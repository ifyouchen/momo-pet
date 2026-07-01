import type { ApiResponse } from '@momo/shared';
import { ApiError, isNetworkError, isRetryableHttpCode, isTimeoutAbort } from './client-errors';

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRY_COUNT = 1;
const RETRYABLE_STATUS_CODES: ReadonlySet<number> = new Set([502, 503, 504]);

export interface RequestRetryOptions {
  readonly method: string;
  readonly url: string;
  readonly headers: Headers;
  readonly body: BodyInit | undefined;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly retryCount?: number;
}

async function executeOnce<T>(
  method: string,
  url: string,
  headers: Headers,
  body: BodyInit | undefined,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers,
    body,
    signal,
  });
  if (RETRYABLE_STATUS_CODES.has(response.status)) {
    throw new ApiError(
      `HTTP_${response.status}`,
      `服务暂时不可用，请稍后重试（HTTP ${response.status}）`,
    );
  }
  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError('INTERNAL_ERROR', `后端返回了非 JSON 响应（HTTP ${response.status}）`);
  }
  if (!payload) {
    throw new ApiError('INTERNAL_ERROR', '后端响应为空');
  }
  if (!payload.success) {
    throw new ApiError(payload.code, payload.message || payload.code);
  }
  return payload.data;
}

/**
 * 单次请求尝试：拥有独立的 AbortController 和 timer，外部 signal 取消或本机超时都只影响本次。
 */
async function executeAttempt<T>(options: RequestRetryOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const timer = setTimeout(() => {
    controller.abort(new DOMException('Request timed out', 'TimeoutError'));
  }, timeoutMs);

  const onCallerAbort = () => {
    controller.abort(options.signal?.reason);
  };
  if (options.signal) {
    if (options.signal.aborted) {
      onCallerAbort();
    } else {
      options.signal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }

  try {
    return await executeOnce<T>(
      options.method,
      options.url,
      options.headers,
      options.body,
      controller.signal,
    );
  } catch (error) {
    if (isTimeoutAbort(error) || isTimeoutAbort(controller.signal.reason)) {
      throw new ApiError('TIMEOUT', '连接超时，请稍后再试。');
    }
    if (options.signal?.aborted) {
      throw new ApiError('ABORTED', '请求已取消');
    }
    throw error;
  } finally {
    clearTimeout(timer);
    if (options.signal) {
      options.signal.removeEventListener('abort', onCallerAbort);
    }
  }
}

/**
 * 执行带重试的请求：网络错误 / 5xx / 超时会重试，业务错误与用户取消不重试。
 *
 * @param options 完整请求选项
 * @returns 解析后的业务数据
 */
export async function executeWithRetry<T>(options: RequestRetryOptions): Promise<T> {
  const maxAttempts = (options.retryCount ?? MAX_RETRY_COUNT) + 1;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await executeAttempt<T>(options);
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && error.code === 'ABORTED') {
        throw error;
      }
      const canRetry =
        error instanceof ApiError
          ? error.code === 'TIMEOUT' || isRetryableHttpCode(error.code)
          : isNetworkError(error);
      if (!canRetry || attempt + 1 >= maxAttempts) {
        break;
      }
    }
  }
  if (lastError instanceof ApiError) {
    throw lastError;
  }
  if (isNetworkError(lastError)) {
    throw new ApiError('NETWORK_ERROR', '连接失败，请确认后端已启动。');
  }
  throw lastError;
}

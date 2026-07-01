const API_BASE_URL = 'http://127.0.0.1:8080';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRY_COUNT = 1;
const RETRYABLE_STATUS_CODES: ReadonlySet<number> = new Set([502, 503, 504]);

export interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly code: string;
  readonly message: string;
  readonly data: T;
}

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  readonly params?: Record<string, string | number | undefined>;
  /** 调用方生命周期取消信号；传入后默认不参与 GET 去重，避免共享请求被单个组件取消。 */
  readonly signal?: AbortSignal;
  /** 单次请求超时毫秒数。 */
  readonly timeoutMs?: number;
  /** 最大重试次数（不含首次请求）。 */
  readonly retryCount?: number;
  /**
   * 自定义请求去重键；显式传入时会共享同一个网络请求，不适合需要独立取消的组件生命周期请求。
   */
  readonly dedupeKey?: string;
}

const inFlightRequests = new Map<string, Promise<unknown>>();

function getErrorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }
  return '';
}

function isTimeoutAbort(error: unknown): boolean {
  return getErrorName(error) === 'TimeoutError';
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function isRetryableHttpCode(code: string): boolean {
  return code === 'HTTP_502' || code === 'HTTP_503' || code === 'HTTP_504';
}

function buildUrl(path: string, params: RequestOptions['params']): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function executeOnce<T>(method: string, url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { Accept: 'application/json' },
    signal,
  });

  if (RETRYABLE_STATUS_CODES.has(response.status)) {
    throw new ApiError(
      `HTTP_${response.status}`,
      `服务暂时不可用，请稍后重试（HTTP ${response.status}）`,
    );
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError('INTERNAL_ERROR', `后端返回了非 JSON 响应（HTTP ${response.status}）`);
  }
  if (!envelope) {
    throw new ApiError('INTERNAL_ERROR', '后端响应为空');
  }
  if (!envelope.success) {
    throw new ApiError(envelope.code, envelope.message || envelope.code);
  }
  return envelope.data;
}

/**
 * 单次请求尝试：拥有独立的 AbortController 和 timer，外部 signal 取消或本机超时都只影响本次。
 *
 * 抛出统一分类后的 ApiError，方便重试逻辑识别：
 * - TIMEOUT：本次超时，可被重试
 * - ABORTED：调用方主动取消，不重试
 * - 其余 ApiError 透传
 */
async function executeAttempt<T>(method: string, url: string, options: RequestOptions): Promise<T> {
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
    return await executeOnce<T>(method, url, controller.signal);
  } catch (error) {
    if (isTimeoutAbort(error) || isTimeoutAbort(controller.signal.reason)) {
      throw new ApiError('TIMEOUT', '请求超时，请稍后重试');
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
 * 多次重试入口：用户主动取消不重试，超时/网络/5xx 才重试。
 */
async function executeWithRetry<T>(
  method: string,
  url: string,
  options: RequestOptions,
): Promise<T> {
  const maxAttempts = (options.retryCount ?? MAX_RETRY_COUNT) + 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await executeAttempt<T>(method, url, options);
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
    throw new ApiError('NETWORK_ERROR', '网络连接失败，请检查后端服务');
  }
  throw lastError;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const finalUrl = buildUrl(path, options.params);
  const shouldDedupe = method === 'GET' && !options.signal;
  const dedupeKey = options.dedupeKey ?? (shouldDedupe ? `${method} ${finalUrl}` : null);

  if (dedupeKey !== null) {
    const existing = inFlightRequests.get(dedupeKey);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const promise = executeWithRetry<T>(method, finalUrl, options);

  if (dedupeKey !== null) {
    inFlightRequests.set(dedupeKey, promise);
    void promise
      .finally(() => {
        inFlightRequests.delete(dedupeKey);
      })
      .catch(() => undefined);
  }

  return promise;
}

export function get<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('GET', path, options);
}

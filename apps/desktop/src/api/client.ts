import { ApiError, isAbortError, isTimeoutAbort, isUserAbort } from './client-errors';
import { buildHeaders, buildRequestBody, buildUrl } from './request-builders';
import { executeWithRetry } from './request-retry';

export { ApiError, isUserAbort, isTimeoutAbort, isAbortError };

export interface RequestOptions {
  /** HTTP 方法，默认 GET。 */
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 请求体；JSON 值会被自动序列化并设置 Content-Type，FormData 由浏览器自动加 boundary。 */
  readonly body?: unknown;
  /** 查询参数；空值会被忽略。 */
  readonly params?: Readonly<Record<string, string | number | undefined>>;
  /** 调用方生命周期取消信号；传入后默认不参与 GET 去重，避免共享请求被单个组件取消。 */
  readonly signal?: AbortSignal;
  /** 单次请求超时毫秒数。 */
  readonly timeoutMs?: number;
  /** 最大重试次数（不含首次请求）。 */
  readonly retryCount?: number;
  /** 自定义去重键；显式传入会共享请求。 */
  readonly dedupeKey?: string;
  /** 额外请求头，常用于覆盖或追加业务头。 */
  readonly headers?: Readonly<Record<string, string>>;
}

const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * 发起一次统一后端请求，自动处理超时、重试、GET 去重和取消语义。
 *
 * @param path 业务路径，例如 '/api/pets'
 * @param options 请求选项
 * @returns 解析后的业务 data
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const finalUrl = buildUrl({ path, params: options.params });
  const shouldDedupe = method === 'GET' && !options.signal;
  const dedupeKey = options.dedupeKey ?? (shouldDedupe ? `${method} ${finalUrl}` : null);
  if (dedupeKey !== null) {
    const existing = inFlightRequests.get(dedupeKey);
    if (existing) {
      return existing as Promise<T>;
    }
  }
  const headers = buildHeaders({ body: options.body, extraHeaders: options.headers });
  const body = buildRequestBody(options.body);
  const promise = executeWithRetry<T>({
    method,
    url: finalUrl,
    headers,
    body,
    signal: options.signal,
    timeoutMs: options.timeoutMs,
    retryCount: options.retryCount,
  });
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

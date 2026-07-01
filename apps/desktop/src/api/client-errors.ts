/**
 * 错误分类工具：判断 fetch / AbortController 抛出的错误属于哪种类型，便于重试与错误归因。
 */

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

function getErrorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }
  return '';
}

export function isTimeoutAbort(error: unknown): boolean {
  return getErrorName(error) === 'TimeoutError';
}

export function isUserAbort(error: unknown): boolean {
  return getErrorName(error) === 'AbortError' && !isTimeoutAbort(error);
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

export function isRetryableHttpCode(code: string): boolean {
  return code === 'HTTP_502' || code === 'HTTP_503' || code === 'HTTP_504';
}

export function isAbortError(error: unknown): boolean {
  return isUserAbort(error) || isTimeoutAbort(error);
}

const API_BASE_URL = 'http://127.0.0.1:8080';

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

interface RequestOptions {
  readonly params?: Record<string, string | number | undefined>;
  readonly signal?: AbortSignal;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  const response = await fetch(url.toString(), {
    method,
    headers: { Accept: 'application/json' },
    signal: options.signal,
  });
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

export function get<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('GET', path, options);
}

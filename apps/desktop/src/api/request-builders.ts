const API_BASE_URL = 'http://127.0.0.1:8080';

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

export interface BuildUrlParams {
  readonly path: string;
  readonly params?: Readonly<Record<string, string | number | undefined>>;
}

/**
 * 拼接最终请求 URL，自动忽略空值参数。
 *
 * @param input 路径与查询参数
 * @returns 完整 URL
 */
export function buildUrl({ path, params }: BuildUrlParams): string {
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

export interface BuildHeadersInput {
  readonly body: unknown;
  readonly extraHeaders?: Readonly<Record<string, string>>;
}

/**
 * 构造请求头：JSON body 自动加 Content-Type，FormData 由浏览器设 boundary。
 *
 * @param input body 与额外头
 * @returns 构造好的 Headers
 */
export function buildHeaders({ body, extraHeaders }: BuildHeadersInput): Headers {
  const headers = new Headers();
  if (body !== undefined && body !== null && !isFormData(body)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, value);
    }
  }
  return headers;
}

/**
 * 把传入的 body 规范成 fetch BodyInit；undefined/null 返回 undefined。
 *
 * @param body 原始 body
 * @returns fetch 可用的 BodyInit 或 undefined
 */
export function buildRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }
  if (isFormData(body)) {
    return body;
  }
  return JSON.stringify(body);
}

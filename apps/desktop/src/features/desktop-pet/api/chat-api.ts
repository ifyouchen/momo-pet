import type {
  ApiResponse,
  ChatMessagesResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from '@momo/shared';

const API_BASE_URL = 'http://127.0.0.1:8080';
const REQUEST_TIMEOUT_MS = 10000;

/**
 * 发送宠物聊天消息。
 *
 * 前置条件：petId 对应已创建宠物。后置条件：返回宠物回复和最新状态。
 * @throws Error 当网络失败、超时或后端返回业务错误时抛出。
 */
export async function sendChatMessage(
  petId: string,
  requestBody: SendChatMessageRequest,
): Promise<SendChatMessageResponse> {
  return request<SendChatMessageResponse>(`/api/pets/${petId}/chat/messages`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

/**
 * 查询最近聊天消息。
 *
 * 前置条件：petId 对应已创建宠物。后置条件：返回最近聊天消息。
 * @throws Error 当网络失败、超时或后端返回业务错误时抛出。
 */
export async function getChatMessages(petId: string, limit = 20): Promise<ChatMessagesResponse> {
  return request<ChatMessagesResponse>(`/api/pets/${petId}/chat/messages?limit=${limit}`);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });
    const payload = await parseApiResponse<T>(response);
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || '请求失败，请稍后再试。');
    }
    return payload.data;
  } catch (error) {
    throw normalizeRequestError(error);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error('后端响应暂时不可读，请稍后再试。');
  }
}

function normalizeRequestError(error: unknown): Error {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new Error('连接超时，请确认后端服务正常。');
  }
  if (error instanceof TypeError) {
    return new Error('连接失败，请确认后端已启动。');
  }
  return error instanceof Error ? error : new Error('请求失败，请稍后再试。');
}

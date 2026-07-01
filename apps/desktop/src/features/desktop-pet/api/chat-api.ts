import { request } from '../../../api/client';
import type {
  ChatMessagesResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from '@momo/shared';

/**
 * 发送宠物聊天消息。
 *
 * 前置条件：petId 对应已创建宠物。后置条件：返回宠物回复和最新状态。
 * @throws ApiError 当网络失败、超时或后端返回业务错误时抛出。
 */
export function sendChatMessage(
  petId: string,
  requestBody: SendChatMessageRequest,
  options: { readonly signal?: AbortSignal } = {},
): Promise<SendChatMessageResponse> {
  return request<SendChatMessageResponse>(`/api/pets/${petId}/chat/messages`, {
    method: 'POST',
    body: requestBody,
    signal: options.signal,
  });
}

/**
 * 查询最近聊天消息。
 *
 * 前置条件：petId 对应已创建宠物。后置条件：返回最近聊天消息。
 * @throws ApiError 当网络失败、超时或后端返回业务错误时抛出。
 */
export function getChatMessages(
  petId: string,
  limit = 20,
  options: { readonly signal?: AbortSignal } = {},
): Promise<ChatMessagesResponse> {
  return request<ChatMessagesResponse>(`/api/pets/${petId}/chat/messages`, {
    params: { limit },
    signal: options.signal,
  });
}

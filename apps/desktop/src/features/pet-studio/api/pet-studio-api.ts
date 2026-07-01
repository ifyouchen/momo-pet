import { request } from '../../../api/client';
import type {
  AiTaskResponse,
  ConfirmPetDnaRequest,
  ConfirmPetDnaResponse,
  CreateAiTaskResponse,
  CreatePetDnaTaskRequest,
  PhotoRole,
  UploadedAsset,
} from '@momo/shared';

/**
 * 取消 AI 任务。仅 PENDING 和 RUNNING 状态可取消。
 *
 * @param taskId AI 任务 ID
 * @throws ApiError 当取消失败或后端返回业务错误时抛出
 */
export function cancelAiTask(
  taskId: string,
  options: { readonly signal?: AbortSignal } = {},
): Promise<AiTaskResponse> {
  return request<AiTaskResponse>(`/api/ai/tasks/${taskId}/cancel`, {
    method: 'POST',
    signal: options.signal,
  });
}

/**
 * 上传单张宠物照片。
 *
 * 前置条件：file 已通过前端本地校验。后置条件：返回后端持久化 asset 元数据。
 * @throws ApiError 当上传失败、超时或后端返回业务错误时抛出。
 */
export function uploadPetPhoto(
  petId: string,
  file: File,
  photoRole: PhotoRole,
  options: { readonly signal?: AbortSignal } = {},
): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('photoRole', photoRole);
  return request<UploadedAsset>(`/api/pets/${petId}/photos`, {
    method: 'POST',
    body: formData,
    signal: options.signal,
  });
}

/**
 * 创建 Pet DNA AI 任务。
 *
 * 前置条件：图片已经上传并取得 assetId。后置条件：返回用于轮询的 taskId。
 * @throws ApiError 当任务创建失败、超时或后端返回业务错误时抛出。
 */
export function createPetDnaGenerationTask(
  petId: string,
  requestBody: CreatePetDnaTaskRequest,
  options: { readonly signal?: AbortSignal } = {},
): Promise<CreateAiTaskResponse> {
  return request<CreateAiTaskResponse>(`/api/pets/${petId}/dna/generation-tasks`, {
    method: 'POST',
    body: requestBody,
    signal: options.signal,
  });
}

/**
 * 查询 AI 任务详情。
 *
 * 前置条件：taskId 来自创建任务接口。后置条件：返回当前任务状态和可能的草稿结果。
 * @throws ApiError 当查询失败、超时或后端返回业务错误时抛出。
 */
export function getAiTask(
  taskId: string,
  options: { readonly signal?: AbortSignal } = {},
): Promise<AiTaskResponse> {
  return request<AiTaskResponse>(`/api/ai/tasks/${taskId}`, options);
}

/**
 * 确认 Pet DNA。
 *
 * 前置条件：用户已确认或编辑 Pet DNA 草稿。后置条件：后端保存新版本。
 * @throws ApiError 当确认失败、超时或后端返回业务错误时抛出。
 */
export function confirmPetDna(
  petId: string,
  requestBody: ConfirmPetDnaRequest,
  options: { readonly signal?: AbortSignal } = {},
): Promise<ConfirmPetDnaResponse> {
  return request<ConfirmPetDnaResponse>(`/api/pets/${petId}/dna`, {
    method: 'PUT',
    body: requestBody,
    signal: options.signal,
  });
}

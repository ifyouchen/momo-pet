import type {
  AiTaskResponse,
  ApiResponse,
  ConfirmPetDnaRequest,
  ConfirmPetDnaResponse,
  CreateAiTaskResponse,
  CreatePetDnaTaskRequest,
  PhotoRole,
  UploadedAsset,
} from '@momo/shared';

const API_BASE_URL = 'http://127.0.0.1:8080';
const REQUEST_TIMEOUT_MS = 10000;

/**
 * 上传单张宠物照片。
 *
 * 前置条件：file 已通过前端本地校验。后置条件：返回后端持久化 asset 元数据。
 * @throws Error 当上传失败、超时或后端返回业务错误时抛出。
 */
export async function uploadPetPhoto(
  petId: string,
  file: File,
  photoRole: PhotoRole,
): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('photoRole', photoRole);
  return request<UploadedAsset>(`/api/pets/${petId}/photos`, {
    method: 'POST',
    body: formData,
  });
}

/**
 * 创建 Pet DNA AI 任务。
 *
 * 前置条件：图片已经上传并取得 assetId。后置条件：返回用于轮询的 taskId。
 * @throws Error 当任务创建失败、超时或后端返回业务错误时抛出。
 */
export async function createPetDnaGenerationTask(
  petId: string,
  requestBody: CreatePetDnaTaskRequest,
): Promise<CreateAiTaskResponse> {
  return request<CreateAiTaskResponse>(`/api/pets/${petId}/dna/generation-tasks`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * 查询 AI 任务详情。
 *
 * 前置条件：taskId 来自创建任务接口。后置条件：返回当前任务状态和可能的草稿结果。
 * @throws Error 当查询失败、超时或后端返回业务错误时抛出。
 */
export async function getAiTask(taskId: string): Promise<AiTaskResponse> {
  return request<AiTaskResponse>(`/api/ai/tasks/${taskId}`);
}

/**
 * 确认 Pet DNA。
 *
 * 前置条件：用户已确认或编辑 Pet DNA 草稿。后置条件：后端保存新版本。
 * @throws Error 当确认失败、超时或后端返回业务错误时抛出。
 */
export async function confirmPetDna(
  petId: string,
  requestBody: ConfirmPetDnaRequest,
): Promise<ConfirmPetDnaResponse> {
  return request<ConfirmPetDnaResponse>(`/api/pets/${petId}/dna`, {
    method: 'PUT',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' },
  });
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
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

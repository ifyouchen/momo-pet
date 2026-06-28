import type {
  ApiResponse,
  CarePetResponse,
  CleanPetRequest,
  CreatePetRequest,
  FeedPetRequest,
  PetProfile,
  PetState,
  TouchPetRequest,
} from '@momo/shared';

const API_BASE_URL = 'http://127.0.0.1:8080';
const REQUEST_TIMEOUT_MS = 8000;

/**
 * 创建默认宠物资料，供首次打开桌面端时初始化本地养成对象。
 *
 * 前置条件：后端宠物 API 可访问。后置条件：返回已持久化的宠物资料。
 * @throws Error 当网络失败、超时或后端返回业务错误时抛出。
 */
export async function createPet(requestBody: CreatePetRequest): Promise<PetProfile> {
  return request<PetProfile>('/api/pets', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

/**
 * 获取指定宠物的基础资料，用于恢复 localStorage 中保存的默认宠物。
 *
 * 前置条件：petId 来自后端或本地缓存。后置条件：返回当前宠物资料。
 * @throws Error 当 petId 无效、网络失败或后端返回业务错误时抛出。
 */
export async function getPet(petId: string): Promise<PetProfile> {
  return request<PetProfile>(`/api/pets/${petId}`);
}

/**
 * 获取宠物当前状态，用于驱动桌面主页状态条。
 *
 * 前置条件：petId 对应已创建宠物。后置条件：返回后端持久化状态快照。
 * @throws Error 当宠物不存在、网络失败或后端返回业务错误时抛出。
 */
export async function getPetState(petId: string): Promise<PetState> {
  return request<PetState>(`/api/pets/${petId}/state`);
}

/**
 * 执行喂食行为，并返回后端计算后的最新状态。
 *
 * 前置条件：宠物未处于不可照顾状态。后置条件：返回后端更新后的状态。
 * @throws Error 当宠物过饱、网络失败或后端返回业务错误时抛出。
 */
export async function feedPet(petId: string, requestBody: FeedPetRequest): Promise<PetState> {
  const response = await request<CarePetResponse>(`/api/pets/${petId}/care/feed`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  return response.state;
}

/**
 * 执行抚摸行为，并返回后端计算后的最新状态。
 *
 * 前置条件：宠物存在且照顾行为允许。后置条件：返回后端更新后的状态。
 * @throws Error 当宠物不存在、网络失败或后端返回业务错误时抛出。
 */
export async function touchPet(petId: string, requestBody: TouchPetRequest): Promise<PetState> {
  const response = await request<CarePetResponse>(`/api/pets/${petId}/care/touch`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  return response.state;
}

/**
 * 执行清理行为，并返回后端计算后的最新状态。
 *
 * 前置条件：清理事件可被后端接受。后置条件：返回后端更新后的状态。
 * @throws Error 当清理事件无效、网络失败或后端返回业务错误时抛出。
 */
export async function cleanPet(petId: string, requestBody: CleanPetRequest): Promise<PetState> {
  const response = await request<CarePetResponse>(`/api/pets/${petId}/care/clean`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  return response.state;
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

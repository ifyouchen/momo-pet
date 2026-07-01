import { request } from '../../../api/client';
import type {
  CarePetResponse,
  CleanPetRequest,
  CreatePetRequest,
  FeedPetRequest,
  PetProfile,
  PetState,
  TouchPetRequest,
} from '@momo/shared';

/**
 * 创建默认宠物资料，供首次打开桌面端时初始化本地养成对象。
 *
 * 前置条件：后端宠物 API 可访问。后置条件：返回已持久化的宠物资料。
 * @throws ApiError 当网络失败、超时或后端返回业务错误时抛出。
 */
export function createPet(requestBody: CreatePetRequest): Promise<PetProfile> {
  return request<PetProfile>('/api/pets', { method: 'POST', body: requestBody });
}

/**
 * 获取指定宠物的基础资料，用于恢复 localStorage 中保存的默认宠物。
 *
 * 前置条件：petId 来自后端或本地缓存。后置条件：返回当前宠物资料。
 * @throws ApiError 当 petId 无效、网络失败或后端返回业务错误时抛出。
 */
export function getPet(
  petId: string,
  options: { readonly signal?: AbortSignal } = {},
): Promise<PetProfile> {
  return request<PetProfile>(`/api/pets/${petId}`, options);
}

/**
 * 获取宠物当前状态，用于驱动桌面主页状态条。
 *
 * 前置条件：petId 对应已创建宠物。后置条件：返回后端持久化状态快照。
 * @throws ApiError 当宠物不存在、网络失败或后端返回业务错误时抛出。
 */
export function getPetState(
  petId: string,
  options: { readonly signal?: AbortSignal } = {},
): Promise<PetState> {
  return request<PetState>(`/api/pets/${petId}/state`, options);
}

/**
 * 执行喂食行为，并返回后端计算后的最新状态。
 *
 * 前置条件：宠物未处于不可照顾状态。后置条件：返回后端更新后的状态。
 * @throws ApiError 当宠物过饱、网络失败或后端返回业务错误时抛出。
 */
export function feedPet(
  petId: string,
  requestBody: FeedPetRequest,
  options: { readonly signal?: AbortSignal } = {},
): Promise<PetState> {
  return request<CarePetResponse>(`/api/pets/${petId}/care/feed`, {
    method: 'POST',
    body: requestBody,
    signal: options.signal,
  }).then((response) => response.state);
}

/**
 * 执行抚摸行为，并返回后端计算后的最新状态。
 *
 * 前置条件：宠物存在且照顾行为允许。后置条件：返回后端更新后的状态。
 * @throws ApiError 当宠物不存在、网络失败或后端返回业务错误时抛出。
 */
export function touchPet(
  petId: string,
  requestBody: TouchPetRequest,
  options: { readonly signal?: AbortSignal } = {},
): Promise<PetState> {
  return request<CarePetResponse>(`/api/pets/${petId}/care/touch`, {
    method: 'POST',
    body: requestBody,
    signal: options.signal,
  }).then((response) => response.state);
}

/**
 * 执行清理行为，并返回后端计算后的最新状态。
 *
 * 前置条件：清理事件可被后端接受。后置条件：返回后端更新后的状态。
 * @throws ApiError 当清理事件无效、网络失败或后端返回业务错误时抛出。
 */
export function cleanPet(
  petId: string,
  requestBody: CleanPetRequest,
  options: { readonly signal?: AbortSignal } = {},
): Promise<PetState> {
  return request<CarePetResponse>(`/api/pets/${petId}/care/clean`, {
    method: 'POST',
    body: requestBody,
    signal: options.signal,
  }).then((response) => response.state);
}

/**
 * Supported pet species in MVP.
 */
export type Species = 'CAT' | 'DOG' | 'BIRD' | 'RABBIT';

/**
 * Pet profile status returned by backend APIs.
 */
export type PetStatus = 'ACTIVE' | 'INACTIVE';

/**
 * Unified API response used by backend, desktop, and admin clients.
 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

/**
 * Pet profile returned by Sprint 1 APIs.
 */
export interface PetProfile {
  petId: string;
  name: string;
  species: Species;
  birthday: string;
  status: PetStatus;
  createdAt: string;
}

/**
 * Current pet life state shown by desktop UI.
 */
export interface PetState {
  hunger: number;
  mood: number;
  cleanliness: number;
  energy: number;
  intimacy: number;
  experience: number;
  level: number;
  updatedAt: string;
}

/**
 * Create pet request used by the desktop default pet bootstrap flow.
 */
export interface CreatePetRequest {
  name: string;
  species: Species;
  birthday?: string;
  description?: string;
}

/**
 * Feed action request.
 */
export interface FeedPetRequest {
  foodCode: 'DRIED_FISH';
}

/**
 * Touch action request.
 */
export interface TouchPetRequest {
  touchType: 'HEAD';
}

/**
 * Clean action request.
 */
export interface CleanPetRequest {
  cleanEventId: string;
}

/**
 * Care action response.
 */
export interface CarePetResponse {
  state: PetState;
}

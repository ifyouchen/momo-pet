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

/**
 * Pet Studio photo roles used by upload and AI task APIs.
 */
export type PhotoRole = 'PRIMARY' | 'FRONT' | 'SIDE' | 'BACK' | 'DETAIL' | 'OTHER';

/**
 * Uploaded asset metadata returned by backend.
 */
export interface UploadedAsset {
  assetId: string;
  assetType: 'ORIGINAL_PHOTO';
  photoRole: PhotoRole;
  status: 'READY' | 'FAILED';
  contentType: string;
  sizeBytes: number;
}

/**
 * Request body for creating Pet DNA generation tasks.
 */
export interface CreatePetDnaTaskRequest {
  name: string;
  speciesHint: Species;
  primaryPhotoAssetId: string;
  referencePhotoAssetIds: string[];
  userDescription: string;
}

/**
 * AI task creation response.
 */
export interface CreateAiTaskResponse {
  taskId: string;
  status: AiTaskStatus;
}

/**
 * AI task status values used by polling UI.
 */
export type AiTaskStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMEOUT';

/**
 * MVP Pet DNA draft returned by AI task.
 */
export interface PetDnaDraft {
  name: string;
  species: Species;
  breed: string;
  appearance: {
    primaryColor: string;
    secondaryColor?: string;
    pattern: string;
    eyeColor: string;
  };
  personality: {
    primary: string;
    energyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  preferences: {
    favoriteFoods: string[];
    dislikedThings: string[];
  };
  voice: {
    catchphrases: string[];
  };
  generation?: {
    source: 'AI' | 'MANUAL' | 'MIXED';
    confidence?: number;
    model?: string;
    generatedAt?: string;
    evidenceSummary?: string;
    mismatchWarning?: string | null;
  };
}

/**
 * AI task detail response.
 */
export interface AiTaskResponse {
  taskId: string;
  petId: string;
  taskType: 'PET_DNA_GENERATION';
  status: AiTaskStatus;
  result: { petDnaDraft: PetDnaDraft } | null;
  errorCode: string | null;
}

/**
 * Confirm Pet DNA request.
 */
export interface ConfirmPetDnaRequest {
  source: 'AI' | 'MANUAL' | 'MIXED';
  dna: PetDnaDraft;
}

/**
 * Confirm Pet DNA response.
 */
export interface ConfirmPetDnaResponse {
  petId: string;
  version: number;
}

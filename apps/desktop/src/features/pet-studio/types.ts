import type { Species } from '@momo/shared';

export type PhotoRole = 'PRIMARY' | 'FRONT' | 'SIDE' | 'BACK' | 'DETAIL' | 'OTHER';

export type PetStudioStep = 'input' | 'uploading' | 'analyzing' | 'ai-failed' | 'confirm';

export interface PetStudioPhoto {
  readonly id: string;
  readonly file: File;
  readonly role: PhotoRole;
  readonly previewUrl: string;
}

export interface PetStudioDraft {
  readonly name: string;
  readonly species: Species;
  readonly description: string;
  readonly photos: readonly PetStudioPhoto[];
}

export interface ManualPetDnaDraft {
  readonly name: string;
  readonly species: Species;
  readonly breed: string;
  readonly primaryColor: string;
  readonly pattern: string;
  readonly eyeColor: string;
  readonly personality: string;
  readonly energyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly favoriteFoods: string;
  readonly dislikedThings: string;
  readonly catchphrases: string;
}

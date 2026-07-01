import { get, type RequestOptions } from './client';

export interface PetSummary {
  readonly petId: string;
  readonly name: string;
  readonly species: string;
  readonly birthday: string;
  readonly status: string;
  readonly createdAt: string;
}

export interface PetList {
  readonly items: ReadonlyArray<PetSummary>;
  readonly total: number;
  readonly page: number;
  readonly size: number;
}

export interface PetState {
  readonly hunger: number;
  readonly mood: number;
  readonly cleanliness: number;
  readonly energy: number;
  readonly intimacy: number;
  readonly experience: number;
  readonly level: number;
  readonly updatedAt: string;
}

export interface PetDna {
  readonly petId: string;
  readonly version: number;
  readonly source: string;
  readonly dna: unknown;
  readonly confirmedAt: string;
}

export function listPets(
  params: { species?: string; status?: string; page?: number; size?: number },
  options: RequestOptions = {},
) {
  return get<PetList>('/api/pets', { ...options, params });
}

export function getPet(petId: string, options: RequestOptions = {}) {
  return get<PetSummary>(`/api/pets/${encodeURIComponent(petId)}`, options);
}

export function getPetState(petId: string, options: RequestOptions = {}) {
  return get<PetState>(`/api/pets/${encodeURIComponent(petId)}/state`, options);
}

export function getPetDna(petId: string, options: RequestOptions = {}) {
  return get<PetDna>(`/api/pets/${encodeURIComponent(petId)}/dna/latest`, options);
}

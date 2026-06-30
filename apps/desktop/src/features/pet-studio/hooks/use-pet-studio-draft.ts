import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Species } from '@momo/shared';
import type { ManualPetDnaDraft, PetStudioPhoto, PhotoRole } from '../types';
import { getDraftBlockingMessage, validateImageDecoding, validatePhotoFiles } from '../validation';

const DEFAULT_DNA: ManualPetDnaDraft = {
  name: 'Momo Pet',
  species: 'CAT',
  breed: 'UNKNOWN',
  primaryColor: 'Orange',
  pattern: 'White belly',
  eyeColor: 'Amber',
  personality: 'Friendly',
  energyLevel: 'MEDIUM',
  favoriteFoods: 'DRIED_FISH',
  dislikedThings: 'BATH',
  catchphrases: '摸摸头会更舒服',
};

export interface PetStudioDraftModel {
  readonly name: string;
  readonly species: Species;
  readonly description: string;
  readonly photos: readonly PetStudioPhoto[];
  readonly dna: ManualPetDnaDraft;
  readonly errorMessage: string | null;
  readonly blockingMessage: string | null;
  readonly setName: (name: string) => void;
  readonly setSpecies: (species: Species) => void;
  readonly setDescription: (description: string) => void;
  readonly addPhotos: (files: readonly File[]) => Promise<void>;
  readonly removePhoto: (photoId: string) => void;
  readonly updatePhotoRole: (photoId: string, role: PhotoRole) => void;
  readonly updateDna: (patch: Partial<ManualPetDnaDraft>) => void;
  readonly clearError: () => void;
}

/**
 * 管理 Pet Studio 本地草稿。
 *
 * 前置条件：运行环境支持 URL.createObjectURL。后置条件：图片预览 URL 会在移除或卸载时释放。
 */
export function usePetStudioDraft(): PetStudioDraftModel {
  const [name, setName] = useState('Momo Pet');
  const [species, setSpecies] = useState<Species>('CAT');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<readonly PetStudioPhoto[]>([]);
  const photosRef = useRef<readonly PetStudioPhoto[]>([]);
  const [dna, setDna] = useState<ManualPetDnaDraft>(DEFAULT_DNA);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const blockingMessage = useMemo(() => getDraftBlockingMessage(name, photos), [name, photos]);

  const addPhotos = useCallback(
    async (files: readonly File[]) => {
      const validation = validatePhotoFiles(files, photos);
      if (!validation.ok) {
        setErrorMessage(validation.message);
        return;
      }
      const decodingValidation = await validateImageDecoding(files);
      if (!decodingValidation.ok) {
        setErrorMessage(decodingValidation.message);
        return;
      }
      setErrorMessage(null);
      setPhotos((currentPhotos) => {
        const hasPrimary = currentPhotos.some((photo) => photo.role === 'PRIMARY');
        const nextPhotos: readonly PetStudioPhoto[] = files.map((file, index) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          role: !hasPrimary && index === 0 ? 'PRIMARY' : 'OTHER',
          previewUrl: URL.createObjectURL(file),
        }));
        return [...currentPhotos, ...nextPhotos];
      });
    },
    [photos],
  );

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((currentPhotos) => {
      const removedPhoto = currentPhotos.find((photo) => photo.id === photoId);
      if (removedPhoto) {
        URL.revokeObjectURL(removedPhoto.previewUrl);
      }
      const nextPhotos = currentPhotos.filter((photo) => photo.id !== photoId);
      if (removedPhoto?.role !== 'PRIMARY' || nextPhotos.length === 0) {
        return nextPhotos;
      }
      const [firstPhoto, ...restPhotos] = nextPhotos;
      return [{ ...firstPhoto, role: 'PRIMARY' }, ...restPhotos];
    });
  }, []);

  const updatePhotoRole = useCallback((photoId: string, role: PhotoRole) => {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) => (photo.id === photoId ? { ...photo, role } : photo)),
    );
  }, []);

  const updateDna = useCallback((patch: Partial<ManualPetDnaDraft>) => {
    setDna((currentDna) => ({ ...currentDna, ...patch }));
  }, []);

  useEffect(() => {
    setDna((currentDna) => ({ ...currentDna, name, species }));
  }, [name, species]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    },
    [],
  );

  return {
    name,
    species,
    description,
    photos,
    dna,
    errorMessage,
    blockingMessage,
    setName,
    setSpecies,
    setDescription,
    addPhotos,
    removePhoto,
    updatePhotoRole,
    updateDna,
    clearError: () => setErrorMessage(null),
  };
}

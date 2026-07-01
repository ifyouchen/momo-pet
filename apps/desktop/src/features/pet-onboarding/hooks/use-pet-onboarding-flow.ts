import { useCallback, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { PetDnaDraft, PetProfile, PetState, PhotoRole, Species } from '@momo/shared';
import { createPet, getPet, getPetState } from '../../desktop-pet/api/pet-api';
import {
  cancelAiTask,
  confirmPetDna,
  createPetDnaGenerationTask,
  getAiTask,
  uploadPetPhoto,
} from '../../pet-studio/api/pet-studio-api';
import { toManualDna, toPetDnaDraft } from '../../pet-studio/utils/pet-dna-mappers';
import type { ManualPetDnaDraft } from '../../pet-studio/types';

export type OnboardingStep =
  | 'welcome'
  | 'create-pet'
  | 'photo-upload'
  | 'ai-analyzing'
  | 'ai-failed'
  | 'confirm-dna'
  | 'deploy-success';

export interface OnboardingDraft {
  name: string;
  species: Species;
  birthday: string;
  description: string;
  photos: { file: File; role: string }[];
  dna: ManualPetDnaDraft;
}

const EMPTY_DRAFT: ManualPetDnaDraft = {
  name: '',
  species: 'CAT',
  breed: '',
  primaryColor: '',
  pattern: '',
  eyeColor: '',
  personality: 'Curious',
  energyLevel: 'MEDIUM',
  favoriteFoods: '',
  dislikedThings: '',
  catchphrases: '',
};

export interface PetOnboardingModel {
  readonly step: OnboardingStep;
  readonly draft: OnboardingDraft;
  readonly flowMessage: string | null;
  readonly isProcessing: boolean;
  readonly goToStep: (step: OnboardingStep) => void;
  readonly updateDraft: (partial: Partial<OnboardingDraft>) => void;
  readonly updateDna: (dna: ManualPetDnaDraft) => void;
  readonly startCreatePet: (input: {
    name: string;
    species: Species;
    birthday: string;
  }) => Promise<void>;
  readonly startAiAnalysis: (photos: { file: File; role: string }[]) => Promise<void>;
  readonly handleManualFallback: () => void;
  readonly handleConfirmDna: (
    onSuccess: (pet: PetProfile, state: PetState) => void,
  ) => Promise<void>;
  readonly handleCancel: () => void;
}

export function usePetOnboardingFlow(): PetOnboardingModel {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [draft, setDraft] = useState<OnboardingDraft>({
    name: '',
    species: 'CAT',
    birthday: '',
    description: '',
    photos: [],
    dna: EMPTY_DRAFT,
  });
  const [flowMessage, setFlowMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dnaSource, setDnaSource] = useState<'AI' | 'MANUAL' | 'MIXED'>('MANUAL');
  const currentTaskIdRef = useRef<string | null>(null);
  const isCancelledRef = useRef(false);
  const createdPetIdRef = useRef<string | null>(null);

  const goToStep = useCallback((newStep: OnboardingStep) => {
    setFlowMessage(null);
    setStep(newStep);
  }, []);

  const updateDraft = useCallback((partial: Partial<OnboardingDraft>) => {
    setDraft((previous) => ({ ...previous, ...partial }));
  }, []);

  const updateDna = useCallback((dna: ManualPetDnaDraft) => {
    setDraft((previous) => ({ ...previous, dna }));
  }, []);

  const startCreatePet = useCallback(
    async (input: { name: string; species: Species; birthday: string }) => {
      setIsProcessing(true);
      setFlowMessage(null);
      try {
        updateDraft({ name: input.name, species: input.species, birthday: input.birthday });
        const pet = await createPet({
          name: input.name,
          species: input.species,
          birthday: input.birthday || undefined,
        });
        createdPetIdRef.current = pet.petId;
        setStep('photo-upload');
      } catch (error) {
        setFlowMessage(error instanceof Error ? error.message : '创建宠物失败，请重试。');
      } finally {
        setIsProcessing(false);
      }
    },
    [updateDraft],
  );

  const startAiAnalysis = useCallback(
    async (photos: { file: File; role: string }[]) => {
      const petId = createdPetIdRef.current;
      if (!petId) {
        setFlowMessage('请先创建宠物。');
        return;
      }
      setIsProcessing(true);
      setFlowMessage(null);
      isCancelledRef.current = false;
      try {
        updateDraft({ photos });
        setStep('ai-analyzing');
        const aiDraft = await uploadAndGenerateDraft(
          petId,
          photos,
          draft.name,
          draft.species,
          draft.description,
          setStep,
          isCancelledRef,
          currentTaskIdRef,
        );
        updateDna(toManualDna(aiDraft));
        setDnaSource('AI');
        setStep('confirm-dna');
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'AI_TASK_CANCELED') {
          return;
        }
        setDnaSource('MANUAL');
        setFlowMessage(normalizeOnboardingError(error));
        setStep('ai-failed');
      } finally {
        setIsProcessing(false);
      }
    },
    [draft.name, draft.species, draft.description, updateDraft, updateDna],
  );

  const handleManualFallback = useCallback(() => {
    setDnaSource('MANUAL');
    setFlowMessage(null);
    setStep('confirm-dna');
  }, []);

  const handleConfirmDna = useCallback(
    async (onSuccess: (pet: PetProfile, state: PetState) => void) => {
      const petId = createdPetIdRef.current;
      if (!petId) {
        return;
      }
      setIsProcessing(true);
      setFlowMessage(null);
      try {
        await confirmPetDna(petId, {
          source: dnaSource,
          dna: toPetDnaDraft(draft.dna),
        });
        const pet = await getPet(petId);
        const state = await getPetState(petId);
        onSuccess(pet, state);
        setStep('deploy-success');
      } catch (error) {
        setFlowMessage(error instanceof Error ? error.message : '保存失败，请重试。');
      } finally {
        setIsProcessing(false);
      }
    },
    [draft.dna, dnaSource],
  );

  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    const taskId = currentTaskIdRef.current;
    currentTaskIdRef.current = null;
    if (taskId) {
      try {
        void cancelAiTask(taskId);
      } catch {
        // cancel 失败不阻塞返回上传
      }
    }
    setIsProcessing(false);
    setFlowMessage(null);
    setStep('photo-upload');
  }, []);

  return {
    step,
    draft,
    flowMessage,
    isProcessing,
    goToStep,
    updateDraft,
    updateDna,
    startCreatePet,
    startAiAnalysis,
    handleManualFallback,
    handleConfirmDna,
    handleCancel,
  };
}

async function uploadAndGenerateDraft(
  petId: string,
  photos: { file: File; role: string }[],
  name: string,
  species: Species,
  description: string,
  setStep: (step: OnboardingStep) => void,
  isCancelledRef: MutableRefObject<boolean>,
  currentTaskIdRef: MutableRefObject<string | null>,
): Promise<PetDnaDraft> {
  if (photos.length === 0) {
    throw new Error('需要先上传一张主图。');
  }
  setStep('ai-analyzing');
  const uploadedAssets = await Promise.all(
    photos.map((photo) => uploadPetPhoto(petId, photo.file, photo.role as PhotoRole)),
  );
  const primaryAsset = uploadedAssets.find((asset) => asset.photoRole === 'PRIMARY');
  if (!primaryAsset) {
    throw new Error('需要先上传一张主图。');
  }
  const task = await createPetDnaGenerationTask(petId, {
    name,
    speciesHint: species,
    primaryPhotoAssetId: primaryAsset.assetId,
    referencePhotoAssetIds: uploadedAssets
      .filter((asset) => asset.photoRole !== 'PRIMARY')
      .map((asset) => asset.assetId),
    userDescription: description,
  });
  return pollPetDnaTask(task.taskId, isCancelledRef, currentTaskIdRef);
}

async function pollPetDnaTask(
  taskId: string,
  isCancelledRef: MutableRefObject<boolean>,
  currentTaskIdRef: MutableRefObject<string | null>,
): Promise<PetDnaDraft> {
  currentTaskIdRef.current = taskId;
  const startedAt = Date.now();
  while (!isCancelledRef.current && Date.now() - startedAt < 60000) {
    const task = await getAiTask(taskId);
    if (task.status === 'SUCCEEDED' && task.result?.petDnaDraft) {
      currentTaskIdRef.current = null;
      return task.result.petDnaDraft;
    }
    if (task.status === 'FAILED' || task.status === 'TIMEOUT') {
      currentTaskIdRef.current = null;
      throw new Error(task.errorCode ?? 'AI_GENERATION_FAILED');
    }
    if (task.status === 'CANCELED') {
      currentTaskIdRef.current = null;
      throw new Error('AI_TASK_CANCELED');
    }
    await wait(1500);
  }
  currentTaskIdRef.current = null;
  throw new Error('AI_GENERATION_TIMEOUT');
}

function wait(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, timeoutMs);
  });
}

function normalizeOnboardingError(error: unknown): string {
  const message = error instanceof Error ? error.message : '请求失败，请稍后再试。';
  if (message === 'AI_GENERATION_TIMEOUT') {
    return '分析时间有点久，我们先用手动草稿继续。';
  }
  if (message === 'AI_GENERATION_FAILED') {
    return '我没能看清它的样子，你可以先手动填写，之后再重新生成。';
  }
  return message;
}

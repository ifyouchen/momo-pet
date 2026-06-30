import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { PetDnaDraft, PhotoRole } from '@momo/shared';
import {
  confirmPetDna,
  createPetDnaGenerationTask,
  getAiTask,
  uploadPetPhoto,
} from '../api/pet-studio-api';
import type { PetStudioStep } from '../types';
import { toManualDna, toPetDnaDraft } from '../utils/pet-dna-mappers';
import type { PetStudioDraftModel } from './use-pet-studio-draft';

interface PetStudioAiFlowOptions {
  /** 当前宠物 ID，用于上传和创建任务。 */
  readonly petId: string;
  /** Pet Studio 本地草稿模型。 */
  readonly draft: PetStudioDraftModel;
  /** 完成确认后的回调。 */
  readonly onDone: () => void;
}

interface PetStudioAiFlowModel {
  /** 当前 Pet Studio 流程状态。 */
  readonly step: PetStudioStep;
  /** 当前流程提示或错误。 */
  readonly flowMessage: string | null;
  /** 当前是否正在提交。 */
  readonly isSubmitting: boolean;
  /** 手动设置流程状态。 */
  readonly setStep: (step: PetStudioStep) => void;
  /** 执行上传、创建任务和轮询。 */
  readonly handleContinue: () => Promise<void>;
  /** 确认当前 Pet DNA。 */
  readonly handleConfirm: () => Promise<void>;
  /** 从失败态进入手动创建。 */
  readonly handleManualFallback: () => void;
  /** 标记当前异步流程取消。 */
  readonly cancelFlow: () => void;
}

/**
 * 管理 Pet Studio 的 Sprint 5 上传、AI 任务轮询和 Pet DNA 确认流程。
 *
 * 前置条件：draft 已完成 Sprint 4 本地校验。后置条件：成功时保存 Pet DNA，失败时保留手动降级。
 */
export function usePetStudioAiFlow({
  petId,
  draft,
  onDone,
}: PetStudioAiFlowOptions): PetStudioAiFlowModel {
  const [step, setStep] = useState<PetStudioStep>('input');
  const [flowMessage, setFlowMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    isCancelledRef.current = false;
    return () => {
      isCancelledRef.current = true;
    };
  }, []);

  const handleContinue = useCallback(async () => {
    if (draft.blockingMessage) {
      return;
    }
    setIsSubmitting(true);
    setFlowMessage(null);
    try {
      const aiDraft = await uploadPhotosAndGenerateDraft(petId, draft, setStep, isCancelledRef);
      draft.updateDna(toManualDna(aiDraft));
      setStep('confirm');
    } catch (error) {
      setFlowMessage(normalizePetStudioError(error));
      setStep('ai-failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, petId]);

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    setFlowMessage(null);
    try {
      await confirmPetDna(petId, {
        source: step === 'ai-failed' ? 'MANUAL' : 'AI',
        dna: toPetDnaDraft(draft.dna),
      });
      onDone();
    } catch (error) {
      setFlowMessage(normalizePetStudioError(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [draft.dna, onDone, petId, step]);

  return {
    step,
    flowMessage,
    isSubmitting,
    setStep,
    handleContinue,
    handleConfirm,
    handleManualFallback: () => {
      setFlowMessage(null);
      setStep('confirm');
    },
    cancelFlow: () => {
      isCancelledRef.current = true;
    },
  };
}

async function uploadPhotosAndGenerateDraft(
  petId: string,
  draft: PetStudioDraftModel,
  setStep: (step: PetStudioStep) => void,
  isCancelledRef: MutableRefObject<boolean>,
): Promise<PetDnaDraft> {
  setStep('uploading');
  const uploadedAssets = await Promise.all(
    draft.photos.map((photo) => uploadPetPhoto(petId, photo.file, photo.role as PhotoRole)),
  );
  const primaryAsset = uploadedAssets.find((asset) => asset.photoRole === 'PRIMARY');
  if (!primaryAsset) {
    throw new Error('需要先上传一张主图。');
  }
  setStep('analyzing');
  const task = await createPetDnaGenerationTask(petId, {
    name: draft.name,
    speciesHint: draft.species,
    primaryPhotoAssetId: primaryAsset.assetId,
    referencePhotoAssetIds: uploadedAssets
      .filter((asset) => asset.photoRole !== 'PRIMARY')
      .map((asset) => asset.assetId),
    userDescription: draft.description,
  });
  return pollPetDnaTask(task.taskId, isCancelledRef);
}

async function pollPetDnaTask(
  taskId: string,
  isCancelledRef: MutableRefObject<boolean>,
): Promise<PetDnaDraft> {
  const startedAt = Date.now();
  while (!isCancelledRef.current && Date.now() - startedAt < 60000) {
    const task = await getAiTask(taskId);
    if (task.status === 'SUCCEEDED' && task.result?.petDnaDraft) {
      return task.result.petDnaDraft;
    }
    if (task.status === 'FAILED' || task.status === 'TIMEOUT') {
      throw new Error(task.errorCode ?? 'AI_GENERATION_FAILED');
    }
    await wait(1500);
  }
  throw new Error('AI_GENERATION_TIMEOUT');
}

function wait(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, timeoutMs);
  });
}

function normalizePetStudioError(error: unknown): string {
  const message = error instanceof Error ? error.message : '请求失败，请稍后再试。';
  if (message === 'AI_GENERATION_TIMEOUT') {
    return '分析时间有点久，我们先用手动草稿继续。';
  }
  if (message === 'AI_GENERATION_FAILED') {
    return '我没能看清它的样子，你可以先手动填写，之后再重新生成。';
  }
  return message;
}

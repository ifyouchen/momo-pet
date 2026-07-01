import { useCallback, useEffect, useRef, useState } from 'react';
import type { CareAction } from '../types';
import {
  HINT_COMPLETE,
  HINT_FAILED,
  HINT_TIMEOUT,
  INTERACTION_CANCEL_DELAY_MS,
  INTERACTION_TIMEOUT_MS,
  MODE_HINTS,
  TOUCH_REQUIRED_DISTANCE,
} from '../runtime/pet-interaction-config';
import type { Point } from '../runtime/pet-interaction-geometry';
import {
  usePetInteractionFood,
  usePetInteractionTouch,
  type PetInteractionFoodHandlers,
  type PetInteractionTouchHandlers,
} from './use-pet-interaction-handlers';

export interface PetInteractionModel {
  readonly dragPoint: Point | null;
  readonly touchDistance: number;
  readonly touchProgress: number;
  readonly isCompleting: boolean;
  readonly touchStartedAtRef: React.MutableRefObject<number>;
  readonly touchDistanceRef: React.MutableRefObject<number>;
  readonly lastTouchPointRef: React.MutableRefObject<Point | null>;
  readonly hitZoneRef: React.MutableRefObject<HTMLDivElement | null>;
  readonly completeInteraction: (action: CareAction) => Promise<void>;
}

export type PetInteractionFoodModel = PetInteractionModel & PetInteractionFoodHandlers;
export type PetInteractionTouchModel = PetInteractionModel & PetInteractionTouchHandlers;
export type PetInteractionHandlersModel = PetInteractionModel &
  PetInteractionFoodHandlers &
  PetInteractionTouchHandlers;

interface UsePetInteractionOptions {
  readonly mode: CareAction | null;
  readonly canCare: boolean;
  readonly isSubmitting: boolean;
  readonly compact: boolean;
  readonly onComplete: (action: CareAction) => Promise<void>;
  readonly onCancel: () => void;
  readonly onHintChange: (message: string | null) => void;
}

/**
 * 桌宠交互手势状态机：管理拖拽点、触摸距离、提交锁和超时自动取消。
 */
export function usePetInteraction({
  mode,
  canCare,
  isSubmitting,
  compact,
  onComplete,
  onCancel,
  onHintChange,
}: UsePetInteractionOptions): PetInteractionHandlersModel {
  const hitZoneRef = useRef<HTMLDivElement | null>(null);
  const lastTouchPointRef = useRef<Point | null>(null);
  const touchStartedAtRef = useRef(0);
  const touchDistanceRef = useRef(0);
  const isCompletingRef = useRef(false);
  const cancelTimeoutRef = useRef<number | null>(null);
  const cancelDelayTimeoutRef = useRef<number | null>(null);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const [touchDistance, setTouchDistance] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const clearCancelTimeout = useCallback(() => {
    if (cancelTimeoutRef.current !== null) {
      window.clearTimeout(cancelTimeoutRef.current);
      cancelTimeoutRef.current = null;
    }
    if (cancelDelayTimeoutRef.current !== null) {
      window.clearTimeout(cancelDelayTimeoutRef.current);
      cancelDelayTimeoutRef.current = null;
    }
  }, []);

  const scheduleDelayedCancel = useCallback(() => {
    if (cancelDelayTimeoutRef.current !== null) {
      window.clearTimeout(cancelDelayTimeoutRef.current);
    }
    cancelDelayTimeoutRef.current = window.setTimeout(() => {
      cancelDelayTimeoutRef.current = null;
      onCancel();
    }, INTERACTION_CANCEL_DELAY_MS);
  }, [onCancel]);

  const scheduleCancel = useCallback(() => {
    clearCancelTimeout();
    cancelTimeoutRef.current = window.setTimeout(() => {
      cancelTimeoutRef.current = null;
      if (!compact) {
        onHintChange(HINT_TIMEOUT);
      }
      scheduleDelayedCancel();
    }, INTERACTION_TIMEOUT_MS);
  }, [clearCancelTimeout, compact, onHintChange, scheduleDelayedCancel]);

  useEffect(() => {
    if (!mode) {
      onHintChange(null);
      return undefined;
    }
    if (!compact) {
      onHintChange(MODE_HINTS[mode]);
    }
    setDragPoint(null);
    setTouchDistance(0);
    setIsCompleting(false);
    touchDistanceRef.current = 0;
    isCompletingRef.current = false;
    lastTouchPointRef.current = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onHintChange(null);
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    scheduleCancel();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearCancelTimeout();
    };
  }, [clearCancelTimeout, compact, mode, onCancel, onHintChange, scheduleCancel]);

  const completeInteraction = useCallback(
    async (action: CareAction) => {
      const isBusy = !canCare || isSubmitting || isCompleting;
      if (isBusy || isCompletingRef.current) {
        return;
      }
      isCompletingRef.current = true;
      setIsCompleting(true);
      clearCancelTimeout();
      if (!compact) {
        onHintChange(HINT_COMPLETE);
      }
      try {
        await onComplete(action);
        if (!compact) {
          onHintChange(null);
        }
        scheduleDelayedCancel();
      } catch {
        isCompletingRef.current = false;
        setIsCompleting(false);
        if (!compact) {
          onHintChange(HINT_FAILED);
        }
      }
    },
    [
      canCare,
      clearCancelTimeout,
      compact,
      isCompleting,
      isSubmitting,
      onComplete,
      onHintChange,
      scheduleDelayedCancel,
    ],
  );

  const food = usePetInteractionFood({
    canCare,
    isSubmitting,
    isCompleting,
    compact,
    dragPoint,
    setDragPoint,
    hitZoneRef,
    completeInteraction,
    onHintChange,
  });

  const touch = usePetInteractionTouch({
    canCare,
    isSubmitting,
    isCompleting,
    compact,
    touchStartedAtRef,
    touchDistanceRef,
    lastTouchPointRef,
    setTouchDistance,
    completeInteraction,
    onHintChange,
    isCompletingRef,
  });

  const touchProgress = Math.min(100, Math.round((touchDistance / TOUCH_REQUIRED_DISTANCE) * 100));

  return {
    dragPoint,
    touchDistance,
    touchProgress,
    isCompleting,
    touchStartedAtRef,
    touchDistanceRef,
    lastTouchPointRef,
    hitZoneRef,
    completeInteraction,
    ...food,
    ...touch,
  };
}

import { useCallback, type MutableRefObject } from 'react';
import type { CareAction } from '../types';
import { HINT_DRAG, HINT_NEAR_MISS, MODE_HINTS } from '../runtime/pet-interaction-config';
import type { Point } from '../runtime/pet-interaction-geometry';

interface UsePetInteractionFoodOptions {
  /** 是否允许发起照顾请求。 */
  readonly canCare: boolean;
  /** 是否正在提交照顾请求。 */
  readonly isSubmitting: boolean;
  /** 是否正在完成手势（防重入）。 */
  readonly isCompleting: boolean;
  /** compact 模式。 */
  readonly compact: boolean;
  /** 当前拖拽点，未在拖拽时为 null。 */
  readonly dragPoint: Point | null;
  /** 设置拖拽点。 */
  readonly setDragPoint: (point: Point | null) => void;
  /** hit zone DOM 引用。 */
  readonly hitZoneRef: MutableRefObject<HTMLDivElement | null>;
  /** 命中 hit zone 时调用的完成函数。 */
  readonly completeInteraction: (action: CareAction) => Promise<void>;
  /** 提示文案变化时调用。 */
  readonly onHintChange: (message: string | null) => void;
}

export interface PetInteractionFoodHandlers {
  readonly handleFoodPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  readonly handleFoodPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  readonly handleFoodPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => Promise<void>;
}

/**
 * 喂食手势事件处理器：拖拽小鱼干到 hit zone 触发完成。
 */
export function usePetInteractionFood({
  canCare,
  isSubmitting,
  isCompleting,
  compact,
  dragPoint,
  setDragPoint,
  hitZoneRef,
  completeInteraction,
  onHintChange,
}: UsePetInteractionFoodOptions): PetInteractionFoodHandlers {
  const handleFoodPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!canCare || isSubmitting || isCompleting) {
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragPoint({ x: event.clientX, y: event.clientY });
      if (!compact) {
        onHintChange(HINT_DRAG);
      }
    },
    [canCare, compact, isCompleting, isSubmitting, onHintChange, setDragPoint],
  );

  const handleFoodPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragPoint || !canCare || isSubmitting || isCompleting) {
        return;
      }
      setDragPoint({ x: event.clientX, y: event.clientY });
    },
    [canCare, dragPoint, isCompleting, isSubmitting, setDragPoint],
  );

  const handleFoodPointerUp = useCallback(
    async (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragPoint || !canCare || isSubmitting || isCompleting) {
        return;
      }
      const hitRect = hitZoneRef.current?.getBoundingClientRect();
      setDragPoint(null);
      if (hitRect) {
        const inside =
          event.clientX >= hitRect.left &&
          event.clientX <= hitRect.right &&
          event.clientY >= hitRect.top &&
          event.clientY <= hitRect.bottom;
        if (inside) {
          await completeInteraction('feed');
          return;
        }
      }
      if (!compact) {
        onHintChange(HINT_NEAR_MISS);
      }
    },
    [
      canCare,
      completeInteraction,
      compact,
      dragPoint,
      hitZoneRef,
      isCompleting,
      isSubmitting,
      onHintChange,
      setDragPoint,
    ],
  );

  return { handleFoodPointerDown, handleFoodPointerMove, handleFoodPointerUp };
}

interface UsePetInteractionTouchOptions {
  readonly canCare: boolean;
  readonly isSubmitting: boolean;
  readonly isCompleting: boolean;
  readonly compact: boolean;
  readonly touchStartedAtRef: MutableRefObject<number>;
  readonly touchDistanceRef: MutableRefObject<number>;
  readonly lastTouchPointRef: MutableRefObject<Point | null>;
  readonly setTouchDistance: (distance: number) => void;
  readonly completeInteraction: (action: CareAction) => Promise<void>;
  readonly onHintChange: (message: string | null) => void;
  readonly isCompletingRef: MutableRefObject<boolean>;
}

export interface PetInteractionTouchHandlers {
  readonly handleTouchPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  readonly handleTouchPointerMove: (event: React.PointerEvent<HTMLDivElement>) => Promise<void>;
  readonly handleTouchPointerUp: () => void;
}

/**
 * 抚摸手势事件处理器：累计距离达到阈值后触发完成。
 */
export function usePetInteractionTouch({
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
}: UsePetInteractionTouchOptions): PetInteractionTouchHandlers {
  const handleTouchPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!canCare || isSubmitting || isCompleting) {
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      touchStartedAtRef.current = Date.now();
      lastTouchPointRef.current = { x: event.clientX, y: event.clientY };
      touchDistanceRef.current = 0;
      setTouchDistance(0);
      if (!compact) {
        onHintChange(MODE_HINTS.touch);
      }
    },
    [
      canCare,
      compact,
      isCompleting,
      isSubmitting,
      lastTouchPointRef,
      onHintChange,
      setTouchDistance,
      touchDistanceRef,
      touchStartedAtRef,
    ],
  );

  const handleTouchPointerMove = useCallback(
    async (event: React.PointerEvent<HTMLDivElement>) => {
      const previousPoint = lastTouchPointRef.current;
      if (!previousPoint || !canCare || isSubmitting || isCompleting) {
        return;
      }
      const nextPoint = { x: event.clientX, y: event.clientY };
      const nextDistance =
        touchDistanceRef.current +
        Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y);
      touchDistanceRef.current = nextDistance;
      lastTouchPointRef.current = nextPoint;
      setTouchDistance(nextDistance);
      const elapsedMs = Date.now() - touchStartedAtRef.current;
      if (elapsedMs >= 900 && nextDistance >= 120) {
        lastTouchPointRef.current = null;
        await completeInteraction('touch');
      }
    },
    [
      canCare,
      completeInteraction,
      isCompleting,
      isSubmitting,
      lastTouchPointRef,
      touchDistanceRef,
      touchStartedAtRef,
      setTouchDistance,
    ],
  );

  const handleTouchPointerUp = useCallback(() => {
    lastTouchPointRef.current = null;
    if (!compact && !isCompletingRef.current) {
      onHintChange('再摸一会儿嘛');
    }
  }, [compact, isCompletingRef, lastTouchPointRef, onHintChange]);

  return { handleTouchPointerDown, handleTouchPointerMove, handleTouchPointerUp };
}

import { Eraser, Fish, HandHeart, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { CareAction } from '../types';

interface PetInteractionLayerProps {
  readonly mode: CareAction | null;
  readonly canCare: boolean;
  readonly isSubmitting: boolean;
  readonly compact?: boolean;
  readonly onComplete: (action: CareAction) => Promise<void>;
  readonly onCancel: () => void;
  readonly onHintChange: (message: string | null) => void;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

const INTERACTION_TIMEOUT_MS = 12000;
const INTERACTION_CANCEL_DELAY_MS = 700;
const TOUCH_REQUIRED_DISTANCE = 120;
const TOUCH_REQUIRED_DURATION_MS = 900;

const MODE_COPY: Record<CareAction, { readonly title: string; readonly hint: string }> = {
  feed: { title: '喂食中', hint: '把小鱼干递给我嘛' },
  touch: { title: '抚摸中', hint: '摸摸头会更舒服' },
  clean: { title: '清理中', hint: '帮我清理一下吧' },
};

/**
 * Sprint 3 鼠标交互层，把模式手势转换为既有 Feed/Touch/Clean API 调用。
 *
 * 前置条件：mode 来自用户选择的 MVP 照顾行为。后置条件：成功手势会调用 onComplete。
 * @throws 本组件不主动抛出异常，提交错误由上层模型反馈。
 */
export function PetInteractionLayer({
  mode,
  canCare,
  isSubmitting,
  compact = false,
  onComplete,
  onCancel,
  onHintChange,
}: PetInteractionLayerProps) {
  const hitZoneRef = useRef<HTMLDivElement>(null);
  const lastTouchPointRef = useRef<Point | null>(null);
  const touchStartedAtRef = useRef(0);
  const touchDistanceRef = useRef(0);
  const isCompletingRef = useRef(false);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const [touchDistance, setTouchDistance] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!mode) {
      onHintChange(null);
      return undefined;
    }
    if (!compact) {
      onHintChange(MODE_COPY[mode].hint);
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
    const timeoutId = window.setTimeout(() => {
      if (!compact) {
        onHintChange('那我先自己待一会儿');
      }
      window.setTimeout(onCancel, INTERACTION_CANCEL_DELAY_MS);
    }, INTERACTION_TIMEOUT_MS);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [compact, mode, onCancel, onHintChange]);

  if (!mode) {
    return null;
  }

  const copy = MODE_COPY[mode];
  const isBusy = !canCare || isSubmitting || isCompleting;

  const completeInteraction = async (action: CareAction) => {
    if (isBusy || isCompletingRef.current) {
      return;
    }
    isCompletingRef.current = true;
    setIsCompleting(true);
    if (!compact) {
      onHintChange('我来啦');
    }
    try {
      await onComplete(action);
      if (!compact) {
        onHintChange(null);
      }
      window.setTimeout(onCancel, INTERACTION_CANCEL_DELAY_MS);
    } catch {
      isCompletingRef.current = false;
      setIsCompleting(false);
      if (!compact) {
        onHintChange('没有成功，再试一次');
      }
    }
  };

  const handleFoodPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (isBusy) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPoint({ x: event.clientX, y: event.clientY });
    if (!compact) {
      onHintChange('递到我嘴边嘛');
    }
  };

  const handleFoodPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragPoint || isBusy) {
      return;
    }
    setDragPoint({ x: event.clientX, y: event.clientY });
  };

  const handleFoodPointerUp = async (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragPoint || isBusy) {
      return;
    }
    const hitRect = hitZoneRef.current?.getBoundingClientRect();
    setDragPoint(null);
    if (hitRect && isPointInsideRect({ x: event.clientX, y: event.clientY }, hitRect)) {
      await completeInteraction('feed');
      return;
    }
    if (!compact) {
      onHintChange('还差一点点，放到嘴边哦');
    }
  };

  const handleTouchPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isBusy) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    touchStartedAtRef.current = Date.now();
    lastTouchPointRef.current = { x: event.clientX, y: event.clientY };
    touchDistanceRef.current = 0;
    setTouchDistance(0);
    if (!compact) {
      onHintChange('摸摸头会更舒服');
    }
  };

  const handleTouchPointerMove = async (event: PointerEvent<HTMLDivElement>) => {
    const previousPoint = lastTouchPointRef.current;
    if (!previousPoint || isBusy) {
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
    if (elapsedMs >= TOUCH_REQUIRED_DURATION_MS && nextDistance >= TOUCH_REQUIRED_DISTANCE) {
      lastTouchPointRef.current = null;
      await completeInteraction('touch');
    }
  };

  const handleTouchPointerUp = () => {
    lastTouchPointRef.current = null;
    if (!compact && !isCompletingRef.current) {
      onHintChange('再摸一会儿嘛');
    }
  };

  const touchProgress = Math.min(100, Math.round((touchDistance / TOUCH_REQUIRED_DISTANCE) * 100));

  return (
    <div className={`interaction-layer${compact ? ' interaction-layer-compact' : ''}`}>
      {!compact ? (
        <div className="interaction-panel" role="status">
          <strong>{copy.title}</strong>
          <button type="button" aria-label="退出交互模式" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div
        ref={hitZoneRef}
        className={`interaction-hit-zone interaction-hit-zone-${mode}`}
        aria-hidden={mode !== 'touch'}
        onPointerDown={mode === 'touch' ? handleTouchPointerDown : undefined}
        onPointerMove={mode === 'touch' ? (event) => void handleTouchPointerMove(event) : undefined}
        onPointerUp={mode === 'touch' ? handleTouchPointerUp : undefined}
      >
        {mode === 'touch' ? (
          <>
            <HandHeart size={compact ? 30 : 36} />
            <span className="touch-progress">
              <span style={{ width: `${touchProgress}%` }} />
            </span>
          </>
        ) : null}
        {mode === 'feed' ? (
          <>
            <Fish size={compact ? 18 : 22} />
            {!compact ? <span className="feed-target-label">嘴边</span> : null}
          </>
        ) : null}
      </div>

      {mode === 'feed' ? (
        <button
          type="button"
          className={`food-token${dragPoint ? ' food-token-dragging' : ''}`}
          style={dragPoint ? { left: dragPoint.x, top: dragPoint.y } : undefined}
          disabled={isBusy}
          onPointerDown={handleFoodPointerDown}
          onPointerMove={handleFoodPointerMove}
          onPointerUp={(event) => void handleFoodPointerUp(event)}
        >
          <Fish size={compact ? 22 : 26} />
          {!compact ? <span>小鱼干</span> : null}
        </button>
      ) : null}

      {mode === 'clean' ? (
        <button
          type="button"
          className="clean-token"
          disabled={isBusy}
          onClick={() => void completeInteraction('clean')}
        >
          <Eraser size={compact ? 20 : 24} />
          {!compact ? <span>{isBusy ? '清理中' : '点击清理'}</span> : null}
        </button>
      ) : null}
    </div>
  );
}

function isPointInsideRect(point: Point, rect: DOMRect): boolean {
  return (
    point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
  );
}

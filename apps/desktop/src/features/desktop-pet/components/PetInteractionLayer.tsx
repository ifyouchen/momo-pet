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
}

interface Point {
  readonly x: number;
  readonly y: number;
}

const MODE_COPY: Record<CareAction, { readonly title: string; readonly hint: string }> = {
  feed: { title: '喂食模式', hint: '拖动小鱼干到 Momo 身上' },
  touch: { title: '抚摸模式', hint: '按住 Momo 连续滑动 1 秒' },
  clean: { title: '清理模式', hint: '点击需要清理的位置' },
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
}: PetInteractionLayerProps) {
  const hitZoneRef = useRef<HTMLDivElement>(null);
  const lastTouchPointRef = useRef<Point | null>(null);
  const touchStartedAtRef = useRef(0);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const [touchDistance, setTouchDistance] = useState(0);
  const [message, setMessage] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!mode) {
      return undefined;
    }
    setMessage(MODE_COPY[mode].hint);
    setDragPoint(null);
    setTouchDistance(0);
    setIsCompleting(false);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    const timeoutId = window.setTimeout(onCancel, 12000);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, onCancel]);

  if (!mode) {
    return null;
  }

  const copy = MODE_COPY[mode];
  const isBusy = !canCare || isSubmitting || isCompleting;

  const completeInteraction = async (action: CareAction) => {
    if (isBusy) {
      return;
    }
    setIsCompleting(true);
    setMessage('处理中...');
    await onComplete(action);
    onCancel();
  };

  const handleFoodPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (isBusy) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPoint({ x: event.clientX, y: event.clientY });
    setMessage('拖到 Momo 身上松开');
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
    setMessage('再靠近 Momo 一点点');
  };

  const handleTouchPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isBusy) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    touchStartedAtRef.current = Date.now();
    lastTouchPointRef.current = { x: event.clientX, y: event.clientY };
    setTouchDistance(0);
    setMessage('继续轻轻滑动');
  };

  const handleTouchPointerMove = async (event: PointerEvent<HTMLDivElement>) => {
    const previousPoint = lastTouchPointRef.current;
    if (!previousPoint || isBusy) {
      return;
    }
    const nextPoint = { x: event.clientX, y: event.clientY };
    const nextDistance =
      touchDistance + Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y);
    lastTouchPointRef.current = nextPoint;
    setTouchDistance(nextDistance);

    const elapsedMs = Date.now() - touchStartedAtRef.current;
    if (elapsedMs >= 900 && nextDistance >= 80) {
      lastTouchPointRef.current = null;
      await completeInteraction('touch');
    }
  };

  const handleTouchPointerUp = () => {
    lastTouchPointRef.current = null;
    if (!isCompleting) {
      setMessage('滑动久一点就会触发抚摸');
    }
  };

  const touchProgress = Math.min(100, Math.round((touchDistance / 120) * 100));

  return (
    <div className={`interaction-layer${compact ? ' interaction-layer-compact' : ''}`}>
      <div className="interaction-panel" role="status">
        <div>
          <strong>{copy.title}</strong>
          <span>{message}</span>
        </div>
        <button type="button" aria-label="退出交互模式" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>

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
          <span>小鱼干</span>
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
          <span>清理</span>
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

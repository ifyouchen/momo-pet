import { Eraser, Fish, HandHeart, X } from 'lucide-react';
import type { CareAction } from '../types';
import { usePetInteraction } from '../hooks/use-pet-interaction';

interface PetInteractionLayerProps {
  readonly mode: CareAction | null;
  readonly canCare: boolean;
  readonly isSubmitting: boolean;
  readonly compact?: boolean;
  readonly onComplete: (action: CareAction) => Promise<void>;
  readonly onCancel: () => void;
  readonly onHintChange: (message: string | null) => void;
}

const MODE_TITLE: Record<CareAction, string> = {
  feed: '喂食中',
  touch: '抚摸中',
  clean: '清理中',
};

const CLEAN_IDLE_LABEL = '点击清理';
const CLEAN_BUSY_LABEL = '清理中';

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
  const interaction = usePetInteraction({
    mode,
    canCare,
    isSubmitting,
    compact,
    onComplete,
    onCancel,
    onHintChange,
  });

  if (!mode) {
    return null;
  }

  const title = MODE_TITLE[mode];
  const isBusy = !canCare || isSubmitting || interaction.isCompleting;
  const dragPoint = interaction.dragPoint;

  return (
    <div className={`interaction-layer${compact ? ' interaction-layer-compact' : ''}`}>
      {!compact ? (
        <div className="interaction-panel" role="status">
          <strong>{title}</strong>
          <button type="button" aria-label="退出交互模式" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div
        ref={interaction.hitZoneRef}
        className={`interaction-hit-zone interaction-hit-zone-${mode}`}
        aria-hidden={mode !== 'touch'}
        onPointerDown={mode === 'touch' ? interaction.handleTouchPointerDown : undefined}
        onPointerMove={
          mode === 'touch' ? (event) => void interaction.handleTouchPointerMove(event) : undefined
        }
        onPointerUp={mode === 'touch' ? interaction.handleTouchPointerUp : undefined}
      >
        {mode === 'touch' ? (
          <>
            <HandHeart size={compact ? 30 : 36} />
            <span className="touch-progress">
              <span style={{ width: `${interaction.touchProgress}%` }} />
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
          onPointerDown={interaction.handleFoodPointerDown}
          onPointerMove={interaction.handleFoodPointerMove}
          onPointerUp={(event) => void interaction.handleFoodPointerUp(event)}
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
          onClick={() => void interaction.completeInteraction('clean')}
        >
          <Eraser size={compact ? 20 : 24} />
          {!compact ? <span>{isBusy ? CLEAN_BUSY_LABEL : CLEAN_IDLE_LABEL}</span> : null}
        </button>
      ) : null}
    </div>
  );
}

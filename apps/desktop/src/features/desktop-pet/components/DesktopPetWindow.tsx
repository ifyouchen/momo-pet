import { EyeOff, Heart, Home, Trash2, Utensils } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import type { DefaultPetModel } from '../hooks/use-default-pet';
import { hidePetWindow, openHomeWindow, startPetWindowDrag } from '../runtime/desktop-runtime-api';
import type { CareAction } from '../types';
import { MomoPetAvatar } from './MomoPetAvatar';
import { PetInteractionLayer } from './PetInteractionLayer';
import { SpeechBubble } from './SpeechBubble';
import { StateDeltaFloat } from './StateDeltaFloat';

interface DesktopPetWindowProps {
  /** 默认宠物模型，提供宠物视觉动作、反馈和照顾行为。 */
  readonly model: DefaultPetModel;
  /** runtime 降级提示，通常来自 Tauri 窗口模式读取失败。 */
  readonly runtimeWarning: string | null;
}

/**
 * 透明桌宠窗口布局，只保留桌宠主体和最小控制。
 *
 * 前置条件：运行在 pet-window 模式或浏览器预览 `?window=pet`。后置条件：桌宠可拖动并可打开主页。
 * @throws 本组件不主动抛出异常。
 */
export function DesktopPetWindow({ model, runtimeWarning }: DesktopPetWindowProps) {
  const [activeInteractionMode, setActiveInteractionMode] = useState<CareAction | null>(null);
  const [interactionHint, setInteractionHint] = useState<string | null>(null);
  const cancelInteractionMode = useCallback(() => {
    setInteractionHint(null);
    setActiveInteractionMode(null);
  }, []);
  const feedbackMessage = runtimeWarning ?? interactionHint ?? model.feedback.message;
  const feedbackTone = runtimeWarning ? 'error' : interactionHint ? 'idle' : model.feedback.tone;

  const handleDragStart = (event: MouseEvent<HTMLElement>) => {
    if (activeInteractionMode || event.button !== 0 || isInteractiveElement(event.target)) {
      return;
    }
    void startPetWindowDrag();
  };

  return (
    <main className="pet-window-shell" aria-label="Momo Pet transparent desktop window">
      <section
        className="pet-window-drag-zone"
        aria-label="拖动 Momo Pet"
        data-tauri-drag-region
        onMouseDown={handleDragStart}
      >
        <StateDeltaFloat deltas={model.stateDeltas} />
        <MomoPetAvatar action={model.visualAction} />
        <button
          type="button"
          className="pet-window-drag-handle"
          aria-label="拖动桌宠"
          title="按住拖动桌宠"
          data-tauri-drag-region
          onMouseDown={(event) => {
            event.preventDefault();
            void startPetWindowDrag();
          }}
        >
          拖动
        </button>
        <SpeechBubble message={feedbackMessage} tone={feedbackTone} />
        <PetInteractionLayer
          mode={activeInteractionMode}
          canCare={model.canCare}
          isSubmitting={model.activeAction !== null}
          compact
          onComplete={model.handleCareAction}
          onCancel={cancelInteractionMode}
          onHintChange={setInteractionHint}
        />
      </section>

      <div className="pet-window-toolbar" aria-label="桌宠窗口操作">
        <button
          type="button"
          className="pet-window-tool"
          aria-label="喂食模式"
          title="喂食模式"
          disabled={!model.canCare}
          onClick={() => setActiveInteractionMode('feed')}
        >
          <Utensils size={17} />
        </button>
        <button
          type="button"
          className="pet-window-tool"
          aria-label="抚摸模式"
          title="抚摸模式"
          disabled={!model.canCare}
          onClick={() => setActiveInteractionMode('touch')}
        >
          <Heart size={17} />
        </button>
        <button
          type="button"
          className="pet-window-tool"
          aria-label="清理模式"
          title="清理模式"
          disabled={!model.canCare}
          onClick={() => setActiveInteractionMode('clean')}
        >
          <Trash2 size={17} />
        </button>
        <button
          type="button"
          className="pet-window-tool"
          aria-label="打开主页"
          title="打开主页"
          onClick={() => void openHomeWindow()}
        >
          <Home size={17} />
        </button>
        <button
          type="button"
          className="pet-window-tool"
          aria-label="隐藏桌宠"
          title="隐藏桌宠"
          onClick={() => void hidePetWindow()}
        >
          <EyeOff size={17} />
        </button>
      </div>
    </main>
  );
}

function isInteractiveElement(target: EventTarget): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('button,a,input,textarea,select'));
}

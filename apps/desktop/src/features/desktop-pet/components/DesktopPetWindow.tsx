import type { MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useDesktopPetBubble } from '../hooks/use-desktop-pet-bubble';
import { useDesktopPetToolbar } from '../hooks/use-desktop-pet-toolbar';
import type { DefaultPetModel } from '../hooks/use-default-pet';
import { usePetChat } from '../hooks/use-pet-chat';
import { usePetLifeSystem } from '../hooks/use-pet-life-system';
import { hidePetWindow, openHomeWindow, startPetWindowDrag } from '../runtime/desktop-runtime-api';
import type { CareAction } from '../types';
import { CompactChatInput } from './CompactChatInput';
import { DesktopPetBubble } from './DesktopPetBubble';
import { DesktopPetInteractionLayer } from './DesktopPetInteractionLayer';
import { DesktopPetToolbar } from './DesktopPetToolbar';
import { MomoPetAvatar } from './MomoPetAvatar';
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const chat = usePetChat({
    petId: model.pet?.petId ?? null,
    onStateChange: model.handleStateChange,
  });
  const isLifeSystemPaused =
    isChatOpen || activeInteractionMode !== null || model.activeAction !== null;
  const life = usePetLifeSystem({
    state: model.state,
    isPaused: isLifeSystemPaused,
  });
  const latestPetReply = useMemo(() => findLatestPetReply(chat.messages), [chat.messages]);
  const visiblePetReply =
    latestPetReply?.messageId === chat.latestSentPetReplyId ? latestPetReply : null;

  const cancelInteractionMode = useCallback(() => {
    setInteractionHint(null);
    setActiveInteractionMode(null);
  }, []);

  const toolbar = useDesktopPetToolbar({ lockExpanded: activeInteractionMode !== null });

  const handleSelectInteractionMode = useCallback(
    (action: CareAction) => {
      setIsChatOpen(false);
      toolbar.openToolbar();
      setInteractionHint(null);
      setActiveInteractionMode(action);
    },
    [toolbar],
  );

  const handleOpenChat = useCallback(() => {
    setInteractionHint(null);
    setActiveInteractionMode(null);
    setIsChatOpen(true);
    toolbar.closeToolbar();
  }, [toolbar]);

  const handleCloseChat = useCallback(() => {
    toolbar.closeToolbar();
    setIsChatOpen(false);
  }, [toolbar]);

  const bubbleMessage =
    runtimeWarning ??
    interactionHint ??
    (isChatOpen && visiblePetReply
      ? visiblePetReply.content
      : activeInteractionMode
        ? null
        : (life.reminderMessage ?? model.feedback.message));
  const bubbleTone = runtimeWarning
    ? 'error'
    : interactionHint || life.reminderMessage
      ? 'idle'
      : model.feedback.tone;
  const bubbleDurationMs = runtimeWarning
    ? null
    : isChatOpen && visiblePetReply
      ? getChatBubbleDurationMs(visiblePetReply.content)
      : life.reminderMessage
        ? 12000
        : 3000;
  const bubbleKey = `${bubbleTone}:${visiblePetReply?.messageId ?? bubbleMessage ?? ''}`;

  const bubble = useDesktopPetBubble({
    message: bubbleMessage,
    defaultDurationMs: bubbleDurationMs,
    resetKey: bubbleKey,
  });

  const visualAction =
    model.visualAction === 'idle' && life.visualAction ? life.visualAction : model.visualAction;

  const handleDragStart = (event: MouseEvent<HTMLElement>) => {
    if (activeInteractionMode || event.button !== 0 || isInteractiveElement(event.target)) {
      return;
    }
    toolbar.closeToolbar();
    void startPetWindowDrag();
  };

  return (
    <main
      className={`pet-window-shell pet-life-${life.behavior} pet-life-facing-${life.direction}`}
      style={life.previewStyle}
      aria-label="Momo Pet transparent desktop window"
    >
      <section
        className="pet-window-drag-zone"
        aria-label="拖动 Momo Pet"
        data-tauri-drag-region
        onMouseDown={handleDragStart}
      >
        <StateDeltaFloat deltas={model.stateDeltas} />
        <MomoPetAvatar action={visualAction} direction={life.direction} />
        {bubble.isBubbleVisible && bubbleMessage ? (
          <DesktopPetBubble
            message={bubbleMessage}
            tone={bubbleTone}
            variant={isChatOpen && visiblePetReply ? 'chat' : 'feedback'}
            onPauseAutoHide={bubble.handleBubbleMouseEnter}
            onResumeAutoHide={bubble.handleBubbleMouseLeave}
          />
        ) : null}
        <DesktopPetInteractionLayer
          mode={activeInteractionMode}
          canCare={model.canCare}
          isSubmitting={model.activeAction !== null}
          onComplete={model.handleCareAction}
          onCancel={cancelInteractionMode}
          onHintChange={setInteractionHint}
        />
      </section>
      {isChatOpen ? <CompactChatInput chat={chat} onClose={handleCloseChat} /> : null}

      {!isChatOpen && !activeInteractionMode ? (
        <DesktopPetToolbar
          isExpanded={toolbar.isToolbarExpanded}
          canCare={model.canCare}
          onToggle={toolbar.handleToolbarToggle}
          onOpen={toolbar.openToolbar}
          onSelectCareMode={handleSelectInteractionMode}
          onOpenChat={handleOpenChat}
          onOpenHome={() => void openHomeWindow()}
          onHidePet={() => void hidePetWindow()}
          onMouseEnter={toolbar.handleToolbarMouseEnter}
          onMouseLeave={toolbar.handleToolbarMouseLeave}
        />
      ) : null}
    </main>
  );
}

function isInteractiveElement(target: EventTarget): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('button,a,input,textarea,select'));
}

function findLatestPetReply(
  messages: ReturnType<typeof usePetChat>['messages'],
): ReturnType<typeof usePetChat>['messages'][number] | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'PET') {
      return message;
    }
  }
  return null;
}

function getChatBubbleDurationMs(content: string): number {
  return Math.min(12000, 8000 + content.length * 80);
}

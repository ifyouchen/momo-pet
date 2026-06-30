import { EyeOff, Heart, Home, MessageCircle, MoreHorizontal, Trash2, Utensils } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DefaultPetModel } from '../hooks/use-default-pet';
import { usePetChat } from '../hooks/use-pet-chat';
import { hidePetWindow, openHomeWindow, startPetWindowDrag } from '../runtime/desktop-runtime-api';
import type { CareAction } from '../types';
import { CompactChatInput } from './CompactChatInput';
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [isBubbleAutoHidePaused, setIsBubbleAutoHidePaused] = useState(false);
  const toolbarHoverTimeoutRef = useRef<number | null>(null);
  const toolbarHoverSuppressedUntilRef = useRef(0);
  const chat = usePetChat({
    petId: model.pet?.petId ?? null,
    onStateChange: model.handleStateChange,
  });
  const latestPetReply = useMemo(() => findLatestPetReply(chat.messages), [chat.messages]);
  const visiblePetReply =
    latestPetReply?.messageId === chat.latestSentPetReplyId ? latestPetReply : null;
  const cancelInteractionMode = useCallback(() => {
    setInteractionHint(null);
    setActiveInteractionMode(null);
    setIsToolbarExpanded(false);
  }, []);
  const handleSelectInteractionMode = useCallback((action: CareAction) => {
    setIsChatOpen(false);
    setIsToolbarExpanded(true);
    setInteractionHint(null);
    setActiveInteractionMode(action);
  }, []);
  const handleOpenChat = useCallback(() => {
    setInteractionHint(null);
    setActiveInteractionMode(null);
    setIsChatOpen(true);
    setIsToolbarExpanded(false);
  }, []);
  const handleCloseChat = useCallback(() => {
    toolbarHoverSuppressedUntilRef.current = Date.now() + 700;
    setIsChatOpen(false);
    setIsToolbarExpanded(false);
  }, []);
  const handleToggleToolbar = useCallback(() => {
    setIsToolbarExpanded((current) => !current);
  }, []);
  const handlePauseBubbleAutoHide = useCallback(() => {
    setIsBubbleAutoHidePaused(true);
  }, []);
  const handleResumeBubbleAutoHide = useCallback(() => {
    setIsBubbleAutoHidePaused(false);
  }, []);
  const clearToolbarHoverTimeout = useCallback(() => {
    if (toolbarHoverTimeoutRef.current !== null) {
      window.clearTimeout(toolbarHoverTimeoutRef.current);
      toolbarHoverTimeoutRef.current = null;
    }
  }, []);
  const handleToolbarMouseEnter = useCallback(() => {
    clearToolbarHoverTimeout();
    if (Date.now() < toolbarHoverSuppressedUntilRef.current) {
      return;
    }
    toolbarHoverTimeoutRef.current = window.setTimeout(() => {
      setIsToolbarExpanded(true);
      toolbarHoverTimeoutRef.current = null;
    }, 120);
  }, [clearToolbarHoverTimeout]);
  const handleToolbarMouseLeave = useCallback(() => {
    clearToolbarHoverTimeout();
    if (!activeInteractionMode) {
      setIsToolbarExpanded(false);
    }
  }, [activeInteractionMode, clearToolbarHoverTimeout]);
  const bubbleMessage =
    runtimeWarning ??
    interactionHint ??
    (isChatOpen && visiblePetReply
      ? visiblePetReply.content
      : activeInteractionMode
        ? null
        : model.feedback.message);
  const bubbleTone = runtimeWarning ? 'error' : interactionHint ? 'idle' : model.feedback.tone;
  const bubbleDurationMs = runtimeWarning
    ? null
    : isChatOpen && visiblePetReply
      ? getChatBubbleDurationMs(visiblePetReply.content)
      : 3000;
  const bubbleKey = `${bubbleTone}:${visiblePetReply?.messageId ?? bubbleMessage ?? ''}`;

  const handleDragStart = (event: MouseEvent<HTMLElement>) => {
    if (activeInteractionMode || event.button !== 0 || isInteractiveElement(event.target)) {
      return;
    }
    setIsToolbarExpanded(false);
    void startPetWindowDrag();
  };

  useEffect(() => clearToolbarHoverTimeout, [clearToolbarHoverTimeout]);

  useEffect(() => {
    setIsBubbleAutoHidePaused(false);
  }, [bubbleKey]);

  useEffect(() => {
    if (!bubbleMessage) {
      setIsBubbleVisible(false);
      setIsBubbleAutoHidePaused(false);
      return undefined;
    }
    setIsBubbleVisible(true);
    if (bubbleDurationMs === null || isBubbleAutoHidePaused) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setIsBubbleVisible(false), bubbleDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [bubbleDurationMs, bubbleKey, bubbleMessage, isBubbleAutoHidePaused]);

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
        {isBubbleVisible && bubbleMessage ? (
          <SpeechBubble
            message={bubbleMessage}
            tone={bubbleTone}
            variant={isChatOpen && visiblePetReply ? 'chat' : 'feedback'}
            onPauseAutoHide={handlePauseBubbleAutoHide}
            onResumeAutoHide={handleResumeBubbleAutoHide}
          />
        ) : null}
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
      {isChatOpen ? <CompactChatInput chat={chat} onClose={handleCloseChat} /> : null}

      {!isChatOpen && !activeInteractionMode ? (
        <div
          className={`pet-window-toolbar-shell${isToolbarExpanded ? ' pet-window-toolbar-expanded' : ''}`}
          aria-label="桌宠窗口操作"
          onMouseEnter={handleToolbarMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        >
          {isToolbarExpanded ? (
            <div className="pet-window-toolbar">
              <button
                type="button"
                className="pet-window-tool"
                aria-label="喂食模式"
                title="喂食模式"
                disabled={!model.canCare}
                onClick={() => handleSelectInteractionMode('feed')}
              >
                <Utensils size={17} />
              </button>
              <button
                type="button"
                className="pet-window-tool"
                aria-label="抚摸模式"
                title="抚摸模式"
                disabled={!model.canCare}
                onClick={() => handleSelectInteractionMode('touch')}
              >
                <Heart size={17} />
              </button>
              <button
                type="button"
                className="pet-window-tool"
                aria-label="清理模式"
                title="清理模式"
                disabled={!model.canCare}
                onClick={() => handleSelectInteractionMode('clean')}
              >
                <Trash2 size={17} />
              </button>
              <button
                type="button"
                className="pet-window-tool"
                aria-label="打开聊天"
                title="打开聊天"
                disabled={!model.canCare}
                onClick={handleOpenChat}
              >
                <MessageCircle size={17} />
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
          ) : (
            <button
              type="button"
              className="pet-window-toolbar-trigger"
              aria-label="展开桌宠工具栏"
              title="展开桌宠工具栏"
              onClick={handleToggleToolbar}
              onFocus={() => setIsToolbarExpanded(true)}
            >
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>
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

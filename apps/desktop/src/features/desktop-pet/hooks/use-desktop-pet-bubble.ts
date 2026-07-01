import { useCallback, useEffect, useState } from 'react';

export interface DesktopPetBubbleModel {
  /** 当前气泡是否可见。 */
  readonly isBubbleVisible: boolean;
  /** 用户进入气泡时触发，暂停自动隐藏计时。 */
  readonly handleBubbleMouseEnter: () => void;
  /** 用户离开气泡时触发，恢复自动隐藏计时。 */
  readonly handleBubbleMouseLeave: () => void;
}

interface UseDesktopPetBubbleOptions {
  /** 气泡要展示的文案；为空时强制隐藏。 */
  readonly message: string | null;
  /** 单次展示的默认持续时间（毫秒）；传 null 表示常驻不自动隐藏。 */
  readonly defaultDurationMs: number | null;
  /** 气泡内容键变化时重置自动隐藏计时，避免跨文案复用。 */
  readonly resetKey: string;
}

/**
 * 控制透明桌宠气泡的可见性与自动隐藏。
 *
 * 行为约定：
 * - message 为空 → 立即隐藏并取消计时。
 * - defaultDurationMs 为 null → 气泡常驻，等待调用方主动隐藏。
 * - mouseEnter / mouseLeave 在业务层用于让用户阅读气泡时暂停计时。
 */
export function useDesktopPetBubble({
  message,
  defaultDurationMs,
  resetKey,
}: UseDesktopPetBubbleOptions): DesktopPetBubbleModel {
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [isBubbleAutoHidePaused, setIsBubbleAutoHidePaused] = useState(false);

  useEffect(() => {
    setIsBubbleAutoHidePaused(false);
  }, [resetKey]);

  useEffect(() => {
    if (!message) {
      setIsBubbleVisible(false);
      setIsBubbleAutoHidePaused(false);
      return undefined;
    }
    setIsBubbleVisible(true);
    if (defaultDurationMs === null || isBubbleAutoHidePaused) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setIsBubbleVisible(false);
    }, defaultDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [defaultDurationMs, isBubbleAutoHidePaused, message, resetKey]);

  const handleBubbleMouseEnter = useCallback(() => {
    setIsBubbleAutoHidePaused(true);
  }, []);

  const handleBubbleMouseLeave = useCallback(() => {
    setIsBubbleAutoHidePaused(false);
  }, []);

  return {
    isBubbleVisible,
    handleBubbleMouseEnter,
    handleBubbleMouseLeave,
  };
}

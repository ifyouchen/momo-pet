import { useCallback, useEffect, useRef, useState } from 'react';

export interface DesktopPetToolbarModel {
  /** 当前是否展开工具栏。 */
  readonly isToolbarExpanded: boolean;
  /** 点击触发器时切换展开/收起。 */
  readonly handleToolbarToggle: () => void;
  /** 鼠标进入工具栏时延迟展开，避免误触。 */
  readonly handleToolbarMouseEnter: () => void;
  /** 鼠标离开工具栏时立即收起。 */
  readonly handleToolbarMouseLeave: () => void;
  /** 主动关闭工具栏。 */
  readonly closeToolbar: () => void;
  /** 主动展开工具栏。 */
  readonly openToolbar: () => void;
}

interface UseDesktopPetToolbarOptions {
  /** 是否锁定展开状态，交互模式下应保持展开不收起。 */
  readonly lockExpanded?: boolean;
  /** 鼠标进入后延迟展开的毫秒数。 */
  readonly hoverExpandDelayMs?: number;
  /** 关闭工具栏后，短时间内抑制 hover 自动展开。 */
  readonly hoverSuppressionMs?: number;
}

const DEFAULT_HOVER_EXPAND_DELAY_MS = 120;
const DEFAULT_HOVER_SUPPRESSION_MS = 700;

/**
 * 控制透明桌宠工具栏的展开/收起与 hover 行为。
 *
 * 行为约定：
 * - 鼠标 hover 工具栏触发延迟展开，避免快速划过时误展开。
 * - lockExpanded=true（如正在交互）时，hover 离开不会收起。
 * - 主动关闭工具栏后短暂抑制 hover 展开，避免按钮位移导致立即重新展开。
 */
export function useDesktopPetToolbar({
  lockExpanded = false,
  hoverExpandDelayMs = DEFAULT_HOVER_EXPAND_DELAY_MS,
  hoverSuppressionMs = DEFAULT_HOVER_SUPPRESSION_MS,
}: UseDesktopPetToolbarOptions = {}): DesktopPetToolbarModel {
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const hoverSuppressedUntilRef = useRef(0);

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearHoverTimeout, [clearHoverTimeout]);

  const handleToolbarToggle = useCallback(() => {
    clearHoverTimeout();
    setIsToolbarExpanded((current) => !current);
  }, [clearHoverTimeout]);

  const closeToolbar = useCallback(() => {
    hoverSuppressedUntilRef.current = Date.now() + hoverSuppressionMs;
    setIsToolbarExpanded(false);
  }, [hoverSuppressionMs]);

  const openToolbar = useCallback(() => {
    setIsToolbarExpanded(true);
  }, []);

  const handleToolbarMouseEnter = useCallback(() => {
    clearHoverTimeout();
    if (Date.now() < hoverSuppressedUntilRef.current) {
      return;
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsToolbarExpanded(true);
      hoverTimeoutRef.current = null;
    }, hoverExpandDelayMs);
  }, [clearHoverTimeout, hoverExpandDelayMs]);

  const handleToolbarMouseLeave = useCallback(() => {
    clearHoverTimeout();
    if (!lockExpanded) {
      setIsToolbarExpanded(false);
    }
  }, [clearHoverTimeout, lockExpanded]);

  return {
    isToolbarExpanded,
    handleToolbarToggle,
    handleToolbarMouseEnter,
    handleToolbarMouseLeave,
    closeToolbar,
    openToolbar,
  };
}

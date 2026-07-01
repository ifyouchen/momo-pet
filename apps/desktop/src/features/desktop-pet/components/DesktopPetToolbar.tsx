import { EyeOff, Heart, Home, MessageCircle, MoreHorizontal, Trash2, Utensils } from 'lucide-react';
import type { CareAction } from '../types';

interface DesktopPetToolbarProps {
  /** 是否展开工具栏；为 true 时渲染功能按钮组，否则渲染触发按钮。 */
  readonly isExpanded: boolean;
  /** 是否允许执行喂食/抚摸/清理/聊天等需要后端权限的操作。 */
  readonly canCare: boolean;
  /** 点击触发器时切换展开/收起。 */
  readonly onToggle: () => void;
  /** 聚焦触发器时展开工具栏，避免 focus + click 连续 toggle 造成抖动。 */
  readonly onOpen: () => void;
  /** 选中某个照顾动作，触发对应交互模式。 */
  readonly onSelectCareMode: (action: CareAction) => void;
  /** 打开聊天。 */
  readonly onOpenChat: () => void;
  /** 打开主页窗口。 */
  readonly onOpenHome: () => void;
  /** 隐藏桌宠窗口。 */
  readonly onHidePet: () => void;
  /** 鼠标进入工具栏容器，父级控制 hover 延迟展开。 */
  readonly onMouseEnter: () => void;
  /** 鼠标离开工具栏容器，父级控制 hover 收起。 */
  readonly onMouseLeave: () => void;
}

/**
 * 桌宠工具栏展示层：渲染触发按钮或功能按钮组，不包含任何业务状态。
 *
 * 前置条件：父级已决定展开/收起并提供所有交互回调。
 */
export function DesktopPetToolbar({
  isExpanded,
  canCare,
  onToggle,
  onOpen,
  onSelectCareMode,
  onOpenChat,
  onOpenHome,
  onHidePet,
  onMouseEnter,
  onMouseLeave,
}: DesktopPetToolbarProps) {
  return (
    <div
      className={`pet-window-toolbar-shell${isExpanded ? ' pet-window-toolbar-expanded' : ''}`}
      aria-label="桌宠窗口操作"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isExpanded ? (
        <div className="pet-window-toolbar">
          <button
            type="button"
            className="pet-window-tool"
            aria-label="喂食模式"
            title="喂食模式"
            disabled={!canCare}
            onClick={() => onSelectCareMode('feed')}
          >
            <Utensils size={17} />
          </button>
          <button
            type="button"
            className="pet-window-tool"
            aria-label="抚摸模式"
            title="抚摸模式"
            disabled={!canCare}
            onClick={() => onSelectCareMode('touch')}
          >
            <Heart size={17} />
          </button>
          <button
            type="button"
            className="pet-window-tool"
            aria-label="清理模式"
            title="清理模式"
            disabled={!canCare}
            onClick={() => onSelectCareMode('clean')}
          >
            <Trash2 size={17} />
          </button>
          <button
            type="button"
            className="pet-window-tool"
            aria-label="打开聊天"
            title="打开聊天"
            disabled={!canCare}
            onClick={onOpenChat}
          >
            <MessageCircle size={17} />
          </button>
          <button
            type="button"
            className="pet-window-tool"
            aria-label="打开主页"
            title="打开主页"
            onClick={onOpenHome}
          >
            <Home size={17} />
          </button>
          <button
            type="button"
            className="pet-window-tool"
            aria-label="隐藏桌宠"
            title="隐藏桌宠"
            onClick={onHidePet}
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
          onClick={onToggle}
          onFocus={onOpen}
        >
          <MoreHorizontal size={18} />
        </button>
      )}
    </div>
  );
}

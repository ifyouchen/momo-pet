import { Heart, MessageCircle, Sparkles, Trash2, Utensils } from 'lucide-react';
import type { CareAction } from '../types';

interface ActionDockProps {
  /** 当前正在提交的照顾动作；为空表示没有操作进行中。 */
  readonly activeAction: CareAction | null;
  /** 当前选中的鼠标交互模式；为空表示未进入交互模式。 */
  readonly activeInteractionMode: CareAction | null;
  /** 是否允许执行真实照顾动作。 */
  readonly canCare: boolean;
  /** 进入鼠标交互模式。 */
  readonly onSelectInteractionMode: (action: CareAction) => void;
  /** 打开 Pet Studio 创建流程。 */
  readonly onOpenPetStudio: () => void;
  /** 打开聊天面板。 */
  readonly onOpenChat: () => void;
}

const ACTIONS: Array<{
  readonly action: CareAction;
  readonly label: string;
  readonly shortLabel: string;
  readonly Icon: typeof Utensils;
}> = [
  { action: 'feed', label: '喂食', shortLabel: '小鱼干', Icon: Utensils },
  { action: 'touch', label: '抚摸', shortLabel: '摸摸头', Icon: Heart },
  { action: 'clean', label: '清理', shortLabel: '清洁', Icon: Trash2 },
];

/**
 * 桌宠主操作 Dock，区分真实可用动作和未来弱入口。
 *
 * 前置条件：onCareAction 已封装 API 行为。后置条件：用户操作会触发 loading 和状态刷新。
 * @throws 本组件不抛出异常。
 */
export function ActionDock({
  activeAction,
  activeInteractionMode,
  canCare,
  onSelectInteractionMode,
  onOpenPetStudio,
  onOpenChat,
}: ActionDockProps) {
  return (
    <div className="action-dock" aria-label="MVP pet actions">
      {ACTIONS.map(({ action, label, shortLabel, Icon }) => {
        const isLoading = activeAction === action;
        const isSelected = activeInteractionMode === action;
        return (
          <button
            type="button"
            className={`dock-button dock-button-primary${isSelected ? ' dock-button-selected' : ''}`}
            aria-label={label}
            disabled={!canCare}
            key={action}
            title={label}
            onClick={() => onSelectInteractionMode(action)}
          >
            <Icon size={19} />
            <span>{isLoading ? '处理中' : isSelected ? '进行中' : shortLabel}</span>
          </button>
        );
      })}
      <button
        type="button"
        className="dock-button dock-button-muted"
        aria-label="打开聊天"
        disabled={!canCare}
        title="打开聊天"
        onClick={onOpenChat}
      >
        <MessageCircle size={18} />
        <span>聊天</span>
      </button>
      <button
        type="button"
        className="dock-button dock-button-muted"
        aria-label="打开 Pet Studio"
        title="打开 Pet Studio"
        onClick={onOpenPetStudio}
      >
        <Sparkles size={18} />
        <span>生成</span>
      </button>
    </div>
  );
}

import type { CareAction } from '../types';
import { PetInteractionLayer } from './PetInteractionLayer';

interface DesktopPetInteractionLayerProps {
  /** 当前激活的照顾模式；为空时不渲染。 */
  readonly mode: CareAction | null;
  /** 是否允许发起照顾请求（受后端权限/疲劳度限制）。 */
  readonly canCare: boolean;
  /** 是否正在提交照顾请求。 */
  readonly isSubmitting: boolean;
  /** 成功完成照顾动作时调用，触发后端 API。 */
  readonly onComplete: (action: CareAction) => Promise<void>;
  /** 取消照顾动作时调用。 */
  readonly onCancel: () => void;
  /** 提示文案变化时调用，父级会把它展示到气泡。 */
  readonly onHintChange: (message: string | null) => void;
}

/**
 * 透明桌宠专用交互层包装：固定以 compact 模式渲染 PetInteractionLayer。
 *
 * 业务约定：桌宠窗口不展示完整交互面板，只接受鼠标手势触发照顾 API。
 *
 * 前置条件：父级编排了 mode / canCare / isSubmitting 状态。
 * 后置条件：成功手势会调用 onComplete；用户按 Esc 或超时由组件内部触发 onCancel。
 */
export function DesktopPetInteractionLayer({
  mode,
  canCare,
  isSubmitting,
  onComplete,
  onCancel,
  onHintChange,
}: DesktopPetInteractionLayerProps) {
  return (
    <PetInteractionLayer
      mode={mode}
      canCare={canCare}
      isSubmitting={isSubmitting}
      compact
      onComplete={onComplete}
      onCancel={onCancel}
      onHintChange={onHintChange}
    />
  );
}

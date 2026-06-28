import { useState } from 'react';
import { resolveSpriteAction } from '../assets/momo-pet-sprite';
import type { PetVisualAction } from '../types';

interface MomoPetAvatarProps {
  /** 当前视觉动作，来自运行时反馈，不承载领域业务判断。 */
  readonly action: PetVisualAction;
}

/**
 * 默认 Momo Pet 视觉规范组件。
 *
 * 前置条件：action 为 sprite manifest 支持的动作。后置条件：优先渲染透明 PNG 动作帧。
 * @throws 本组件不抛出异常。
 */
export function MomoPetAvatar({ action }: MomoPetAvatarProps) {
  const [failedActions, setFailedActions] = useState<ReadonlySet<PetVisualAction>>(new Set());
  const spriteAction = resolveSpriteAction(action, failedActions);

  return (
    <div className={`momo-pet momo-pet-${action}`} aria-label="Default Momo Pet">
      {spriteAction ? (
        <>
          <img
            className="momo-pet-image"
            src={spriteAction.definition.src}
            alt="Momo Pet 默认橘白长毛猫"
            draggable={false}
            onError={() =>
              setFailedActions((current) => addFailedAction(current, spriteAction.action))
            }
          />
          <span className="pet-shadow pet-shadow-image" />
        </>
      ) : (
        <FallbackPetAvatar />
      )}
    </div>
  );
}

function addFailedAction(
  current: ReadonlySet<PetVisualAction>,
  action: PetVisualAction,
): ReadonlySet<PetVisualAction> {
  const next = new Set(current);
  next.add(action);
  return next;
}

/**
 * 默认猫咪资产加载失败时的 CSS 降级形象。
 *
 * 前置条件：图片资源不可用。后置条件：仍能展示可交互宠物，不让主页白屏。
 * @throws 本组件不抛出异常。
 */
function FallbackPetAvatar() {
  return (
    <div className="momo-pet-fallback" aria-label="Fallback Momo Pet">
      <span className="pet-shadow" />
      <span className="ear ear-left">
        <span />
      </span>
      <span className="ear ear-right">
        <span />
      </span>
      <span className="face">
        <span className="cheek cheek-left" />
        <span className="cheek cheek-right" />
        <span className="eye eye-left" />
        <span className="eye eye-right" />
        <span className="nose" />
        <span className="mouth" />
      </span>
    </div>
  );
}

import { useState } from 'react';

type MomoMood = 'idle' | 'happy' | 'worried';

const DEFAULT_CAT_ASSET = '/assets/sprites/momo-pet/default-cat-idle.png';

interface MomoPetAvatarProps {
  /** 当前表情状态，来自用户操作反馈，不承载领域业务判断。 */
  readonly mood: MomoMood;
}

/**
 * 默认 Momo Pet 视觉规范组件。
 *
 * 前置条件：mood 为受控枚举。后置条件：优先渲染非 Q 版橘白长毛猫资产。
 * @throws 本组件不抛出异常。
 */
export function MomoPetAvatar({ mood }: MomoPetAvatarProps) {
  const [hasAssetError, setHasAssetError] = useState(false);

  return (
    <div className={`momo-pet momo-pet-${mood}`} aria-label="Default Momo Pet">
      {hasAssetError ? (
        <FallbackPetAvatar />
      ) : (
        <>
          <img
            className="momo-pet-image"
            src={DEFAULT_CAT_ASSET}
            alt="Momo Pet 默认橘白长毛猫"
            draggable={false}
            onError={() => setHasAssetError(true)}
          />
          <span className="pet-shadow pet-shadow-image" />
        </>
      )}
    </div>
  );
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

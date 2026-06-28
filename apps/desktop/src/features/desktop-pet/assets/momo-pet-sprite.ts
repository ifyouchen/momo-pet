import type { PetVisualAction } from '../types';

export interface SpriteActionDefinition {
  /** 运行时可访问的 PNG 资源路径。 */
  readonly src: string;
  /** MVP 先用单帧，后续 sprite sheet 扩展此字段。 */
  readonly frameCount: number;
  /** 动画播放帧率；单帧时用于保留统一接口。 */
  readonly fps: number;
  /** 动作是否循环播放。 */
  readonly loop: boolean;
  /** 当前动作资源缺失时的动作级回退。 */
  readonly fallbackAction: PetVisualAction | null;
}

export interface SpriteManifest {
  /** 默认猫咪资源包编码，后续用于 Pet DNA 匹配。 */
  readonly spriteCode: string;
  /** 默认宠物物种。 */
  readonly species: 'CAT';
  /** 默认猫咪视觉风格。 */
  readonly style: string;
  /** 没有显式动作时使用的默认动作。 */
  readonly defaultAction: PetVisualAction;
  /** 各动作资源定义。 */
  readonly actions: Record<PetVisualAction, SpriteActionDefinition>;
}

export interface ResolvedSpriteAction {
  /** 实际命中的动作，可能是请求动作的 fallback。 */
  readonly action: PetVisualAction;
  /** 实际命中的资源定义。 */
  readonly definition: SpriteActionDefinition;
}

export const MOMO_PET_SPRITE_MANIFEST: SpriteManifest = {
  spriteCode: 'momo-pet-default-cat',
  species: 'CAT',
  style: 'orange-white-longhair-tabby',
  defaultAction: 'idle',
  actions: {
    idle: {
      src: '/assets/sprites/momo-pet/frames/idle/default-cat-idle.png',
      frameCount: 1,
      fps: 1,
      loop: true,
      fallbackAction: null,
    },
    happy: {
      src: '/assets/sprites/momo-pet/frames/happy/default-cat-happy.png',
      frameCount: 1,
      fps: 1,
      loop: false,
      fallbackAction: 'idle',
    },
    eat: {
      src: '/assets/sprites/momo-pet/frames/eat/default-cat-eat.png',
      frameCount: 1,
      fps: 1,
      loop: false,
      fallbackAction: 'happy',
    },
    sleep: {
      src: '/assets/sprites/momo-pet/frames/sleep/default-cat-sleep.png',
      frameCount: 1,
      fps: 1,
      loop: true,
      fallbackAction: 'idle',
    },
    'low-head': {
      src: '/assets/sprites/momo-pet/frames/low-head/default-cat-low-head.png',
      frameCount: 1,
      fps: 1,
      loop: false,
      fallbackAction: 'idle',
    },
    lying: {
      src: '/assets/sprites/momo-pet/frames/lying/default-cat-lying.png',
      frameCount: 1,
      fps: 1,
      loop: true,
      fallbackAction: 'idle',
    },
    grooming: {
      src: '/assets/sprites/momo-pet/frames/grooming/default-cat-grooming.png',
      frameCount: 1,
      fps: 1,
      loop: false,
      fallbackAction: 'idle',
    },
  },
};

/**
 * 根据动作和已失败资源集合解析可用帧，按 manifest fallback 链路回退。
 *
 * 前置条件：action 来自 PetVisualAction。后置条件：返回可加载资源或 null 触发 CSS fallback。
 */
export function resolveSpriteAction(
  action: PetVisualAction,
  failedActions: ReadonlySet<PetVisualAction>,
): ResolvedSpriteAction | null {
  let currentAction: PetVisualAction | null = action;
  const visitedActions = new Set<PetVisualAction>();

  while (currentAction && !visitedActions.has(currentAction)) {
    visitedActions.add(currentAction);
    const definition: SpriteActionDefinition = MOMO_PET_SPRITE_MANIFEST.actions[currentAction];
    if (!failedActions.has(currentAction)) {
      return { action: currentAction, definition };
    }
    currentAction = definition.fallbackAction;
  }

  const idleDefinition = MOMO_PET_SPRITE_MANIFEST.actions[MOMO_PET_SPRITE_MANIFEST.defaultAction];
  return failedActions.has(MOMO_PET_SPRITE_MANIFEST.defaultAction)
    ? null
    : { action: MOMO_PET_SPRITE_MANIFEST.defaultAction, definition: idleDefinition };
}

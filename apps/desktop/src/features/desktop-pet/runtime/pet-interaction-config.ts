import type { CareAction } from '../types';

/** 单一交互模式最长持续时间，超时后自动取消。 */
export const INTERACTION_TIMEOUT_MS = 12_000;

/** 完成照顾动作后延迟多久调用 onCancel。 */
export const INTERACTION_CANCEL_DELAY_MS = 700;

/** 抚摸手势累计位移达到该值即可触发完成。 */
export const TOUCH_REQUIRED_DISTANCE = 120;

/** 抚摸手势需要持续至少该毫秒数才会计入完成判定。 */
export const TOUCH_REQUIRED_DURATION_MS = 900;

/** 喂食/抚摸/清理三种模式进入时的默认提示文案。 */
export const MODE_HINTS: Record<CareAction, string> = {
  feed: '把小鱼干递给我嘛',
  touch: '摸摸头会更舒服',
  clean: '帮我清理一下吧',
};

export const HINT_DRAG = '递到我嘴边嘛';
export const HINT_COMPLETE = '我来啦';
export const HINT_FAILED = '没有成功，再试一次';
export const HINT_TIMEOUT = '那我先自己待一会儿';
export const HINT_NEAR_MISS = '还差一点点，放到嘴边哦';
export const HINT_TOUCH_RETRY = '再摸一会儿嘛';

export const WORK_REMINDER_AFTER_MS = 50 * 60 * 1000;
export const NIGHT_REMINDER_AFTER_MS = 30 * 60 * 1000;
export const REST_REMINDER_COOLDOWN_MS = 45 * 60 * 1000;

/** 自定义任务夜班时段：23:00-06:00 视为夜班。 */
export function isNightWork(now: number): boolean {
  const hour = new Date(now).getHours();
  return hour >= 23 || hour < 6;
}

/**
 * 计算当前应展示的休息提醒文案。
 *
 * 业务规则：
 * - 距离上次提醒不足冷却时间 → 不提醒。
 * - 夜班且工作超过 30 分钟 → 夜班提醒。
 * - 工作超过 50 分钟 → 通用提醒。
 * - 其它情况返回 null。
 *
 * 纯函数：调用方负责把 startedAt / lastReminderAt 从 localStorage 取出并回写。
 */
export function getDueReminderMessage(
  now: number,
  startedAt: number,
  lastReminderAt: number,
): string | null {
  if (now - lastReminderAt < REST_REMINDER_COOLDOWN_MS) {
    return null;
  }
  const workDurationMs = now - startedAt;
  if (isNightWork(now) && workDurationMs >= NIGHT_REMINDER_AFTER_MS) {
    return '夜深啦，陪你再做一小段就休息吧。';
  }
  if (workDurationMs >= WORK_REMINDER_AFTER_MS) {
    return '已经专注很久啦，起来喝口水伸个懒腰吧。';
  }
  return null;
}

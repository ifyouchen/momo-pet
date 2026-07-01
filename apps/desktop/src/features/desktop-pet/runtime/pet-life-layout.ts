export const TOP_LANE_MARGIN_PX = 36;
export const BOTTOM_LANE_MARGIN_PX = 72;
export const DESKTOP_WALK_STEP_PX = 20;
export const PREVIEW_WALK_STEP_PX = 18;
export const PREVIEW_WALK_BOUNDARY_PX = 46;

/**
 * 计算原生桌宠窗口在某条 lane 上的 Y 坐标。
 *
 * 行为约定：
 * - top lane：贴顶留 TOP_LANE_MARGIN_PX 余量。
 * - bottom lane：贴底留 BOTTOM_LANE_MARGIN_PX 余量，避免遮挡任务栏。
 */
export function getLaneY(
  monitorY: number,
  monitorHeight: number,
  windowHeight: number,
  lane: 'top' | 'bottom',
): number {
  if (lane === 'top') {
    return monitorY + TOP_LANE_MARGIN_PX;
  }
  return monitorY + monitorHeight - windowHeight - BOTTOM_LANE_MARGIN_PX;
}

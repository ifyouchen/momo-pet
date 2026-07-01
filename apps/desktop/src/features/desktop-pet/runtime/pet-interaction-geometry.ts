/**
 * 二维平面点，描述指针/触点在视口中的坐标。
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * 判断点是否在矩形内部（含边界）。
 *
 * @param point 目标点
 * @param rect 矩形区域，通常来自 getBoundingClientRect
 * @returns 命中返回 true
 */
export function isPointInsideRect(point: Point, rect: DOMRect): boolean {
  return (
    point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
  );
}

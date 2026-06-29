import type { RuntimeWindowMode } from '../runtime/desktop-runtime-api';

interface RuntimeModeBadgeProps {
  /** 当前 Tauri/浏览器窗口模式，用于现场确认渲染入口是否正确。 */
  readonly mode: RuntimeWindowMode;
}

/**
 * 显示当前窗口模式的调试水印。
 *
 * 前置条件：由窗口入口传入已解析模式。后置条件：用户可直接看到当前渲染分支。
 * @throws 本组件不抛出异常。
 */
export function RuntimeModeBadge({ mode }: RuntimeModeBadgeProps) {
  return (
    <div className="runtime-mode-badge" aria-label={`当前窗口模式 ${mode}`}>
      {mode}
    </div>
  );
}

import { invoke, isTauri } from '@tauri-apps/api/core';

export type RuntimeWindowMode = 'pet-window' | 'home-window';

/**
 * Returns whether the current UI is running inside Tauri.
 *
 * 前置条件：可访问浏览器 window 对象。后置条件：浏览器预览返回 false，Tauri 返回 true。
 */
export function isDesktopRuntime(): boolean {
  return isTauri();
}

/**
 * Resolves the active window mode from URL preview hints or Tauri runtime labels.
 *
 * 前置条件：可访问 URLSearchParams。后置条件：返回桌宠窗口或主页窗口模式。
 * @throws Tauri command 失败时向调用方抛出异常，由 hook 转为降级模式。
 */
export async function getRuntimeWindowMode(): Promise<RuntimeWindowMode> {
  if (isDesktopRuntime()) {
    return invoke<RuntimeWindowMode>('get_runtime_window_mode');
  }
  const previewMode = getPreviewWindowMode();
  if (previewMode) {
    return previewMode;
  }
  return 'home-window';
}

/**
 * Starts native window dragging for the transparent pet window.
 *
 * 前置条件：当前运行在 Tauri 窗口内。后置条件：操作系统接管窗口拖动。
 * @throws Tauri window plugin 不可用时向调用方抛出异常。
 */
export async function startPetWindowDrag(): Promise<void> {
  if (!isDesktopRuntime()) {
    return;
  }
  await invoke('start_pet_window_drag');
}

/**
 * Opens the full home window from the transparent pet window.
 *
 * 前置条件：当前运行在 Tauri 桌面端。后置条件：主页窗口可见并获得焦点。
 * @throws Tauri command 失败时向调用方抛出异常。
 */
export async function openHomeWindow(): Promise<void> {
  if (!isDesktopRuntime()) {
    return;
  }
  await invoke('open_home_window');
}

/**
 * Hides the transparent pet window while keeping tray/menu recovery available.
 *
 * 前置条件：当前运行在 Tauri 桌面端。后置条件：桌宠窗口隐藏。
 * @throws Tauri command 失败时向调用方抛出异常。
 */
export async function hidePetWindow(): Promise<void> {
  if (!isDesktopRuntime()) {
    return;
  }
  await invoke('hide_all_windows_to_tray');
}

function getPreviewWindowMode(): RuntimeWindowMode | null {
  const mode = new URLSearchParams(window.location.search).get('window');
  if (mode === 'pet') {
    return 'pet-window';
  }
  if (mode === 'home') {
    return 'home-window';
  }
  return null;
}

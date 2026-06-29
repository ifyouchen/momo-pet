import { useEffect, useState } from 'react';
import { getRuntimeWindowMode, type RuntimeWindowMode } from '../runtime/desktop-runtime-api';

export interface WindowModeModel {
  /** 当前窗口模式，决定渲染透明桌宠还是完整主页。 */
  readonly mode: RuntimeWindowMode;
  /** runtime 模式读取失败时的友好提示。 */
  readonly runtimeWarning: string | null;
}

/**
 * Resolves desktop runtime window mode with browser-safe fallback.
 *
 * 前置条件：React 组件已挂载。后置条件：Tauri 内按窗口 label 渲染，浏览器内默认渲染主页。
 * @throws 本 Hook 不向调用方抛出异常。
 */
export function useWindowMode(): WindowModeModel {
  const [mode, setMode] = useState<RuntimeWindowMode>('home-window');
  const [runtimeWarning, setRuntimeWarning] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getRuntimeWindowMode()
      .then((nextMode) => {
        if (!isMounted) {
          return;
        }
        setMode(nextMode);
        setRuntimeWarning(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setMode('home-window');
        setRuntimeWarning('桌面窗口模式读取失败，已切换到普通主页。');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { mode, runtimeWarning };
}

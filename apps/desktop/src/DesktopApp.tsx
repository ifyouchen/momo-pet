import { DesktopScene } from './features/desktop-pet/components/DesktopScene';
import { useDefaultPet } from './features/desktop-pet/hooks/use-default-pet';

/**
 * 桌面端 MVP 入口，组合默认宠物养成场景并承接真实后端状态。
 *
 * 前置条件：浏览器环境可访问 localStorage。后置条件：页面展示默认宠物状态与照顾操作。
 * 本组件不主动抛出异常，错误会在场景内转化为用户可理解的提示。
 */
export function DesktopApp() {
  const petModel = useDefaultPet();

  return <DesktopScene model={petModel} />;
}

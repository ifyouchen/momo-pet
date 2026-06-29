import type { DefaultPetModel } from '../hooks/use-default-pet';
import { DesktopScene } from './DesktopScene';

interface HomeWindowProps {
  /** 默认宠物主页模型。 */
  readonly model: DefaultPetModel;
  /** runtime 降级提示。 */
  readonly runtimeWarning: string | null;
}

/**
 * 完整主页窗口，保留状态面板和操作 Dock。
 *
 * 前置条件：model 已完成默认宠物初始化流程。后置条件：用户可以查看和操作完整 MVP 主页。
 * @throws 本组件不抛出异常。
 */
export function HomeWindow({ model, runtimeWarning }: HomeWindowProps) {
  return <DesktopScene model={model} runtimeWarning={runtimeWarning} />;
}

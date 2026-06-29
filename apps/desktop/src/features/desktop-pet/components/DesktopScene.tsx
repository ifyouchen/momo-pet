import { useCallback, useState } from 'react';
import type { CareAction } from '../types';
import type { DefaultPetModel } from '../hooks/use-default-pet';
import { ActionDock } from './ActionDock';
import { MomoPetAvatar } from './MomoPetAvatar';
import { PetInteractionLayer } from './PetInteractionLayer';
import { SpeechBubble } from './SpeechBubble';
import { StateDeltaFloat } from './StateDeltaFloat';
import { StatePanel } from './StatePanel';

interface DesktopSceneProps {
  /** 默认宠物主页所需的完整视图模型，集中承接 API 状态和交互回调。 */
  readonly model: DefaultPetModel;
  /** runtime 降级提示，通常来自 Tauri 窗口模式读取失败。 */
  readonly runtimeWarning: string | null;
}

/**
 * 渲染 Momo Pet 的桌面场景主页。
 *
 * 前置条件：model 由 useDefaultPet 提供。后置条件：用户可以查看状态并触发照顾动作。
 * @throws 本组件不抛出异常。
 */
export function DesktopScene({ model, runtimeWarning }: DesktopSceneProps) {
  const petName = model.pet?.name ?? 'Momo Pet';
  const [activeInteractionMode, setActiveInteractionMode] = useState<CareAction | null>(null);
  const cancelInteractionMode = useCallback(() => setActiveInteractionMode(null), []);

  return (
    <main className="desktop-shell" aria-label="Project Momo desktop window">
      <section className="scene" aria-label="Momo Pet desktop scene">
        {runtimeWarning ? (
          <div className="runtime-warning" role="status">
            {runtimeWarning}
          </div>
        ) : null}
        <header className="scene-header">
          <div>
            <p className="scene-kicker">Desktop Pet</p>
            <h1>{petName}</h1>
          </div>
          <span className="status-pill">{model.statusText}</span>
        </header>

        <div className="scene-sky" aria-hidden="true">
          <span className="cloud cloud-one" />
          <span className="cloud cloud-two" />
          <span className="sparkle sparkle-one" />
          <span className="sparkle sparkle-two" />
        </div>

        <section className="pet-stage" aria-label="Momo Pet interaction stage">
          <StateDeltaFloat deltas={model.stateDeltas} />
          <MomoPetAvatar action={model.visualAction} />
          <SpeechBubble message={model.feedback.message} tone={model.feedback.tone} />
          <PetInteractionLayer
            mode={activeInteractionMode}
            canCare={model.canCare}
            isSubmitting={model.activeAction !== null}
            onComplete={model.handleCareAction}
            onCancel={cancelInteractionMode}
          />
        </section>

        <StatePanel isLoading={model.isBootstrapping} state={model.state} />
        <ActionDock
          activeAction={model.activeAction}
          activeInteractionMode={activeInteractionMode}
          canCare={model.canCare}
          onSelectInteractionMode={setActiveInteractionMode}
        />
      </section>
    </main>
  );
}

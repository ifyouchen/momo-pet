import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Species } from '@momo/shared';
import { usePetStudioDraft } from '../hooks/use-pet-studio-draft';
import type { PetStudioStep } from '../types';
import { PetDnaManualForm } from './PetDnaManualForm';
import { PhotoUploadPanel } from './PhotoUploadPanel';

interface PetStudioViewProps {
  /** 关闭 Pet Studio 并返回桌宠主页。 */
  readonly onClose: () => void;
  /** 完成本地确认后返回桌宠主页。 */
  readonly onDone: () => void;
}

/**
 * Pet Studio MVP 前端流程。
 *
 * 前置条件：由桌宠主页进入。后置条件：用户可完成本地图片校验和手动 Pet DNA 确认。
 */
export function PetStudioView({ onClose, onDone }: PetStudioViewProps) {
  const draft = usePetStudioDraft();
  const [step, setStep] = useState<PetStudioStep>('input');

  useEffect(() => {
    if (step !== 'ritual') {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setStep('confirm'), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [step]);

  const handleContinue = () => {
    if (draft.blockingMessage) {
      return;
    }
    setStep('ritual');
  };

  return (
    <main className="pet-studio-shell" aria-label="Pet Studio">
      <header className="pet-studio-header">
        <div>
          <span>Pet Studio</span>
          <h2>创建它的数字身份</h2>
        </div>
        <button type="button" aria-label="关闭 Pet Studio" onClick={onClose}>
          <X size={18} />
        </button>
      </header>

      {step === 'input' ? (
        <section className="pet-studio-content">
          <section className="pet-studio-form" aria-label="宠物基础信息">
            <div className="pet-studio-panel-header">
              <h3>基础信息</h3>
              <span>先给它一个可识别的身份</span>
            </div>
            <label>
              名称
              <input value={draft.name} onChange={(event) => draft.setName(event.target.value)} />
            </label>
            <label>
              类型
              <select
                value={draft.species}
                onChange={(event) => draft.setSpecies(event.target.value as Species)}
              >
                <option value="CAT">CAT</option>
                <option value="DOG">DOG</option>
                <option value="BIRD">BIRD</option>
                <option value="RABBIT">RABBIT</option>
              </select>
            </label>
            <label>
              描述
              <textarea
                value={draft.description}
                onChange={(event) => draft.setDescription(event.target.value)}
              />
            </label>
          </section>

          <PhotoUploadPanel
            photos={draft.photos}
            onAddPhotos={draft.addPhotos}
            onRemovePhoto={draft.removePhoto}
            onUpdateRole={draft.updatePhotoRole}
          />

          {(draft.errorMessage ?? draft.blockingMessage) ? (
            <div className="pet-studio-error" role="alert">
              {draft.errorMessage ?? draft.blockingMessage}
            </div>
          ) : null}

          <div className="pet-studio-actions">
            <button type="button" className="pet-studio-secondary" onClick={onClose}>
              取消
            </button>
            <button
              type="button"
              className="pet-studio-primary"
              disabled={Boolean(draft.blockingMessage)}
              onClick={handleContinue}
            >
              继续
            </button>
          </div>
        </section>
      ) : null}

      {step === 'ritual' ? (
        <section className="pet-studio-ritual" aria-live="polite">
          <Sparkles size={38} />
          <h3>正在整理它的数字身份</h3>
          <p>先根据你填写的信息和照片生成一份可编辑草稿。</p>
        </section>
      ) : null}

      {step === 'confirm' ? (
        <PetDnaManualForm
          dna={draft.dna}
          onBack={() => setStep('input')}
          onChange={draft.updateDna}
          onConfirm={onDone}
        />
      ) : null}
    </main>
  );
}

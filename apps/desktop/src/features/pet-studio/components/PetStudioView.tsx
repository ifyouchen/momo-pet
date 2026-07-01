import { Sparkles, X } from 'lucide-react';
import type { Species } from '@momo/shared';
import { usePetStudioAiFlow } from '../hooks/use-pet-studio-ai-flow';
import { usePetStudioDraft } from '../hooks/use-pet-studio-draft';
import { PetDnaManualForm } from './PetDnaManualForm';
import { PhotoUploadPanel } from './PhotoUploadPanel';

interface PetStudioViewProps {
  /** 当前默认宠物 ID，用于上传照片和创建 AI 任务。 */
  readonly petId: string;
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
export function PetStudioView({ petId, onClose, onDone }: PetStudioViewProps) {
  const draft = usePetStudioDraft();
  const flow = usePetStudioAiFlow({ petId, draft, onDone });

  const handleClose = () => {
    flow.cancelFlow();
    onClose();
  };

  return (
    <main className="pet-studio-shell" aria-label="Pet Studio">
      <header className="pet-studio-header">
        <div>
          <span>Pet Studio</span>
          <h2>编辑数字身份</h2>
        </div>
        <button type="button" aria-label="关闭 Pet Studio" onClick={handleClose}>
          <X size={18} />
        </button>
      </header>

      {flow.step === 'input' ? (
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
              disabled={Boolean(draft.blockingMessage) || flow.isSubmitting || petId.length === 0}
              onClick={flow.handleContinue}
            >
              {flow.isSubmitting ? '处理中' : '继续'}
            </button>
          </div>
        </section>
      ) : null}

      {flow.step === 'uploading' || flow.step === 'analyzing' ? (
        <section className="pet-studio-ritual" aria-live="polite">
          <Sparkles size={38} />
          <h3>{flow.step === 'uploading' ? '正在保存照片' : '正在识别它的数字身份'}</h3>
          <p>
            {flow.step === 'uploading'
              ? '照片会先保存为资源，再创建 Pet DNA 分析任务。'
              : 'AI 正在整理一份可编辑草稿，不会直接生成可动桌宠。'}
          </p>
        </section>
      ) : null}

      {flow.step === 'ai-failed' ? (
        <section className="pet-studio-ritual" aria-live="polite">
          <Sparkles size={38} />
          <h3>先用手动草稿继续</h3>
          <p>{flow.flowMessage ?? '我没能看清它的样子，你可以先手动填写，之后再重新生成。'}</p>
          <div className="pet-studio-actions">
            <button type="button" className="pet-studio-secondary" onClick={handleClose}>
              取消
            </button>
            <button
              type="button"
              className="pet-studio-primary"
              onClick={flow.handleManualFallback}
            >
              手动创建
            </button>
          </div>
        </section>
      ) : null}

      {flow.step === 'confirm' ? (
        <PetDnaManualForm
          dna={draft.dna}
          onBack={() => flow.setStep('input')}
          onChange={draft.updateDna}
          onConfirm={flow.handleConfirm}
        />
      ) : null}

      {flow.flowMessage && flow.step === 'confirm' ? (
        <div className="pet-studio-error" role="alert">
          {flow.flowMessage}
        </div>
      ) : null}
    </main>
  );
}

import { PetDnaManualForm } from '../../pet-studio/components/PetDnaManualForm';
import type { ManualPetDnaDraft } from '../../pet-studio/types';

interface PetDnaConfirmScreenProps {
  readonly dna: ManualPetDnaDraft;
  readonly isProcessing: boolean;
  readonly flowMessage: string | null;
  readonly onConfirm: () => void;
  readonly onDnaChange: (dna: ManualPetDnaDraft) => void;
  readonly onBack: () => void;
}

export function PetDnaConfirmScreen({
  dna,
  isProcessing: _isProcessing,
  flowMessage,
  onConfirm,
  onDnaChange,
  onBack,
}: PetDnaConfirmScreenProps) {
  return (
    <div className="onboarding-screen dna-confirm-screen">
      <h1>确认宠物信息</h1>
      <p>可以编辑 AI 生成的宠物信息，然后确认。</p>
      <PetDnaManualForm
        dna={dna}
        onChange={(patch) => onDnaChange({ ...dna, ...patch })}
        onConfirm={onConfirm}
        onBack={onBack}
      />
      {flowMessage ? <p className="onboarding-error">{flowMessage}</p> : null}
    </div>
  );
}

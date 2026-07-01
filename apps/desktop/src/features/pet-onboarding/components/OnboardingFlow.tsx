import { useCallback, useState } from 'react';
import type { PetProfile, PetState } from '@momo/shared';
import { usePetOnboardingFlow } from '../hooks/use-pet-onboarding-flow';
import { AiAnalysisScreen } from './AiAnalysisScreen';
import { DeploySuccessScreen } from './DeploySuccessScreen';
import { PetCreateScreen } from './PetCreateScreen';
import { PetDnaConfirmScreen } from './PetDnaConfirmScreen';
import { PhotoUploadScreen } from './PhotoUploadScreen';
import { WelcomeScreen } from './WelcomeScreen';

interface OnboardingFlowProps {
  readonly onComplete: (pet: PetProfile, state: PetState) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const flow = usePetOnboardingFlow();
  const [deployData, setDeployData] = useState<{ pet: PetProfile; state: PetState } | null>(null);

  const handleConfirm = useCallback(async () => {
    await flow.handleConfirmDna(async (pet: PetProfile, state: PetState) => {
      setDeployData({ pet, state });
    });
  }, [flow]);

  const handleDeployFinish = useCallback(() => {
    if (deployData) {
      onComplete(deployData.pet, deployData.state);
    }
  }, [deployData, onComplete]);

  const renderStep = () => {
    switch (flow.step) {
      case 'welcome':
        return <WelcomeScreen onStart={() => flow.goToStep('create-pet')} />;

      case 'create-pet':
        return (
          <PetCreateScreen
            initialName={flow.draft.name}
            initialSpecies={flow.draft.species}
            initialBirthday={flow.draft.birthday}
            isProcessing={flow.isProcessing}
            flowMessage={flow.flowMessage}
            onConfirm={(name, species, birthday) => {
              void flow.startCreatePet({ name, species, birthday });
            }}
            onBack={() => flow.goToStep('welcome')}
          />
        );

      case 'photo-upload':
        return (
          <PhotoUploadScreen
            isProcessing={flow.isProcessing}
            onConfirm={(photos) => {
              void flow.startAiAnalysis(photos);
            }}
            onSkip={() => {
              flow.updateDraft({ photos: [] });
              flow.handleManualFallback();
            }}
            onBack={() => flow.goToStep('create-pet')}
          />
        );

      case 'ai-analyzing':
      case 'ai-failed':
        return (
          <AiAnalysisScreen
            flowMessage={flow.flowMessage}
            isAnalyzing={flow.step === 'ai-analyzing'}
            onRetry={() => void flow.startAiAnalysis(flow.draft.photos)}
            onManual={flow.handleManualFallback}
            onBack={flow.handleCancel}
          />
        );

      case 'confirm-dna':
        return (
          <PetDnaConfirmScreen
            dna={flow.draft.dna}
            isProcessing={flow.isProcessing}
            flowMessage={flow.flowMessage}
            onDnaChange={flow.updateDna}
            onConfirm={handleConfirm}
            onBack={() => flow.goToStep('photo-upload')}
          />
        );

      case 'deploy-success':
        return (
          <DeploySuccessScreen
            petName={flow.draft.name}
            onFinish={handleDeployFinish}
            canFinish={deployData !== null}
          />
        );
    }
  };

  return <div className="onboarding-container">{renderStep()}</div>;
}

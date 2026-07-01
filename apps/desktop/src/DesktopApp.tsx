import { useCallback, useState } from 'react';
import type { PetProfile, PetState } from '@momo/shared';
import { DesktopPetWindow } from './features/desktop-pet/components/DesktopPetWindow';
import { HomeWindow } from './features/desktop-pet/components/HomeWindow';
import { useDefaultPet } from './features/desktop-pet/hooks/use-default-pet';
import { useWindowMode } from './features/desktop-pet/hooks/use-window-mode';
import { OnboardingFlow } from './features/pet-onboarding/components/OnboardingFlow';

export function DesktopApp() {
  const petModel = useDefaultPet();
  const windowMode = useWindowMode();
  const [isOnboarding, setIsOnboarding] = useState(false);

  const handleOnboardingComplete = useCallback(
    (pet: PetProfile, state: PetState) => {
      petModel.setPetAndState(pet, state);
      setIsOnboarding(false);
    },
    [petModel],
  );

  if (petModel.isBootstrapping) {
    return <div className="app-loading">加载中...</div>;
  }

  if (isOnboarding || !petModel.hasPet) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (windowMode.mode === 'pet-window') {
    return <DesktopPetWindow model={petModel} runtimeWarning={windowMode.runtimeWarning} />;
  }

  return <HomeWindow model={petModel} runtimeWarning={windowMode.runtimeWarning} />;
}

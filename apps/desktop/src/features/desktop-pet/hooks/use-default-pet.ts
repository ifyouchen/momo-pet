import type { PetProfile, PetState } from '@momo/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cleanPet, feedPet, getPet, getPetState, touchPet } from '../api/pet-api';
import { getStateDeltas } from '../runtime/default-pet-state-deltas';
import { getSuccessMessage, getVisualActionSequence } from '../runtime/default-pet-visuals';
import type { CareAction, FeedbackTone, PetVisualAction, StateDelta } from '../types';

const LOCAL_PET_ID_KEY = 'momo.defaultPetId';
const DEFAULT_CLEAN_EVENT_ID = 'default-clean-event';
const STATE_DELTA_HIDE_DELAY_MS = 1800;
const CHAT_HAPPY_DURATION_MS = 1400;
const DEFAULT_BOOTSTRAP_MESSAGE = '今天也陪你一起开工。';
const BOOTSTRAP_SUCCESS_MESSAGE = 'Momo Pet 已准备好啦。';
const CHAT_SUCCESS_MESSAGE = '我听见你啦。';
const CLEAN_THRESHOLD = 95;
const CLEAN_NOT_NEEDED_MESSAGE = '现在很干净。';

interface ActionFeedback {
  readonly tone: FeedbackTone;
  readonly message: string;
}

export interface DefaultPetModel {
  readonly pet: PetProfile | null;
  readonly state: PetState | null;
  readonly isBootstrapping: boolean;
  readonly hasPet: boolean;
  readonly activeAction: CareAction | null;
  readonly feedback: ActionFeedback;
  readonly stateDeltas: readonly StateDelta[];
  readonly visualAction: PetVisualAction;
  readonly statusText: string;
  readonly canCare: boolean;
  readonly handleCareAction: (action: CareAction) => Promise<void>;
  readonly handleStateChange: (state: PetState) => void;
  readonly setPetAndState: (pet: PetProfile, state: PetState) => void;
}

export function useDefaultPet(): DefaultPetModel {
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [state, setState] = useState<PetState | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [activeAction, setActiveAction] = useState<CareAction | null>(null);
  const [stateDeltas, setStateDeltas] = useState<readonly StateDelta[]>([]);
  const [visualAction, setVisualAction] = useState<PetVisualAction>('idle');
  const [feedback, setFeedback] = useState<ActionFeedback>({
    tone: 'idle',
    message: DEFAULT_BOOTSTRAP_MESSAGE,
  });
  const visualTimersRef = useRef<readonly number[]>([]);

  const hasPet = pet !== null;

  const canCare = Boolean(pet) && !isBootstrapping && activeAction === null;
  const statusText = useMemo(() => {
    if (isBootstrapping) {
      return 'Loading';
    }
    return state ? `Lv.${state.level}` : 'Offline';
  }, [isBootstrapping, state]);

  const clearVisualTimers = useCallback(() => {
    visualTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    visualTimersRef.current = [];
  }, []);

  const resetVisualAction = useCallback(() => {
    clearVisualTimers();
    setVisualAction('idle');
  }, [clearVisualTimers]);

  const scheduleVisualAction = useCallback(
    (action: CareAction) => {
      clearVisualTimers();
      const sequence = getVisualActionSequence(action);
      setVisualAction(sequence[0].action);
      visualTimersRef.current = sequence.slice(1).map((step) =>
        window.setTimeout(() => {
          setVisualAction(step.action);
        }, step.atMs),
      );
    },
    [clearVisualTimers],
  );

  const scheduleChatVisualAction = useCallback(() => {
    clearVisualTimers();
    setVisualAction('happy');
    const idleTimer = window.setTimeout(() => setVisualAction('idle'), CHAT_HAPPY_DURATION_MS);
    visualTimersRef.current = [idleTimer];
  }, [clearVisualTimers]);

  const bootstrapDefaultPet = useCallback(async () => {
    setIsBootstrapping(true);
    try {
      const storedPetId = window.localStorage.getItem(LOCAL_PET_ID_KEY);
      if (!storedPetId) {
        setIsBootstrapping(false);
        return;
      }
      let profile: PetProfile;
      try {
        profile = await getPet(storedPetId);
      } catch {
        window.localStorage.removeItem(LOCAL_PET_ID_KEY);
        setIsBootstrapping(false);
        return;
      }
      setPet(profile);
      setState(await getPetState(profile.petId));
      setFeedback({ tone: 'success', message: BOOTSTRAP_SUCCESS_MESSAGE });
    } catch {
      window.localStorage.removeItem(LOCAL_PET_ID_KEY);
      setFeedback({ tone: 'error', message: '连接失败，请确认后端已启动。' });
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  const setPetAndState = useCallback((newPet: PetProfile, newState: PetState) => {
    setPet(newPet);
    setState(newState);
    window.localStorage.setItem(LOCAL_PET_ID_KEY, newPet.petId);
  }, []);

  const handleCareAction = useCallback(
    async (action: CareAction) => {
      if (!pet || activeAction) {
        return;
      }
      setActiveAction(action);
      setStateDeltas([]);
      try {
        if (action === 'clean' && state && state.cleanliness >= CLEAN_THRESHOLD) {
          setFeedback({ tone: 'success', message: CLEAN_NOT_NEEDED_MESSAGE });
          return;
        }
        const nextState = await executeCareAction(pet.petId, action);
        setState((previousState) => {
          setStateDeltas(getStateDeltas(previousState, nextState));
          return nextState;
        });
        setFeedback({ tone: 'success', message: getSuccessMessage(action) });
        scheduleVisualAction(action);
      } catch (error) {
        resetVisualAction();
        setFeedback({ tone: 'error', message: getErrorMessage(error) });
      } finally {
        setActiveAction(null);
      }
    },
    [activeAction, pet, state, resetVisualAction, scheduleVisualAction],
  );

  const handleStateChange = useCallback(
    (nextState: PetState) => {
      setState((previousState) => {
        setStateDeltas(getStateDeltas(previousState, nextState));
        return nextState;
      });
      setFeedback({ tone: 'success', message: CHAT_SUCCESS_MESSAGE });
      scheduleChatVisualAction();
    },
    [scheduleChatVisualAction],
  );

  useEffect(() => {
    void bootstrapDefaultPet();
  }, [bootstrapDefaultPet]);

  useEffect(() => {
    if (stateDeltas.length === 0) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setStateDeltas([]), STATE_DELTA_HIDE_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [stateDeltas]);

  return {
    pet,
    state,
    isBootstrapping,
    hasPet,
    activeAction,
    feedback,
    stateDeltas,
    visualAction,
    statusText,
    canCare,
    handleCareAction,
    handleStateChange,
    setPetAndState,
  };
}

function executeCareAction(petId: string, action: CareAction): Promise<PetState> {
  if (action === 'feed') {
    return feedPet(petId, { foodCode: 'DRIED_FISH' });
  }
  if (action === 'touch') {
    return touchPet(petId, { touchType: 'HEAD' });
  }
  return cleanPet(petId, { cleanEventId: DEFAULT_CLEAN_EVENT_ID });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '连接失败，请确认后端已启动。';
}

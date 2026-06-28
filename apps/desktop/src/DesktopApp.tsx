import type { ApiResponse, CarePetResponse, PetProfile, PetState } from '@momo/shared';
import { Heart, MessageCircle, Sparkles, Trash2, Utensils } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8080';
const LOCAL_PET_ID_KEY = 'momo.defaultPetId';
const DEFAULT_CLEAN_EVENT_ID = 'default-clean-event';

type CareAction = 'feed' | 'touch' | 'clean';

interface ActionFeedback {
  type: 'idle' | 'success' | 'error';
  message: string;
}

const statusItems: Array<{ key: keyof Pick<PetState, 'hunger' | 'mood' | 'cleanliness' | 'energy' | 'intimacy'>; label: string }> = [
  { key: 'hunger', label: '饱食' },
  { key: 'mood', label: '心情' },
  { key: 'cleanliness', label: '清洁' },
  { key: 'energy', label: '能量' },
  { key: 'intimacy', label: '亲密' },
];

/**
 * 桌面端 Sprint 1 默认宠物页面，负责展示 Momo Pet 状态并触发照顾 API。
 *
 * <p>前置条件：后端服务可访问。后置条件：用户可以看到状态并执行喂食、抚摸、清理。
 * 本组件不抛出业务异常。</p>
 */
export function DesktopApp() {
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [state, setState] = useState<PetState | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [activeAction, setActiveAction] = useState<CareAction | null>(null);
  const [feedback, setFeedback] = useState<ActionFeedback>({
    type: 'idle',
    message: '今天也陪你一起开工。',
  });

  const isBusy = isBootstrapping || activeAction !== null;
  const statusText = useMemo(() => {
    if (isBootstrapping) {
      return 'Loading';
    }
    return state ? `Lv.${state.level}` : 'Offline';
  }, [isBootstrapping, state]);

  useEffect(() => {
    void bootstrapDefaultPet();
  }, []);

  async function bootstrapDefaultPet() {
    setIsBootstrapping(true);
    try {
      const storedPetId = window.localStorage.getItem(LOCAL_PET_ID_KEY);
      const profile = storedPetId ? await getPet(storedPetId) : await createDefaultPet();
      window.localStorage.setItem(LOCAL_PET_ID_KEY, profile.petId);
      setPet(profile);
      setState(await getPetState(profile.petId));
      setFeedback({ type: 'success', message: 'Momo Pet 已准备好啦。' });
    } catch (error) {
      window.localStorage.removeItem(LOCAL_PET_ID_KEY);
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsBootstrapping(false);
    }
  }

  async function handleCareAction(action: CareAction) {
    if (!pet || activeAction) {
      return;
    }
    setActiveAction(action);
    try {
      const nextState = await executeCareAction(pet.petId, action);
      setState(nextState);
      setFeedback({ type: 'success', message: getSuccessMessage(action) });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <main className="desktop-shell" aria-label="Project Momo desktop window">
      <section className="scene" aria-label="Momo desktop scene">
        <div className="status-bar">
          <span className="pet-name">{pet?.name ?? 'Momo Pet'}</span>
          <span className="status-pill">{statusText}</span>
        </div>
        <div className="pet-stage">
          <div className="momo-pet" aria-label="Default Momo Pet">
            <span className="ear left" />
            <span className="ear right" />
            <span className="face">
              <span className="eye left" />
              <span className="eye right" />
              <span className="nose" />
            </span>
          </div>
          <div className={`speech-bubble ${feedback.type}`}>{feedback.message}</div>
        </div>
        <section className="state-panel" aria-label="Momo Pet state">
          {state ? (
            <>
              <div className="level-row">
                <span>Level {state.level}</span>
                <span>{state.experience} XP</span>
              </div>
              {statusItems.map((item) => (
                <label className="state-row" key={item.key}>
                  <span>{item.label}</span>
                  <meter min="0" max="100" value={state[item.key]} />
                  <strong>{state[item.key]}</strong>
                </label>
              ))}
            </>
          ) : (
            <div className="empty-state">等待后端连接。</div>
          )}
        </section>
        <div className="action-dock" aria-label="MVP pet actions">
          <button type="button" aria-label="Feed Momo" disabled={isBusy} onClick={() => void handleCareAction('feed')}>
            <Utensils size={18} />
          </button>
          <button type="button" aria-label="Pet Momo" disabled={isBusy} onClick={() => void handleCareAction('touch')}>
            <Heart size={18} />
          </button>
          <button type="button" aria-label="Clean Momo" disabled={isBusy} onClick={() => void handleCareAction('clean')}>
            <Trash2 size={18} />
          </button>
          <button type="button" aria-label="Chat with Momo">
            <MessageCircle size={18} />
          </button>
          <button type="button" aria-label="Open Pet Studio">
            <Sparkles size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}

async function createDefaultPet(): Promise<PetProfile> {
  return request<PetProfile>('/api/pets', {
    method: 'POST',
    body: JSON.stringify({ name: 'Momo Pet', species: 'CAT', description: '默认 MVP 桌宠' }),
  });
}

async function getPet(petId: string): Promise<PetProfile> {
  return request<PetProfile>(`/api/pets/${petId}`);
}

async function getPetState(petId: string): Promise<PetState> {
  return request<PetState>(`/api/pets/${petId}/state`);
}

async function executeCareAction(petId: string, action: CareAction): Promise<PetState> {
  const payload = getCarePayload(action);
  const response = await request<CarePetResponse>(`/api/pets/${petId}/care/${action}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.state;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || '请求失败，请稍后再试。');
  }
  return payload.data;
}

function getCarePayload(action: CareAction) {
  if (action === 'feed') {
    return { foodCode: 'DRIED_FISH' };
  }
  if (action === 'touch') {
    return { touchType: 'HEAD' };
  }
  return { cleanEventId: DEFAULT_CLEAN_EVENT_ID };
}

function getSuccessMessage(action: CareAction): string {
  if (action === 'feed') {
    return '小鱼干补给成功。';
  }
  if (action === 'touch') {
    return 'Momo Pet 开心地蹭了蹭你。';
  }
  return '已经清理干净啦。';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '连接失败，请确认后端已启动。';
}

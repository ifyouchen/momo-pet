import { useState } from 'react';
import type { Species } from '@momo/shared';

interface PetCreateScreenProps {
  readonly initialName: string;
  readonly initialSpecies: Species;
  readonly initialBirthday: string;
  readonly isProcessing: boolean;
  readonly flowMessage: string | null;
  readonly onConfirm: (name: string, species: Species, birthday: string) => void;
  readonly onBack: () => void;
}

const SPECIES_OPTIONS: Species[] = ['CAT', 'DOG', 'BIRD', 'RABBIT'];

export function PetCreateScreen({
  initialName,
  initialSpecies,
  initialBirthday,
  isProcessing,
  flowMessage,
  onConfirm,
  onBack,
}: PetCreateScreenProps) {
  const [name, setName] = useState(initialName);
  const [species, setSpecies] = useState<Species>(initialSpecies);
  const [birthday, setBirthday] = useState(initialBirthday);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('请输入宠物名称。');
      return;
    }
    if (trimmed.length > 20) {
      setError('名称不能超过 20 个字。');
      return;
    }
    setError(null);
    onConfirm(trimmed, species, birthday);
  };

  return (
    <div className="onboarding-screen pet-create-screen">
      <h1>创建你的宠物</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <label>
          名称
          <input
            value={name}
            maxLength={20}
            placeholder="给它取个名字"
            onChange={(event) => setName(event.target.value)}
            disabled={isProcessing}
          />
        </label>
        <label>
          种类
          <select
            value={species}
            onChange={(event) => setSpecies(event.target.value as Species)}
            disabled={isProcessing}
          >
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          生日（可选）
          <input
            type="date"
            value={birthday}
            onChange={(event) => setBirthday(event.target.value)}
            disabled={isProcessing}
          />
        </label>
        {error || flowMessage ? <p className="onboarding-error">{error ?? flowMessage}</p> : null}
        <div className="onboarding-actions">
          <button type="button" onClick={onBack} disabled={isProcessing}>
            返回
          </button>
          <button type="submit" disabled={isProcessing}>
            {isProcessing ? '创建中...' : '继续'}
          </button>
        </div>
      </form>
    </div>
  );
}

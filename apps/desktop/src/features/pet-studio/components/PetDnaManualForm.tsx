import type { ManualPetDnaDraft } from '../types';

interface PetDnaManualFormProps {
  /** 当前手动 Pet DNA 草稿。 */
  readonly dna: ManualPetDnaDraft;
  /** 更新手动 Pet DNA 草稿字段。 */
  readonly onChange: (patch: Partial<ManualPetDnaDraft>) => void;
  /** 用户确认手动 Pet DNA。 */
  readonly onConfirm: () => void;
  /** 返回上一步。 */
  readonly onBack: () => void;
}

/**
 * 手动 Pet DNA 确认表单。
 *
 * 前置条件：用户已完成基础信息和图片校验。后置条件：用户可确认本地 Pet DNA 草稿。
 */
export function PetDnaManualForm({ dna, onChange, onConfirm, onBack }: PetDnaManualFormProps) {
  return (
    <section className="pet-studio-form" aria-label="Pet DNA 手动确认">
      <div className="pet-studio-panel-header">
        <h3>确认数字身份</h3>
        <span>AI 接入前，先用手动草稿完成闭环</span>
      </div>

      <div className="pet-studio-grid">
        <label>
          名称
          <input value={dna.name} onChange={(event) => onChange({ name: event.target.value })} />
        </label>
        <label>
          类型
          <select
            value={dna.species}
            onChange={(event) =>
              onChange({ species: event.target.value as ManualPetDnaDraft['species'] })
            }
          >
            <option value="CAT">CAT</option>
            <option value="DOG">DOG</option>
            <option value="BIRD">BIRD</option>
            <option value="RABBIT">RABBIT</option>
          </select>
        </label>
        <label>
          品种
          <input value={dna.breed} onChange={(event) => onChange({ breed: event.target.value })} />
        </label>
        <label>
          主色
          <input
            value={dna.primaryColor}
            onChange={(event) => onChange({ primaryColor: event.target.value })}
          />
        </label>
        <label>
          花纹
          <input
            value={dna.pattern}
            onChange={(event) => onChange({ pattern: event.target.value })}
          />
        </label>
        <label>
          眼睛颜色
          <input
            value={dna.eyeColor}
            onChange={(event) => onChange({ eyeColor: event.target.value })}
          />
        </label>
        <label>
          性格
          <select
            value={dna.personality}
            onChange={(event) => onChange({ personality: event.target.value })}
          >
            <option value="Curious">Curious</option>
            <option value="Friendly">Friendly</option>
            <option value="Lazy">Lazy</option>
            <option value="Proud">Proud</option>
            <option value="Greedy">Greedy</option>
          </select>
        </label>
        <label>
          精力
          <select
            value={dna.energyLevel}
            onChange={(event) =>
              onChange({ energyLevel: event.target.value as ManualPetDnaDraft['energyLevel'] })
            }
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </label>
      </div>

      <label>
        喜欢的食物
        <input
          value={dna.favoriteFoods}
          onChange={(event) => onChange({ favoriteFoods: event.target.value })}
        />
      </label>
      <label>
        讨厌的事
        <input
          value={dna.dislikedThings}
          onChange={(event) => onChange({ dislikedThings: event.target.value })}
        />
      </label>
      <label>
        口头禅
        <textarea
          value={dna.catchphrases}
          onChange={(event) => onChange({ catchphrases: event.target.value })}
        />
      </label>

      <div className="pet-studio-actions">
        <button type="button" className="pet-studio-secondary" onClick={onBack}>
          返回
        </button>
        <button type="button" className="pet-studio-primary" onClick={onConfirm}>
          确认
        </button>
      </div>
    </section>
  );
}

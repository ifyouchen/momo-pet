import type { PetDna, PetState, PetSummary } from '../../api/pets';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import type { SectionProps } from './pet-detail-types';

/**
 * Overview Tab，展示 Pet 基础档案、当前状态、最新 Pet DNA 三张卡片。
 *
 * @param props 详情页共享入参
 * @returns Overview 区块
 */
export function OverviewSection({
  pet,
  state,
  dna,
}: {
  readonly pet: PetSummary;
  readonly state: PetState | null;
  readonly dna: PetDna | null;
}) {
  return (
    <div className="detail-grid">
      <article className="detail-card">
        <h3>基础档案</h3>
        <dl>
          <dt>Pet ID</dt>
          <dd>{pet.petId}</dd>
          <dt>Name</dt>
          <dd>{pet.name}</dd>
          <dt>Species</dt>
          <dd>{pet.species}</dd>
          <dt>Status</dt>
          <dd>{pet.status}</dd>
          <dt>Birthday</dt>
          <dd>{pet.birthday}</dd>
          <dt>Created At</dt>
          <dd>{pet.createdAt}</dd>
        </dl>
      </article>
      <article className="detail-card">
        <h3>当前状态</h3>
        {state ? (
          <dl>
            <dt>Level</dt>
            <dd>{state.level}</dd>
            <dt>Hunger</dt>
            <dd>{state.hunger}</dd>
            <dt>Mood</dt>
            <dd>{state.mood}</dd>
            <dt>Cleanliness</dt>
            <dd>{state.cleanliness}</dd>
            <dt>Energy</dt>
            <dd>{state.energy}</dd>
            <dt>Intimacy</dt>
            <dd>{state.intimacy}</dd>
            <dt>Experience</dt>
            <dd>{state.experience}</dd>
          </dl>
        ) : (
          <span>暂无状态</span>
        )}
      </article>
      <article className="detail-card">
        <h3>最新 Pet DNA</h3>
        {dna ? (
          <dl>
            <dt>Version</dt>
            <dd>{dna.version}</dd>
            <dt>Source</dt>
            <dd>{dna.source}</dd>
            <dt>Confirmed At</dt>
            <dd>{dna.confirmedAt}</dd>
          </dl>
        ) : (
          <span>暂无 Pet DNA</span>
        )}
      </article>
    </div>
  );
}

/**
 * Pet DNA Tab，展示 DNA 详细载荷。
 *
 * @param props 详情页共享入参
 * @returns Pet DNA 区块
 */
export function DnaSection({ dna, dnaError }: SectionProps) {
  if (dnaError) {
    return <ErrorState message={dnaError} />;
  }
  if (!dna) {
    return <LoadingState label="正在加载 Pet DNA…" />;
  }
  return (
    <article className="detail-card">
      <h3>Pet DNA v{dna.version}</h3>
      <dl>
        <dt>Source</dt>
        <dd>{dna.source}</dd>
        <dt>Confirmed At</dt>
        <dd>{dna.confirmedAt}</dd>
      </dl>
      <h4>Payload</h4>
      <pre className="json-block">{JSON.stringify(dna.dna, null, 2)}</pre>
    </article>
  );
}

/**
 * State Tab，展示 Pet 数值状态。
 *
 * @param props 详情页共享入参
 * @returns State 区块
 */
export function StateSection({ state, stateError }: SectionProps) {
  if (stateError) {
    return <ErrorState message={stateError} />;
  }
  if (!state) {
    return <LoadingState label="正在加载状态…" />;
  }
  return (
    <article className="detail-card">
      <h3>State</h3>
      <dl>
        <dt>Level</dt>
        <dd>{state.level}</dd>
        <dt>Experience</dt>
        <dd>{state.experience}</dd>
        <dt>Hunger</dt>
        <dd>{state.hunger}</dd>
        <dt>Mood</dt>
        <dd>{state.mood}</dd>
        <dt>Cleanliness</dt>
        <dd>{state.cleanliness}</dd>
        <dt>Energy</dt>
        <dd>{state.energy}</dd>
        <dt>Intimacy</dt>
        <dd>{state.intimacy}</dd>
        <dt>Updated At</dt>
        <dd>{state.updatedAt}</dd>
      </dl>
    </article>
  );
}

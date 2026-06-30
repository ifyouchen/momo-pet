import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getPet,
  getPetDna,
  getPetState,
  type PetDna,
  type PetState,
  type PetSummary,
} from '../api/pets';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useAsync } from '../hooks/use-async';

type Tab = 'overview' | 'dna' | 'state';

interface SectionProps {
  readonly pet: PetSummary;
  readonly state: PetState | null;
  readonly dna: PetDna | null;
  readonly stateError: string | null;
  readonly dnaError: string | null;
}

function OverviewSection({ pet, state, dna }: SectionProps) {
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

function DnaSection({ dna, dnaError }: SectionProps) {
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

function StateSection({ state, stateError }: SectionProps) {
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

/**
 * Pet 详情页面，包含 Overview / DNA / State 三个 Tab。
 *
 * @returns Pet 详情页面
 */
export function PetDetailPage() {
  const { petId = '' } = useParams<{ petId: string }>();
  const [tab, setTab] = useState<Tab>('overview');

  const petQuery = useAsync({ fetcher: () => getPet(petId), deps: [petId] });
  const stateQuery = useAsync({ fetcher: () => getPetState(petId), deps: [petId] });
  const dnaQuery = useAsync({ fetcher: () => getPetDna(petId), deps: [petId] });

  if (petQuery.state.status === 'loading' || petQuery.state.status === 'idle') {
    return (
      <>
        <PageHeader title="Pet Detail" />
        <LoadingState />
      </>
    );
  }
  if (petQuery.state.status === 'error') {
    return (
      <>
        <PageHeader title="Pet Detail" />
        <ErrorState message={petQuery.state.error} />
      </>
    );
  }
  const pet = petQuery.state.data;
  const stateData = stateQuery.state.status === 'success' ? stateQuery.state.data : null;
  const dnaData = dnaQuery.state.status === 'success' ? dnaQuery.state.data : null;
  const stateError = stateQuery.state.status === 'error' ? stateQuery.state.error : null;
  const dnaError = dnaQuery.state.status === 'error' ? dnaQuery.state.error : null;

  const sectionProps: SectionProps = {
    pet,
    state: stateData,
    dna: dnaData,
    stateError,
    dnaError,
  };

  return (
    <>
      <PageHeader
        title={`Pet · ${pet.name}`}
        description={`${pet.species} · ${pet.status}`}
        actions={
          <button type="button" onClick={() => window.history.back()}>
            返回
          </button>
        }
      />
      <div className="tab-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'overview'}
          className={tab === 'overview' ? 'tab tab-active' : 'tab'}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'dna'}
          className={tab === 'dna' ? 'tab tab-active' : 'tab'}
          onClick={() => setTab('dna')}
        >
          Pet DNA
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'state'}
          className={tab === 'state' ? 'tab tab-active' : 'tab'}
          onClick={() => setTab('state')}
        >
          State
        </button>
      </div>
      {tab === 'overview' ? <OverviewSection {...sectionProps} /> : null}
      {tab === 'dna' ? <DnaSection {...sectionProps} /> : null}
      {tab === 'state' ? <StateSection {...sectionProps} /> : null}
    </>
  );
}

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPet, getPetDna, getPetState } from '../api/pets';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useAsync } from '../hooks/use-async';
import { DnaSection, OverviewSection, StateSection } from './pet-detail/PetDetailSections';
import type { SectionProps } from './pet-detail/pet-detail-types';

type Tab = 'overview' | 'dna' | 'state';

/**
 * Pet 详情页面，包含 Overview / DNA / State 三个 Tab。
 *
 * @returns Pet 详情页面
 */
export function PetDetailPage() {
  const { petId = '' } = useParams<{ petId: string }>();
  const [tab, setTab] = useState<Tab>('overview');

  const petQuery = useAsync({
    fetcher: (signal) => getPet(petId, { signal }),
    deps: [petId],
  });
  const stateQuery = useAsync({
    fetcher: (signal) => getPetState(petId, { signal }),
    deps: [petId],
  });
  const dnaQuery = useAsync({
    fetcher: (signal) => getPetDna(petId, { signal }),
    deps: [petId],
  });

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
      {tab === 'overview' ? <OverviewSection pet={pet} state={stateData} dna={dnaData} /> : null}
      {tab === 'dna' ? <DnaSection {...sectionProps} /> : null}
      {tab === 'state' ? <StateSection {...sectionProps} /> : null}
    </>
  );
}

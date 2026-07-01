import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPets, type PetSummary } from '../api/pets';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useAsync } from '../hooks/use-async';

const columns: ReadonlyArray<DataTableColumn<PetSummary>> = [
  { key: 'petId', header: 'Pet ID', render: (row) => row.petId },
  { key: 'name', header: 'Name', render: (row) => row.name },
  { key: 'species', header: 'Species', render: (row) => row.species },
  { key: 'status', header: 'Status', render: (row) => row.status },
  { key: 'birthday', header: 'Birthday', render: (row) => row.birthday },
  { key: 'createdAt', header: 'Created At', render: (row) => row.createdAt },
];

/**
 * Pets 列表页面。
 *
 * @returns Pets 列表页面
 */
export function PetsListPage() {
  const navigate = useNavigate();
  const [species, setSpecies] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const { state, refetch } = useAsync({
    fetcher: (signal) => listPets({ species, status, page, size: 20 }, { signal }),
    deps: [species, status, page],
  });

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <>
        <PageHeader title="Pets" description="分页查询所有宠物" />
        <LoadingState />
      </>
    );
  }
  if (state.status === 'error') {
    return (
      <>
        <PageHeader
          title="Pets"
          actions={
            <button type="button" onClick={refetch}>
              重试
            </button>
          }
        />
        <ErrorState message={state.error} />
      </>
    );
  }
  const list = state.data;
  const totalPages = Math.max(1, Math.ceil(list.total / list.size));
  return (
    <>
      <PageHeader title="Pets" description={`共 ${list.total} 只宠物`} />
      <div className="filter-bar" aria-label="Pets 过滤">
        <label>
          物种
          <select
            value={species}
            onChange={(event) => {
              setSpecies(event.target.value);
              setPage(0);
            }}
          >
            <option value="">全部</option>
            <option value="CAT">CAT</option>
            <option value="DOG">DOG</option>
            <option value="BIRD">BIRD</option>
            <option value="RABBIT">RABBIT</option>
          </select>
        </label>
        <label>
          状态
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            <option value="">全部</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>
      </div>
      <DataTable
        columns={columns}
        rows={list.items}
        rowKey={(row) => row.petId}
        onRowClick={(row) => navigate(`/pets/${encodeURIComponent(row.petId)}`)}
      />
      <div className="pager" aria-label="Pets 分页">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        >
          上一页
        </button>
        <span>
          第 {page + 1} / {totalPages} 页
        </span>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((value) => value + 1)}
        >
          下一页
        </button>
      </div>
    </>
  );
}

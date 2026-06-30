import { useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

interface UseAsyncParams<T> {
  readonly fetcher: () => Promise<T>;
  readonly deps?: ReadonlyArray<unknown>;
}

interface UseAsyncResult<T> {
  readonly state: AsyncState<T>;
  readonly refetch: () => void;
}

/**
 * 统一处理 loading / data / error 的异步数据 hook。
 *
 * @param params fetcher 函数和依赖
 * @returns 异步状态和重新拉取方法
 */
export function useAsync<T>({ fetcher, deps = [] }: UseAsyncParams<T>): UseAsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fetcher()
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : '请求失败';
          setState({ status: 'error', error: message });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return {
    state,
    refetch: () => setTick((value) => value + 1),
  };
}

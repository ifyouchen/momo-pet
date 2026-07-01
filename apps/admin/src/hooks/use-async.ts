import { useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

interface UseAsyncParams<T> {
  readonly fetcher: (signal: AbortSignal) => Promise<T>;
  readonly deps?: ReadonlyArray<unknown>;
}

interface UseAsyncResult<T> {
  readonly state: AsyncState<T>;
  readonly refetch: () => void;
}

function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.name === 'TimeoutError';
  }
  return false;
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
    const controller = new AbortController();
    let aborted = false;
    setState({ status: 'loading' });
    fetcher(controller.signal)
      .then((data) => {
        if (!aborted) {
          setState({ status: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (aborted || isAbortError(error)) {
          return;
        }
        const message = error instanceof Error ? error.message : '请求失败';
        setState({ status: 'error', error: message });
      });
    return () => {
      aborted = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return {
    state,
    refetch: () => setTick((value) => value + 1),
  };
}

import { useEffect, useState } from 'react';

export type ApiResource<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; value: T };

export function useApiResource<T>(load: () => Promise<T>): ApiResource<T> {
  const [resource, setResource] = useState<ApiResource<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setResource({ status: 'loading' });
    load()
      .then((value) => {
        if (active) setResource({ status: 'success', value });
      })
      .catch(() => {
        if (active) setResource({ status: 'error' });
      });

    return () => { active = false; };
  }, [load]);

  return resource;
}
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Repository } from './repository';
import { DEMO, NOT_READY_MESSAGE } from '../demo';
import { SampleRepository } from './sample';

const Ctx = createContext<Repository | undefined>(undefined);

export function RepoProvider({ children }: { children: ReactNode }) {
  const repo = useMemo<Repository>(() => {
    // Sample data, pretend sign-in and pretend second people exist only in demo builds.
    if (!DEMO) throw new Error(NOT_READY_MESSAGE);
    return new SampleRepository();
  }, []);
  useEffect(() => {
    void repo.ready();
  }, [repo]);
  return <Ctx.Provider value={repo}>{children}</Ctx.Provider>;
}

export function useRepo(): Repository {
  const repo = useContext(Ctx);
  if (!repo) throw new Error('useRepo must be used inside RepoProvider');
  return repo;
}

/** Re-renders the component whenever the repository changes. Returns the repository. */
export function useRepoLive(): Repository {
  const repo = useRepo();
  const [version, setVersion] = useState(0);
  useEffect(() => repo.subscribe(() => setVersion((v) => v + 1)), [repo]);
  void version;
  return repo;
}

/** Loads something from the repository and reloads it when the repository changes. */
export function useLoad<T>(load: (repo: Repository) => Promise<T>, key = ''): T | undefined {
  const repo = useRepo();
  const [value, setValue] = useState<T | undefined>(undefined);
  const [version, setVersion] = useState(0);
  useEffect(() => repo.subscribe(() => setVersion((v) => v + 1)), [repo]);
  useEffect(() => {
    let active = true;
    repo
      .ready()
      .then(() => load(repo))
      .then((result) => {
        if (active) setValue(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
    // `load` is a fresh function each render; `key` carries its real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, version, key]);
  return value;
}


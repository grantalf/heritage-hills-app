import { router } from 'expo-router';

import { useRepoLive } from './data/provider';

/**
 * Access levels (docs/SPEC.md section 3). In the first draft the level is
 * chosen in the app instead of by real sign-in.
 */
export function useSession() {
  const repo = useRepoLive();
  const role = repo.getRole();
  const isNeighbor = role !== 'visitor';
  return {
    repo,
    role,
    isNeighbor,
    isBoard: role === 'board',
    /** Runs the action for neighbors. Sends visitors to sign-in first. */
    needNeighbor(action: () => void) {
      if (isNeighbor) action();
      else router.push('/sign-in');
    },
  };
}

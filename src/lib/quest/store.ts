/**
 * Keeps the map game's saved data (state.ts) on this phone and tells screens
 * when it changes. Also reads the rescue game's stamps for quests.
 * "Delete my information" calls resetWorld().
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { parseProgress, PROGRESS_KEY } from '../arcade/progress';
import { emptyWorld, parseWorld, WORLD_KEY, type WorldSave } from './state';

type Snapshot = { world: WorldSave; stamps: string[]; ready: boolean };

let snap: Snapshot = { world: emptyWorld(), stamps: [], ready: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let loading: Promise<void> | undefined;

function load(force = false): Promise<void> {
  if (loading && !force) return loading;
  loading = Promise.all([AsyncStorage.getItem(WORLD_KEY), AsyncStorage.getItem(PROGRESS_KEY)])
    .then(([world, rescue]) => {
      snap = { world: parseWorld(world), stamps: parseProgress(rescue).stamps, ready: true };
    })
    .catch(() => {
      snap = { ...snap, ready: true };
    })
    .finally(emit);
  return loading;
}

export function saveWorld(next: WorldSave) {
  snap = { ...snap, world: next };
  emit();
  AsyncStorage.setItem(WORLD_KEY, JSON.stringify(next)).catch(() => undefined);
}

export function resetWorld() {
  snap = { world: emptyWorld(), stamps: [], ready: true };
  emit();
  AsyncStorage.removeItem(WORLD_KEY).catch(() => undefined);
}

/** The saved world. Stamps are re-read whenever a screen asks, since the rescue game writes them. */
export function useWorld(refreshKey?: unknown): Snapshot {
  useEffect(() => {
    void load(true);
  }, [refreshKey]);
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snap,
    () => snap,
  );
}

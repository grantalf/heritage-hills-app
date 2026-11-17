/**
 * Plays sound effects on phones with expo-audio. The WAV files are made from
 * the same recipes as the web sounds (npm run sounds). One player per sound,
 * made the first time it is needed and released when the game screen closes.
 *
 * Sounds mix with other audio (a podcast keeps playing) and stay quiet when
 * the phone's ringer switch is on silent. No microphone, no background audio.
 *
 * Not yet tried on a real phone (see docs/BRAWLER.md).
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { SoundName } from '@/lib/arcade/sound';
import { SOUND_FILES } from '@/lib/arcade/sounds.generated';

export type Sfx = { play: (name: SoundName) => void; unlock: () => void; release: () => void };

export function createSfx(): Sfx {
  const players = new Map<SoundName, AudioPlayer>();
  let moded = false;
  const player = (name: SoundName): AudioPlayer | undefined => {
    let p = players.get(name);
    if (!p) {
      try {
        p = createAudioPlayer(SOUND_FILES[name]);
        players.set(name, p);
      } catch {
        return undefined;
      }
    }
    return p;
  };
  return {
    unlock: () => {
      if (moded) return;
      moded = true;
      setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => undefined);
    },
    play: (name) => {
      const p = player(name);
      if (!p) return;
      try {
        p.seekTo(0).catch(() => undefined);
        p.play();
      } catch {
        // A sound that fails to play is not worth stopping the game for.
      }
    },
    release: () => {
      for (const p of players.values()) {
        try {
          p.release();
        } catch {
          // already gone
        }
      }
      players.clear();
    },
  };
}

/**
 * Sound effects, as recipes (block 2). Every sound is a few short chip-style
 * tones described by numbers, so there are no audio files to license, and a
 * holiday pack can swap a sound by naming another recipe.
 *
 * - Web: components/arcade/sfx.ts plays the recipes live in the browser.
 * - Phones: scripts/make_sounds.mts turns the same recipes into small WAV
 *   files, played by components/arcade/sfx.native.ts.
 *
 * No phone code here, so the mapping from game events to sounds is tested.
 */
import type { GameEvent } from './rules';
import type { Skin, SkinRole } from './skins';

export type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise';
/** One tone: start pitch, end pitch, how long, how loud, when it starts. */
export type Tone = { wave: Wave; from: number; to?: number; dur: number; vol: number; at?: number };

/** Kept quiet on purpose: short, soft, no sudden loud bursts. */
export const SOUNDS = {
  swing: [{ wave: 'noise', from: 2600, to: 900, dur: 0.07, vol: 0.12 }],
  bonk: [
    { wave: 'square', from: 420, to: 160, dur: 0.09, vol: 0.22 },
    { wave: 'noise', from: 1400, dur: 0.04, vol: 0.12 },
  ],
  bigBonk: [
    { wave: 'square', from: 520, to: 120, dur: 0.16, vol: 0.26 },
    { wave: 'noise', from: 900, dur: 0.08, vol: 0.16 },
  ],
  clang: [
    { wave: 'square', from: 1180, to: 1100, dur: 0.18, vol: 0.14 },
    { wave: 'triangle', from: 1770, to: 1700, dur: 0.22, vol: 0.12 },
  ],
  poof: [
    { wave: 'noise', from: 3000, to: 600, dur: 0.22, vol: 0.14 },
    { wave: 'triangle', from: 660, to: 1320, dur: 0.12, vol: 0.12, at: 0.05 },
  ],
  oof: [{ wave: 'square', from: 300, to: 180, dur: 0.14, vol: 0.2 }],
  down: [
    { wave: 'triangle', from: 440, to: 330, dur: 0.14, vol: 0.2 },
    { wave: 'triangle', from: 330, to: 220, dur: 0.22, vol: 0.2, at: 0.15 },
  ],
  snack: [
    { wave: 'square', from: 660, dur: 0.06, vol: 0.14 },
    { wave: 'square', from: 880, dur: 0.06, vol: 0.14, at: 0.07 },
    { wave: 'square', from: 1320, dur: 0.1, vol: 0.14, at: 0.14 },
  ],
  go: [
    { wave: 'square', from: 523, dur: 0.08, vol: 0.14 },
    { wave: 'square', from: 784, dur: 0.12, vol: 0.14, at: 0.1 },
  ],
  fight: [
    { wave: 'sawtooth', from: 220, dur: 0.08, vol: 0.12 },
    { wave: 'sawtooth', from: 208, dur: 0.12, vol: 0.12, at: 0.1 },
  ],
  creak: [
    { wave: 'sawtooth', from: 90, to: 140, dur: 0.5, vol: 0.14 },
    { wave: 'noise', from: 500, dur: 0.3, vol: 0.06, at: 0.2 },
  ],
  charge: [{ wave: 'sawtooth', from: 110, to: 330, dur: 0.3, vol: 0.14 }],
  crash: [
    { wave: 'noise', from: 700, to: 200, dur: 0.3, vol: 0.2 },
    { wave: 'square', from: 140, to: 70, dur: 0.25, vol: 0.18 },
  ],
  stomp: [
    { wave: 'triangle', from: 110, to: 50, dur: 0.25, vol: 0.28 },
    { wave: 'noise', from: 400, dur: 0.15, vol: 0.12 },
  ],
  angry: [
    { wave: 'sawtooth', from: 150, dur: 0.1, vol: 0.13 },
    { wave: 'sawtooth', from: 150, dur: 0.1, vol: 0.13, at: 0.14 },
    { wave: 'sawtooth', from: 180, dur: 0.16, vol: 0.13, at: 0.28 },
  ],
  calm: [
    { wave: 'triangle', from: 880, to: 440, dur: 0.6, vol: 0.14 },
    { wave: 'triangle', from: 660, to: 330, dur: 0.6, vol: 0.1, at: 0.1 },
  ],
  cageOpen: [
    { wave: 'square', from: 392, dur: 0.07, vol: 0.14 },
    { wave: 'square', from: 523, dur: 0.07, vol: 0.14, at: 0.08 },
    { wave: 'square', from: 659, dur: 0.07, vol: 0.14, at: 0.16 },
    { wave: 'square', from: 784, dur: 0.16, vol: 0.14, at: 0.24 },
  ],
  cheer: [
    { wave: 'triangle', from: 990, to: 1320, dur: 0.08, vol: 0.12 },
    { wave: 'triangle', from: 1180, to: 1580, dur: 0.08, vol: 0.12, at: 0.1 },
  ],
  win: [
    { wave: 'square', from: 523, dur: 0.1, vol: 0.13 },
    { wave: 'square', from: 659, dur: 0.1, vol: 0.13, at: 0.12 },
    { wave: 'square', from: 784, dur: 0.1, vol: 0.13, at: 0.24 },
    { wave: 'square', from: 1047, dur: 0.3, vol: 0.13, at: 0.36 },
    { wave: 'triangle', from: 523, dur: 0.6, vol: 0.1, at: 0.36 },
  ],
  jingle: [
    { wave: 'triangle', from: 1568, dur: 0.06, vol: 0.12 },
    { wave: 'triangle', from: 2093, dur: 0.08, vol: 0.12, at: 0.06 },
    { wave: 'noise', from: 6000, dur: 0.12, vol: 0.05 },
  ],
} satisfies Record<string, Tone[]>;

export type SoundName = keyof typeof SOUNDS;
export const SOUND_NAMES = Object.keys(SOUNDS) as SoundName[];
export const isSound = (name: string | undefined): name is SoundName => !!name && name in SOUNDS;

/** How long a recipe lasts, in seconds. */
export const soundLength = (name: SoundName): number => Math.max(...SOUNDS[name].map((t: Tone) => (t.at ?? 0) + t.dur));

/**
 * The sounds to play for one step of the game. Skins can change the bonk,
 * poof and voice sounds. At most three at once, and never the same one twice
 * in a step, so a crowd of monsters does not make a din.
 */
export function soundsFor(events: GameEvent[], skins: Record<SkinRole, Skin>, hero: SkinRole): SoundName[] {
  const out: SoundName[] = [];
  const add = (name: string | undefined, fallback: SoundName) => {
    const pick = isSound(name) ? name : fallback;
    if (!out.includes(pick)) out.push(pick);
  };
  for (const e of events) {
    switch (e.type) {
      case 'swing':
        add(undefined, 'swing');
        break;
      case 'bonk':
        // The boss is metal: it clangs.
        if (e.boss) add(skins.boss?.sounds?.bonked, 'clang');
        else add(undefined, e.finisher ? 'bigBonk' : 'bonk');
        break;
      case 'poof': {
        const role = e.role as SkinRole;
        add(skins[role]?.sounds?.poof, 'poof');
        break;
      }
      case 'heroHurt':
        add(skins[hero]?.sounds?.bonked, 'oof');
        break;
      case 'heroDown':
        add(undefined, 'down');
        break;
      case 'snack':
        add(undefined, 'snack');
        break;
      case 'waveStart':
        add(undefined, 'fight');
        break;
      case 'waveClear':
        add(undefined, 'go');
        break;
      case 'bossWake':
        add(skins.boss?.sounds?.voice, 'creak');
        break;
      case 'bossAngry':
        add(undefined, 'angry');
        break;
      case 'charge':
        add(undefined, 'charge');
        break;
      case 'bossStun':
        add(undefined, 'crash');
        break;
      case 'stomp':
        add(undefined, 'stomp');
        break;
      case 'bossSettle':
        add(undefined, 'calm');
        break;
      case 'cageOpen':
        add(undefined, 'cageOpen');
        break;
      case 'rescued': {
        const role = e.kind as SkinRole;
        add(skins[role]?.sounds?.voice, 'cheer');
        break;
      }
      case 'won':
        add(undefined, 'win');
        break;
    }
  }
  return out.slice(0, 3);
}

/** Turns a recipe into sound samples between -1 and 1. Used by the WAV maker and by tests. */
export function renderSound(name: SoundName, rate = 22050): Float32Array {
  const len = Math.ceil(soundLength(name) * rate) + 1;
  const out = new Float32Array(len);
  let seed = 12345;
  const noise = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1;
  };
  for (const tone of SOUNDS[name] as Tone[]) {
    const start = Math.floor((tone.at ?? 0) * rate);
    const n = Math.floor(tone.dur * rate);
    let phase = 0;
    let held = 0;
    for (let i = 0; i < n && start + i < len; i++) {
      const p = i / n;
      const freq = tone.from + ((tone.to ?? tone.from) - tone.from) * p;
      phase += freq / rate;
      // Quick fade in, smooth fade out: no clicks.
      const env = Math.min(1, i / (rate * 0.004)) * (1 - p) * (1 - p);
      let v: number;
      if (tone.wave === 'square') v = phase % 1 < 0.5 ? 1 : -1;
      else if (tone.wave === 'triangle') v = 1 - 4 * Math.abs((phase % 1) - 0.5);
      else if (tone.wave === 'sawtooth') v = 2 * (phase % 1) - 1;
      else {
        // Noise held for a moment: lower pitch numbers give a rougher sound.
        if (phase >= 1) {
          phase %= 1;
          held = noise();
        }
        v = held;
      }
      out[start + i] += v * tone.vol * env;
    }
  }
  for (let i = 0; i < len; i++) out[i] = Math.max(-1, Math.min(1, out[i]));
  return out;
}

/** A 16-bit mono WAV file. */
export function wavBytes(samples: Float32Array, rate = 22050): Uint8Array {
  const data = samples.length * 2;
  const buf = new ArrayBuffer(44 + data);
  const v = new DataView(buf);
  const text = (o: number, s: string) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  text(0, 'RIFF');
  v.setUint32(4, 36 + data, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  text(36, 'data');
  v.setUint32(40, data, true);
  samples.forEach((s, i) => v.setInt16(44 + i * 2, Math.round(s * 32767), true));
  return new Uint8Array(buf);
}

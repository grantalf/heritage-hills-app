/**
 * Plays sound effects in the browser (web build and the single-file preview).
 * The recipes from lib/arcade/sound.ts are played live with the browser's own
 * sound maker, so no files are loaded. Phones use sfx.native.ts instead.
 *
 * Browsers only allow sound after the person taps something. The game screen
 * calls `unlock()` from the Start button.
 */
import { SOUNDS, type SoundName, type Tone } from '@/lib/arcade/sound';

export type Sfx = { play: (name: SoundName) => void; unlock: () => void; release: () => void };

type Ctx = AudioContext;
const AudioCtor = (): (new () => Ctx) | undefined => {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { AudioContext?: new () => Ctx; webkitAudioContext?: new () => Ctx };
  return w.AudioContext ?? w.webkitAudioContext;
};

export function createSfx(): Sfx {
  let ctx: Ctx | null = null;
  let noise: AudioBuffer | null = null;
  const master = { gain: null as GainNode | null };

  const ready = (): Ctx | null => {
    if (ctx) return ctx;
    const Ctor = AudioCtor();
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      const g = ctx.createGain();
      g.gain.value = 0.8;
      g.connect(ctx.destination);
      master.gain = g;
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    } catch {
      ctx = null;
    }
    return ctx;
  };

  const tone = (c: Ctx, t: Tone, start: number) => {
    const at = start + (t.at ?? 0);
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(t.vol, at + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, at + t.dur);
    env.connect(master.gain!);
    if (t.wave === 'noise') {
      const src = c.createBufferSource();
      src.buffer = noise;
      // Lower numbers make rougher noise: filter it to the recipe's pitch.
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(t.from, at);
      if (t.to) filter.frequency.linearRampToValueAtTime(t.to, at + t.dur);
      src.connect(filter).connect(env);
      src.start(at);
      src.stop(at + t.dur + 0.02);
    } else {
      const osc = c.createOscillator();
      osc.type = t.wave;
      osc.frequency.setValueAtTime(t.from, at);
      if (t.to) osc.frequency.linearRampToValueAtTime(t.to, at + t.dur);
      osc.connect(env);
      osc.start(at);
      osc.stop(at + t.dur + 0.02);
    }
  };

  return {
    unlock: () => {
      const c = ready();
      if (c && c.state === 'suspended') c.resume().catch(() => undefined);
    },
    play: (name) => {
      const c = ready();
      if (!c || c.state !== 'running') return;
      const now = c.currentTime + 0.01;
      for (const t of SOUNDS[name] as Tone[]) tone(c, t, now);
    },
    release: () => {
      ctx?.close().catch(() => undefined);
      ctx = null;
    },
  };
}

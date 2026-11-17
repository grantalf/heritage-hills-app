/**
 * One game in progress: the world, the effects, the buttons held, and the
 * latest status line. The screen subscribes to it and repaints when the frame
 * number changes. No React and no phone code, so it is tested like the rules.
 */
import { autoplay } from './autoplay';
import { createWorld, retry, step, STEP, type Difficulty, type GameEvent, type HeroId, type Input, type Level, type World } from './rules';
import { advanceFx, statusFor, type Fx, type StatusKey } from './scene';

/** Never catch up more than this many steps in one frame. A slow phone slows the game; it does not skip it. */
const MAX_STEPS = 6;

export class GameSession {
  world: World | null = null;
  fx: Fx[] = [];
  status: StatusKey = 'start';
  private input: Input = { x: 0, z: 0, attack: false };
  private frame = 0;
  private owed = 0;
  private fxId = 0;
  private listeners = new Set<() => void>();
  /** Everything that happened since the screen last asked: for sounds. */
  private events: GameEvent[] = [];

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getFrame = (): number => this.frame;

  private changed() {
    this.frame += 1;
    for (const listener of this.listeners) listener();
  }

  start(level: Level, options: { difficulty: Difficulty; viewW: number; seed?: number; hero?: HeroId }) {
    this.world = createWorld(level, options);
    this.fx = [];
    this.events = [];
    this.owed = 0;
    this.status = 'start';
    this.input = { x: 0, z: 0, attack: false };
    this.changed();
  }

  /** After a knock-out: back to the last checkpoint. */
  tryAgain() {
    if (!this.world) return;
    this.world = retry(this.world);
    this.fx = [];
    this.owed = 0;
    this.status = 'waveClear';
    this.changed();
  }

  /** Takes the events collected since the last call. */
  takeEvents(): GameEvent[] {
    const out = this.events;
    this.events = [];
    return out;
  }

  setInput(x: number, z: number, attack: boolean) {
    this.input = { x, z, attack };
  }

  /** Move the game forward by some real time, in fixed steps. */
  advance(seconds: number, viewW: number, auto = false) {
    const world = this.world;
    if (!world) return;
    this.owed += Math.min(0.1, Math.max(0, seconds));
    let steps = 0;
    while (this.owed >= STEP && steps < MAX_STEPS) {
      world.viewW = viewW;
      step(world, auto ? autoplay(world) : this.input);
      this.fx = advanceFx(this.fx, world.events, STEP, () => ++this.fxId);
      this.status = statusFor(world.events) ?? this.status;
      if (this.events.length < 64) this.events.push(...world.events);
      this.owed -= STEP;
      steps += 1;
    }
    if (this.owed > STEP * MAX_STEPS) this.owed = 0;
    if (steps) this.changed();
  }
}

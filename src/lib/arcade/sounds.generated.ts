// Made by scripts/make_sounds.mts. Do not edit by hand. Run `npm run sounds`.
// Phones only: components/arcade/sfx.native.ts loads these. The web plays the recipes live.
import type { SoundName } from './sound';

export const SOUND_FILES: Record<SoundName, number> = {
  swing: require('../../../assets/game/sfx/swing.wav'),
  bonk: require('../../../assets/game/sfx/bonk.wav'),
  bigBonk: require('../../../assets/game/sfx/bigBonk.wav'),
  clang: require('../../../assets/game/sfx/clang.wav'),
  poof: require('../../../assets/game/sfx/poof.wav'),
  oof: require('../../../assets/game/sfx/oof.wav'),
  down: require('../../../assets/game/sfx/down.wav'),
  snack: require('../../../assets/game/sfx/snack.wav'),
  go: require('../../../assets/game/sfx/go.wav'),
  fight: require('../../../assets/game/sfx/fight.wav'),
  creak: require('../../../assets/game/sfx/creak.wav'),
  charge: require('../../../assets/game/sfx/charge.wav'),
  crash: require('../../../assets/game/sfx/crash.wav'),
  stomp: require('../../../assets/game/sfx/stomp.wav'),
  angry: require('../../../assets/game/sfx/angry.wav'),
  calm: require('../../../assets/game/sfx/calm.wav'),
  cageOpen: require('../../../assets/game/sfx/cageOpen.wav'),
  cheer: require('../../../assets/game/sfx/cheer.wav'),
  win: require('../../../assets/game/sfx/win.wav'),
  jingle: require('../../../assets/game/sfx/jingle.wav'),
};

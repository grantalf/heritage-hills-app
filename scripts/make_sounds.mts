/**
 * Turns the sound recipes in src/lib/arcade/sound.ts into small WAV files for phones.
 *   npm run sounds
 * Writes assets/game/sfx/<name>.wav and src/lib/arcade/sounds.generated.ts.
 * The web build does not use these files: it plays the recipes live.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSound, SOUND_NAMES, wavBytes } from '../src/lib/arcade/sound.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'assets/game/sfx');
mkdirSync(dir, { recursive: true });
let bytes = 0;
for (const name of SOUND_NAMES) {
  const file = wavBytes(renderSound(name));
  writeFileSync(join(dir, `${name}.wav`), file);
  bytes += file.length;
}
const lines = SOUND_NAMES.map((name) => `  ${name}: require('../../../assets/game/sfx/${name}.wav'),`).join('\n');
writeFileSync(
  join(root, 'src/lib/arcade/sounds.generated.ts'),
  `// Made by scripts/make_sounds.mts. Do not edit by hand. Run \`npm run sounds\`.\n// Phones only: components/arcade/sfx.native.ts loads these. The web plays the recipes live.\nimport type { SoundName } from './sound';\n\nexport const SOUND_FILES: Record<SoundName, number> = {\n${lines}\n};\n`,
);
console.log(`${SOUND_NAMES.length} sounds, ${(bytes / 1024).toFixed(0)} KB of WAV`);

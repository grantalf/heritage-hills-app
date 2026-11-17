/**
 * A pixel critter from the zone's sprite sheet (made by `npm run critters`).
 * Decorative: the name next to it carries the meaning. Unknown animals show as a
 * plain tan shape, like an empty slot in an old game's collection.
 */
import { Image, Platform, View } from 'react-native';

import { CRITTER_CELL } from '@/lib/quest/critter-puppet';
import { CRITTER_COLS, CRITTER_INDEX, CRITTER_ROWS, CRITTER_SHADOWS, CRITTER_SHEET } from '@/lib/quest/critters.generated';

const CRISP = Platform.OS === 'web' ? ({ imageRendering: 'pixelated' } as object) : null;

export const hasPixelCritter = (id: string) => id in CRITTER_INDEX;

export function PixelCritter({ id, size = 36, shadow }: { id: string; size?: number; shadow?: boolean }) {
  const index = CRITTER_INDEX[id];
  if (index === undefined) return <View style={{ width: size, height: size }} />;
  const k = size / CRITTER_CELL;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri: shadow ? CRITTER_SHADOWS : CRITTER_SHEET }}
        fadeDuration={0}
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: CRITTER_COLS * CRITTER_CELL * k,
            height: CRITTER_ROWS * CRITTER_CELL * k,
            transform: [{ translateX: -(index % CRITTER_COLS) * size }, { translateY: -Math.floor(index / CRITTER_COLS) * size }],
          },
          CRISP,
        ]}
      />
    </View>
  );
}

/**
 * Shows one frame of a sprite sheet. The sheet images are packed into the app
 * (sheets.generated.ts), so nothing is downloaded.
 */
import { Image, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { sheetMeta } from '@/lib/arcade/scene';
import { SHEET_IMAGES } from '@/lib/arcade/sheets.generated';

export type LookId = 'thinFlat' | 'thinShaded' | 'thickFlat' | 'thickShaded';
export const LOOK_IDS: LookId[] = ['thinFlat', 'thinShaded', 'thickFlat', 'thickShaded'];

// Keep pixel edges hard in the browser. Phones get sheets stored three times larger, so they stay crisp too.
const CRISP = Platform.OS === 'web' ? ({ imageRendering: 'pixelated' } as object) : null;

/** A frame that sits in the normal page layout. */
export function Sprite({ sheet, frame, look, scale = 2, flip, style, opacity = 1 }: { sheet: string; frame: number; look: LookId; scale?: number; flip?: boolean; style?: StyleProp<ViewStyle>; opacity?: number }) {
  const meta = sheetMeta(sheet);
  const uri = SHEET_IMAGES[look]?.[sheet];
  if (!meta || !uri) return null;
  const rows = Math.ceil(Object.values(meta.anims).reduce((n, a) => Math.max(n, a.from + a.count), 0) / meta.cols);
  return (
    <View style={[{ width: meta.cw * scale, height: meta.ch * scale, overflow: 'hidden', opacity, transform: flip ? [{ scaleX: -1 }] : undefined }, style]}>
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri }}
        fadeDuration={0}
        style={[
          { position: 'absolute', top: 0, left: 0, width: meta.cols * meta.cw * scale, height: rows * meta.ch * scale, transform: [{ translateX: -(frame % meta.cols) * meta.cw * scale }, { translateY: -Math.floor(frame / meta.cols) * meta.ch * scale }] },
          CRISP,
        ]}
      />
    </View>
  );
}

/** A frame placed on the game stage by where its feet stand, in art pixels. */
export function StageSprite({ sheet, frame, look, scale, x, y, flip, opacity }: { sheet: string; frame: number; look: LookId; scale: number; x: number; y: number; flip?: boolean; opacity?: number }) {
  const meta = sheetMeta(sheet);
  if (!meta) return null;
  const left = (x - (flip ? meta.cw - meta.ax : meta.ax)) * scale;
  const top = (y - meta.ay) * scale;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, transform: [{ translateX: left }, { translateY: top }] }}>
      <Sprite sheet={sheet} frame={frame} look={look} scale={scale} flip={flip} opacity={opacity} />
    </View>
  );
}

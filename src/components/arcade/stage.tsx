/**
 * Paints the scene list from lib/arcade/scene.ts. This is the only file that
 * knows how the game is drawn: plain views and sprite sheet images, no game
 * library (decision D-057). If real phones need more speed, replace this file
 * with a faster painter; rules, art and screens stay as they are.
 */
import { View } from 'react-native';

import { frameOf, GROUND_TOP, TILE_W, VIEW_H, type Scene } from '@/lib/arcade/scene';

import { Sprite, StageSprite, type LookId } from './sprite';

type Mood = { skyTop: string; skyLow: string; glow: string; ground: string; groundLine: string; curb: string; shadow: string };
/** One strong color mood per level (style brief). This is the dusk street. */
export const DUSK: Mood = { skyTop: '#2b2a5c', skyLow: '#5a4a8a', glow: '#e9a37a', ground: '#4d5a78', groundLine: '#66759a', curb: '#3a4462', shadow: 'rgba(20,16,40,0.35)' };
/** The Frontier Lands: golden hour over the scrub forest, a dusty caliche trail. */
export const FRONTIER: Mood = { skyTop: '#5b3f6e', skyLow: '#c76a52', glow: '#ffc46b', ground: '#b98a5a', groundLine: '#d4a873', curb: '#8a6240', shadow: 'rgba(60,30,20,0.32)' };
export const MOODS: Record<string, Mood> = { dusk: DUSK, frontier: FRONTIER };

export function Stage({ scene, look, scale, viewW, label }: { scene: Scene; look: LookId; scale: number; viewW: number; label: string }) {
  const tiles = Math.ceil(viewW / TILE_W) + 1;
  const DUSK = MOODS[scene.mood] ?? MOODS.dusk;
  const sheet = scene.backdrop;
  const row = (anim: 'far' | 'near', offset: number, bottom: number) =>
    Array.from({ length: tiles }, (_, i) => <StageSprite key={`${anim}${i}`} sheet={sheet} frame={frameOf(sheet, anim, 0)} look={look} scale={scale} x={offset + i * TILE_W} y={bottom} />);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ width: viewW * scale, height: VIEW_H * scale, overflow: 'hidden', backgroundColor: DUSK.skyTop, alignSelf: 'center', direction: 'ltr' }}>
      <View style={{ position: 'absolute', top: 24 * scale, left: 0, right: 0, height: 26 * scale, backgroundColor: DUSK.skyLow }} />
      <View style={{ position: 'absolute', top: 44 * scale, left: 0, right: 0, height: 10 * scale, backgroundColor: DUSK.glow, opacity: 0.55 }} />
      {row('far', scene.farX, GROUND_TOP - 12)}
      <View style={{ position: 'absolute', top: (GROUND_TOP - 6) * scale, left: 0, right: 0, bottom: 0, backgroundColor: DUSK.ground }} />
      <View style={{ position: 'absolute', top: (GROUND_TOP - 6) * scale, left: 0, right: 0, height: scale, backgroundColor: DUSK.curb }} />
      <View style={{ position: 'absolute', top: (GROUND_TOP + 22) * scale, left: 0, right: 0, height: scale, backgroundColor: DUSK.groundLine, opacity: 0.5 }} />
      {row('near', scene.nearX, GROUND_TOP - 5)}
      {scene.draws.map((d) =>
        d.shadow ? (
          <View
            key={`s${d.key}`}
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, width: d.shadow * scale, height: 5 * scale, borderRadius: 3 * scale, backgroundColor: DUSK.shadow, transform: [{ translateX: (d.x - d.shadow / 2) * scale }, { translateY: (d.y - 3) * scale }] }}
          />
        ) : null,
      )}
      {scene.draws.map((d) => (
        <StageSprite key={d.key} sheet={d.sheet} frame={d.frame} look={look} scale={scale} x={d.x} y={d.y} flip={d.flip} opacity={d.hidden ? 0.35 : d.flash ? 0.6 : 1} />
      ))}
    </View>
  );
}

/** A still picture of a few characters on the dusk street, for the style sheets. */
export function Lineup({ look, scale, width, items, label }: { look: LookId; scale: number; width: number; items: { sheet: string; frame: number; x: number; flip?: boolean }[]; label: string }) {
  const h = 78;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width, height: h * scale, overflow: 'hidden', backgroundColor: DUSK.skyLow, borderRadius: 8, direction: 'ltr' }}>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 22 * scale, backgroundColor: DUSK.ground }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 22 * scale, height: scale, backgroundColor: DUSK.curb }} />
      {items.map((it, i) => (
        <View key={`sh${i}`} style={{ position: 'absolute', top: 0, left: 0, width: (it.sheet === 'boss' ? 60 : 20) * scale, height: 4 * scale, borderRadius: 2 * scale, backgroundColor: DUSK.shadow, transform: [{ translateX: (it.x - (it.sheet === 'boss' ? 30 : 10)) * scale }, { translateY: (h - 13) * scale }] }} />
      ))}
      {items.map((it, i) => (
        <StageSprite key={i} sheet={it.sheet} frame={it.frame} look={look} scale={scale} x={it.x} y={h - 10} flip={it.flip} />
      ))}
    </View>
  );
}

export { Sprite };

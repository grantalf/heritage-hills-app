/**
 * The score bar across the top of the game, in the old arcade style: a hero
 * portrait, segmented health, the score, and the boss's health when it is
 * awake. Every bar has words for screen readers.
 */
import { View } from 'react-native';

import { Txt } from '@/components/ui';
import { MENU } from '@/lib/arcade/menu-colors';
import { sheetMeta } from '@/lib/arcade/scene';
import { space } from '@/lib/theme';

import { Sprite, type LookId } from './sprite';

/** Where each hero's face sits in its sprite cell, in art pixels. */
const FACE: Record<string, { x: number; y: number }> = { hero: { x: 27, y: 25 }, flor: { x: 35, y: 37 } };
const BOX = 22;

/** A head-and-shoulders crop of a hero's first idle frame. */
export function Portrait({ sheet, look, scale = 2 }: { sheet: string; look: LookId; scale?: number }) {
  const meta = sheetMeta(sheet);
  const face = FACE[sheet] ?? { x: meta ? meta.ax : 0, y: meta ? meta.ay / 2 : 0 };
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: BOX * scale, height: BOX * scale, overflow: 'hidden', borderRadius: 4, borderWidth: 2, borderColor: MENU.gold, backgroundColor: MENU.parchmentDeep }}>
      <View style={{ position: 'absolute', left: -(face.x - BOX / 2) * scale - 2, top: -(face.y - BOX / 2) * scale - 2 }}>
        <Sprite sheet={sheet} frame={meta?.anims.idle?.from ?? 0} look={look} scale={scale} />
      </View>
    </View>
  );
}

/** A segmented bar, as on old arcade score strips. */
export function Segments({ now, max, color, label }: { now: number; max: number; color: string; label: string }) {
  const wide = max > 14 ? 5 : 9;
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max, now }} style={{ flexDirection: 'row', gap: 2, flexWrap: 'wrap', direction: 'ltr' }}>
      {Array.from({ length: max }, (_, i) => (
        <View key={i} style={{ width: wide, height: 12, borderRadius: 2, borderWidth: 1.5, borderColor: MENU.parchment, backgroundColor: i < now ? color : 'transparent' }} />
      ))}
    </View>
  );
}

export function ScoreBar({
  heroSheet,
  heroName,
  look,
  hp,
  maxHp,
  score,
  scoreLabel,
  heroLabel,
  boss,
}: {
  heroSheet: string;
  heroName: string;
  look: LookId;
  hp: number;
  maxHp: number;
  score: number;
  scoreLabel: string;
  heroLabel: string;
  boss?: { name: string; hp: number; maxHp: number; label: string };
}) {
  return (
    <View style={{ backgroundColor: MENU.woodDark, borderBottomWidth: 3, borderBottomColor: MENU.wood, paddingHorizontal: space.sm, paddingVertical: 6, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Portrait sheet={heroSheet} look={look} />
        <View style={{ flex: 1, gap: 3 }}>
          <Txt variant="label" numberOfLines={1} maxFontSizeMultiplier={1.4} style={{ color: MENU.parchment }}>
            {heroName}
          </Txt>
          <Segments now={hp} max={maxHp} color="#5fd068" label={heroLabel} />
        </View>
        <Txt variant="label" maxFontSizeMultiplier={1.4} style={{ color: MENU.gold, fontVariant: ['tabular-nums'] }} accessibilityLabel={scoreLabel}>
          {String(score).padStart(5, '0')}
        </Txt>
      </View>
      {boss ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Txt variant="small" numberOfLines={1} maxFontSizeMultiplier={1.4} style={{ color: MENU.parchment, flexShrink: 1 }}>
            {boss.name}
          </Txt>
          <View style={{ flex: 1 }}>
            <Segments now={boss.hp} max={boss.maxHp} color="#ff7a5c" label={boss.label} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

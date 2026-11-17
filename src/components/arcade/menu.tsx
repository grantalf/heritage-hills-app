/**
 * Wood-and-parchment pieces for the game menus (style brief): a hand-built
 * wooden sign for the title, and parchment panels in plank frames. Colors come
 * from lib/arcade/menu-colors.ts and are checked for contrast in tests.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Txt, UIOverrideProvider } from '@/components/ui';
import { MENU } from '@/lib/arcade/menu-colors';
import { ZONE, ZONE_ROUNDNESS } from '@/lib/quest/palette';
import { space } from '@/lib/theme';

/** The title sign: two planks on two posts. The words are real text. */
export function WoodSign({ title, caption }: { title: string; caption?: string }) {
  return (
    <View accessibilityRole="header" accessible accessibilityLabel={caption ? `${title}. ${caption}` : title} style={{ alignItems: 'center' }}>
      <View style={{ backgroundColor: MENU.wood, borderColor: MENU.woodDark, borderWidth: 4, borderRadius: 10, paddingVertical: space.md, paddingHorizontal: space.xl, alignItems: 'center', gap: 2, maxWidth: '100%' }}>
        {/* Plank lines and nail heads, for the hand-built look. */}
        <View pointerEvents="none" style={{ position: 'absolute', left: 6, right: 6, top: '50%', height: 2, backgroundColor: MENU.woodDark, opacity: 0.45 }} />
        {[{ left: 8, top: 8 }, { right: 8, top: 8 }, { left: 8, bottom: 8 }, { right: 8, bottom: 8 }].map((pos, i) => (
          <View key={i} pointerEvents="none" style={{ position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: MENU.gold, ...pos }} />
        ))}
        <Txt variant="display" style={{ color: MENU.parchment, textAlign: 'center', fontWeight: '900', letterSpacing: 1 }}>
          {title}
        </Txt>
        {caption ? (
          <Txt variant="label" style={{ color: MENU.parchment, textAlign: 'center' }}>
            {caption}
          </Txt>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 120 }}>
        <View style={{ width: 12, height: 22, backgroundColor: MENU.woodDark }} />
        <View style={{ width: 12, height: 22, backgroundColor: MENU.woodDark }} />
      </View>
    </View>
  );
}

/** A parchment panel in a plank frame. */
export function Parchment({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <View style={{ borderWidth: 4, borderColor: MENU.wood, borderRadius: 10, backgroundColor: MENU.parchment, overflow: 'hidden' }}>
      {title ? (
        <View style={{ backgroundColor: MENU.wood, paddingHorizontal: space.md, paddingVertical: space.xs }}>
          <Txt accessibilityRole="header" variant="lead" style={{ color: MENU.parchment, fontWeight: '800' }}>
            {title}
          </Txt>
        </View>
      ) : null}
      {/* Buttons and text inside parchment use the zone's tested colors, so they stay readable in dark mode (block 5 review, A-02). */}
      <ParchmentColors>
        <View style={{ padding: space.md, gap: space.sm }}>{children}</View>
      </ParchmentColors>
    </View>
  );
}

const PARCHMENT_UI = { palette: ZONE, roundness: ZONE_ROUNDNESS };
/** Wraps anything drawn on parchment, so the app's light or dark colors never land on it. */
export function ParchmentColors({ children }: { children: ReactNode }) {
  return <UIOverrideProvider value={PARCHMENT_UI}>{children}</UIOverrideProvider>;
}

/** Text on parchment, in the menu ink color. */
export function Ink({ children, soft, variant = 'body' }: { children: ReactNode; soft?: boolean; variant?: 'body' | 'small' | 'label' | 'lead' | 'title' }) {
  return (
    <Txt variant={variant} style={{ color: soft ? MENU.inkSoft : MENU.ink }}>
      {children}
    </Txt>
  );
}

/**
 * Shared pieces of the Critter Club game zone (block 3): its colors, the dialog
 * box, the experience bar and the menu bar. Readable body text everywhere; the
 * game feel comes from wood, parchment, pixel critters and the boxes.
 */
import { router, usePathname, type Href } from 'expo-router';
import { BookOpen, Ellipsis, Map, PawPrint, ScrollText, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt, UIOverrideProvider, useUI } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { ZONE, ZONE_EXTRA, ZONE_ROUNDNESS } from '@/lib/quest/palette';
import type { Experience } from '@/lib/quest/quests';
import { MIN_TOUCH, space } from '@/lib/theme';

import { PixelCritter } from './pixel-critter';

const ZONE_UI = { palette: ZONE, roundness: ZONE_ROUNDNESS };

/** Everything inside wears the zone's wood-and-parchment colors. */
export function ZoneColors({ children }: { children: ReactNode }) {
  return <UIOverrideProvider value={ZONE_UI}>{children}</UIOverrideProvider>;
}

/** An old-game dialog box: who is talking, what they say, and buttons. */
export function DialogBox({ speaker, name, children, actions }: { speaker?: string; name: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <View accessibilityRole="summary" style={{ borderWidth: 4, borderColor: ZONE_EXTRA.woodDark, backgroundColor: ZONE_EXTRA.dialog, borderRadius: 6, padding: space.md, gap: space.sm }}>
      <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderWidth: 2, borderColor: ZONE_EXTRA.gold, borderRadius: 3 }} pointerEvents="none" />
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
        {speaker ? (
          <View style={{ borderWidth: 3, borderColor: ZONE_EXTRA.wood, backgroundColor: ZONE.surface, borderRadius: 4, padding: 2 }}>
            <PixelCritter id={speaker} size={54} />
          </View>
        ) : null}
        <View style={{ flex: 1, gap: 4 }}>
          <Txt variant="label" style={{ color: ZONE.primary }}>
            {name}
          </Txt>
          {typeof children === 'string' ? <Txt>{children}</Txt> : children}
        </View>
      </View>
      {actions ? <View style={{ gap: space.sm }}>{actions}</View> : null}
    </View>
  );
}

/** Experience bar with the rank, like an old role-playing game's status strip. */
export function XpBar({ exp }: { exp: Experience }) {
  const { t } = useT();
  const rank = t(`critters.rank.${exp.rank}`);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('xp.bar', { xp: exp.xp, rank })}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(exp.share * 100) }}
      style={{ backgroundColor: ZONE_EXTRA.woodDark, borderRadius: 6, paddingHorizontal: space.md, paddingVertical: space.sm, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, flexWrap: 'wrap' }}>
        <Txt variant="label" style={{ color: ZONE.onPrimary }}>
          {rank}
        </Txt>
        <Txt variant="label" style={{ color: ZONE_EXTRA.gold }}>
          {t('xp.label', { xp: exp.xp })}
        </Txt>
      </View>
      <View style={{ height: 12, borderRadius: 2, borderWidth: 2, borderColor: ZONE.onPrimary, backgroundColor: ZONE_EXTRA.xpTrack, overflow: 'hidden', direction: 'ltr' }}>
        <View style={{ height: '100%', width: `${Math.round(exp.share * 100)}%`, backgroundColor: ZONE_EXTRA.xp }} />
      </View>
      <Txt variant="small" style={{ color: ZONE.onPrimary }}>
        {exp.next ? t('xp.next', { points: exp.next.toGo, rank: t(`critters.rank.${exp.next.rank}`) }) : t('xp.top')}
      </Txt>
    </View>
  );
}

const ITEMS: { key: 'map' | 'guide' | 'quests' | 'pets' | 'more'; icon: LucideIcon; href: Href; match: string }[] = [
  { key: 'map', icon: Map, href: '/critters/world', match: '/critters/world' },
  { key: 'guide', icon: BookOpen, href: '/critters/guide', match: '/critters/guide' },
  { key: 'quests', icon: ScrollText, href: '/critters/quests', match: '/critters/quests' },
  { key: 'pets', icon: PawPrint, href: '/critters/pets', match: '/critters/pets' },
  { key: 'more', icon: Ellipsis, href: '/critters/more', match: '/critters/more' },
];

/** The zone's own menu bar, in wood. Icon and word on every button. */
export function ZoneMenu() {
  const { t } = useT();
  const { fs } = useUI();
  // Grows with the text-size setting, up to what five buttons can hold. Long words wrap to two lines.
  const size = Math.min(Math.round(fs('small') * 0.8), 15);
  const path = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: ZONE_EXTRA.wood, borderTopWidth: 3, borderTopColor: ZONE_EXTRA.woodDark, paddingBottom: insets.bottom }}>
      {ITEMS.map(({ key, icon: Icon, href, match }) => {
        const on = path === match;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            aria-selected={on}
            accessibilityLabel={t(`menu.${key}`)}
            onPress={() => (on ? undefined : router.replace(href))}
            style={({ pressed }) => ({ flex: 1, minHeight: MIN_TOUCH + 8, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 4, backgroundColor: on ? ZONE_EXTRA.woodDark : pressed ? '#6a4224' : 'transparent' })}>
            <Icon color={on ? ZONE_EXTRA.gold : ZONE.onPrimary} size={22} />
            <Txt variant="small" numberOfLines={2} style={{ color: on ? ZONE_EXTRA.gold : ZONE.onPrimary, fontSize: size, lineHeight: size * 1.2, fontWeight: '700', textAlign: 'center' }}>
              {t(`menu.${key}`)}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

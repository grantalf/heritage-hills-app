/**
 * Pieces of a pet character card (block 4), in the game zone's wood and
 * parchment (style brief: "a framed portrait beside names and numbers").
 * Every piece is readable by screen readers and grows with the text size.
 */
import { EyeOff, Flag, Minus, Plus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Image, Pressable, View } from 'react-native';

import { CritterArt, type ArtSpec } from '@/components/critter-art';
import { CritterPic, Emoji } from '@/components/game';
import { Ink, Parchment } from '@/components/arcade/menu';
import { Btn, SampleTag, Tag, Txt } from '@/components/ui';
import { MENU } from '@/lib/arcade/menu-colors';
import { CARD_COLORS } from '@/lib/petcard-colors';
import type { Portrait } from '@/lib/data/petcard-repository';
import { useT } from '@/lib/i18n';
import { STAT_IDS, STAT_MAX, STAT_MIN, STICKER_IDS, topStickers, type PawNote, type StatId, type Stats, type StickerCounts, type StickerId } from '@/lib/petcards';
import { MIN_TOUCH, space } from '@/lib/theme';

export const STICKER_EMOJI: Record<StickerId, string> = {
  goodest: '🏅',
  softest: '☁️',
  funny: '😂',
  brave: '🛡️',
  gentle: '🌸',
  speedy: '⚡',
  bestHello: '👋',
  snackChamp: '🍪',
};

/** The picture in the card's frame: an uploaded portrait, a sample portrait, or the pet's own character. */
export function PortraitPic({ id, art, emoji, portrait, name, size }: { id: string; art?: ArtSpec; emoji: string; portrait?: Portrait; name: string; size: number }) {
  const { t } = useT();
  if (portrait?.kind === 'image') {
    return <Image source={{ uri: portrait.uri }} accessibilityLabel={t('cards.portraitAlt', { name })} style={{ width: size, height: size, borderRadius: 4 }} resizeMode="cover" />;
  }
  if (portrait?.kind === 'sample') {
    // A stand-in for a made portrait: the cartoon on a soft golden backdrop.
    return (
      <View accessible accessibilityRole="image" accessibilityLabel={t('cards.portraitAlt', { name })} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', backgroundColor: CARD_COLORS.goldSoft, borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', width: size * 0.9, height: size * 0.9, borderRadius: size, backgroundColor: CARD_COLORS.goldPale }} />
        {art ? <CritterArt spec={art} size={size * 0.86} /> : <CritterPic id={id} emoji={emoji} size={Math.round(size * 0.8)} />}
      </View>
    );
  }
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <CritterPic id={id} art={art} emoji={emoji} size={Math.round(size * 0.9)} />
    </View>
  );
}

/** The framed card top: picture in a plank frame, a name plate and tags. */
export function CardFrame({ name, picture, tags, label }: { name: string; picture: ReactNode; tags?: ReactNode; label: string }) {
  return (
    <View accessibilityLabel={label} style={{ alignItems: 'center', gap: space.sm }}>
      <View style={{ backgroundColor: MENU.wood, borderColor: MENU.woodDark, borderWidth: 4, borderRadius: 8, padding: 8 }}>
        <View style={{ borderWidth: 3, borderColor: MENU.gold, backgroundColor: MENU.parchmentDeep, borderRadius: 4, padding: 6 }}>{picture}</View>
        {[{ left: 3, top: 3 }, { right: 3, top: 3 }, { left: 3, bottom: 3 }, { right: 3, bottom: 3 }].map((pos, i) => (
          <View key={i} pointerEvents="none" style={{ position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: MENU.gold, ...pos }} />
        ))}
      </View>
      <View style={{ backgroundColor: MENU.woodDark, borderRadius: 6, paddingHorizontal: space.lg, paddingVertical: space.xs, maxWidth: '100%' }}>
        <Txt variant="title" style={{ color: MENU.parchment, textAlign: 'center', fontWeight: '900' }}>
          {name}
        </Txt>
      </View>
      {tags ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>{tags}</View> : null}
    </View>
  );
}

/** One stat as five segments, like an old game's status screen. */
export function StatBar({ id, value }: { id: StatId; value: number }) {
  const { t } = useT();
  const label = t(`cards.stat.${id}`);
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={t('cards.statValue', { stat: label, value })} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
      <Txt variant="label" style={{ color: MENU.ink, minWidth: 110, flexShrink: 1 }}>
        {label}
      </Txt>
      <View style={{ flexDirection: 'row', gap: 3, direction: 'ltr' }}>
        {Array.from({ length: STAT_MAX }, (_, i) => (
          <View key={i} style={{ width: 22, height: 14, borderWidth: 2, borderColor: MENU.woodDark, backgroundColor: i < value ? CARD_COLORS.statOn : MENU.parchment }} />
        ))}
      </View>
      {/* The number too, so the stat never depends on telling colors apart. */}
      <Txt variant="label" style={{ color: MENU.ink }}>
        {value}/{STAT_MAX}
      </Txt>
    </View>
  );
}

export function StatBars({ stats }: { stats: Stats }) {
  return (
    <View style={{ gap: space.sm }}>
      {STAT_IDS.map((id) => (
        <StatBar key={id} id={id} value={stats[id]} />
      ))}
    </View>
  );
}

/** A stat with minus and plus buttons, for the card editor. */
export function StatStepper({ id, value, onChange }: { id: StatId; value: number; onChange: (next: number) => void }) {
  const { t } = useT();
  const stat = t(`cards.stat.${id}`);
  const step = (delta: number) => onChange(Math.min(STAT_MAX, Math.max(STAT_MIN, value + delta)));
  const button = (delta: number) => {
    const disabled = delta < 0 ? value <= STAT_MIN : value >= STAT_MAX;
    const Icon = delta < 0 ? Minus : Plus;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(delta < 0 ? 'cards.statLess' : 'cards.statMore', { stat })}
        // Says the new number after each press (block 5 review).
        accessibilityValue={{ min: STAT_MIN, max: STAT_MAX, now: value, text: t('cards.statNow', { stat, value, max: STAT_MAX }) }}
        accessibilityState={{ disabled }}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={() => step(delta)}
        style={({ pressed }) => ({ width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 2, borderColor: MENU.woodDark, backgroundColor: pressed ? MENU.parchmentDeep : MENU.parchment, opacity: disabled ? 0.4 : 1 })}>
        <Icon color={MENU.ink} size={22} />
      </Pressable>
    );
  };
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
        {button(-1)}
        <View style={{ flexShrink: 1 }} accessibilityLiveRegion="polite">
          <StatBar id={id} value={value} />
        </View>
        {button(1)}
      </View>
    </View>
  );
}

/** The top stickers, with counts. */
export function TopStickers({ counts }: { counts: StickerCounts }) {
  const { t } = useT();
  const top = topStickers(counts);
  if (top.length === 0) return <Txt style={{ color: MENU.inkSoft }}>{t('cards.stickersNone')}</Txt>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {top.map(({ id, count }) => {
        const label = t(`cards.sticker.${id}`);
        return (
          <View key={id} accessible accessibilityLabel={t('cards.stickerCount', { label, count })} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: MENU.parchmentDeep, borderColor: MENU.wood, borderWidth: 2, borderRadius: 999, paddingHorizontal: space.md, paddingVertical: 4 }}>
            <Emoji size={20}>{STICKER_EMOJI[id]}</Emoji>
            <Txt variant="label" style={{ color: MENU.ink }}>
              {label} · {count}
            </Txt>
          </View>
        );
      })}
    </View>
  );
}

/** All stickers as buttons. One of each per person. Tap again to take it back. */
export function StickerPicker({ mine, onToggle }: { mine: readonly StickerId[]; onToggle: (id: StickerId) => void }) {
  const { t } = useT();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {STICKER_IDS.map((id) => {
        const on = mine.includes(id);
        const label = t(`cards.sticker.${id}`);
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            aria-pressed={on}
            accessibilityLabel={on ? t('cards.stickerGiven', { label }) : t('cards.stickerGive', { label })}
            onPress={() => onToggle(id)}
            style={({ pressed }) => ({
              flexBasis: '22%',
              flexGrow: 1,
              minWidth: 72,
              minHeight: 72,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: 4,
              borderRadius: 8,
              borderWidth: 3,
              borderColor: on ? MENU.woodDark : MENU.wood,
              backgroundColor: on ? CARD_COLORS.goldSoft : pressed ? MENU.parchmentDeep : MENU.parchment,
            })}>
            <Emoji size={26}>{STICKER_EMOJI[id]}</Emoji>
            <Txt variant="small" style={{ color: MENU.ink, textAlign: 'center', fontWeight: on ? '800' : '600' }}>
              {label}
            </Txt>
            {on ? <Tag tone="good" label="✓" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** A small tile for the album grid. */
export function CardTile({ title, subtitle, picture, onPress, label, badge }: { title: string; subtitle?: string; picture: ReactNode; onPress: () => void; label: string; badge?: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ flexBasis: '45%', flexGrow: 1, alignItems: 'center', gap: 6, padding: space.sm, borderRadius: 8, borderWidth: 4, borderColor: MENU.wood, backgroundColor: pressed ? MENU.parchmentDeep : MENU.parchment })}>
      <View style={{ borderWidth: 3, borderColor: MENU.gold, borderRadius: 4, padding: 4, backgroundColor: MENU.parchmentDeep }}>{picture}</View>
      <Txt variant="lead" style={{ color: MENU.ink, textAlign: 'center', fontWeight: '800' }}>
        {title}
      </Txt>
      {subtitle ? (
        <Txt variant="small" style={{ color: MENU.inkSoft, textAlign: 'center' }}>
          {subtitle}
        </Txt>
      ) : null}
      {badge}
    </Pressable>
  );
}

/** One paw note, shown as written. The writer is never shown. */
export function NoteCard({ note, date, onReport, onRemove }: { note: PawNote; date: string; onReport?: () => void; onRemove?: () => void }) {
  const { t } = useT();
  return (
    <Parchment>
      <Ink>“{note.text}”</Ink>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <Ink soft variant="small">
          {t('cards.noteDate', { date })}
        </Ink>
        {note.sample ? <SampleTag /> : null}
      </View>
      {onReport ? <Btn kind="quiet" icon={Flag} label={t('cards.noteReport')} onPress={onReport} /> : null}
      {onRemove ? <Btn kind="quiet" icon={EyeOff} label={t('cards.noteRemove')} onPress={onRemove} /> : null}
    </Parchment>
  );
}

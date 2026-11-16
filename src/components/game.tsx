import { router, type Href } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { I18nManager, Pressable, Text, View } from 'react-native';

import { CritterArt, type ArtSpec } from '@/components/critter-art';
import { Txt, useUI } from '@/components/ui';
import { critterArt, petArt } from '@/lib/data/game-art';
import { radius, space } from '@/lib/theme';

/** Placeholder picture. Decorative: the name next to it carries the meaning. */
export function Emoji({ children, size = 32, dim }: { children: string; size?: number; dim?: boolean }) {
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      aria-hidden
      allowFontScaling={false}
      style={{ fontSize: size, lineHeight: Math.round(size * 1.25), opacity: dim ? 0.3 : 1, textAlign: 'center' }}>
      {children}
    </Text>
  );
}

/** The cartoon character for an animal or pet, or its emoji if it has none yet. */
export function CritterPic({ id, art, emoji, size = 48, dim }: { id?: string; art?: ArtSpec; emoji: string; size?: number; dim?: boolean }) {
  const spec = art ?? (id ? (critterArt[id] ?? petArt[id]) : undefined);
  if (spec) return <CritterArt spec={spec} size={size} dim={dim} />;
  return (
    <Emoji size={Math.round(size * 0.75)} dim={dim}>
      {emoji}
    </Emoji>
  );
}

export function EmojiRow({
  emoji,
  picId,
  art,
  title,
  subtitle,
  href,
  right,
  dim,
}: {
  emoji: string;
  picId?: string;
  art?: ArtSpec;
  title: string;
  subtitle?: string;
  href: Href;
  right?: ReactNode;
  dim?: boolean;
}) {
  const { c, round } = useUI();
  const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={() => router.push(href)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        minHeight: 68,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
        borderRadius: round(radius.lg),
        backgroundColor: pressed ? c.surfaceStrong : c.surface,
      })}>
      <View style={{ width: 52, alignItems: 'center' }}>
        {picId || art ? (
          <CritterPic id={picId} art={art} emoji={emoji} size={52} dim={dim} />
        ) : (
          <Emoji size={34} dim={dim}>
            {emoji}
          </Emoji>
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="lead">{title}</Txt>
        {subtitle ? (
          <Txt variant="small" tone="secondary">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ?? <Chevron color={c.textSecondary} size={22} />}
    </Pressable>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const { c } = useUI();
  const share = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: Math.min(value, max) }}
      style={{ height: 14, borderRadius: radius.pill, backgroundColor: c.surfaceStrong, overflow: 'hidden' }}>
      <View style={{ height: 14, borderRadius: radius.pill, backgroundColor: c.primary, width: `${Math.round(share * 100)}%` }} />
    </View>
  );
}

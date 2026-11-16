import { router, type Href } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { I18nManager, Pressable, Text, View } from 'react-native';

import { Txt, useUI } from '@/components/ui';
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

export function EmojiRow({
  emoji,
  title,
  subtitle,
  href,
  right,
  dim,
}: {
  emoji: string;
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
      <View style={{ width: 48, alignItems: 'center' }}>
        <Emoji size={34} dim={dim}>
          {emoji}
        </Emoji>
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

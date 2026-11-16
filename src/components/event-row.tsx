import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { SampleTag, Tag, Txt, useUI } from '@/components/ui';
import type { CommunityEvent } from '@/lib/data/types';
import { clock, dayParts } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { radius, space } from '@/lib/theme';

export function EventRow({ event }: { event: CommunityEvent }) {
  const { c } = useUI();
  const { t, tl, language } = useT();
  const parts = dayParts(event.startsAt, language);
  const time = clock(event.startsAt, language);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tl(event.title)}. ${parts.weekday} ${parts.month} ${parts.day}, ${time}. ${tl(event.place)}`}
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: space.md,
        padding: space.md,
        borderRadius: radius.lg,
        backgroundColor: pressed ? c.surfaceStrong : c.surface,
        alignItems: 'center',
      })}>
      <View style={{ width: 62, alignItems: 'center', backgroundColor: c.primarySoft, borderRadius: radius.md, paddingVertical: space.sm }}>
        <Txt variant="label" tone="primary">
          {parts.month}
        </Txt>
        <Txt variant="title" tone="primary">
          {parts.day}
        </Txt>
        <Txt variant="small" tone="primary">
          {parts.weekday}
        </Txt>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Txt variant="lead">{tl(event.title)}</Txt>
        <Txt variant="small" tone="secondary">
          {time} · {tl(event.place)}
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Tag label={t(`events.category.${event.category}`)} />
          {event.onlineLink ? <Tag tone="good" label={t('events.online')} /> : null}
          {event.sample ? <SampleTag /> : null}
        </View>
      </View>
    </Pressable>
  );
}

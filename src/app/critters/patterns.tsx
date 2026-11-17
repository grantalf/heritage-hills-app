import { Info, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { CritterPic } from '@/components/game';
import { Card, Notice, SampleTag, Screen, SectionTitle, Txt, useUI } from '@/components/ui';
import { ZoneScene } from '@/components/zone-scene';
import { useLoad } from '@/lib/data/provider';
import { monthName } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { combine, MIN_FOR_PATTERN, pattern, TIMES, ZONES } from '@/lib/patterns';
import { radius, space } from '@/lib/theme';

const TIME_EMOJI = { dawn: '🌅', day: '☀️', dusk: '🌇', night: '🌙' } as const;

export default function PatternsScreen() {
  const { t, tl, language } = useT();
  const { c, round } = useUI();
  const [picked, setPicked] = useState<string | undefined>();
  const data = useLoad(async (r) => ({ critters: await r.listCritters(), all: await r.getObservations() }));
  if (!data) return <Screen title={t('critters.patterns')}>{null}</Screen>;

  // Only animals with at least 10 sightings appear, and only their sightings count toward "all animals" (D-053; block 5 review, S-05).
  const withData = data.critters.filter((x) => (data.all[x.id]?.total ?? 0) >= MIN_FOR_PATTERN).sort((a, b) => data.all[b.id].total - data.all[a.id].total);
  const critter = data.critters.find((x) => x.id === picked);
  const counts = combine(data.all, picked ? [picked] : withData.map((x) => x.id));
  const found = pattern(counts);
  const maxZone = Math.max(1, ...ZONES.map((z) => counts.zones[z]));
  const maxTime = Math.max(1, ...TIMES.map((x) => counts.times[x]));
  const maxMonth = Math.max(1, ...counts.months);
  const name = critter ? tl(critter.name) : t('critters.allAnimals');

  return (
    <Screen title={t('critters.patterns')} subtitle={t('critters.patternsSubtitle')}>
      <Notice tone="notice" icon={Info} title={t('critters.patternsCaveatTitle')} body={t('critters.patternsCaveatBody')} />

      <Txt variant="label">{t('critters.pickAnimal')}</Txt>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('critters.pickAnimal')} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {[undefined, ...withData.map((x) => x.id)].map((id) => {
          const item = data.critters.find((x) => x.id === id);
          const selected = picked === id;
          const label = item ? tl(item.name) : t('critters.allAnimals');
          return (
            <Pressable
              key={id ?? 'all'}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              aria-checked={selected}
              accessibilityLabel={label}
              onPress={() => setPicked(id)}
              style={{ width: 76, minHeight: 84, alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: round(radius.md), borderWidth: 2, borderColor: selected ? c.primary : 'transparent', backgroundColor: selected ? c.primarySoft : c.surface }}>
              {item ? <CritterPic id={item.id} emoji={item.emoji} size={44} /> : <Txt variant="title">★</Txt>}
              <Txt variant="small" numberOfLines={2} style={{ textAlign: 'center', fontSize: 12, lineHeight: 15 }}>
                {label}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <Card tone="soft">
        <SampleTag />
        <Txt variant="title">{name}</Txt>
        <Txt>{t('critters.patternTotal', { count: counts.total })}</Txt>
        {!found.enough ? <Txt tone="secondary">{t('critters.patternNotEnough', { min: MIN_FOR_PATTERN })}</Txt> : null}
        {found.topZone ? <Txt variant="lead">{t('critters.patternZone', { percent: found.topZone.percent, place: t(`critters.zone.${found.topZone.zone}`) })}</Txt> : null}
        {found.topTime ? <Txt variant="lead">{t('critters.patternTime', { percent: found.topTime.percent, time: t(`critters.time.${found.topTime.time}`) })}</Txt> : null}
        {found.peakMonths.length > 0 && found.peakMonths.length < 8 ? <Txt variant="lead">{t('critters.patternMonths', { months: found.peakMonths.map((m) => monthName(m + 1, language)).join(', ') })}</Txt> : null}
      </Card>

      {found.enough && picked ? (
        <>
          <SectionTitle>{t('critters.dayPath')}</SectionTitle>
          <Txt tone="secondary">{found.moves ? t('critters.dayPathMoves') : t('critters.dayPathStays')}</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {found.dayPath.map((step) => (
              <View key={step.time} accessible accessibilityLabel={`${t(`critters.time.${step.time}`)}: ${step.zone ? t(`critters.zone.${step.zone}`) : t('critters.rarelySeen')}`} style={{ flexBasis: '45%', flexGrow: 1, borderRadius: round(radius.md), overflow: 'hidden', backgroundColor: c.surface, opacity: step.zone ? 1 : 0.55 }}>
                {step.zone ? <ZoneScene zone={step.zone} height={64} /> : <View style={{ height: 64, backgroundColor: c.surfaceStrong }} />}
                <View style={{ padding: space.sm }}>
                  <Txt variant="label">
                    {TIME_EMOJI[step.time]} {t(`critters.time.${step.time}`)}
                  </Txt>
                  <Txt variant="small">{step.zone ? t(`critters.zone.${step.zone}`) : t('critters.rarelySeen')}</Txt>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {found.enough ? (
        <>
      <SectionTitle>{t('critters.whereSeen')}</SectionTitle>
      <Txt variant="small" tone="secondary">
        {t('critters.notAMap')}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {ZONES.map((zone) => {
          const n = counts.zones[zone];
          return (
            <View key={zone} accessible accessibilityLabel={`${t(`critters.zone.${zone}`)}: ${n}`} style={{ flexBasis: '45%', flexGrow: 1, borderRadius: round(radius.md), overflow: 'hidden', backgroundColor: c.surface }}>
              <View>
                <ZoneScene zone={zone} height={72} />
                <View style={{ position: 'absolute', end: 6, top: 6, minWidth: 34, height: 34, borderRadius: 17, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary, opacity: n > 0 ? 1 : 0.5 }}>
                  <Txt variant="label" tone="onPrimary">
                    {String(n)}
                  </Txt>
                </View>
              </View>
              <View style={{ padding: space.sm, gap: 4 }}>
                <Txt variant="label">{t(`critters.zone.${zone}`)}</Txt>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: c.surfaceStrong }}>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: c.primary, width: `${Math.round((n / maxZone) * 100)}%` }} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <SectionTitle>{t('critters.whenSeen')}</SectionTitle>
      <Card>
        {TIMES.map((time) => (
          <View key={time} accessible accessibilityLabel={`${t(`critters.time.${time}`)}: ${counts.times[time]}`} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt>
                {TIME_EMOJI[time]} {t(`critters.time.${time}`)}
              </Txt>
              <Txt variant="label">{String(counts.times[time])}</Txt>
            </View>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: c.surfaceStrong }}>
              <View style={{ height: 10, borderRadius: 5, backgroundColor: c.primary, width: `${Math.round((counts.times[time] / maxTime) * 100)}%` }} />
            </View>
          </View>
        ))}
      </Card>

      <SectionTitle>{t('critters.monthsSeen')}</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 96 }}>
          {counts.months.map((n, i) => (
            <View key={i} accessible accessibilityLabel={`${monthName(i + 1, language)}: ${n}`} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <View style={{ width: '100%', borderRadius: 3, backgroundColor: c.primary, height: Math.max(2, Math.round((n / maxMonth) * 70)) }} />
              <Txt variant="small" style={{ fontSize: 11, lineHeight: 14 }}>
                {monthName(i + 1, language).slice(0, 1).toUpperCase()}
              </Txt>
            </View>
          ))}
        </View>
      </Card>
        </>
      ) : null}

      <Notice tone="primary" icon={Lock} title={t('critters.patternsPrivacyTitle')} body={t('critters.patternsPrivacyBody')} />
    </Screen>
  );
}

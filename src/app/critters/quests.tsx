/**
 * The quest log: every quest, who gives it, how far along it is, plus the
 * experience bar and badges (moved here from the old Critter Club page).
 */
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Emoji } from '@/components/game';
import { PixelCritter } from '@/components/quest/pixel-critter';
import { XpBar } from '@/components/quest/zone';
import { Btn, Card, Screen, SectionTitle, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { BADGES, earnedBadges } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { placeById } from '@/lib/quest/places';
import { experience, offered, questStatus, QUESTS, type QuestContext } from '@/lib/quest/quests';
import { useWorld } from '@/lib/quest/store';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

const BADGE_EMOJI = { firstFind: '🔎', sharpEyes: '👀', allKinds: '🌈', nightOwl: '🌙', pollinatorFriend: '🌼', creekKeeper: '💧', petPal: '🐾', caseClosed: '🕵️', bingo: '🎉' } as const;

export default function QuestLogScreen() {
  const { t } = useT();
  const { repo } = useSession();
  const [focus, setFocus] = useState(0);
  useFocusEffect(useCallback(() => setFocus((n) => n + 1), []));
  const { world, stamps } = useWorld(focus);
  const data = useLoad(async (r) => ({ critters: await r.listCritters(), cards: await r.listBingoCards() }));
  if (!data) return <Screen title={t('quest.log')}>{null}</Screen>;
  const game = repo.getGame();
  const ctx: QuestContext = { game, critters: data.critters, cards: data.cards, world, stamps };
  const badges = earnedBadges(game, data.critters, data.cards);
  const order = { ready: 0, active: 1, unmet: 2, done: 3 } as const;
  const list = QUESTS.filter(offered)
    .map((q) => ({ q, s: questStatus(q, ctx) }))
    .sort((a, b) => order[a.s.status] - order[b.s.status]);

  return (
    <Screen title={t('quest.log')} subtitle={t('quest.logSubtitle')}>
      <XpBar exp={experience(ctx)} />
      <View style={{ gap: space.sm }}>
        {list.map(({ q, s }) => {
          const place = placeById(q.place)!;
          const host = place.host ? t(`host.${place.host}`) : '';
          const placeName = t(`place.${place.id}.name`);
          const line =
            s.status === 'unmet'
              ? t('quest.status.unmet', { place: placeName, name: host })
              : s.status === 'ready'
                ? t('quest.status.ready', { name: host })
                : s.status === 'done'
                  ? t('quest.status.done')
                  : `${t('quest.status.active')} · ${t('quest.progress', { now: s.now, target: q.target })}`;
          return (
            <Card key={q.id} tone={s.status === 'ready' ? 'soft' : 'plain'} style={{ opacity: s.status === 'done' ? 0.75 : 1 }}>
              <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                {place.host ? <PixelCritter id={place.host} size={36} /> : null}
                <View style={{ flex: 1 }}>
                  <Txt variant="lead">{s.status === 'unmet' ? '???' : t(`quest.${q.id}.title`)}</Txt>
                  <Txt variant="small" tone="secondary">
                    {line} · {t('quest.reward', { xp: q.xp })}
                  </Txt>
                </View>
              </View>
              {s.status === 'unmet' || s.status === 'ready' ? <Btn kind="secondary" label={t('quest.goThere', { place: placeName })} onPress={() => router.replace('/critters/world')} /> : null}
            </Card>
          );
        })}
      </View>

      <SectionTitle>{t('critters.badges')}</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {BADGES.map((badge) => {
          const has = badges.has(badge);
          return (
            <View
              key={badge}
              accessible
              accessibilityLabel={`${t(`critters.badge.${badge}`)}. ${has ? t('critters.badgeEarned') : t(`critters.badgeHow.${badge}`)}`}
              style={{ flexBasis: '30%', flexGrow: 1, alignItems: 'center', gap: 4, paddingVertical: space.sm }}>
              <Emoji size={36} dim={!has}>
                {BADGE_EMOJI[badge]}
              </Emoji>
              <Txt variant="label" style={{ textAlign: 'center' }}>
                {t(`critters.badge.${badge}`)}
              </Txt>
              <Txt variant="small" tone="secondary" style={{ textAlign: 'center' }}>
                {has ? t('critters.badgeEarned') : t(`critters.badgeHow.${badge}`)}
              </Txt>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

import { Users } from 'lucide-react-native';
import { View } from 'react-native';

import { Emoji, EmojiRow, ProgressBar } from '@/components/game';
import { Card, Notice, Screen, SectionTitle, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { BADGES, earnedBadges, rankFor, spottedIds, totalPoints } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

const BADGE_EMOJI = { firstFind: '🔎', sharpEyes: '👀', allKinds: '🌈', nightOwl: '🌙', pollinatorFriend: '🌼', creekKeeper: '💧', petPal: '🐾', caseClosed: '🕵️', bingo: '🎉' } as const;

export default function CritterClubScreen() {
  const { t, tl } = useT();
  const { repo } = useSession();
  const data = useLoad(async (r) => ({ critters: await r.listCritters(), cards: await r.listBingoCards(), mysteries: await r.listMysteries(), pets: await r.listPets() }));
  const game = repo.getGame();
  if (!data) return <Screen title={t('critters.title')}>{null}</Screen>;

  const points = totalPoints(game, data.critters, data.cards);
  const rank = rankFor(points);
  const found = spottedIds(game).size;
  const badges = earnedBadges(game, data.critters, data.cards);
  const nextMin = rank.next ? points + rank.next.pointsToGo : points;

  return (
    <Screen title={t('critters.title')} subtitle={t('critters.subtitle')}>
      <Card tone="soft">
        <Txt variant="label" tone="primary">
          {t('critters.yourRank')}
        </Txt>
        <Txt variant="title">{t(`critters.rank.${rank.id}`)}</Txt>
        <Txt>{t('critters.points', { points })}</Txt>
        {rank.next ? (
          <>
            <ProgressBar value={points} max={nextMin} label={t('critters.toNext', { points: rank.next.pointsToGo, rank: t(`critters.rank.${rank.next.id}`) })} />
            <Txt variant="small" tone="secondary">
              {t('critters.toNext', { points: rank.next.pointsToGo, rank: t(`critters.rank.${rank.next.id}`) })}
            </Txt>
          </>
        ) : null}
      </Card>

      <View style={{ gap: space.sm }}>
        <EmojiRow emoji="📖" title={t('critters.guide')} subtitle={t('critters.guideCount', { found, total: data.critters.length })} href="/critters/guide" />
        <EmojiRow emoji="🐾" title={t('critters.pets')} subtitle={t('critters.petsCount', { met: game.petsMet.length, total: data.pets.length })} href="/critters/pets" />
        <EmojiRow emoji="🎯" title={t('critters.bingo')} subtitle={t('critters.bingoHint')} href="/critters/bingo" />
        <EmojiRow emoji="🌎" title={t('critters.tally')} subtitle={t('critters.tallyHint')} href="/critters/tally" />
      </View>

      <SectionTitle>{t('critters.mysteries')}</SectionTitle>
      <Txt tone="secondary">{t('critters.mysteriesHint')}</Txt>
      <View style={{ gap: space.sm }}>
        {data.mysteries.map((m) => {
          const result = game.mysteries[m.id];
          return (
            <EmojiRow
              key={m.id}
              emoji={result ? (result.solved ? '✅' : '📘') : '🕵️'}
              title={tl(m.title)}
              subtitle={result ? (result.solved ? t('critters.caseSolved') : t('critters.caseLearned')) : t('critters.caseOpen')}
              href={{ pathname: '/critters/mystery/[id]', params: { id: m.id } }}
            />
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

      <Notice tone="primary" icon={Users} title={t('critters.familyTitle')} body={t('critters.familyBody')} />
      <EmojiRow emoji="🧭" title={t('critters.rules')} subtitle={t('critters.rulesHint')} href="/critters/rules" />
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <Tag tone="draft" label={t('common.draft')} />
        <Txt variant="small" tone="secondary" style={{ flex: 1 }}>
          {t('critters.draftNote')}
        </Txt>
      </View>
    </Screen>
  );
}

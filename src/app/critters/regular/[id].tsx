/**
 * A wild regular's character card (block 4, D-064): a wild animal many
 * neighbors know, at a shared public place. No real photo and no paw notes:
 * there is no family to approve them. Stickers only.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, Eye, Hourglass } from 'lucide-react-native';

import { Ink, Parchment } from '@/components/arcade/menu';
import { CardFrame, PortraitPic, StatBars, StickerPicker, TopStickers } from '@/components/pet-card';
import { Btn, EmptyState, Notice, SampleTag, Screen, SectionTitle, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';

export default function RegularCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tl } = useT();
  const { repo, needNeighbor } = useSession();
  const regular = repo.cards.getRegular(id);
  const critter = useLoad((r) => (regular ? r.getCritter(regular.critterId) : Promise.resolve(undefined)), regular?.critterId ?? '');

  if (!regular) return <Screen title={t('cards.regularsTitle')}><EmptyState icon={Eye} title={t('critters.missing')} /></Screen>;
  const stickers = repo.cards.getStickers(regular.id);
  const kind = critter ? tl(critter.name) : '';

  return (
    <Screen title={regular.name} hideTitle>
      <CardFrame
        name={regular.name}
        label={t('cards.cardOf', { name: regular.name })}
        picture={<PortraitPic id={regular.critterId} emoji={critter?.emoji ?? '🐾'} name={regular.name} size={168} />}
        tags={
          <>
            <Tag label={`${t('cards.class')}: ${t(`cards.class.${regular.classId}`)}`} />
            {kind ? <Tag label={kind} /> : null}
            {regular.sample ? <SampleTag /> : null}
          </>
        }
      />
      <Txt style={{ textAlign: 'center' }}>{tl(regular.about)}</Txt>
      {regular.status === 'suggested' ? <Notice tone="notice" icon={Hourglass} title={t('cards.suggestedWaiting')} /> : null}

      <Parchment>
        <Ink variant="label">{t('cards.whereRegular', { place: t(`critters.zone.${regular.zone}`) })}</Ink>
        <Ink>{t('cards.regularSafe')}</Ink>
      </Parchment>
      <Parchment title={t('cards.stats')}>
        <StatBars stats={regular.stats} />
      </Parchment>
      {critter ? <Btn kind="secondary" icon={BookOpen} label={`${t('critters.guide')}: ${kind}`} onPress={() => router.push({ pathname: '/critters/[id]', params: { id: critter.id } })} /> : null}

      {regular.status === 'approved' ? (
        <>
          <SectionTitle>{t('cards.stickersTitle')}</SectionTitle>
          <TopStickers counts={stickers.counts} />
          <Txt variant="small" tone="secondary">
            {t('cards.stickersHint')}
          </Txt>
          <StickerPicker mine={stickers.mine} onToggle={(s) => needNeighbor(() => void repo.cards.toggleSticker(regular.id, s))} />
        </>
      ) : null}
    </Screen>
  );
}

/**
 * The pet album (block 4): character cards for the neighborhood's pets and wild
 * regulars. Cards are in name order, starting from a different card each day,
 * and never sorted by stickers (D-049: no ranking).
 */
import { router } from 'expo-router';
import { Heart, Plus, Sparkles } from 'lucide-react-native';
import { View } from 'react-native';

import { EmojiRow } from '@/components/game';
import { CardTile, PortraitPic } from '@/components/pet-card';
import { Parchment } from '@/components/arcade/menu';
import { Btn, Notice, SampleTag, Screen, SectionTitle, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { albumOrder, dayNumber } from '@/lib/petcards';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function PetsScreen() {
  const { t } = useT();
  const { repo, needNeighbor } = useSession();
  const pets = useLoad((r) => r.listPets());
  const met = repo.getGame().petsMet;
  const today = dayNumber(new Date());
  const regulars = albumOrder(repo.cards.listRegulars(), today);
  const ordered = albumOrder(pets ?? [], today);

  return (
    <Screen
      title={t('critters.pets')}
      subtitle={t('cards.albumSubtitle')}
      footer={<Btn icon={Plus} label={t('critters.addPet')} onPress={() => needNeighbor(() => router.push('/critters/pet/new'))} />}>
      <Notice tone="primary" icon={Heart} title={t('critters.petsRuleTitle')} body={t('critters.petsRuleBody')} />

      <SectionTitle>{t('cards.petsTitle')}</SectionTitle>
      <Txt variant="small" tone="secondary">
        {t('cards.albumOrder')}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {ordered.map((pet) => {
          const card = repo.cards.hasCard(pet.id) ? repo.cards.getCard(pet.id) : undefined;
          const classLabel = card ? t(`cards.class.${card.classId}`) : t('cards.noCardYet');
          return (
            <CardTile
              key={pet.id}
              title={pet.name}
              subtitle={classLabel}
              label={`${t('cards.openCard', { name: pet.name })}. ${classLabel}`}
              onPress={() => router.push({ pathname: '/critters/pet/[id]', params: { id: pet.id } })}
              picture={<PortraitPic id={pet.id} art={pet.art} emoji={pet.emoji} portrait={repo.cards.getPortrait(pet.id)} name={pet.name} size={96} />}
              badge={
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                  {met.includes(pet.id) ? <Tag tone="good" label={'🐾 ' + t('critters.met')} /> : null}
                  {pet.mine ? <Tag tone="notice" label={t('share.yours')} /> : null}
                  {pet.sample ? <SampleTag /> : null}
                </View>
              }
            />
          );
        })}
      </View>

      <SectionTitle>{t('cards.regularsTitle')}</SectionTitle>
      <Txt tone="secondary">{t('cards.regularsHint')}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {regulars.map((r) => {
          const classLabel = t(`cards.class.${r.classId}`);
          return (
            <CardTile
              key={r.id}
              title={r.name}
              subtitle={t(`critters.zone.${r.zone}`)}
              label={`${t('cards.openCard', { name: r.name })}. ${t(`critters.zone.${r.zone}`)}. ${classLabel}`}
              onPress={() => router.push({ pathname: '/critters/regular/[id]', params: { id: r.id } })}
              picture={<PortraitPic id={r.critterId} emoji="🐾" name={r.name} size={96} />}
              badge={
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                  {r.status === 'suggested' ? <Tag tone="notice" label={t('cards.suggestedWaiting')} /> : null}
                  {r.sample ? <SampleTag /> : null}
                </View>
              }
            />
          );
        })}
      </View>
      <Btn kind="secondary" icon={Sparkles} label={t('cards.suggestRegular')} onPress={() => needNeighbor(() => router.push('/critters/regular/new'))} />

      <Parchment>
        <Txt variant="small">{t('critters.straysNote')}</Txt>
      </Parchment>
      <EmojiRow emoji="🤝" title={t('critters.rules')} subtitle={t('critters.rulesHint')} href="/critters/rules" />
    </Screen>
  );
}

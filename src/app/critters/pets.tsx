import { router } from 'expo-router';
import { Heart, Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { EmojiRow } from '@/components/game';
import { Btn, Notice, SampleTag, Screen, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function PetsScreen() {
  const { t, tl } = useT();
  const { repo, needNeighbor } = useSession();
  const pets = useLoad((r) => r.listPets());
  const met = repo.getGame().petsMet;

  return (
    <Screen
      title={t('critters.pets')}
      subtitle={t('critters.petsSubtitle')}
      footer={<Btn icon={Plus} label={t('critters.addPet')} onPress={() => needNeighbor(() => router.push('/critters/pet/new'))} />}>
      <Notice tone="primary" icon={Heart} title={t('critters.petsRuleTitle')} body={t('critters.petsRuleBody')} />
      <View style={{ gap: space.sm }}>
        {pets?.map((pet) => (
          <EmojiRow
            key={pet.id}
            emoji={pet.emoji}
            title={pet.name}
            subtitle={tl(pet.about)}
            href={{ pathname: '/critters/pet/[id]', params: { id: pet.id } }}
            right={
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                {met.includes(pet.id) ? <Tag tone="good" label={'🐾 ' + t('critters.met')} /> : null}
                {pet.mine ? <Tag tone="notice" label={t('share.yours')} /> : null}
                {pet.sample ? <SampleTag /> : null}
              </View>
            }
          />
        ))}
      </View>
      <Txt variant="small" tone="secondary">
        {t('critters.straysNote')}
      </Txt>
      <EmojiRow emoji="🧭" title={t('critters.rules')} subtitle={t('critters.rulesHint')} href="/critters/rules" />
    </Screen>
  );
}

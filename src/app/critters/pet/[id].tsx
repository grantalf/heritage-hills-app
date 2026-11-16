import { router, useLocalSearchParams } from 'expo-router';
import { Check, Hand, Heart, Send, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { CritterPic } from '@/components/game';
import { Btn, Card, EmptyState, Field, Notice, SampleTag, Screen, SectionTitle, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { POINTS } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';

export default function PetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tl } = useT();
  const { repo, needNeighbor } = useSession();
  const result = useLoad(async (r) => ({ pet: await r.getPet(id) }), id);
  const pet = result?.pet;
  const [story, setStory] = useState('');

  if (!pet) {
    return <Screen title={t('critters.pets')}>{result ? <EmptyState icon={Heart} title={t('critters.missing')} /> : null}</Screen>;
  }
  const met = repo.getGame().petsMet.includes(pet.id);
  const waiting = repo.pendingPetStories(pet.id);

  return (
    <Screen title={pet.name} subtitle={tl(pet.about)}>
      <View style={{ alignItems: 'center' }}>
        <CritterPic id={pet.id} art={pet.art} emoji={pet.emoji} size={150} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Tag label={t(`critters.petKind.${pet.kind}`)} />
        {met ? <Tag tone="good" label={'🐾 ' + t('critters.met')} /> : null}
        {pet.mine ? <Tag tone="notice" label={t('share.yours')} /> : null}
        {pet.sample ? <SampleTag /> : null}
      </View>

      <Notice tone="primary" icon={Hand} title={t('critters.helloTitle')} body={tl(pet.hello)} />

      {tl(pet.loves) || tl(pet.where) ? (
        <Card>
          {tl(pet.loves) ? (
            <>
              <Txt variant="label">{t('critters.loves')}</Txt>
              <Txt>{tl(pet.loves)}</Txt>
            </>
          ) : null}
          {tl(pet.where) ? (
            <>
              <Txt variant="label">{t('critters.whereHint')}</Txt>
              <Txt>{tl(pet.where)}</Txt>
            </>
          ) : null}
        </Card>
      ) : null}

      {pet.mine ? (
        <Btn
          kind="danger"
          icon={Trash2}
          label={t('critters.removePet')}
          onPress={() => {
            void repo.removePet(pet.id);
            router.back();
          }}
        />
      ) : met ? (
        <Notice tone="good" icon={Check} title={t('critters.metTitle', { name: pet.name })} body={t('critters.earned', { points: POINTS.petMet })} />
      ) : (
        <Btn icon={Heart} label={t('critters.meetButton', { name: pet.name })} onPress={() => void repo.meetPet(pet.id)} />
      )}

      <SectionTitle>{t('critters.stories')}</SectionTitle>
      {pet.stories.length === 0 ? <Txt tone="secondary">{t('critters.noStories')}</Txt> : null}
      {pet.stories.map((s, i) => (
        <Card key={i}>
          <Txt>{tl(s)}</Txt>
        </Card>
      ))}

      {!pet.mine ? (
        <>
          <Field label={t('critters.storyLabel', { name: pet.name })} hint={t('critters.storyHint')} value={story} onChangeText={setStory} multiline maxLength={280} style={{ minHeight: 96, textAlignVertical: 'top' }} />
          <Btn
            kind="secondary"
            icon={Send}
            label={t('critters.storySend', { name: pet.name })}
            disabled={story.trim().length < 10}
            onPress={() =>
              needNeighbor(() => {
                void repo.submitPetStory(pet.id, story.trim());
                setStory('');
              })
            }
          />
          {waiting > 0 ? <Notice tone="good" icon={Check} title={t('critters.storySentTitle')} body={t('critters.storySentBody')} /> : null}
        </>
      ) : null}
    </Screen>
  );
}

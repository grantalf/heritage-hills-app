import { router } from 'expo-router';
import { Check, Lock } from 'lucide-react-native';
import { useState } from 'react';

import { View } from 'react-native';

import { CritterArt } from '@/components/critter-art';
import { Btn, Card, Choices, Field, Notice, Screen, Txt } from '@/components/ui';
import { buildPetArt, EAR_IDS, FUR_IDS, MARK_IDS, type EarId, type FurId, type MarkId } from '@/lib/data/game-art';
import type { PetKind } from '@/lib/data/game-types';
import { useT } from '@/lib/i18n';
import { petTextProblems, PET_TEXT } from '@/lib/petcards';
import { useSession } from '@/lib/session';

const KINDS: PetKind[] = ['dog', 'cat', 'other'];

export default function NewPetScreen() {
  const { t } = useT();
  const { repo } = useSession();
  const [kind, setKind] = useState<PetKind>('dog');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [hello, setHello] = useState('');
  const [fur, setFur] = useState<FurId>('golden');
  const [ears, setEars] = useState<EarId>('floppy');
  const [mark, setMark] = useState<MarkId>('none');
  const art = buildPetArt(kind, fur, ears, mark);
  // The same word check as pet cards: no links, contacts, addresses or our street names (block 5 review).
  const problems = petTextProblems({ name, about, hello });
  const ready = name.trim().length >= 2 && about.trim().length >= 5 && problems.length === 0;

  return (
    <Screen
      title={t('critters.addPet')}
      subtitle={t('critters.addPetSubtitle')}
      footer={
        <Btn
          icon={Check}
          label={t('critters.savePet')}
          disabled={!ready}
          onPress={() => {
            // Next, the family fills in the character card.
            void repo.addPet({ name: name.trim(), kind, about: about.trim(), hello: hello.trim() || t('critters.helloDefault'), art }).then((petId) => router.replace({ pathname: '/critters/pet/edit', params: { id: petId, fresh: '1' } }));
          }}
        />
      }>
      <Notice tone="primary" icon={Lock} title={t('critters.addPetRuleTitle')} body={t('critters.addPetRuleBody')} />
      <Txt variant="label">{t('critters.petKindLabel')}</Txt>
      <Choices label={t('critters.petKindLabel')} value={kind} onChange={setKind} options={KINDS.map((k) => ({ value: k, label: t(`critters.petKind.${k}`) }))} />
      <Card>
        <Txt variant="lead">{t('critters.makerTitle')}</Txt>
        <Txt variant="small" tone="secondary">
          {t('critters.makerHint')}
        </Txt>
        <View style={{ alignItems: 'center' }}>
          <CritterArt spec={art} size={150} />
        </View>
        <Txt variant="label">{t('critters.makerFur')}</Txt>
        <Choices label={t('critters.makerFur')} value={fur} onChange={setFur} options={FUR_IDS.map((f) => ({ value: f, label: t(`critters.fur.${f}`) }))} />
        <Txt variant="label">{t('critters.makerEars')}</Txt>
        <Choices label={t('critters.makerEars')} value={ears} onChange={setEars} options={EAR_IDS.map((e) => ({ value: e, label: t(`critters.ears.${e}`) }))} />
        <Txt variant="label">{t('critters.makerMark')}</Txt>
        <Choices label={t('critters.makerMark')} value={mark} onChange={setMark} options={MARK_IDS.map((m) => ({ value: m, label: t(`critters.mark.${m}`) }))} />
      </Card>
      <Field label={t('critters.petNameLabel')} value={name} onChangeText={setName} maxLength={PET_TEXT.name} />
      <Field label={t('critters.petAboutLabel')} hint={t('critters.petAboutHint')} value={about} onChangeText={setAbout} maxLength={PET_TEXT.about} />
      <Field label={t('critters.petHelloLabel')} hint={t('critters.petHelloHint')} value={hello} onChangeText={setHello} maxLength={PET_TEXT.hello} />
      {problems.map((p) => (
        <Txt key={p} tone="urgent" accessibilityLiveRegion="assertive">
          {t(`cards.problem.${p}`)}
        </Txt>
      ))}
    </Screen>
  );
}

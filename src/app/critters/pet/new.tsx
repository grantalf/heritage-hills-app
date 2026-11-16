import { router } from 'expo-router';
import { Check, Lock } from 'lucide-react-native';
import { useState } from 'react';

import { Btn, Choices, Field, Notice, Screen, Txt } from '@/components/ui';
import type { PetKind } from '@/lib/data/game-types';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';

const KINDS: PetKind[] = ['dog', 'cat', 'other'];

export default function NewPetScreen() {
  const { t } = useT();
  const { repo } = useSession();
  const [kind, setKind] = useState<PetKind>('dog');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [hello, setHello] = useState('');
  const ready = name.trim().length >= 2 && about.trim().length >= 5;

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
            void repo.addPet({ name: name.trim(), kind, about: about.trim(), hello: hello.trim() || t('critters.helloDefault') });
            router.back();
          }}
        />
      }>
      <Notice tone="primary" icon={Lock} title={t('critters.addPetRuleTitle')} body={t('critters.addPetRuleBody')} />
      <Txt variant="label">{t('critters.petKindLabel')}</Txt>
      <Choices label={t('critters.petKindLabel')} value={kind} onChange={setKind} options={KINDS.map((k) => ({ value: k, label: t(`critters.petKind.${k}`) }))} />
      <Field label={t('critters.petNameLabel')} value={name} onChangeText={setName} maxLength={30} />
      <Field label={t('critters.petAboutLabel')} hint={t('critters.petAboutHint')} value={about} onChangeText={setAbout} maxLength={120} />
      <Field label={t('critters.petHelloLabel')} hint={t('critters.petHelloHint')} value={hello} onChangeText={setHello} maxLength={120} />
    </Screen>
  );
}

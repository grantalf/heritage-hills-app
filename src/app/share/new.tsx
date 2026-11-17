import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';

import { Btn, Choices, Field, Screen, Txt } from '@/components/ui';
import type { ShareCategory } from '@/lib/data/types';
import { useT } from '@/lib/i18n';
import { shareTextProblems, SHARE_TEXT } from '@/lib/petcards';
import { useSession } from '@/lib/session';

const CATEGORIES: ShareCategory[] = ['tool', 'book', 'toy'];

export default function NewShareItemScreen() {
  const { t } = useT();
  const { repo } = useSession();
  const [category, setCategory] = useState<ShareCategory>('tool');
  const [title, setTitle] = useState('');
  const [condition, setCondition] = useState('');
  // No links, contacts, addresses or our street names in what neighbors will read (block 5 review).
  const problems = shareTextProblems({ title, condition });
  const ready = title.trim().length >= 3 && problems.length === 0;

  return (
    <Screen
      title={t('share.newTitle')}
      subtitle={t('share.newSubtitle')}
      footer={
        <Btn
          icon={Check}
          label={t('share.save')}
          disabled={!ready}
          onPress={() => {
            void repo.addShareItem({ category, title: title.trim(), condition: condition.trim() || t('share.conditionDefault') });
            router.back();
          }}
        />
      }>
      <Txt variant="label">{t('share.kindLabel')}</Txt>
      <Choices
        label={t('share.kindLabel')}
        value={category}
        onChange={setCategory}
        options={CATEGORIES.map((c) => ({ value: c, label: t(`share.category.${c}`) }))}
      />
      <Field label={t('share.nameLabel')} hint={t('share.nameHint')} value={title} onChangeText={setTitle} maxLength={SHARE_TEXT.title} />
      <Field label={t('share.conditionLabel')} hint={t('share.conditionHint')} value={condition} onChangeText={setCondition} maxLength={SHARE_TEXT.condition} />
      {problems.map((p) => (
        <Txt key={p} tone="urgent" accessibilityLiveRegion="assertive">
          {t(`cards.problem.${p}`)}
        </Txt>
      ))}
      <Txt variant="small" tone="secondary">
        {t('share.newPrivacy')}
      </Txt>
    </Screen>
  );
}

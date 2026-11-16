import { useState } from 'react';
import { View } from 'react-native';

import { Card, Choices, LinkBtn, Screen, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import type { ResourceKind } from '@/lib/data/types';
import { checkedDate } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { space } from '@/lib/theme';

type Filter = 'all' | ResourceKind;
const FILTERS: Filter[] = ['all', 'rebate', 'free', 'grant', 'program'];

export default function ResourcesScreen() {
  const { t, tl, language } = useT();
  const [filter, setFilter] = useState<Filter>('all');
  const resources = useLoad((r) => r.listResources());
  const shown = resources?.filter((r) => filter === 'all' || r.kind === filter) ?? [];

  return (
    <Screen title={t('resources.title')} subtitle={t('resources.subtitle')}>
      <Txt variant="small" tone="secondary">
        {t('resources.note')}
      </Txt>
      <Choices
        label={t('resources.filter')}
        value={filter}
        onChange={setFilter}
        options={FILTERS.map((f) => ({ value: f, label: f === 'all' ? t('common.all') : t(`resources.kind.${f}`) }))}
      />
      <View style={{ gap: space.md }}>
        {shown.map((resource) => (
          <Card key={resource.id}>
            <Tag tone="good" label={t(`resources.kind.${resource.kind}`)} />
            <Txt variant="lead">{tl(resource.title)}</Txt>
            <Txt variant="small" tone="secondary">
              {resource.provider}
            </Txt>
            <Txt>{tl(resource.summary)}</Txt>
            <Txt variant="small">
              <Txt variant="label">{t('resources.who')} </Txt>
              {tl(resource.who)}
            </Txt>
            <Txt variant="small" tone="secondary">
              {t('common.checked', { date: checkedDate(resource.verifiedOn, language) })}
            </Txt>
            <LinkBtn label={t('resources.open')} url={resource.url} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

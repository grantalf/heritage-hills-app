import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { EventRow } from '@/components/event-row';
import { Choices, EmptyState, Screen } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import type { EventCategory } from '@/lib/data/types';
import { useT } from '@/lib/i18n';
import { space } from '@/lib/theme';

type Filter = 'all' | EventCategory;
const FILTERS: Filter[] = ['all', 'meeting', 'nature', 'garden', 'family', 'community'];

export default function EventsScreen() {
  const { t } = useT();
  const [filter, setFilter] = useState<Filter>('all');
  const events = useLoad((r) => r.listEvents());
  const shown = events?.filter((e) => filter === 'all' || e.category === filter) ?? [];

  return (
    <Screen back={false} title={t('events.title')} subtitle={t('events.subtitle')}>
      <Choices
        label={t('events.filter')}
        value={filter}
        onChange={setFilter}
        options={FILTERS.map((f) => ({ value: f, label: f === 'all' ? t('common.all') : t(`events.category.${f}`) }))}
      />
      <View style={{ gap: space.sm }}>
        {shown.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
        {events && shown.length === 0 ? <EmptyState icon={CalendarDays} title={t('events.empty')} body={t('events.emptyHint')} /> : null}
      </View>
    </Screen>
  );
}

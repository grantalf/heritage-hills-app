import { router } from 'expo-router';
import { Lock, LogIn, Plus, Wrench } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { SHARE_ICON } from '@/components/icons';
import { Btn, Choices, EmptyState, RowLink, SampleTag, Screen, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import type { ShareCategory } from '@/lib/data/types';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

type Filter = 'all' | ShareCategory;
const FILTERS: Filter[] = ['all', 'tool', 'book', 'toy'];

export default function ShareScreen() {
  const { t, tl } = useT();
  const { needNeighbor, isNeighbor } = useSession();
  const [filter, setFilter] = useState<Filter>('all');
  const items = useLoad((r) => r.listShareItems());
  const shown = items?.filter((i) => filter === 'all' || i.category === filter) ?? [];

  return (
    <Screen
      title={t('share.title')}
      subtitle={t('share.subtitle')}
      footer={<Btn icon={Plus} label={t('share.lend')} onPress={() => needNeighbor(() => router.push('/share/new'))} />}>
      {!isNeighbor ? (
        <>
          <EmptyState icon={Lock} title={t('share.neighborsOnly')} body={t('share.neighborsOnlyHint')} />
          <Btn kind="secondary" icon={LogIn} label={t('signIn.start')} onPress={() => router.push('/sign-in')} />
        </>
      ) : null}
      <Choices
        label={t('share.filter')}
        value={filter}
        onChange={setFilter}
        options={FILTERS.map((f) => ({
          value: f,
          label: f === 'all' ? t('common.all') : t(`share.category.${f}`),
          icon: f === 'all' ? undefined : SHARE_ICON[f],
        }))}
      />
      <View style={{ gap: space.sm }}>
        {shown.map((item) => (
          <RowLink
            key={item.id}
            icon={SHARE_ICON[item.category]}
            title={tl(item.title)}
            subtitle={tl(item.condition)}
            href={{ pathname: '/share/[id]', params: { id: item.id } }}
            right={
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Tag tone={item.status === 'available' ? 'good' : 'neutral'} label={t(`share.status.${item.status}`)} />
                {item.mine ? <Tag tone="notice" label={t('share.yours')} /> : null}
                {item.sample ? <SampleTag /> : null}
              </View>
            }
          />
        ))}
        {items && isNeighbor && shown.length === 0 ? <EmptyState icon={Wrench} title={t('share.empty')} body={t('share.emptyHint')} /> : null}
      </View>
      <Txt variant="small" tone="secondary">
        {t('share.footnote')}
      </Txt>
    </Screen>
  );
}

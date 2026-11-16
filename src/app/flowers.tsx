import { Flower2, Lock, Printer, Users } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Btn, Card, CheckRow, Notice, Screen, SectionTitle, Txt, useUI } from '@/components/ui';
import { dictionaries, useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { radius, space } from '@/lib/theme';

export default function FlowersScreen() {
  const { t } = useT();
  const { c } = useUI();
  const { repo, needNeighbor } = useSession();
  const flowers = repo.getFlowers();
  const [showCard, setShowCard] = useState(false);

  return (
    <Screen title={t('flowers.title')} subtitle={t('flowers.subtitle')}>
      <Txt>{t('flowers.intro')}</Txt>

      <SectionTitle>{t('flowers.receiveTitle')}</SectionTitle>
      <View style={{ gap: space.sm }}>
        <CheckRow
          label={t('flowers.receive')}
          hint={t('flowers.receiveHint')}
          checked={flowers.receiving}
          onChange={(next) => needNeighbor(() => void repo.setFlowers({ ...flowers, receiving: next, paused: false }))}
        />
        {flowers.receiving ? (
          <CheckRow label={t('flowers.pause')} hint={t('flowers.pauseHint')} checked={flowers.paused} onChange={(next) => void repo.setFlowers({ ...flowers, paused: next })} />
        ) : null}
      </View>

      <SectionTitle>{t('flowers.deliverTitle')}</SectionTitle>
      <CheckRow
        label={t('flowers.deliver')}
        hint={t('flowers.deliverHint')}
        checked={flowers.delivering}
        onChange={(next) => needNeighbor(() => void repo.setFlowers({ ...flowers, delivering: next }))}
      />
      <Notice tone="primary" icon={Users} title={t('flowers.pairsTitle')} body={t('flowers.pairsBody')} />

      <SectionTitle>{t('flowers.knowTitle')}</SectionTitle>
      <Txt>{t('flowers.knowBody')}</Txt>
      <Btn kind="secondary" icon={Printer} label={showCard ? t('flowers.hideCard') : t('flowers.showCard')} onPress={() => setShowCard(!showCard)} />
      {showCard ? (
        <Card style={{ borderWidth: 2, borderColor: c.primary, borderStyle: 'dashed', borderRadius: radius.lg, backgroundColor: c.background }}>
          <Flower2 color={c.primary} size={32} />
          {/* The card is always shown in both languages, whatever the app language is. */}
          <Txt variant="title">{dictionaries.en['flowers.cardTitle']}</Txt>
          <Txt>{dictionaries.en['flowers.cardBody']}</Txt>
          <View style={{ height: 1, backgroundColor: c.surfaceStrong, marginVertical: space.sm }} />
          <Txt variant="title">{dictionaries.es['flowers.cardTitle']}</Txt>
          <Txt>{dictionaries.es['flowers.cardBody']}</Txt>
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
        <Lock color={c.textSecondary} size={18} />
        <Txt variant="small" tone="secondary" style={{ flex: 1 }}>
          {t('flowers.privacy')}
        </Txt>
      </View>
    </Screen>
  );
}

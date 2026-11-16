import { Bell, BookOpen, HandHeart, Landmark, Leaf, PiggyBank, Sprout, Wrench } from 'lucide-react-native';
import { View } from 'react-native';

import { EventRow } from '@/components/event-row';
import { ALERT_ICON } from '@/components/icons';
import { Card, Notice, RowLink, SampleTag, Screen, SectionTitle, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { monthName } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function HomeScreen() {
  const { t, tl, language } = useT();
  const { role } = useSession();
  const alerts = useLoad((r) => r.listAlerts());
  const events = useLoad((r) => r.listEvents());
  const month = new Date().getMonth() + 1;
  const tips = useLoad((r) => r.listMonthTips(month), String(month));

  return (
    <Screen back={false} title={t('home.title')} subtitle={t('home.subtitle')}>
      {alerts?.slice(0, 2).map((alert) => (
        <Notice key={alert.id} tone={alert.kind} icon={ALERT_ICON[alert.kind]} title={tl(alert.title)} body={tl(alert.body)}>
          {alert.kind === 'urgent' ? <Txt variant="small">{t('alerts.emergencyLine')}</Txt> : null}
          {alert.sample ? <SampleTag /> : null}
        </Notice>
      ))}
      {alerts && alerts.length > 2 ? (
        <RowLink icon={Bell} title={t('home.allAlerts', { count: alerts.length })} href="/alerts" />
      ) : null}

      {tips && tips.length > 0 ? (
        <Card tone="soft">
          <Txt variant="label" tone="primary">
            {t('home.thisMonth', { month: monthName(month, language) })}
          </Txt>
          <Txt variant="lead">{tl(tips[0].text)}</Txt>
          <RowLink icon={Leaf} title={t('home.moreNature')} href="/nature" />
        </Card>
      ) : null}

      <SectionTitle>{t('home.comingUp')}</SectionTitle>
      <View style={{ gap: space.sm }}>
        {events?.slice(0, 3).map((event) => <EventRow key={event.id} event={event} />)}
      </View>

      <SectionTitle>{t('home.shortcuts')}</SectionTitle>
      <View style={{ gap: space.sm }}>
        <RowLink icon={Sprout} title={t('garden.title')} subtitle={t('home.gardenHint')} href="/garden" />
        <RowLink icon={Wrench} title={t('share.title')} subtitle={t('home.shareHint')} href="/share" />
        <RowLink icon={PiggyBank} title={t('resources.title')} subtitle={t('home.resourcesHint')} href="/resources" />
        <RowLink icon={BookOpen} title={t('nature.ecosystem')} subtitle={t('home.ecosystemHint')} href="/nature" />
        <RowLink icon={Landmark} title={t('association.title')} subtitle={t('home.associationHint')} href="/association" />
        <RowLink icon={HandHeart} title={t('help.title')} subtitle={t('home.helpHint')} href="/help" />
      </View>

      <Card>
        <Txt variant="small" tone="secondary">
          {t('home.viewingAs', { role: t(`role.${role}`) })}
        </Txt>
        <RowLink title={t('home.switchRole')} href="/more" />
      </Card>
    </Screen>
  );
}

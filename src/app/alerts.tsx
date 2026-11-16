import { Bell } from 'lucide-react-native';

import { ALERT_ICON } from '@/components/icons';
import { EmptyState, Notice, SampleTag, Screen, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { clock, shortDay } from '@/lib/dates';
import { useT } from '@/lib/i18n';

export default function AlertsScreen() {
  const { t, tl, language } = useT();
  const alerts = useLoad((r) => r.listAlerts());
  return (
    <Screen title={t('alerts.title')} subtitle={t('alerts.subtitle')}>
      {alerts?.map((alert) => (
        <Notice key={alert.id} tone={alert.kind} icon={ALERT_ICON[alert.kind]} title={tl(alert.title)} body={tl(alert.body)}>
          {alert.kind === 'urgent' ? <Txt variant="small">{t('alerts.emergencyLine')}</Txt> : null}
          <Txt variant="small" tone="secondary">
            {t('alerts.posted', { when: `${shortDay(alert.postedAt, language)}, ${clock(alert.postedAt, language)}` })}
          </Txt>
          {alert.sample ? <SampleTag /> : null}
        </Notice>
      ))}
      {alerts && alerts.length === 0 ? <EmptyState icon={Bell} title={t('alerts.empty')} /> : null}
    </Screen>
  );
}

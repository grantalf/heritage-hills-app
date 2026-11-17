import { Hammer } from 'lucide-react-native';

import { PaperMapSample } from '@/components/arcade/paper-map-sample';
import { Card, Notice, Screen, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';

export default function PaperMapScreen() {
  const { t } = useT();
  return (
    <Screen title={t('papermap.title')} subtitle={t('papermap.subtitle')}>
      <Txt>{t('papermap.intro')}</Txt>
      <PaperMapSample />
      <Txt variant="label">{t('papermap.notScale')}</Txt>
      <Card>
        <Txt variant="lead">{t('papermap.leaves')}</Txt>
        <Txt>{t('papermap.leavesBody')}</Txt>
        <Txt tone="secondary">{t('papermap.badges')}</Txt>
      </Card>
      <Notice icon={Hammer} tone="notice" title={t('common.draft')} body={t('papermap.next')} />
    </Screen>
  );
}

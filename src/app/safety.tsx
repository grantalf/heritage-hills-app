import { Flag, Phone, TriangleAlert } from 'lucide-react-native';
import { Linking } from 'react-native';

import { Btn, Bullets, Card, IconBubble, Notice, Screen, SectionTitle, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';

export default function SafetyScreen() {
  const { t } = useT();
  const call = (number: string) => void Linking.openURL(`tel:${number}`).catch(() => undefined);
  return (
    <Screen title={t('safety.title')} subtitle={t('safety.subtitle')}>
      <Notice tone="urgent" icon={TriangleAlert} title={t('safety.notEmergencyTitle')} body={t('safety.notEmergencyBody')}>
        <Btn kind="danger" icon={Phone} label={t('safety.call911')} onPress={() => call('911')} />
        <Btn kind="secondary" icon={Phone} label={t('safety.call311')} onPress={() => call('311')} />
      </Notice>

      <SectionTitle>{t('safety.guidelinesTitle')}</SectionTitle>
      <Bullets items={[t('safety.g1'), t('safety.g2'), t('safety.g3'), t('safety.g4'), t('safety.g5')]} />

      <SectionTitle>{t('safety.reportTitle')}</SectionTitle>
      <Card>
        <IconBubble icon={Flag} tone="urgent" />
        <Txt>{t('safety.reportBody')}</Txt>
      </Card>
      <Txt variant="small" tone="secondary">
        {t('safety.draftNote')}
      </Txt>
    </Screen>
  );
}

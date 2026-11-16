import { Phone, TriangleAlert, Users } from 'lucide-react-native';
import { Linking } from 'react-native';

import { Btn, Bullets, Notice, Screen, SectionTitle, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';

export default function CritterRulesScreen() {
  const { t } = useT();
  return (
    <Screen title={t('critters.rules')} subtitle={t('critters.rulesSubtitle')}>
      <SectionTitle>{t('critters.rulesWild')}</SectionTitle>
      <Bullets items={[t('critters.rw1'), t('critters.rw2'), t('critters.rw3'), t('critters.rw4'), t('critters.rw5'), t('critters.rw6')]} />
      <Notice tone="urgent" icon={TriangleAlert} title={t('critters.rulesHurtTitle')} body={t('critters.rulesHurtBody')} />

      <SectionTitle>{t('critters.rulesPhotos')}</SectionTitle>
      <Bullets items={[t('critters.rp1'), t('critters.rp2'), t('critters.rp3'), t('critters.rp4')]} />

      <SectionTitle>{t('critters.rulesPets')}</SectionTitle>
      <Bullets items={[t('critters.rpet1'), t('critters.rpet2'), t('critters.rpet3')]} />

      <SectionTitle>{t('critters.rulesStrays')}</SectionTitle>
      <Bullets items={[t('critters.rs1'), t('critters.rs2'), t('critters.rs3')]} />
      <Btn kind="secondary" icon={Phone} label={t('safety.call311')} onPress={() => void Linking.openURL('tel:311').catch(() => undefined)} />

      <Notice tone="primary" icon={Users} title={t('critters.familyTitle')} body={t('critters.familyBody')} />
      <Txt variant="small" tone="secondary">
        {t('critters.rulesDraft')}
      </Txt>
    </Screen>
  );
}

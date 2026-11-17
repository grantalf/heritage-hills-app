import { Gamepad2, Hammer, Map, Palette } from 'lucide-react-native';
import { View } from 'react-native';

import { Notice, RowLink, Screen, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { space } from '@/lib/theme';

export default function WorkshopScreen() {
  const { t } = useT();
  return (
    <Screen title={t('workshop.title')} subtitle={t('workshop.subtitle')}>
      <Txt>{t('workshop.intro')}</Txt>
      <View style={{ gap: space.sm }}>
        <RowLink icon={Palette} title={t('workshop.styles')} subtitle={t('workshop.stylesHint')} href="/workshop/styles" />
        <RowLink icon={Gamepad2} title={t('workshop.street')} subtitle={t('workshop.streetHint')} href="/workshop/street" />
        <RowLink icon={Map} title={t('workshop.map')} subtitle={t('workshop.mapHint')} href="/workshop/map" />
      </View>
      <Notice icon={Hammer} tone="notice" title={t('common.draft')} body={t('workshop.draft')} />
    </Screen>
  );
}

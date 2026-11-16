import { Languages, Type } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, Choices, IconBubble, Screen, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { LANGUAGES, TEXT_SCALES, usePrefs, type TextScale } from '@/lib/prefs';
import { space } from '@/lib/theme';

const SCALE_KEY: Record<TextScale, 'settings.size.normal' | 'settings.size.large' | 'settings.size.xlarge'> = {
  1: 'settings.size.normal',
  1.15: 'settings.size.large',
  1.3: 'settings.size.xlarge',
};

export default function SettingsScreen() {
  const { t } = useT();
  const { language, setLanguage, textScale, setTextScale } = usePrefs();

  return (
    <Screen title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <Card>
        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
          <IconBubble icon={Languages} />
          <Txt variant="lead" style={{ flex: 1 }}>
            {t('settings.language')}
          </Txt>
        </View>
        <Choices label={t('settings.language')} value={language} onChange={setLanguage} options={LANGUAGES.map((l) => ({ value: l.code, label: l.name }))} />
        <Txt variant="small" tone="secondary">
          {t('settings.languageNote')}
        </Txt>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
          <IconBubble icon={Type} />
          <Txt variant="lead" style={{ flex: 1 }}>
            {t('settings.textSize')}
          </Txt>
        </View>
        <Choices label={t('settings.textSize')} value={textScale} onChange={setTextScale} options={TEXT_SCALES.map((s) => ({ value: s, label: t(SCALE_KEY[s]) }))} />
        <Txt>{t('settings.preview')}</Txt>
        <Txt variant="small" tone="secondary">
          {t('settings.textSizeNote')}
        </Txt>
      </Card>
    </Screen>
  );
}

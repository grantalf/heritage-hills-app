import { Languages, Palette, Type } from 'lucide-react-native';
import { View } from 'react-native';

import { Btn, Card, Choices, IconBubble, Notice, Screen, Tag, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { LANGUAGES, TEXT_SCALES, usePrefs, type TextScale } from '@/lib/prefs';
import { LOOK_IDS, space } from '@/lib/theme';

const SCALE_KEY: Record<TextScale, 'settings.size.normal' | 'settings.size.large' | 'settings.size.xlarge'> = {
  1: 'settings.size.normal',
  1.15: 'settings.size.large',
  1.3: 'settings.size.xlarge',
};

export default function SettingsScreen() {
  const { t } = useT();
  const { language, setLanguage, textScale, setTextScale, look, setLook } = usePrefs();

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

      <Card>
        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
          <IconBubble icon={Palette} />
          <Txt variant="lead" style={{ flex: 1 }}>
            {t('settings.look')}
          </Txt>
        </View>
        <Txt variant="small" tone="secondary">
          {t('settings.lookNote')}
        </Txt>
        <Choices label={t('settings.look')} value={look} onChange={setLook} options={LOOK_IDS.map((id) => ({ value: id, label: t(`settings.look.${id}`) }))} />
        <Txt variant="title">{t(`settings.look.${look}`)}</Txt>
        <Txt>{t(`settings.lookAbout.${look}`)}</Txt>
        <Notice tone="good" icon={Palette} title={t('settings.lookSampleTitle')} body={t('settings.lookSampleBody')} />
        <Btn label={t('settings.lookSampleButton')} onPress={() => undefined} />
        <Tag label={t('settings.lookChecked')} tone="good" />
      </Card>
    </Screen>
  );
}

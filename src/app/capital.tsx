import { Lock } from 'lucide-react-native';
import { View } from 'react-native';

import { CAPITAL_ICON } from '@/components/icons';
import { Card, IconBubble, Notice, SampleTag, Screen, SectionTitle, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import type { Capital } from '@/lib/data/types';
import { useT } from '@/lib/i18n';
import { space } from '@/lib/theme';

const ORDER: Capital[] = ['natural', 'social', 'human', 'cultural', 'built', 'financial', 'civic'];

export default function CapitalScreen() {
  const { t, tl } = useT();
  const measures = useLoad((r) => r.listCapitalMeasures());

  return (
    <Screen title={t('capital.title')} subtitle={t('capital.subtitle')}>
      <Txt>{t('capital.intro')}</Txt>
      <Notice tone="primary" icon={Lock} title={t('capital.rulesTitle')} body={t('capital.rulesBody')} />

      <SectionTitle>{t('capital.sevenTitle')}</SectionTitle>
      {ORDER.map((capital) => {
        const measure = measures?.find((m) => m.capital === capital);
        return (
          <Card key={capital}>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <IconBubble icon={CAPITAL_ICON[capital]} />
              <View style={{ flex: 1 }}>
                <Txt variant="lead">{t(`capital.kind.${capital}`)}</Txt>
                <Txt variant="small" tone="secondary">
                  {t(`capital.meaning.${capital}`)}
                </Txt>
              </View>
            </View>
            {measure ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm, flexWrap: 'wrap' }}>
                  <Txt variant="display" tone="primary">
                    {String(measure.value)}
                  </Txt>
                  <Txt tone="secondary">{tl(measure.unit)}</Txt>
                </View>
                <Txt>{tl(measure.label)}</Txt>
                {measure.sample ? <SampleTag /> : null}
                <Txt variant="small">
                  <Txt variant="label">{t('capital.grow')} </Txt>
                  {tl(measure.how)}
                </Txt>
              </>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

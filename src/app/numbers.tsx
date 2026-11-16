import { Info } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, Notice, Screen, Tag, Txt, useUI } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { space } from '@/lib/theme';

const PLACES = ['numbers.place.hh', 'numbers.place.austin', 'numbers.place.texas', 'numbers.place.us'] as const;

export default function NumbersScreen() {
  const { t, tl } = useT();
  const { c } = useUI();
  const measures = useLoad((r) => r.listStatMeasures());

  return (
    <Screen title={t('numbers.title')} subtitle={t('numbers.subtitle')}>
      <Notice tone="primary" icon={Info} title={t('numbers.rulesTitle')} body={t('numbers.rulesBody')} />
      <Notice tone="notice" icon={Info} title={t('numbers.pendingTitle')} body={t('numbers.pendingBody')} />

      {measures?.map((measure) => (
        <Card key={measure.id}>
          <Txt variant="lead">{tl(measure.label)}</Txt>
          <Txt variant="small" tone="secondary">
            {tl(measure.why)}
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {PLACES.map((place) => (
              <View
                key={place}
                style={{ flexGrow: 1, flexBasis: '45%', backgroundColor: c.background, borderRadius: 10, padding: space.md, gap: 2 }}
                accessible
                accessibilityLabel={`${t(place)}: ${t('common.comingSoon')}`}>
                <Txt variant="small" tone="secondary">
                  {t(place)}
                </Txt>
                <Txt variant="title">—</Txt>
              </View>
            ))}
          </View>
          <Tag label={t('common.comingSoon')} />
          <Txt variant="small">
            <Txt variant="label">{t('numbers.whatToDo')} </Txt>
            {tl(measure.action)}
          </Txt>
        </Card>
      ))}
    </Screen>
  );
}

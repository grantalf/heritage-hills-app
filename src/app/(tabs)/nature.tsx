import { Sprout } from 'lucide-react-native';
import { View } from 'react-native';

import { ECO_ICON } from '@/components/icons';
import { Bullets, Card, RowLink, Screen, SectionTitle, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { monthName } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { space } from '@/lib/theme';

export default function NatureScreen() {
  const { t, tl, language } = useT();
  const month = new Date().getMonth() + 1;
  const tips = useLoad((r) => r.listMonthTips(month), String(month));
  const articles = useLoad((r) => r.listArticles());

  return (
    <Screen back={false} title={t('nature.title')} subtitle={t('nature.subtitle')}>
      <Card tone="soft">
        <Txt variant="label" tone="primary">
          {t('nature.thisMonth', { month: monthName(month, language) })}
        </Txt>
        <Bullets items={(tips ?? []).map((tip) => tl(tip.text))} />
      </Card>

      <RowLink icon={Sprout} title={t('garden.title')} subtitle={t('garden.subtitle')} href="/garden" />

      <SectionTitle>{t('nature.ecosystem')}</SectionTitle>
      <Txt tone="secondary">{t('nature.ecosystemIntro')}</Txt>
      <View style={{ gap: space.sm }}>
        {articles?.map((article) => (
          <RowLink
            key={article.id}
            icon={ECO_ICON[article.section]}
            title={tl(article.title)}
            subtitle={tl(article.summary)}
            href={{ pathname: '/ecosystem/[id]', params: { id: article.id } }}
            right={article.status === 'draft' ? <Tag tone="draft" label={t('common.draft')} /> : undefined}
          />
        ))}
      </View>
    </Screen>
  );
}

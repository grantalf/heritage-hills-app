import { useLocalSearchParams } from 'expo-router';
import { BookOpen, Sprout } from 'lucide-react-native';

import { EmptyState, LinkBtn, Notice, Screen, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { checkedDate } from '@/lib/dates';
import { useT } from '@/lib/i18n';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tl, language } = useT();
  const result = useLoad(async (r) => ({ article: await r.getArticle(id) }), id);
  const article = result?.article;

  if (!article) {
    return <Screen title={t('nature.ecosystem')}>{result ? <EmptyState icon={BookOpen} title={t('nature.notFound')} /> : null}</Screen>;
  }

  return (
    <Screen title={tl(article.title)} subtitle={tl(article.summary)}>
      {article.status === 'draft' ? (
        <>
          <Tag tone="draft" label={t('common.draft')} />
          <Txt variant="small" tone="secondary">
            {t('nature.draftNote')}
          </Txt>
        </>
      ) : article.verifiedOn ? (
        <Txt variant="small" tone="secondary">
          {t('common.checked', { date: checkedDate(article.verifiedOn, language) })}
        </Txt>
      ) : null}

      {article.body.map((paragraph, i) => (
        <Txt key={i}>{tl(paragraph)}</Txt>
      ))}

      <Notice tone="good" icon={Sprout} title={t('nature.oneThing')} body={tl(article.action)} />

      {article.sourceUrl ? <LinkBtn label={t('nature.learnMore', { source: article.sourceName ?? '' })} url={article.sourceUrl} /> : null}
    </Screen>
  );
}

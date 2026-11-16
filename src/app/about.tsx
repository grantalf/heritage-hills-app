import { Bullets, Card, Screen, SectionTitle, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';

export default function AboutScreen() {
  const { t } = useT();
  return (
    <Screen title={t('about.title')} subtitle={t('about.subtitle')}>
      <Txt>{t('about.what')}</Txt>

      <SectionTitle>{t('about.realTitle')}</SectionTitle>
      <Bullets items={[t('about.real1'), t('about.real2'), t('about.real3')]} />

      <SectionTitle>{t('about.sampleTitle')}</SectionTitle>
      <Bullets items={[t('about.sample1'), t('about.sample2'), t('about.sample3')]} />

      <SectionTitle>{t('about.wavesTitle')}</SectionTitle>
      <Bullets items={[t('about.wave1'), t('about.wave2'), t('about.wave3')]} />

      <SectionTitle>{t('about.promiseTitle')}</SectionTitle>
      <Bullets items={[t('about.promise1'), t('about.promise2'), t('about.promise3'), t('about.promise4')]} />

      <Card>
        <Txt variant="small" tone="secondary">
          {t('about.version')}
        </Txt>
      </Card>
    </Screen>
  );
}

import { ChartColumn, HandHeart, Info, Landmark, Megaphone, PiggyBank, Settings, ShieldCheck, Sparkles, LifeBuoy } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, Choices, RowLink, Screen, SectionTitle, Txt } from '@/components/ui';
import type { DemoRole } from '@/lib/data/types';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

const ROLES: DemoRole[] = ['visitor', 'neighbor', 'board'];

export default function MoreScreen() {
  const { t } = useT();
  const { repo, role, isBoard } = useSession();

  return (
    <Screen back={false} title={t('more.title')}>
      <Card>
        <Txt variant="lead">{t('more.demoTitle')}</Txt>
        <Txt variant="small" tone="secondary">
          {t('more.demoBody')}
        </Txt>
        <Choices
          label={t('more.demoTitle')}
          value={role}
          onChange={(next) => void repo.setRole(next)}
          options={ROLES.map((r) => ({ value: r, label: t(`role.${r}`) }))}
        />
        <Txt variant="small" tone="secondary">
          {t(`role.${role}.can`)}
        </Txt>
      </Card>

      {isBoard ? <RowLink icon={Megaphone} tone="notice" title={t('board.title')} subtitle={t('board.subtitle')} href="/board" /> : null}

      <SectionTitle>{t('more.neighborhood')}</SectionTitle>
      <View style={{ gap: space.sm }}>
        <RowLink icon={Landmark} title={t('association.title')} subtitle={t('association.subtitle')} href="/association" />
        <RowLink icon={PiggyBank} title={t('resources.title')} subtitle={t('resources.subtitle')} href="/resources" />
        <RowLink icon={ChartColumn} title={t('numbers.title')} subtitle={t('numbers.subtitle')} href="/numbers" />
        <RowLink icon={Sparkles} title={t('capital.title')} subtitle={t('capital.subtitle')} href="/capital" />
        <RowLink icon={HandHeart} title={t('help.title')} subtitle={t('help.subtitle')} href="/help" />
      </View>

      <SectionTitle>{t('more.app')}</SectionTitle>
      <View style={{ gap: space.sm }}>
        <RowLink icon={Settings} title={t('settings.title')} subtitle={t('settings.subtitle')} href="/settings" />
        <RowLink icon={ShieldCheck} title={t('privacy.title')} subtitle={t('privacy.subtitle')} href="/privacy" />
        <RowLink icon={LifeBuoy} title={t('safety.title')} subtitle={t('safety.subtitle')} href="/safety" />
        <RowLink icon={Info} title={t('about.title')} subtitle={t('about.subtitle')} href="/about" />
      </View>
    </Screen>
  );
}

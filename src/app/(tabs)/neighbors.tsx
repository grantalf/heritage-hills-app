import { router } from 'expo-router';
import { Flower2, HandHeart, HeartHandshake, LogIn, Mail, Wrench } from 'lucide-react-native';
import { View } from 'react-native';

import { EmojiRow } from '@/components/game';
import { Btn, Notice, RowLink, Screen } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function NeighborsScreen() {
  const { t } = useT();
  const { isNeighbor } = useSession();
  const invites = useLoad((r) => r.listInvites());

  return (
    <Screen back={false} title={t('neighbors.title')} subtitle={t('neighbors.subtitle')}>
      {!isNeighbor ? (
        <Notice tone="primary" icon={LogIn} title={t('neighbors.signInTitle')} body={t('neighbors.signInBody')}>
          <Btn label={t('signIn.start')} icon={LogIn} onPress={() => router.push('/sign-in')} />
        </Notice>
      ) : null}
      <View style={{ gap: space.sm }}>
        <RowLink icon={Wrench} title={t('share.title')} subtitle={t('share.subtitle')} href="/share" />
        <RowLink icon={HeartHandshake} title={t('volunteer.title')} subtitle={t('volunteer.subtitle')} href="/volunteer" />
        <RowLink
          icon={Mail}
          title={t('invites.title')}
          subtitle={isNeighbor ? t('invites.count', { count: invites?.length ?? 0 }) : t('invites.subtitle')}
          href="/invites"
        />
        <RowLink icon={Flower2} title={t('flowers.title')} subtitle={t('flowers.subtitle')} href="/flowers" />
        <EmojiRow emoji="🐾" title={t('critters.pets')} subtitle={t('critters.petsSubtitle')} href="/critters/pets" />
        <RowLink icon={HandHeart} title={t('help.title')} subtitle={t('help.subtitle')} href="/help" />
      </View>
    </Screen>
  );
}

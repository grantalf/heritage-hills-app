import { Clock, HeartHandshake, Timer } from 'lucide-react-native';
import { View } from 'react-native';

import { Bullets, Card, IconBubble, RowLink, Screen, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import type { HelpIdea } from '@/lib/data/types';
import { useT } from '@/lib/i18n';
import { space } from '@/lib/theme';

const GROUPS: { time: HelpIdea['time']; icon: typeof Clock }[] = [
  { time: 'minutes', icon: Timer },
  { time: 'hour', icon: Clock },
  { time: 'ongoing', icon: HeartHandshake },
];

export default function HelpScreen() {
  const { t, tl } = useT();
  const ideas = useLoad((r) => r.listHelpIdeas());
  return (
    <Screen title={t('help.title')} subtitle={t('help.subtitle')}>
      {GROUPS.map((group) => (
        <Card key={group.time}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <IconBubble icon={group.icon} />
            <Txt variant="lead" style={{ flex: 1 }}>
              {t(`help.time.${group.time}`)}
            </Txt>
          </View>
          <Bullets items={(ideas ?? []).filter((i) => i.time === group.time).map((i) => tl(i.text))} />
        </Card>
      ))}
      <RowLink icon={HeartHandshake} title={t('volunteer.title')} subtitle={t('volunteer.subtitle')} href="/volunteer" />
    </Screen>
  );
}

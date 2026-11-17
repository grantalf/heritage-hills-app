/** Detective cases, from the notice board at the Mighty Bridge (moved from the old Critter Club page). */
import { View } from 'react-native';

import { EmojiRow } from '@/components/game';
import { Screen, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function CasesScreen() {
  const { t, tl } = useT();
  const { repo } = useSession();
  const cases = useLoad((r) => r.listCases());
  const game = repo.getGame();
  return (
    <Screen title={t('critters.mysteries')} subtitle={t('place.bridge.name')}>
      <Txt tone="secondary">{t('critters.mysteriesHint')}</Txt>
      <View style={{ gap: space.sm }}>
        {(cases ?? []).map((m) => {
          const result = game.mysteries[m.id];
          return (
            <EmojiRow
              key={m.id}
              emoji={result ? (result.solved ? '✅' : '📁') : '🕵️'}
              title={tl(m.title)}
              subtitle={result ? (result.solved ? t('critters.caseSolved') : t('critters.caseLearned')) : t('critters.caseOpen')}
              href={{ pathname: '/critters/case/[id]', params: { id: m.id } }}
            />
          );
        })}
      </View>
    </Screen>
  );
}

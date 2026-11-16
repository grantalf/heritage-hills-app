import { Check, Clock, HeartHandshake } from 'lucide-react-native';
import { View } from 'react-native';

import { CAPITAL_ICON } from '@/components/icons';
import { Btn, Card, IconBubble, SampleTag, Screen, Txt, useUI } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function VolunteerScreen() {
  const { t, tl } = useT();
  const { c } = useUI();
  const { repo, needNeighbor } = useSession();
  const opportunities = useLoad((r) => r.listOpportunities());

  return (
    <Screen title={t('volunteer.title')} subtitle={t('volunteer.subtitle')}>
      {opportunities?.map((o) => {
        const signedUp = repo.isSignedUp(o.id);
        return (
          <Card key={o.id} tone={signedUp ? 'soft' : 'plain'}>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
              <IconBubble icon={CAPITAL_ICON[o.capital]} />
              <View style={{ flex: 1, gap: 4 }}>
                <Txt variant="lead">{tl(o.title)}</Txt>
                <Txt>{tl(o.summary)}</Txt>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <Clock size={16} color={c.textSecondary} />
                  <Txt variant="small" tone="secondary" style={{ flex: 1 }}>
                    {tl(o.when)} · {tl(o.duration)}
                  </Txt>
                </View>
                {o.sample ? <SampleTag /> : null}
              </View>
            </View>
            {signedUp ? (
              <>
                <Txt variant="label" tone="good">
                  {t('volunteer.signedUp')}
                </Txt>
                <Btn kind="quiet" label={t('volunteer.withdraw')} onPress={() => void repo.setSignedUp(o.id, false)} />
              </>
            ) : (
              <Btn icon={HeartHandshake} kind="secondary" label={t('volunteer.signUp')} onPress={() => needNeighbor(() => void repo.setSignedUp(o.id, true))} />
            )}
          </Card>
        );
      })}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Check size={18} color={c.textSecondary} />
        <Txt variant="small" tone="secondary" style={{ flex: 1 }}>
          {t('volunteer.privacy')}
        </Txt>
      </View>
    </Screen>
  );
}

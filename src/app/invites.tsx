import { router } from 'expo-router';
import { Lock, LogIn, Mail } from 'lucide-react-native';

import { Btn, Card, Choices, EmptyState, Notice, SampleTag, Screen, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import type { InviteAnswer } from '@/lib/data/types';
import { clock, longDay } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';

const ANSWERS: InviteAnswer[] = ['yes', 'maybe', 'no'];

export default function InvitesScreen() {
  const { t, tl, language } = useT();
  const { repo, isNeighbor } = useSession();
  const invites = useLoad((r) => r.listInvites());

  return (
    <Screen title={t('invites.title')} subtitle={t('invites.subtitle')}>
      <Notice tone="primary" icon={Lock} title={t('invites.privateTitle')} body={t('invites.privateBody')} />
      {!isNeighbor ? (
        <>
          <EmptyState icon={Mail} title={t('invites.signInTitle')} body={t('invites.signInBody')} />
          <Btn icon={LogIn} label={t('signIn.start')} onPress={() => router.push('/sign-in')} />
        </>
      ) : (
        invites?.map((invite) => {
          const answer = repo.getInviteAnswer(invite.id);
          return (
            <Card key={invite.id}>
              <Txt variant="lead">{tl(invite.title)}</Txt>
              <Txt variant="small" tone="secondary">
                {t('invites.from', { host: tl(invite.host) })}
              </Txt>
              <Txt>
                {longDay(invite.startsAt, language)}, {clock(invite.startsAt, language)} · {tl(invite.place)}
              </Txt>
              <Txt>{tl(invite.note)}</Txt>
              {invite.sample ? <SampleTag /> : null}
              <Txt variant="label">{t('invites.answerLabel')}</Txt>
              <Choices
                label={t('invites.answerLabel')}
                value={answer ?? ('' as InviteAnswer)}
                onChange={(next) => void repo.setInviteAnswer(invite.id, next)}
                options={ANSWERS.map((a) => ({ value: a, label: t(`invites.answer.${a}`) }))}
              />
            </Card>
          );
        })
      )}
      <Txt variant="small" tone="secondary">
        {t('invites.createSoon')}
      </Txt>
    </Screen>
  );
}

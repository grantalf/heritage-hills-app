import { CalendarDays, FileText, ListChecks, UserRound, Vote } from 'lucide-react-native';
import { View } from 'react-native';

import { EventRow } from '@/components/event-row';
import { Btn, Card, InfoRow, RowLink, SampleTag, Screen, SectionTitle, Tag, Txt, useUI } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { shortDay } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { safeCount } from '@/lib/rules';
import { useSession } from '@/lib/session';
import { radius, space } from '@/lib/theme';

export default function AssociationScreen() {
  const { t, tl, language } = useT();
  const { c } = useUI();
  const { repo, needNeighbor } = useSession();
  const offices = useLoad((r) => r.listOffices());
  const docs = useLoad((r) => r.listDocs());
  const polls = useLoad((r) => r.listPolls());
  const events = useLoad((r) => r.listEvents());
  const nextMeeting = events?.find((e) => e.category === 'meeting');

  return (
    <Screen title={t('association.title')} subtitle={t('association.subtitle')}>
      <Txt>{t('association.about')}</Txt>

      <SectionTitle>{t('association.nextMeeting')}</SectionTitle>
      {nextMeeting ? <EventRow event={nextMeeting} /> : <Txt tone="secondary">{t('association.noMeeting')}</Txt>}

      <SectionTitle>{t('association.offices')}</SectionTitle>
      <Txt variant="small" tone="secondary">
        {t('association.officesNote')}
      </Txt>
      <View style={{ gap: space.sm }}>
        {offices?.map((office) => (
          <InfoRow key={office.id} icon={UserRound} title={tl(office.title)} subtitle={office.holder ?? t('association.toBeAdded')} />
        ))}
      </View>

      <SectionTitle>{t('association.decisions')}</SectionTitle>
      <RowLink icon={ListChecks} title={t('decisions.title')} subtitle={t('decisions.subtitle')} href="/decisions" />

      <SectionTitle>{t('association.polls')}</SectionTitle>
      {polls?.map((poll) => {
        const vote = repo.getPollVote(poll.id);
        const total = poll.counts.reduce((a, b) => a + b, 0);
        return (
          <Card key={poll.id}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <Tag tone="notice" label={t('association.advisory')} />
              {poll.sample ? <SampleTag /> : null}
            </View>
            <Txt variant="lead">{tl(poll.question)}</Txt>
            <Txt variant="small" tone="secondary">
              {t('association.pollCloses', { date: shortDay(poll.closesAt, language) })}
            </Txt>
            {vote === undefined
              ? poll.options.map((option, i) => (
                  <Btn key={i} kind="secondary" icon={Vote} label={tl(option)} onPress={() => needNeighbor(() => void repo.votePoll(poll.id, i))} />
                ))
              : poll.options.map((option, i) => {
                  const count = safeCount(poll.counts[i]);
                  const share = total ? poll.counts[i] / total : 0;
                  return (
                    <View key={i} style={{ gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
                        <Txt style={{ flex: 1 }}>
                          {tl(option)}
                          {vote === i ? ` (${t('association.yourChoice')})` : ''}
                        </Txt>
                        <Txt variant="label">{count === null ? t('association.fewVotes') : String(count)}</Txt>
                      </View>
                      <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: c.surfaceStrong }}>
                        <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: c.primary, width: `${Math.round(share * 100)}%` }} />
                      </View>
                    </View>
                  );
                })}
            <Txt variant="small" tone="secondary">
              {t('association.pollNote')}
            </Txt>
          </Card>
        );
      })}

      <SectionTitle>{t('association.documents')}</SectionTitle>
      <View style={{ gap: space.sm }}>
        {docs?.map((doc) => (
          <InfoRow key={doc.id} icon={FileText} title={tl(doc.title)} right={<Tag label={doc.available ? t('common.open') : t('common.comingSoon')} />} />
        ))}
      </View>
      <RowLink icon={CalendarDays} title={t('events.title')} subtitle={t('association.allMeetings')} href="/events" />
    </Screen>
  );
}

import { useLocalSearchParams } from 'expo-router';
import { CalendarDays, Check, CircleHelp, Clock, MapPin, Phone, Users, Video } from 'lucide-react-native';
import { Linking, View } from 'react-native';

import { CAPITAL_ICON } from '@/components/icons';
import { Btn, Card, EmptyState, IconBubble, LinkBtn, Notice, SampleTag, Screen, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { clock, longDay } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tl, language } = useT();
  const { repo, isNeighbor, needNeighbor } = useSession();
  const result = useLoad(async (r) => ({ event: await r.getEvent(id) }), id);
  const event = result?.event;

  if (!event) {
    return <Screen title={t('events.title')}>{result ? <EmptyState icon={CalendarDays} title={t('events.notFound')} /> : null}</Screen>;
  }
  const rsvp = repo.getRsvp(event.id);

  return (
    <Screen title={tl(event.title)} subtitle={tl(event.summary)}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Tag label={t(`events.category.${event.category}`)} />
        {event.openToAll ? <Tag tone="good" label={t('events.openToAll')} /> : null}
        {event.sample ? <SampleTag /> : null}
      </View>

      <Card>
        <Fact icon={Clock} text={`${longDay(event.startsAt, language)}\n${clock(event.startsAt, language)} – ${clock(event.endsAt, language)}`} />
        <Fact icon={MapPin} text={tl(event.place)} />
        <Fact icon={Users} text={t('events.going', { count: event.goingCount })} />
      </Card>

      <Txt>{tl(event.details)}</Txt>

      {event.onlineLink ? (
        <Notice tone="primary" icon={Video} title={t('events.onlineTitle')} body={t('events.onlineBody')}>
          <LinkBtn label={t('events.joinOnline')} url={event.onlineLink} />
          {event.phone ? (
            <Btn
              kind="secondary"
              icon={Phone}
              label={t('events.joinPhone', { phone: event.phone })}
              onPress={() => void Linking.openURL(`tel:${event.phone}`).catch(() => undefined)}
            />
          ) : null}
        </Notice>
      ) : null}

      <View style={{ gap: space.sm }}>
        <Txt variant="title">{t('events.rsvpTitle')}</Txt>
        {rsvp ? (
          <Notice tone="good" icon={Check} title={rsvp === 'going' ? t('events.youAreGoing') : t('events.youMightGo')}>
            <Btn kind="quiet" label={t('events.undoRsvp')} onPress={() => void repo.setRsvp(event.id, undefined)} />
          </Notice>
        ) : (
          <>
            <Btn icon={Check} label={t('events.rsvpGoing')} onPress={() => needNeighbor(() => void repo.setRsvp(event.id, 'going'))} />
            <Btn kind="secondary" icon={CircleHelp} label={t('events.rsvpMaybe')} onPress={() => needNeighbor(() => void repo.setRsvp(event.id, 'maybe'))} />
            {!isNeighbor ? (
              <Txt variant="small" tone="secondary">
                {t('events.rsvpNeedsSignIn')}
              </Txt>
            ) : null}
          </>
        )}
        <Txt variant="small" tone="secondary">
          {t('events.rsvpPrivacy')}
        </Txt>
      </View>

      <Card>
        <Txt variant="label">{t('capital.builds')}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {event.capital.map((capital) => (
            <View key={capital} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconBubble icon={CAPITAL_ICON[capital]} size={32} />
              <Txt variant="small">{t(`capital.kind.${capital}`)}</Txt>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

function Fact({ icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
      <IconBubble icon={icon} size={36} />
      <Txt style={{ flex: 1, paddingTop: 5 }}>{text}</Txt>
    </View>
  );
}

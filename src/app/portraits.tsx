/**
 * The portrait maker's page (block 4, D-059): the queue of portrait requests,
 * oldest first, the photo check, what is sent to the image service, the
 * spending limits, and wild regulars to approve. In the draft the Board
 * level stands in for the portrait maker and moderators.
 */
import * as ImagePicker from 'expo-image-picker';
import { BadgeCheck, CircleDollarSign, Clock, ImagePlus, Minus, Plus, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp, Undo2 } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import { CritterPic, ProgressBar } from '@/components/game';
import { Btn, Card, CheckRow, EmptyState, Notice, SampleTag, Screen, SectionTitle, Tag, Txt, useUI } from '@/components/ui';
import { longDay, shortDay } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { nextBatchDay, outbound, PHOTO_CHECKS, PORTRAIT, SEND_BACK_REASONS, type PhotoCheck, type PortraitRequest } from '@/lib/petcards';
import { useSession } from '@/lib/session';
import { MIN_TOUCH, space } from '@/lib/theme';

const dollars = (cents: number) => '$' + (cents / 100).toFixed(2);

export default function PortraitMakerScreen() {
  const { t, language } = useT();
  const { repo, isBoard } = useSession();
  // A finished request leaves the queue, so the thank-you shows at the top of the page.
  const [finished, setFinished] = useState(false);

  if (!isBoard) {
    return (
      <Screen title={t('maker.title')}>
        <EmptyState icon={ShieldCheck} title={t('maker.only')} body={t('maker.onlyHint')} />
      </Screen>
    );
  }
  const queue = repo.cards.listRequests();
  const spend = repo.cards.getSpend();
  const suggestions = repo.cards.listRegulars().filter((r) => r.status === 'suggested');

  return (
    <Screen title={t('maker.title')} subtitle={t('maker.subtitle')}>
      <Txt variant="small" tone="secondary">
        {t('maker.roleNote')}
      </Txt>

      <Card>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <CircleDollarSign color="#6E4122" size={24} />
          <Txt variant="lead">{t('maker.budgetTitle')}</Txt>
        </View>
        <Txt>{t('maker.budgetMonth', { spent: dollars(spend.monthCents), cap: dollars(PORTRAIT.monthlyCapCents) })}</Txt>
        <ProgressBar value={spend.monthCents} max={PORTRAIT.monthlyCapCents} label={t('maker.budgetMonth', { spent: dollars(spend.monthCents), cap: dollars(PORTRAIT.monthlyCapCents) })} />
        <Txt>{t('maker.budgetYear', { spent: dollars(spend.yearCents), cap: dollars(PORTRAIT.yearlyCapCents) })}</Txt>
        <ProgressBar value={spend.yearCents} max={PORTRAIT.yearlyCapCents} label={t('maker.budgetYear', { spent: dollars(spend.yearCents), cap: dollars(PORTRAIT.yearlyCapCents) })} />
        <Txt variant="label">{t('maker.budgetTries', { tries: spend.triesLeft })}</Txt>
        <Txt variant="small" tone="secondary">
          {t('maker.budgetNote')}
        </Txt>
      </Card>
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <Clock color="#55402B" size={20} />
        <Txt>{t('maker.batch', { date: longDay(nextBatchDay(new Date()).toISOString().slice(0, 10) + 'T12:00:00', language) })}</Txt>
      </View>

      {finished ? <Notice tone="good" icon={BadgeCheck} title={t('maker.doneTitle')} body={t('maker.doneBody')} /> : null}
      <SectionTitle>{t('maker.queueTitle', { count: queue.length })}</SectionTitle>
      {queue.length === 0 ? <EmptyState icon={BadgeCheck} title={t('maker.queueEmpty')} /> : null}
      {queue.map((r) => (
        <RequestCard key={r.id} request={r} triesLeft={spend.triesLeft} date={shortDay(r.requestedAt, language)} onDone={() => setFinished(true)} />
      ))}

      <SectionTitle>{t('maker.suggestionsTitle', { count: suggestions.length })}</SectionTitle>
      <Txt variant="small" tone="secondary">
        {t('maker.suggestionRule')}
      </Txt>
      {suggestions.length === 0 ? <Txt tone="secondary">{t('maker.suggestionsEmpty')}</Txt> : null}
      {suggestions.map((s) => (
        <Card key={s.id}>
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <CritterPic id={s.critterId} emoji="🐾" size={56} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="lead">{s.name}</Txt>
              <Txt variant="small" tone="secondary">
                {t(`critters.zone.${s.zone}`)}
              </Txt>
            </View>
            {s.sample ? <SampleTag /> : null}
          </View>
          <Txt>{s.about.en}</Txt>
          <Btn icon={ThumbsUp} label={t('maker.approve')} onPress={() => void repo.cards.decideRegular(s.id, true)} />
          <Btn kind="secondary" icon={ThumbsDown} label={t('maker.decline')} onPress={() => void repo.cards.decideRegular(s.id, false)} />
        </Card>
      ))}
    </Screen>
  );
}

function RequestCard({ request, triesLeft, date, onDone }: { request: PortraitRequest; triesLeft: number; date: string; onDone: () => void }) {
  const { t, language } = useT();
  const { c } = useUI();
  const { repo } = useSession();
  const [checks, setChecks] = useState<PhotoCheck[]>([]);
  const [tries, setTries] = useState(1);
  const photo = repo.cards.getRequestPhoto(request.id);
  const kind = t(`critters.petKind.${request.kind}`);
  const out = outbound(request);
  const expires = new Date(new Date(request.requestedAt).getTime() + PORTRAIT.keepPhotoDays * 86_400_000).toISOString();

  const finish = async (uri?: string) => {
    if (await repo.cards.finishPortrait(request.id, tries, uri)) onDone();
  };
  const upload = async () => {
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, exif: false });
      if (!picked.canceled && picked.assets[0]) await finish(picked.assets[0].uri);
    } catch {
      // Nothing to do: the request stays open.
    }
  };
  const stepButton = (delta: number) => {
    const next = tries + delta;
    const disabled = next < 1 || next > PORTRAIT.triesPerRequest || next > triesLeft;
    const Icon = delta < 0 ? Minus : Plus;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(delta < 0 ? 'maker.triesLess' : 'maker.triesMore')}
        accessibilityState={{ disabled }}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={() => setTries(next)}
        style={({ pressed }) => ({ width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 2, borderColor: c.border, backgroundColor: pressed ? c.surfaceStrong : c.background, opacity: disabled ? 0.4 : 1 })}>
        <Icon color={c.text} size={22} />
      </Pressable>
    );
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <Txt variant="lead" style={{ flexShrink: 1 }}>
          {t('maker.requestOf', { kind, name: request.petName })}
        </Txt>
        {request.redo ? <Tag tone="notice" label={t('cards.requestAgain')} /> : null}
        {request.sample ? <SampleTag /> : null}
      </View>
      <Txt variant="small" tone="secondary">
        {t('maker.requested', { date })} · {t('maker.expires', { date: shortDay(expires, language) })}
      </Txt>
      {photo ? <Image source={{ uri: photo }} accessibilityLabel={t('maker.photoAlt')} style={{ width: '100%', height: 220, borderRadius: 8 }} resizeMode="contain" /> : <Txt tone="secondary">{t('maker.noPhoto')}</Txt>}

      {request.status === 'waiting' ? (
        <>
          <Txt variant="label">{t('maker.checksTitle')}</Txt>
          {PHOTO_CHECKS.map((k) => (
            <CheckRow key={k} label={t(`maker.check.${k}`)} checked={checks.includes(k)} onChange={(on) => setChecks(on ? [...checks, k] : checks.filter((x) => x !== k))} />
          ))}
          <Btn icon={BadgeCheck} label={t('maker.photoOk')} disabled={checks.length < PHOTO_CHECKS.length} onPress={() => repo.cards.checkPhoto(request.id, checks)} />
          <Txt variant="label">{t('maker.sendBackTitle')}</Txt>
          {SEND_BACK_REASONS.map((reason) => (
            <Btn key={reason} kind="secondary" icon={Undo2} label={t('maker.sendBack', { reason: t(`cards.sendBack.${reason}`) })} onPress={() => repo.cards.checkPhoto(request.id, [], reason)} />
          ))}
        </>
      ) : null}

      {request.status === 'sentBack' ? <Notice tone="notice" icon={Undo2} title={t('cards.request.sentBack')} body={request.sentBackReason ? t(`cards.sendBack.${request.sentBackReason}`) : undefined} /> : null}

      {request.status === 'photoOk' ? (
        <>
          <Notice tone="primary" icon={ShieldCheck} title={t('maker.outboundTitle')} body={t('maker.outbound', { file: out.fileName, kind })} />
          <Txt variant="small" tone="secondary">
            {t('maker.styleNote')}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            {stepButton(-1)}
            <Txt variant="lead" accessibilityLiveRegion="polite">
              {t('maker.tries', { count: tries })}
            </Txt>
            {stepButton(1)}
          </View>
          {triesLeft < 1 ? <Txt tone="urgent">{t('maker.overBudget')}</Txt> : null}
          <Btn icon={ImagePlus} label={t('maker.upload')} disabled={tries > triesLeft} onPress={() => void upload()} />
          <Btn kind="secondary" icon={Sparkles} label={t('maker.useSample')} disabled={tries > triesLeft} onPress={() => void finish()} />
        </>
      ) : null}
    </Card>
  );
}

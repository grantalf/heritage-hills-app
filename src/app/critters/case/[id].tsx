import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, Clock, Footprints, PartyPopper, Search, Sprout } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { CritterPic, Emoji } from '@/components/game';
import { Btn, Card, Choices, EmptyState, Notice, SampleTag, Screen, SectionTitle, Txt, useUI } from '@/components/ui';
import { ZoneScene } from '@/components/zone-scene';
import { clockParts, COST, hearWitness, isLastStop, matchesNotebook, nameCulprit, rewardLevel, startCase, travel, witnessKey, type CaseState, type Notebook, type Suspect } from '@/lib/cases';
import { sizeOf, type Size } from '@/lib/data/game-art';
import type { CritterGroup, PetKind } from '@/lib/data/game-types';
import { useLoad } from '@/lib/data/provider';
import { GROUPS, POINTS } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { radius, space } from '@/lib/theme';

const TYPE = Platform.select({ ios: 'Courier', android: 'monospace', default: '"Courier New", Courier, monospace' });
const SIZES: Size[] = ['tiny', 'small', 'big'];
const PET_KINDS: PetKind[] = ['dog', 'cat', 'other'];
type Any<T extends string> = T | 'any';

export default function CaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tl } = useT();
  const { c, round, fs } = useUI();
  const { repo } = useSession();
  const data = useLoad(async (r) => ({ theCase: (await r.listCases()).find((x) => x.id === id), critters: await r.listCritters(), pets: await r.listPets() }), id);
  const theCase = data?.theCase;
  const [state, setState] = useState<CaseState | undefined>();
  const [notebook, setNotebook] = useState<Notebook>({});
  const [naming, setNaming] = useState(false);

  if (!data || !theCase) {
    return <Screen title={t('critters.mysteries')}>{data ? <EmptyState icon={Search} title={t('critters.missing')} /> : null}</Screen>;
  }
  const saved = repo.getGame().mysteries[theCase.id];
  const typed = { fontFamily: TYPE, fontSize: fs('body'), lineHeight: fs('body') * 1.45, color: c.text };

  const suspects: (Suspect & { name: string; emoji: string })[] =
    theCase.kind === 'pet'
      ? data.pets.filter((p) => p.sample).map((p) => ({ id: p.id, petKind: p.kind, name: p.name, emoji: p.emoji }))
      : data.critters.map((x) => ({ id: x.id, group: x.group, night: !!x.night, size: sizeOf(x.id, x.group), name: tl(x.name), emoji: x.emoji }));
  const culprit = suspects.find((s) => s.id === theCase.culpritId);

  const update = (next: CaseState) => {
    setState(next);
    if (next.outcome) void repo.finishCase(theCase.id, next.outcome === 'solved', rewardLevel(theCase, next));
  };

  // Finished (now or in an earlier visit): show the answer.
  if (saved || state?.outcome) {
    const solved = state?.outcome ? state.outcome === 'solved' : !!saved?.solved;
    const level = saved?.cluesUsed ?? (state ? rewardLevel(theCase, state) : 3);
    return (
      <Screen title={tl(theCase.title)}>
        <Card style={{ borderWidth: 2, borderColor: c.border, borderStyle: 'dashed' }}>
          <Txt variant="label" style={{ fontFamily: TYPE, letterSpacing: 2 }}>
            {solved ? t('critters.stampSolved') : t('critters.stampCold')}
          </Txt>
          <View style={{ alignItems: 'center' }}>
            <CritterPic id={theCase.culpritId} emoji={culprit?.emoji ?? '❓'} size={140} />
          </View>
          <Txt style={typed}>{tl(theCase.reveal)}</Txt>
        </Card>
        <Notice
          tone={solved ? 'good' : 'primary'}
          icon={solved ? PartyPopper : BookOpen}
          title={solved ? t('critters.caseClosed') : t('critters.caseNotQuite')}
          body={solved ? t('critters.earned', { points: POINTS.mystery[level] ?? POINTS.mystery[3] }) : t('critters.caseColdBody')}
        />
        <Notice tone="good" icon={Sprout} title={t('nature.oneThing')} body={tl(theCase.action)} />
        <Btn
          kind="secondary"
          label={theCase.kind === 'pet' ? t('critters.seePet') : t('critters.seeInGuide')}
          onPress={() =>
            theCase.kind === 'pet'
              ? router.push({ pathname: '/critters/pet/[id]', params: { id: theCase.culpritId } })
              : router.push({ pathname: '/critters/[id]', params: { id: theCase.culpritId } })
          }
        />
      </Screen>
    );
  }

  // Briefing.
  if (!state) {
    return (
      <Screen title={tl(theCase.title)}>
        {theCase.sample ? <SampleTag /> : null}
        <Card style={{ borderWidth: 2, borderColor: c.border, borderStyle: 'dashed' }}>
          <Txt variant="label" style={{ fontFamily: TYPE, letterSpacing: 2 }}>
            {t('critters.caseFile')}
          </Txt>
          <Txt style={typed}>{tl(theCase.briefing)}</Txt>
          <Txt style={typed}>{t('critters.caseDeadline', { hours: theCase.hours })}</Txt>
        </Card>
        <Card>
          <Txt variant="label">{t('critters.howCasesWork')}</Txt>
          <Txt>{t('critters.caseHow1', { hours: COST.witness })}</Txt>
          <Txt>{t('critters.caseHow2', { hours: COST.travel, wrong: COST.wrongTurn })}</Txt>
          <Txt>{t('critters.caseHow3')}</Txt>
        </Card>
        <Btn icon={Search} label={t('critters.caseStart')} onPress={() => setState(startCase(theCase))} />
      </Screen>
    );
  }

  const stop = theCase.stops[state.stop];
  const last = isLastStop(theCase, state);
  const clock = clockParts(theCase, state);
  const heardHere = stop.witnesses.some((_, i) => state.heard.includes(witnessKey(state.stop, i)));
  const matching = suspects.filter((s) => matchesNotebook(s, notebook));
  const pick = <T extends string>(value: T | undefined): Any<T> => value ?? 'any';
  const anyOption = { value: 'any' as const, label: t('critters.notebookAny') };

  return (
    <Screen title={tl(theCase.title)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
        <Clock color={c.primary} size={22} />
        <Txt variant="lead" style={{ fontFamily: TYPE }}>
          {t(`critters.day.${clock.day}`)}, {t('critters.oclock', { hour: clock.hour })}
        </Txt>
        <Txt tone={state.hoursLeft <= 6 ? 'urgent' : 'secondary'}>{t('critters.hoursLeft', { hours: state.hoursLeft })}</Txt>
      </View>

      <View style={{ borderRadius: round(radius.lg), overflow: 'hidden', borderWidth: 2, borderColor: c.border }}>
        <ZoneScene zone={stop.zone} height={130} />
        <View style={{ backgroundColor: c.surface, padding: space.md }}>
          <Txt variant="label" style={{ fontFamily: TYPE, letterSpacing: 1 }}>
            {t('critters.stopOf', { n: state.stop + 1, total: theCase.stops.length })}
          </Txt>
          <Txt variant="title">{t(`critters.zone.${stop.zone}`)}</Txt>
        </View>
      </View>

      <SectionTitle>{t('critters.witnesses')}</SectionTitle>
      {stop.witnesses.map((w, i) => {
        const heard = state.heard.includes(witnessKey(state.stop, i));
        return heard ? (
          <Card key={i}>
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <Emoji size={28}>{w.emoji}</Emoji>
              <Txt variant="label" style={{ flex: 1 }}>
                {tl(w.who)}
              </Txt>
            </View>
            <Txt style={typed}>“{tl(w.clue)}”</Txt>
          </Card>
        ) : (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={t('critters.askWitness', { who: tl(w.who) })}
            onPress={() => update(hearWitness(state, i))}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, padding: space.md, borderRadius: round(radius.lg), borderWidth: 2, borderColor: c.primary, backgroundColor: pressed ? c.primarySoft : c.background })}>
            <Emoji size={30}>{w.emoji}</Emoji>
            <Txt variant="lead" tone="primary" style={{ flex: 1 }}>
              {t('critters.askWitness', { who: tl(w.who) })}
            </Txt>
          </Pressable>
        );
      })}

      <SectionTitle>{t('critters.notebook')}</SectionTitle>
      <Card>
        <Txt variant="small" tone="secondary">
          {t('critters.notebookHint')}
        </Txt>
        {theCase.kind === 'wild' ? (
          <>
            <Txt variant="label">{t('critters.noteGroup')}</Txt>
            <Choices label={t('critters.noteGroup')} value={pick(notebook.group)} onChange={(v) => setNotebook({ ...notebook, group: v === 'any' ? undefined : v })} options={[anyOption, ...GROUPS.map((g) => ({ value: g as Any<CritterGroup>, label: t(`critters.group.${g}`) }))]} />
            <Txt variant="label">{t('critters.noteAwake')}</Txt>
            <Choices
              label={t('critters.noteAwake')}
              value={pick(notebook.awake)}
              onChange={(v) => setNotebook({ ...notebook, awake: v === 'any' ? undefined : v })}
              options={[anyOption, { value: 'day' as Any<'day' | 'night'>, label: t('critters.awake.day') }, { value: 'night' as Any<'day' | 'night'>, label: t('critters.awake.night') }]}
            />
            <Txt variant="label">{t('critters.noteSize')}</Txt>
            <Choices label={t('critters.noteSize')} value={pick(notebook.size)} onChange={(v) => setNotebook({ ...notebook, size: v === 'any' ? undefined : v })} options={[anyOption, ...SIZES.map((s) => ({ value: s as Any<Size>, label: t(`critters.size.${s}`) }))]} />
          </>
        ) : (
          <>
            <Txt variant="label">{t('critters.petKindLabel')}</Txt>
            <Choices label={t('critters.petKindLabel')} value={pick(notebook.petKind)} onChange={(v) => setNotebook({ ...notebook, petKind: v === 'any' ? undefined : v })} options={[anyOption, ...PET_KINDS.map((k) => ({ value: k as Any<PetKind>, label: t(`critters.petKind.${k}`) }))]} />
          </>
        )}
        <Txt variant="label" tone="primary">
          {t('critters.suspectsLeft', { count: matching.length })}
        </Txt>
      </Card>

      {last ? (
        <>
          <SectionTitle>{t('critters.whoWasIt')}</SectionTitle>
          {!naming ? (
            <Btn icon={Search} label={t('critters.nameCulprit')} disabled={!heardHere} onPress={() => setNaming(true)} />
          ) : matching.length > 8 ? (
            <Notice tone="notice" icon={BookOpen} title={t('critters.tooMany', { count: matching.length })} body={t('critters.tooManyBody')} />
          ) : (
            <>
              {state.wrongNames.length > 0 ? <Txt tone="urgent">{t('critters.alibi', { hours: COST.wrongName })}</Txt> : null}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {matching.map((s) => {
                  const cleared = state.wrongNames.includes(s.id);
                  return (
                    <Pressable
                      key={s.id}
                      accessibilityRole="button"
                      accessibilityLabel={cleared ? `${s.name}. ${t('critters.cleared')}` : s.name}
                      disabled={cleared}
                      onPress={() => update(nameCulprit(theCase, state, s.id))}
                      style={({ pressed }) => ({ flexBasis: '45%', flexGrow: 1, minHeight: 130, alignItems: 'center', justifyContent: 'center', gap: 4, padding: space.sm, borderRadius: round(radius.lg), borderWidth: 2, borderColor: cleared ? c.surfaceStrong : c.primary, backgroundColor: pressed ? c.primarySoft : c.background, opacity: cleared ? 0.45 : 1 })}>
                      <CritterPic id={s.id} emoji={s.emoji} size={72} />
                      <Txt variant="label" style={{ textAlign: 'center' }}>
                        {s.name}
                      </Txt>
                      {cleared ? (
                        <Txt variant="small" tone="secondary">
                          {t('critters.cleared')}
                        </Txt>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
          {!heardHere ? (
            <Txt variant="small" tone="secondary">
              {t('critters.askFirst')}
            </Txt>
          ) : null}
        </>
      ) : (
        <>
          <SectionTitle>{t('critters.whereNext')}</SectionTitle>
          {state.wrongTurns.length > 0 ? <Txt tone="urgent">{t('critters.coldTrail', { hours: COST.wrongTurn })}</Txt> : null}
          {(stop.nextOptions ?? []).map((zone) => {
            const tried = state.wrongTurns.includes(zone);
            return <Btn key={zone} kind="secondary" icon={Footprints} disabled={tried || !heardHere} label={t('critters.goTo', { place: t(`critters.zone.${zone}`) })} onPress={() => update(travel(theCase, state, zone))} />;
          })}
          {!heardHere ? (
            <Txt variant="small" tone="secondary">
              {t('critters.askFirst')}
            </Txt>
          ) : null}
        </>
      )}
    </Screen>
  );
}

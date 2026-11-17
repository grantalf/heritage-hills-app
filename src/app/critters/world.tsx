/**
 * Critter Club's world: the storybook map (D-070).
 *
 * Tap a place: the hero token walks there along the roads, then the place's
 * card opens. Gentle places open Critter Club activities and their critter
 * host's quest. Rescue places open a side-scrolling level (block 2). Every
 * place is also in a plain list, so nothing here needs the map.
 *
 * Rules: lib/quest. Map layout and drawing: lib/quest/map.ts and
 * components/quest/paper-map.tsx.
 */
import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { BookOpen, ChartColumn, Eye, FileSearch, Grid3x3, Globe, List, Map as MapIcon, Stamp, Swords, Volume2, VolumeX, X, ZoomIn, ZoomOut, type LucideIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createSfx } from '@/components/arcade/sfx';
import { EmojiRow } from '@/components/game';
import { markerPos, WorldMap, type MarkerInfo } from '@/components/quest/paper-map';
import { PixelCritter } from '@/components/quest/pixel-critter';
import { DialogBox, XpBar } from '@/components/quest/zone';
import { Btn, Notice, RowLink, Tag, Txt, useUI } from '@/components/ui';
import type { CritterGroup, Zone } from '@/lib/data/game-types';
import { useLoad } from '@/lib/data/provider';
import { GROUPS } from '@/lib/game';
import { useT, type StringKey } from '@/lib/i18n';
import { WORLD_W, type Pt } from '@/lib/quest/map';
import { groupView } from '@/lib/quest/map-patterns';
import { levelLink, RESCUE_IN_APP } from '@/lib/quest/levels';
import { ZONE, ZONE_EXTRA } from '@/lib/quest/palette';
import { PLACES, placeById, routeBetween, travelSeconds, type Activity, type Place, type PlaceId } from '@/lib/quest/places';
import { experience, hostQuest, questById, questStatus, type QuestContext } from '@/lib/quest/quests';
import type { Observations } from '@/lib/patterns';
import { arrive, claim, meetHost } from '@/lib/quest/state';
import { saveWorld, useWorld } from '@/lib/quest/store';
import { MIN_FOR_PATTERN } from '@/lib/patterns';
import type { SoundName } from '@/lib/arcade/sound';
import { useSession } from '@/lib/session';
import { MAX_CONTENT_WIDTH, MIN_TOUCH, space } from '@/lib/theme';

/** One critter to stand for each kind of animal on the pattern buttons. */
const GROUP_FACE: Record<CritterGroup, string> = { mammal: 'armadillo', bird: 'cardinal', reptile: 'anole', amphibian: 'treefrog', insect: 'monarch', other: 'gardenspider' };

/** A trip in progress. The clock counts seconds since the trip began. */
type Travel = { route: Pt[]; seconds: number; to: PlaceId };

export default function WorldScreen() {
  const { t, tl } = useT();
  const { fs } = useUI();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { repo } = useSession();
  // The plain list (More) sends people here with a place to open.
  const params = useLocalSearchParams<{ open?: string; hello?: string }>();
  const [focusCount, setFocusCount] = useState(0);
  // Leaving the map closes any open place card, so it never covers the next screen.
  const [open, setOpen] = useState<PlaceId | null>(() => placeById(params.open)?.id ?? null);
  useFocusEffect(
    useCallback(() => {
      setFocusCount((n) => n + 1);
      return () => setOpen(null);
    }, []),
  );
  const { world, stamps, ready } = useWorld(focusCount);
  const data = useLoad(async (r) => ({ critters: await r.listCritters(), cards: await r.listBingoCards(), all: await r.getObservations() }));
  const game = repo.getGame();

  const [view, setView] = useState<'map' | 'list'>('map');
  const [zoom, setZoom] = useState<1 | 2>(1);
  const [travel, setTravel] = useState<Travel | null>(null);
  const [clock, setClock] = useState(0);
  /** The host at this place said hello for the first time on this visit. */
  const [justMet, setJustMet] = useState<PlaceId | null>(() => (params.hello ? (placeById(params.open)?.id ?? null) : null));
  const [lookAround, setLookAround] = useState<Zone | null>(null);
  const [group, setGroup] = useState<CritterGroup | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const reduceMotion = useRef(false);
  const scrollX = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const sfx = useMemo(() => createSfx(), []);
  useEffect(() => () => sfx.release(), [sfx]);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => (reduceMotion.current = on))
      .catch(() => undefined);
  }, []);
  const play = useCallback((name: SoundName) => world.sound && sfx.play(name), [sfx, world.sound]);

  const mapW = Math.min(screenW, MAX_CONTENT_WIDTH) - space.lg * 2;
  const fitScale = mapW / WORLD_W;
  const scale = zoom === 1 ? fitScale : fitScale * 2;

  const ctx: QuestContext | undefined = data ? { game, critters: data.critters, cards: data.cards, world, stamps } : undefined;
  const exp = ctx ? experience(ctx) : undefined;
  const placeName = (id: PlaceId) => t(`place.${id}.name`);

  const finishTravel = useCallback(
    (to: PlaceId) => {
    setTravel(null);
    let next = arrive(world, to);
    const place = placeById(to)!;
    setJustMet(place.host && !world.met.includes(to) ? to : null);
    if (place.host) next = meetHost(next, to);
    saveWorld(next);
    play('jingle');
    setStatus(t('world.arrived', { place: placeName(to) }));
    setLookAround(null);
    setOpen(to);
  },
    // placeName is t() with a key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world, play, t],
  );

  // Walk the token along the route, one frame at a time.
  useEffect(() => {
    if (!travel) return;
    let frame = 0;
    const begin = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - begin) / 1000;
      if (elapsed >= travel.seconds) {
        finishTravel(travel.to);
        return;
      }
      setClock(elapsed);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [travel, finishTravel]);

  const goTo = (id: PlaceId, animate: boolean) => {
    if (travel) return;
    sfx.unlock();
    if (id === world.at) {
      const place = placeById(id)!;
      setJustMet(place.host && !world.met.includes(id) ? id : null);
      if (place.host && !world.met.includes(id)) saveWorld(meetHost(world, id));
      setLookAround(null);
      setOpen(id);
      return;
    }
    const from = placeById(world.at)!;
    const to = placeById(id)!;
    if (!animate || reduceMotion.current) {
      finishTravel(id);
      return;
    }
    // Start and end at the buttons, so the token never jumps.
    const route = routeBetween(from, to);
    route[0] = markerPos(from, scale).map((v) => v / scale) as unknown as Pt;
    route[route.length - 1] = markerPos(to, scale).map((v) => v / scale) as unknown as Pt;
    play('go');
    setStatus(t('world.walking', { place: placeName(id) }));
    setClock(0);
    setTravel({ route, seconds: travelSeconds(route), to: id });
  };

  // Keep the token in view when zoomed in.
  const token = travel ? pointOnRoute(travel, clock) : undefined;
  useEffect(() => {
    if (zoom !== 2) return;
    const target = token ?? (() => {
      const p = placeById(world.at);
      return p ? (markerPos(p, scale).map((v) => v / scale) as unknown as Pt) : undefined;
    })();
    if (!target) return;
    scrollX.current?.scrollTo({ x: Math.max(0, target[0] * scale - mapW / 2), animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, token?.[0], world.at]);

  const info = useMemo(() => {
    const out = {} as Record<PlaceId, MarkerInfo>;
    for (const p of PLACES) {
      const parts = [placeName(p.id), t(`world.kind.${p.kind}`)];
      if (p.id === world.at && !travel) parts.push(t('world.youAreHere'));
      out[p.id] = { label: placeName(p.id), a11y: parts.join('. ') };
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, world.at, travel]);

  const view_ = data && group ? groupView(data.all, data.critters, group) : undefined;

  if (!ready || !data || !ctx || !exp) return <View style={{ flex: 1, backgroundColor: ZONE.background }} />;

  const openPlace = open ? placeById(open) : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: ZONE.background }}>
      <View style={{ backgroundColor: ZONE.sample, paddingTop: insets.top }}>
        <Text style={{ color: ZONE.onSample, textAlign: 'center', fontSize: 13, fontWeight: '700', paddingVertical: 5 }}>{t('draft.banner')}</Text>
      </View>
      {/* While a place card is open, the map behind it is hidden from screen readers. */}
      <ScrollView ref={scrollY} importantForAccessibility={openPlace ? 'no-hide-descendants' : 'auto'} accessibilityElementsHidden={!!openPlace} aria-hidden={!!openPlace} contentContainerStyle={{ padding: space.lg, gap: space.md, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <Txt variant="title" style={{ flex: 1, minWidth: 140 }}>
            {t('world.title')}
          </Txt>
          <IconBtn icon={world.sound ? Volume2 : VolumeX} label={world.sound ? t('zone.soundOn') : t('zone.soundOff')} selected={world.sound} onPress={() => saveWorld({ ...world, sound: !world.sound })} />
        </View>
        <XpBar exp={exp} />

        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <ToggleBtn icon={MapIcon} label={t('world.showMap')} on={view === 'map'} onPress={() => setView('map')} />
          <ToggleBtn icon={List} label={t('world.list')} on={view === 'list'} onPress={() => setView('list')} />
          {view === 'map' ? (
            <>
              <View style={{ flex: 1 }} />
              <IconBtn icon={ZoomOut} label={t('world.zoomOut')} disabled={zoom === 1} onPress={() => setZoom(1)} />
              <IconBtn icon={ZoomIn} label={t('world.zoomIn')} disabled={zoom === 2} onPress={() => setZoom(2)} />
            </>
          ) : null}
        </View>

        <Text accessibilityLiveRegion="polite" aria-live="polite" style={{ color: ZONE.text, fontSize: fs('small'), fontWeight: '700', minHeight: fs('small') * 1.4 }}>
          {status || t('world.arrived', { place: placeName(world.at) })}
        </Text>

        {view === 'map' ? (
          <View style={{ borderWidth: 4, borderColor: ZONE_EXTRA.wood, borderRadius: 6, overflow: 'hidden', alignSelf: 'center' }}>
            <ScrollView ref={scrollX} horizontal scrollEnabled={zoom === 2} showsHorizontalScrollIndicator={zoom === 2} style={{ width: mapW, maxHeight: zoom === 2 ? 520 : undefined }} nestedScrollEnabled>
              <ScrollView nestedScrollEnabled scrollEnabled={zoom === 2} style={{ maxHeight: zoom === 2 ? 520 : undefined }}>
                <WorldMap
                  scale={scale}
                  at={world.at}
                  token={token}
                  walking={!!travel}
                  clock={clock}
                  facingLeft={travel ? isFacingLeft(travel, clock) : false}
                  info={info}
                  onPlace={(id) => goTo(id, true)}
                  showRoadNames={zoom === 2}
                  creekCritters={view_ && view_.enough && view_.atCreek > 0 ? { ids: view_.top.slice(0, 2), label: t('pat.creekLabel', { count: view_.atCreek }) } : undefined}
                  alt={t('world.alt')}
                  notToScale={t('world.notToScale')}
                  regionLabels={{ frontier: t('world.regionFrontier'), shadow: t('world.regionShadow'), title: t('world.mapTitle') }}
                />
              </ScrollView>
            </ScrollView>
          </View>
        ) : (
          <View style={{ gap: space.sm }}>
            <Txt tone="secondary">{t('world.listHint')}</Txt>
            {PLACES.map((p) => (
              <PlaceRow key={p.id} place={p} here={p.id === world.at} onPress={() => goTo(p.id, false)} />
            ))}
          </View>
        )}

        {view === 'map' ? (
          <View style={{ gap: space.sm }}>
            <Txt variant="lead">{t('pat.title')}</Txt>
            <Txt variant="small" tone="secondary">
              {t('pat.hint')} {t('pat.wildOnly')}
            </Txt>
            <View accessibilityRole="radiogroup" accessibilityLabel={t('pat.title')} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {GROUPS.map((g) => {
                const on = group === g;
                return (
                  <Pressable
                    key={g}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on, selected: on }}
                    aria-checked={on}
                    accessibilityLabel={t(`critters.group.${g}`)}
                    onPress={() => setGroup(on ? null : g)}
                    style={{ minWidth: MIN_TOUCH + 8, minHeight: MIN_TOUCH + 8, alignItems: 'center', justifyContent: 'center', borderRadius: 28, borderWidth: on ? 4 : 2, borderColor: on ? ZONE_EXTRA.gold : ZONE.border, backgroundColor: on ? ZONE.primarySoft : ZONE.surface }}>
                    <PixelCritter id={GROUP_FACE[g]} size={36} />
                  </Pressable>
                );
              })}
            </View>
            {view_ ? <GroupPanel view={view_} onHide={() => setGroup(null)} /> : null}
            <Txt variant="small" tone="secondary">
              {t('world.privacy')}
            </Txt>
          </View>
        ) : null}
        {toast ? (
          <Notice tone="good" icon={Stamp} title={toast}>
            <Btn kind="quiet" label={t('dialog.ok')} onPress={() => setToast(null)} />
          </Notice>
        ) : null}
      </ScrollView>

      <Modal visible={!!openPlace} transparent animationType="none" onRequestClose={() => setOpen(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(40,24,12,0.45)' }}>
          {openPlace ? (
            <PlaceCard
              place={openPlace}
              ctx={ctx}
              hello={justMet === openPlace.id}
              lookAround={lookAround}
              setLookAround={setLookAround}
              all={data.all}
              stamps={stamps.length}
              onClose={() => setOpen(null)}
              onClaim={(questId) => {
                const q = questById(questId);
                if (!q) return;
                const before = experience(ctx).rank;
                const next = claim(world, questId);
                saveWorld(next);
                play('win');
                const after = experience({ ...ctx, world: next }).rank;
                const parts = [t('quest.collected', { xp: q.xp })];
                if (after !== before) parts.push(t('quest.rankUp', { rank: t(`critters.rank.${after}`) }));
                setToast(parts.join(' '));
                setStatus(parts.join(' '));
              }}
              go={(href) => {
                setOpen(null);
                router.push(href);
              }}
              tl={tl}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

function pointOnRoute(travel: Travel, clock: number): Pt {
  const share = Math.min(1, Math.max(0, clock / travel.seconds));
  return pointAlongRoute(travel.route, share);
}
function pointAlongRoute(route: Pt[], share: number): Pt {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]);
  let left = share * total;
  for (let i = 1; i < route.length; i++) {
    const seg = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]);
    if (left <= seg && seg > 0) return [route[i - 1][0] + ((route[i][0] - route[i - 1][0]) * left) / seg, route[i - 1][1] + ((route[i][1] - route[i - 1][1]) * left) / seg];
    left -= seg;
  }
  return route[route.length - 1];
}
function isFacingLeft(travel: Travel, clock: number): boolean {
  const share = clock / travel.seconds;
  const a = pointAlongRoute(travel.route, Math.max(0, share - 0.02));
  const b = pointAlongRoute(travel.route, Math.min(1, share + 0.02));
  return b[0] < a[0] - 0.01;
}

/** A small tool button: icon and word, at least 48 points tall. */
function IconBtn({ icon: Icon, label, onPress, disabled, selected }: { icon: LucideIcon; label: string; onPress: () => void; disabled?: boolean; selected?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected }}
      aria-disabled={!!disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({ minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, paddingHorizontal: 6, paddingVertical: 4, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 8, borderWidth: 2, borderColor: ZONE.border, backgroundColor: pressed ? ZONE.surfaceStrong : ZONE.surface, opacity: disabled ? 0.45 : 1 })}>
      <Icon color={ZONE.primary} size={22} />
      <Txt variant="small" style={{ color: ZONE.primary, fontWeight: '700', fontSize: 13, lineHeight: 16, textAlign: 'center' }}>
        {label}
      </Txt>
    </Pressable>
  );
}

function ToggleBtn({ icon: Icon, label, on, onPress }: { icon: LucideIcon; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: on, selected: on }}
      aria-checked={on}
      accessibilityLabel={label}
      onPress={onPress}
      style={{ minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, borderRadius: 8, borderWidth: 2, borderColor: on ? ZONE.primary : ZONE.border, backgroundColor: on ? ZONE.primary : ZONE.surface }}>
      <Icon color={on ? ZONE.onPrimary : ZONE.primary} size={20} />
      <Txt variant="label" style={{ color: on ? ZONE.onPrimary : ZONE.primary }}>
        {label}
      </Txt>
    </Pressable>
  );
}

function PlaceRow({ place, here, onPress }: { place: Place; here: boolean; onPress: () => void }) {
  const { t } = useT();
  const kind = t(`world.kind.${place.kind}`);
  const sub = here ? `${kind}. ${t('world.youAreHere')}` : kind;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t(`place.${place.id}.name`)}. ${sub}`}
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 68, padding: space.md, borderRadius: 8, borderWidth: here ? 3 : 2, borderColor: here ? ZONE_EXTRA.gold : ZONE.border, backgroundColor: place.kind === 'rescue' ? ZONE_EXTRA.spooky : pressed ? ZONE.surfaceStrong : ZONE.surface })}>
      <View style={{ width: 48, alignItems: 'center' }}>{place.host ? <PixelCritter id={place.host} size={36} /> : <Txt style={{ fontSize: 26 }}>{place.kind === 'rescue' ? '🗝️' : '🏫'}</Txt>}</View>
      <View style={{ flex: 1 }}>
        <Txt variant="lead" style={place.kind === 'rescue' ? { color: ZONE_EXTRA.onSpooky } : undefined}>
          {t(`place.${place.id}.name`)}
        </Txt>
        <Txt variant="small" style={{ color: place.kind === 'rescue' ? ZONE_EXTRA.onSpooky : ZONE.textSecondary }}>
          {sub}
        </Txt>
      </View>
    </Pressable>
  );
}

function GroupPanel({ view, onHide }: { view: ReturnType<typeof groupView>; onHide: () => void }) {
  const { t } = useT();
  const name = t(`critters.group.${view.group}`);
  return (
    <View style={{ borderWidth: 3, borderColor: ZONE_EXTRA.wood, backgroundColor: ZONE.primarySoft, borderRadius: 6, padding: space.md, gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Txt variant="lead" style={{ flex: 1 }}>
          {name}
        </Txt>
        <Tag tone="sample" label={t('common.sample')} />
      </View>
      {!view.enough ? (
        <Txt>{t('pat.notEnough', { group: name.toLowerCase(), min: MIN_FOR_PATTERN })}</Txt>
      ) : (
        <>
          <Txt>{t('pat.creekLabel', { count: view.atCreek })}</Txt>
          <Txt variant="label">{t('pat.around')}</Txt>
          <Txt>{view.around.map((a) => `${t(`critters.zone.${a.zone}`)} ${a.percent}%`).join(' · ')}</Txt>
          <Txt variant="small" tone="secondary">
            {t('pat.aroundWhy')}
          </Txt>
          <Txt variant="label">{t('pat.through')}</Txt>
          {view.dayPath.map((d) => (
            <Txt key={d.time}>{d.zone ? t('pat.timeAt', { time: t(`critters.time.${d.time}`), place: t(`critters.zone.${d.zone}`).toLowerCase() }) : t('pat.timeNone', { time: t(`critters.time.${d.time}`) })}</Txt>
          ))}
        </>
      )}
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Btn kind="secondary" icon={ChartColumn} label={t('pat.more')} onPress={() => router.push('/critters/patterns')} />
        <Btn kind="quiet" icon={X} label={t('pat.hide')} onPress={onHide} />
      </View>
    </View>
  );
}

const ACT_ICON: Record<Activity['kind'], LucideIcon> = { spot: Eye, cases: FileSearch, bingo: Grid3x3, tally: Globe, patterns: ChartColumn, guide: BookOpen, stamps: Stamp, rescue: Swords };

function PlaceCard({
  place,
  ctx,
  hello,
  lookAround,
  setLookAround,
  all,
  stamps,
  onClose,
  onClaim,
  go,
  tl,
}: {
  place: Place;
  ctx: QuestContext;
  hello: boolean;
  lookAround: Zone | null;
  setLookAround: (z: Zone | null) => void;
  all: Observations;
  stamps: number;
  onClose: () => void;
  onClaim: (questId: string) => void;
  go: (href: Href) => void;
  tl: (l: { en: string; es: string }) => string;
}) {
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const quest = hostQuest(place.id, ctx);
  const qs = quest ? questStatus(quest, ctx) : undefined;
  const hostName = place.host ? t(`host.${place.host}`) : '';

  const likely = lookAround
    ? ctx.critters
        .filter((c) => (all[c.id]?.zones[lookAround] ?? 0) > 0)
        .sort((a, b) => (all[b.id]?.zones[lookAround] ?? 0) - (all[a.id]?.zones[lookAround] ?? 0))
        .slice(0, 6)
    : [];

  const activity = (a: Activity, i: number) => {
    const Icon = ACT_ICON[a.kind];
    switch (a.kind) {
      case 'spot':
        return <RowLink key={i} icon={Icon} title={t('act.spot')} subtitle={t('act.spotHint', { zone: t(`critters.zone.${a.zone}`).toLowerCase() })} onPress={() => setLookAround(lookAround === a.zone ? null : a.zone)} />;
      case 'cases':
        return <RowLink key={i} icon={Icon} title={t('act.cases')} subtitle={t('act.casesHint')} onPress={() => go('/critters/cases')} />;
      case 'bingo':
        return <RowLink key={i} icon={Icon} title={t('act.bingo')} subtitle={t('act.bingoHint')} onPress={() => go('/critters/bingo')} />;
      case 'tally':
        return <RowLink key={i} icon={Icon} title={t('act.tally')} subtitle={t('act.tallyHint')} onPress={() => go('/critters/tally')} />;
      case 'patterns':
        return <RowLink key={i} icon={Icon} title={t('act.patterns')} subtitle={t('act.patternsHint')} onPress={() => go('/critters/patterns')} />;
      case 'guide':
        return <RowLink key={i} icon={Icon} title={t('act.guide')} subtitle={t('act.guideHint')} onPress={() => go('/critters/guide')} />;
      case 'stamps': {
        const link = levelLink('frontier-trail');
        return RESCUE_IN_APP && link.ready ? <RowLink key={i} icon={Icon} title={t('act.stamps')} subtitle={t('act.stampsHint', { count: stamps })} onPress={() => go(link.href as Href)} /> : null;
      }
      case 'rescue': {
        const link = levelLink(a.level);
        if (!link.ready) return <Notice key={i} tone="notice" icon={Swords} title={RESCUE_IN_APP ? t('act.rescueSoon') : t('act.rescueElsewhere')} />;
        return (
          <View key={i} style={{ gap: space.sm }}>
            <Btn icon={Swords} label={t('act.rescue')} hint={t('act.rescueHint')} onPress={() => go(link.href as Href)} />
            <Txt variant="small" tone="secondary">
              {t('act.rescueTone')}
            </Txt>
          </View>
        );
      }
    }
  };

  return (
    <View
      accessibilityViewIsModal
      style={{ maxHeight: height * 0.82, backgroundColor: ZONE.background, borderTopWidth: 5, borderColor: ZONE_EXTRA.wood, borderTopLeftRadius: 10, borderTopRightRadius: 10, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: place.kind === 'rescue' ? ZONE_EXTRA.spooky : ZONE_EXTRA.wood, paddingHorizontal: space.lg, paddingVertical: space.sm }}>
        <View style={{ flex: 1 }}>
          <Txt variant="title" style={{ color: ZONE.onPrimary }}>
            {t(`place.${place.id}.name`)}
          </Txt>
          <Txt variant="small" style={{ color: ZONE.onPrimary }}>
            {t(`world.kind.${place.kind}`)}
            {place.real ? '' : ` · ${t('world.madeUp')}`}
          </Txt>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('place.close')} onPress={onClose} style={{ minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 }}>
          <X color={ZONE.onPrimary} size={24} />
          <Txt variant="label" style={{ color: ZONE.onPrimary }}>
            {t('place.close')}
          </Txt>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.lg + insets.bottom }}>
        <Txt>{t(`place.${place.id}.about`)}</Txt>

        {place.host ? (
          hello ? (
            <DialogBox speaker={place.host} name={hostName}>
              {`${t(`hello.${place.id}` as StringKey)} ${quest ? t(`quest.${quest.id}.ask`) : ''}`}
            </DialogBox>
          ) : !quest || !qs ? (
            <DialogBox speaker={place.host} name={hostName}>
              {t('host.allDone')}
            </DialogBox>
          ) : (
            <DialogBox
              speaker={place.host}
              name={hostName}
              actions={qs.status === 'ready' ? <Btn icon={Stamp} label={t('quest.claim', { xp: quest.xp })} onPress={() => onClaim(quest.id)} /> : undefined}>
              <View style={{ gap: 4 }}>
                <Txt variant="label">{t(`quest.${quest.id}.title`)}</Txt>
                <Txt>{qs.status === 'ready' ? t(`quest.${quest.id}.done`) : t(`quest.${quest.id}.ask`)}</Txt>
                <Txt variant="small" tone="secondary">
                  {t('quest.progress', { now: qs.now, target: quest.target })} · {t('quest.reward', { xp: quest.xp })}
                </Txt>
              </View>
            </DialogBox>
          )
        ) : null}

        <Txt variant="lead">{t('place.todo')}</Txt>
        {place.activities.length === 0 ? <Txt tone="secondary">{t('place.nothing')}</Txt> : <View style={{ gap: space.sm }}>{place.activities.map(activity)}</View>}

        {lookAround ? (
          <View style={{ gap: space.sm }}>
            {likely.length === 0 ? <Txt tone="secondary">{t('act.spotNone')}</Txt> : null}
            {likely.map((c) => (
              <EmojiRow key={c.id} emoji={c.emoji} picId={c.id} title={tl(c.name)} subtitle={t(`critters.rarity.${c.rarity}`)} href={{ pathname: '/critters/[id]', params: { id: c.id, zone: lookAround } }} onPress={go} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

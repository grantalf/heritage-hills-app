/**
 * Critter Rescue (block 2): the first real side-scrolling level.
 *
 * Three parts on one route: the title (sign, hero pick, settings, how to play,
 * cast, stamps), the game, and the rescue card at the end. Block 3's storybook
 * map opens this route for spooky places: /brawler?level=frontier-trail
 *
 * Rules, art and sounds live in lib/arcade and components/arcade. This file
 * only wires them to the screen.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { BookOpen, ChevronLeft, Eye, Hammer, Home, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ink, Parchment, ParchmentColors, WoodSign } from '@/components/arcade/menu';
import { ScoreBar } from '@/components/arcade/hud';
import { Pad } from '@/components/arcade/pad';
import { createSfx } from '@/components/arcade/sfx';
import { Sprite, type LookId } from '@/components/arcade/sprite';
import { Stage } from '@/components/arcade/stage';
import { Bullets, Btn, CheckRow, Choices, Notice, Screen, Txt, useUI } from '@/components/ui';
import { levelById } from '@/lib/arcade/levels';
import { MENU } from '@/lib/arcade/menu-colors';
import { cageCritters, emptyProgress, parseProgress, PROGRESS_KEY, recordWin, stampId, stampsFor, type Progress, type WinResult } from '@/lib/arcade/progress';
import { heroOf, HERO_IDS, type HeroId } from '@/lib/arcade/rules';
import { buildScene, sheetMeta, VIEW_H } from '@/lib/arcade/scene';
import { GameSession } from '@/lib/arcade/session';
import { soundsFor } from '@/lib/arcade/sound';
import { heroRole, resolveSkins, type SkinRole } from '@/lib/arcade/skins';
import { useT } from '@/lib/i18n';
import { MAX_CONTENT_WIDTH, MIN_TOUCH, space } from '@/lib/theme';

/** The founder picked look D: thick outline, shaded color (D-074). */
const LOOK: LookId = 'thickShaded';
const CAST: SkinRole[] = ['shambler', 'lunger', 'tosser', 'boss'];

/** Saved settings and stamps, on this phone only. */
function useProgress(): [Progress, (next: Progress) => void, boolean] {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(PROGRESS_KEY)
      .then((raw) => live && setProgress(parseProgress(raw)))
      .catch(() => undefined)
      .finally(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);
  const save = useCallback((next: Progress) => {
    setProgress(next);
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);
  return [progress, save, ready];
}

export default function CritterRescueScreen() {
  const params = useLocalSearchParams<{ level?: string }>();
  const level = levelById(params.level);
  const [progress, saveProgress] = useProgress();
  const [mode, setMode] = useState<'title' | 'play' | 'end'>('title');
  const [auto, setAuto] = useState(false);
  const [result, setResult] = useState<WinResult | null>(null);
  const [session] = useState(() => new GameSession());
  const lastViewW = useRef(180);
  const sfx = useMemo(() => createSfx(), []);
  useEffect(() => () => sfx.release(), [sfx]);
  const skins = useMemo(() => resolveSkins(new Date()), []);

  const start = (viewW: number) => {
    lastViewW.current = viewW;
    sfx.unlock();
    session.start(level, { difficulty: progress.difficulty, viewW, seed: Date.now() % 100000, hero: progress.hero });
    setResult(null);
    setMode('play');
  };

  if (mode === 'play' && session.world) {
    return (
      <PlayView
        session={session}
        skins={skins}
        auto={auto}
        sound={progress.sound}
        setSound={(on) => saveProgress({ ...progress, sound: on })}
        playSounds={(names) => names.forEach((n) => sfx.play(n))}
        onWin={() => {
          const w = session.world!;
          const r = recordWin(progress, level, w);
          saveProgress(r.progress);
          setResult(r);
          setMode('end');
        }}
        onRestart={(viewW) => start(viewW)}
        onQuit={() => setMode('title')}
      />
    );
  }
  if (mode === 'end' && result && session.world) {
    return <EndView level={level} result={result} score={session.world.score} onAgain={() => start(lastViewW.current)} onTitle={() => setMode('title')} />;
  }
  return <TitleView level={level} progress={progress} save={saveProgress} auto={auto} setAuto={setAuto} onPlay={start} skins={skins} />;
}

// ---------- title ----------

function TitleView({
  level,
  progress,
  save,
  auto,
  setAuto,
  onPlay,
  skins,
}: {
  level: ReturnType<typeof levelById>;
  progress: Progress;
  save: (p: Progress) => void;
  auto: boolean;
  setAuto: (v: boolean) => void;
  onPlay: (viewW: number) => void;
  skins: ReturnType<typeof resolveSkins>;
}) {
  const { t, tl } = useT();
  const [width, setWidth] = useState(360);
  const scale = Math.max(2, Math.floor(Math.min(width, MAX_CONTENT_WIDTH) / 170));
  const viewW = Math.floor(Math.min(width, MAX_CONTENT_WIDTH) / scale);
  const got = stampsFor(progress, level);
  const best = progress.best[level.id];
  return (
    <View style={{ flex: 1 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Screen
        title={t('rescue.title')}
        subtitle={t('rescue.subtitle')}
        footer={<Btn icon={Play} label={t('rescue.play')} onPress={() => onPlay(viewW)} />}>
        <WoodSign title={tl(level.title)} caption={`${t('rescue.levelLabel')} · ${t('rescue.where', { place: tl(level.place) })}`} />
        <Parchment>
          <Ink>{tl(level.story)}</Ink>
        </Parchment>

        <Parchment title={t('rescue.pickHero')}>
          <View accessibilityRole="radiogroup" accessibilityLabel={t('rescue.pickHero')} style={{ flexDirection: 'row', gap: space.sm }}>
            {HERO_IDS.map((id) => (
              <HeroCard key={id} id={id} chosen={progress.hero === id} onPress={() => save({ ...progress, hero: id })} />
            ))}
          </View>
        </Parchment>

        <View style={{ gap: space.sm }}>
          <Txt variant="lead">{t('rescue.howHard')}</Txt>
          <Choices
            label={t('rescue.howHard')}
            value={progress.difficulty}
            onChange={(difficulty) => save({ ...progress, difficulty })}
            options={[
              { value: 'gentle', label: t('rescue.gentle') },
              { value: 'classic', label: t('rescue.classic') },
            ]}
          />
          <Txt variant="small" tone="secondary">
            {progress.difficulty === 'gentle' ? t('rescue.gentleHint') : t('rescue.classicHint')}
          </Txt>
          <Txt variant="lead">{t('rescue.sound')}</Txt>
          <Choices
            label={t('rescue.sound')}
            value={progress.sound ? 'on' : 'off'}
            onChange={(v) => save({ ...progress, sound: v === 'on' })}
            options={[
              { value: 'on', label: t('rescue.soundOn'), icon: Volume2 },
              { value: 'off', label: t('rescue.soundOff'), icon: VolumeX },
            ]}
          />
          <CheckRow label={t('rescue.watch')} hint={t('rescue.watchHint')} checked={auto} onChange={setAuto} />
        </View>

        <Parchment title={t('rescue.howTo')}>
          {(['rescue.howTo1', 'rescue.howTo2', 'rescue.howTo3', 'rescue.howTo4', 'rescue.howTo5'] as const).map((k) => (
            <Ink key={k}>{'• ' + t(k)}</Ink>
          ))}
          {Platform.OS === 'web' ? <Ink soft variant="small">{t('rescue.keys')}</Ink> : null}
        </Parchment>

        <Parchment title={t('rescue.cast')}>
          {CAST.map((role) => (
            <View key={role} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <CastPic sheet={skins[role].sheet} />
              <View style={{ flex: 1 }}>
                <Ink variant="label">{tl(skins[role].name)}</Ink>
                <Ink soft variant="small">
                  {t(`rescue.cast.${role as 'shambler' | 'lunger' | 'tosser' | 'boss'}`)}
                </Ink>
              </View>
            </View>
          ))}
          <Ink soft variant="small">
            {t('rescue.castNote')}
          </Ink>
        </Parchment>

        <Parchment title={t('rescue.stamps')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {cageCritters(level).map((c) => {
              const has = progress.stamps.includes(stampId(level.id, c.id));
              return <Stamp key={c.id} sheet={skins[c.id as SkinRole]?.sheet} name={tl(c.name)} earned={has} />;
            })}
          </View>
          <Ink>{got ? t('rescue.stampsCount', { count: got, total: level.cage.critters.length }) : t('rescue.stampsNone')}</Ink>
          {best ? <Ink>{t('rescue.best', { score: best })}</Ink> : null}
          <Ink soft variant="small">
            {t('rescue.stampsNote')}
          </Ink>
        </Parchment>

        <Btn kind="secondary" icon={BookOpen} label={t('rescue.toGuide')} onPress={() => router.push('/critters/guide')} />
        <Notice icon={Hammer} tone="notice" title={t('common.draft')} body={t('rescue.draft')} />
      </Screen>
    </View>
  );
}

function HeroCard({ id, chosen, onPress }: { id: HeroId; chosen: boolean; onPress: () => void }) {
  const { t } = useT();
  const sheet = id === 'flor' ? 'flor' : 'hero';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: chosen, checked: chosen }}
      aria-checked={chosen}
      accessibilityLabel={`${t(`rescue.hero.${id}`)}. ${t(`rescue.hero.${id}.about`)}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: MIN_TOUCH,
        alignItems: 'center',
        gap: 4,
        padding: space.sm,
        borderRadius: 10,
        borderWidth: chosen ? 4 : 2,
        borderColor: chosen ? MENU.teal : MENU.inkSoft,
        backgroundColor: chosen ? MENU.parchmentDeep : pressed ? MENU.parchmentDeep : MENU.parchment,
      })}>
      <Crop sheet={sheet} anim="idle" scale={2} width={124} height={116} />
      <Ink variant="lead">{t(`rescue.hero.${id}`)}</Ink>
      <Ink soft variant="small">
        {t(`rescue.hero.${id}.about`)}
      </Ink>
      {chosen ? (
        <View style={{ backgroundColor: MENU.teal, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Txt variant="label" style={{ color: '#ffffff' }}>
            {'✓ ' + t('rescue.chosen')}
          </Txt>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * One frame of a character, standing on the bottom edge of a box, centered on
 * its feet. Whole-number scale only, so pixels stay sharp. Decorative: the
 * words next to it carry the meaning.
 */
function Crop({ sheet, anim, scale, width, height }: { sheet: string; anim: string; scale: number; width: number; height: number }) {
  const meta = sheetMeta(sheet);
  if (!meta) return <View style={{ width, height }} />;
  const frame = meta.anims[anim]?.from ?? meta.anims.idle?.from ?? meta.anims.walk?.from ?? 0;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width, height, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: width / 2 - meta.ax * scale, top: height - 4 - meta.ay * scale }}>
        <Sprite sheet={sheet} frame={frame} look={LOOK} scale={scale} />
      </View>
    </View>
  );
}

/** A character's picture for the cast list. Monsters at twice size; the big statue at normal size. */
function CastPic({ sheet }: { sheet: string }) {
  const big = (sheetMeta(sheet)?.cw ?? 0) > 80;
  return <Crop sheet={sheet} anim={big ? 'statue' : 'idle'} scale={big ? 1 : 2} width={104} height={76} />;
}

function Stamp({ sheet, name, earned }: { sheet?: string; name: string; earned: boolean }) {
  const { t } = useT();
  const meta = sheet ? sheetMeta(sheet) : undefined;
  // Words, not a check mark, and full-strength text: only the picture is faded (block 5 review, A-09, A-20).
  const state = earned ? t('rescue.stampEarned') : t('rescue.stampNotYet');
  return (
    <View
      accessible
      accessibilityLabel={`${name}: ${state}`}
      style={{ width: 96, alignItems: 'center', padding: 4, borderRadius: 8, borderWidth: 2, borderStyle: earned ? 'solid' : 'dashed', borderColor: earned ? MENU.teal : MENU.inkSoft }}>
      {sheet && meta ? (
        <View style={{ opacity: earned ? 1 : 0.5 }}>
          <Crop sheet={sheet} anim="cheer" scale={2} width={84} height={56} />
        </View>
      ) : null}
      <Txt variant="small" style={{ color: MENU.ink, textAlign: 'center' }}>
        {name}
      </Txt>
      <Txt variant="label" style={{ color: earned ? MENU.ink : MENU.inkSoft, textAlign: 'center' }}>
        {earned ? '✓ ' + state : state}
      </Txt>
    </View>
  );
}

// ---------- play ----------

function PlayView({
  session,
  skins,
  auto,
  sound,
  setSound,
  playSounds,
  onWin,
  onRestart,
  onQuit,
}: {
  session: GameSession;
  skins: ReturnType<typeof resolveSkins>;
  auto: boolean;
  sound: boolean;
  setSound: (on: boolean) => void;
  playSounds: (names: ReturnType<typeof soundsFor>) => void;
  onWin: () => void;
  onRestart: (viewW: number) => void;
  onQuit: () => void;
}) {
  const { t, tl } = useT();
  const { c } = useUI();
  const insets = useSafeAreaInsets();
  const [paused, setPaused] = useState(false);
  const [width, setWidth] = useState(360);
  useSyncExternalStore(session.subscribe, session.getFrame, session.getFrame);
  // Latest values for the game loop, without restarting it.
  const soundRef = useRef(sound);
  const winRef = useRef(onWin);
  const playRef = useRef(playSounds);
  useEffect(() => {
    soundRef.current = sound;
    winRef.current = onWin;
    playRef.current = playSounds;
  }, [sound, onWin, playSounds]);

  const scale = Math.max(2, Math.floor(width / 170));
  const viewW = Math.floor(width / scale);
  const w = session.world!;
  const hRole = heroRole(w.heroId);
  const running = !paused && w.phase !== 'won' && w.phase !== 'lost';

  useEffect(() => {
    if (!running) return;
    let handle = 0;
    let last = Date.now();
    const loop = () => {
      const now = Date.now();
      session.advance((now - last) / 1000, viewW, auto);
      last = now;
      const events = session.takeEvents();
      if (soundRef.current && events.length) playRef.current(soundsFor(events, skins, hRole));
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [running, auto, viewW, session, skins, hRole]);

  // A short pause on the "thank you" moment, then the rescue card.
  useEffect(() => {
    if (w.phase !== 'won') return;
    const id = setTimeout(() => winRef.current(), 900);
    return () => clearTimeout(id);
  }, [w.phase]);

  // Pause when the player leaves the screen or the app.
  useFocusEffect(useCallback(() => () => setPaused(true), []));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => state !== 'active' && setPaused(true));
    return () => sub.remove();
  }, []);

  // Keyboard, for the web build.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const held = new Set<string>();
    const apply = () => {
      const has = (...keys: string[]) => keys.some((k) => held.has(k));
      session.setInput((has('ArrowRight', 'd') ? 1 : 0) - (has('ArrowLeft', 'a') ? 1 : 0), (has('ArrowDown', 's') ? 1 : 0) - (has('ArrowUp', 'w') ? 1 : 0), has(' ', 'j'));
    };
    const key = (e: KeyboardEvent) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const down = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
      const k = key(e);
      if (k === 'p' || k === 'Escape') {
        setPaused((p) => !p);
        return;
      }
      if (k === 'm') {
        setSound(!soundRef.current);
        return;
      }
      held.add(k);
      apply();
    };
    const up = (e: KeyboardEvent) => {
      held.delete(key(e));
      apply();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [session, setSound]);

  const hero = heroOf(w);
  const boss = w.actors.find((a) => a.role === 'boss');
  const showBoss = boss && w.phase === 'boss' && boss.state !== 'statue';
  const scene = buildScene(w, skins, session.fx);
  const lost = w.phase === 'lost';
  const overlay = lost || paused;
  const heroName = tl(skins[hRole].name);
  const bossName = tl(skins.boss.name);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ backgroundColor: c.sample, paddingTop: insets.top }}>
        <Txt variant="label" style={{ color: c.onSample, textAlign: 'center', paddingVertical: 5, fontSize: 13 }}>
          {t('draft.banner')}
        </Txt>
      </View>
      <View onLayout={(e) => setWidth(Math.min(e.nativeEvent.layout.width, MAX_CONTENT_WIDTH))} style={{ flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingBottom: insets.bottom }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm }}>
          <HeaderButton icon={ChevronLeft} label={t('common.back')} onPress={() => setPaused(true)} />
          <HeaderButton icon={sound ? Volume2 : VolumeX} label={t('rescue.soundToggle')} state={sound} onPress={() => setSound(!sound)} />
          <HeaderButton icon={paused ? Play : Pause} label={paused ? t('rescue.resume') : t('rescue.pause')} disabled={lost} onPress={() => setPaused((p) => !p)} />
        </View>

        <ScoreBar
          heroSheet={skins[hRole].sheet}
          heroName={heroName}
          look={LOOK}
          hp={hero.hp}
          maxHp={hero.maxHp}
          score={w.score}
          heroLabel={t('rescue.hud.hero', { name: heroName, now: hero.hp, max: hero.maxHp })}
          scoreLabel={t('rescue.hud.score', { score: w.score })}
          boss={showBoss ? { name: bossName, hp: boss.hp, maxHp: boss.maxHp, label: t('rescue.hud.boss', { name: bossName, now: boss.hp, max: boss.maxHp }) } : undefined}
        />

        <View>
          <Stage scene={scene} look={LOOK} scale={scale} viewW={viewW} label={t('rescue.stageLabel')} />
          {!w.locked && w.phase === 'play' ? (
            <View pointerEvents="none" style={{ position: 'absolute', top: 8, right: 12, backgroundColor: MENU.wood, borderColor: MENU.woodDark, borderWidth: 2, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 2, opacity: Math.floor(w.time * 2) % 2 ? 1 : 0.6 }}>
              <Txt variant="label" maxFontSizeMultiplier={1.4} style={{ color: MENU.parchment }}>
                {t('street.go')} ▶
              </Txt>
            </View>
          ) : null}
          {w.phase === 'rescue' || w.phase === 'won' ? (
            <View pointerEvents="none" style={{ position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center' }}>
              <View style={{ backgroundColor: MENU.parchment, borderColor: MENU.woodDark, borderWidth: 3, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6, maxWidth: '90%' }}>
                <Txt variant="lead" maxFontSizeMultiplier={1.4} style={{ color: MENU.ink, textAlign: 'center' }}>
                  {t('rescue.thanks')}
                </Txt>
              </View>
            </View>
          ) : null}
          {overlay ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: VIEW_H * scale, backgroundColor: 'rgba(30,18,10,0.72)', alignItems: 'center', justifyContent: 'center', padding: space.md }}>
              <ParchmentColors>
              <View style={{ backgroundColor: MENU.parchment, borderColor: MENU.wood, borderWidth: 4, borderRadius: 12, padding: space.md, gap: space.sm, width: '100%', maxWidth: 340 }}>
                {lost ? (
                  <>
                    <Ink variant="title">{t('rescue.lostTitle')}</Ink>
                    <Ink>{t('rescue.lostBody')}</Ink>
                    <Btn icon={RotateCcw} label={t('rescue.tryAgain')} onPress={() => session.tryAgain()} />
                    <Btn kind="secondary" icon={Home} label={t('rescue.quit')} onPress={onQuit} />
                  </>
                ) : (
                  <>
                    <Ink variant="title">{t('rescue.paused')}</Ink>
                    <Btn icon={Play} label={t('rescue.resume')} onPress={() => setPaused(false)} />
                    <Btn kind="secondary" icon={RotateCcw} label={t('rescue.restart')} onPress={() => onRestart(viewW)} />
                    <Btn kind="secondary" icon={Home} label={t('rescue.quit')} onPress={onQuit} />
                  </>
                )}
              </View>
              </ParchmentColors>
            </View>
          ) : null}
        </View>

        <Txt accessibilityLiveRegion="polite" aria-live="polite" variant="label" maxFontSizeMultiplier={1.6} style={{ textAlign: 'center', paddingHorizontal: space.md, paddingVertical: space.sm, minHeight: 44 }}>
          {t(`street.status.${session.status}`)}
        </Txt>

        {auto ? (
          <View style={{ padding: space.lg }}>
            <Notice icon={Eye} tone="primary" title={t('rescue.watch')} body={t('rescue.watchHint')} />
          </View>
        ) : (
          <Pad onInput={(x, z, bonk) => session.setInput(x, z, bonk)} moveLabel={t('street.move')} bonkLabel={t('street.bonk')} label={t('street.padLabel')} disabled={overlay} />
        )}
      </View>
    </View>
  );
}

function HeaderButton({ icon: Icon, label, onPress, disabled, state }: { icon: typeof Play; label: string; onPress: () => void; disabled?: boolean; state?: boolean }) {
  const { c } = useUI();
  return (
    <Pressable
      accessibilityRole={state === undefined ? 'button' : 'switch'}
      accessibilityState={state === undefined ? { disabled: !!disabled } : { checked: state, disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({ minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 4, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}>
      <Icon color={c.primary} size={22} />
      <Txt tone="primary" variant="label" maxFontSizeMultiplier={1.4}>
        {label}
      </Txt>
    </Pressable>
  );
}

// ---------- end ----------

function EndView({ level, result, score, onAgain, onTitle }: { level: ReturnType<typeof levelById>; result: WinResult; score: number; onAgain: () => void; onTitle: () => void }) {
  const { t, tl } = useT();
  const skins = useMemo(() => resolveSkins(new Date()), []);
  return (
    <Screen title={t('rescue.wonTitle')} subtitle={tl(level.title)} footer={<Btn icon={RotateCcw} label={t('rescue.playAgain')} onPress={onAgain} />}>
      <WoodSign title={t('rescue.thanks')} />
      <Parchment>
        <Ink variant="lead">{t('rescue.wonScore', { score })}</Ink>
        {result.newBest ? <Ink>{t('rescue.newBest')}</Ink> : null}
      </Parchment>
      {cageCritters(level).map((critter) => {
        const fresh = result.newStamps.includes(stampId(level.id, critter.id));
        const sheet = skins[critter.id as SkinRole]?.sheet;
        const meta = sheet ? sheetMeta(sheet) : undefined;
        return (
          <Parchment key={critter.id} title={tl(critter.name)}>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              {sheet && meta ? <Crop sheet={sheet} anim="cheer" scale={3} width={120} height={84} /> : null}
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: fresh ? MENU.teal : MENU.parchmentDeep, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Txt variant="label" style={{ color: fresh ? '#ffffff' : MENU.ink }}>
                    {fresh ? '★ ' + t('rescue.newStamp') : '✓ ' + t('rescue.hadStamp')}
                  </Txt>
                </View>
              </View>
            </View>
            <Ink variant="label">{t('rescue.factLabel')}</Ink>
            <Ink>{tl(critter.fact)}</Ink>
            <Ink variant="label">{t('rescue.lookLabel')}</Ink>
            <Ink>{tl(critter.look)}</Ink>
            {critter.caution ? <Ink soft>{'⚠ ' + tl(critter.caution)}</Ink> : null}
            <Btn kind="quiet" icon={BookOpen} label={t('rescue.learnMore')} onPress={() => router.push({ pathname: '/critters/[id]', params: { id: critter.id } })} />
          </Parchment>
        );
      })}
      <Bullets items={[t('rescue.stampsNote')]} />
      <Btn kind="secondary" icon={Home} label={t('rescue.backToTitle')} onPress={onTitle} />
    </Screen>
  );
}

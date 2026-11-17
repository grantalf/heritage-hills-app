import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Eye, Hammer, Pause, Play, RotateCcw } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AppState, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pad } from '@/components/arcade/pad';
import { LOOK_IDS, type LookId } from '@/components/arcade/sprite';
import { Stage } from '@/components/arcade/stage';
import { Btn, Card, CheckRow, Choices, Notice, Screen, Txt, useUI } from '@/components/ui';
import { WORKSHOP_LEVEL } from '@/lib/arcade/levels';
import { heroOf, type Difficulty } from '@/lib/arcade/rules';
import { buildScene, VIEW_H } from '@/lib/arcade/scene';
import { GameSession } from '@/lib/arcade/session';
import { FROST_EXAMPLE, resolveSkins, type SkinRole } from '@/lib/arcade/skins';
import { useT } from '@/lib/i18n';
import { MAX_CONTENT_WIDTH, MIN_TOUCH, space } from '@/lib/theme';

const LETTER: Record<LookId, string> = { thinFlat: 'A', thinShaded: 'B', thickFlat: 'C', thickShaded: 'D' };

export default function TestStreetScreen() {
  const { t, tl } = useT();
  const { c } = useUI();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ look?: string }>();
  const [look, setLook] = useState<LookId>(LOOK_IDS.includes(params.look as LookId) ? (params.look as LookId) : 'thinShaded');
  const [difficulty, setDifficulty] = useState<Difficulty>('gentle');
  const [frost, setFrost] = useState(false);
  const [auto, setAuto] = useState(false);
  const [mode, setMode] = useState<'lobby' | 'play'>('lobby');
  const [paused, setPaused] = useState(false);
  const [width, setWidth] = useState(360);
  const [session] = useState(() => new GameSession());
  // Repaint whenever the game moves on a frame.
  useSyncExternalStore(session.subscribe, session.getFrame, session.getFrame);

  // Whole-number scale keeps every art pixel the same size on screen.
  const scale = Math.max(2, Math.floor(width / 170));
  const viewW = Math.floor(width / scale);
  const skins = useMemo(() => resolveSkins(new Date(), frost ? { force: FROST_EXAMPLE.id } : {}), [frost]);

  const begin = () => {
    session.start(WORKSHOP_LEVEL, { difficulty, viewW, seed: 11 });
    setPaused(false);
    setMode('play');
  };

  const w = session.world;
  const running = mode === 'play' && !paused && !!w && w.phase !== 'won' && w.phase !== 'lost';

  useEffect(() => {
    if (!running) return;
    let handle = 0;
    let last = Date.now();
    const loop = () => {
      const now = Date.now();
      session.advance((now - last) / 1000, viewW, auto);
      last = now;
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [running, auto, viewW, session]);

  // Pause when the player leaves the screen or the app.
  useFocusEffect(useCallback(() => () => setPaused(true), []));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => state !== 'active' && setPaused(true));
    return () => sub.remove();
  }, []);

  // Keyboard, for the web build.
  useEffect(() => {
    if (Platform.OS !== 'web' || mode !== 'play') return;
    const held = new Set<string>();
    const apply = () => {
      const has = (...keys: string[]) => keys.some((k) => held.has(k));
      session.setInput((has('ArrowRight', 'd') ? 1 : 0) - (has('ArrowLeft', 'a') ? 1 : 0), (has('ArrowDown', 's') ? 1 : 0) - (has('ArrowUp', 'w') ? 1 : 0), has(' ', 'j'));
    };
    const key = (e: KeyboardEvent) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const down = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
      held.add(key(e));
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
  }, [mode, session]);

  if (mode === 'lobby' || !w) {
    return (
      <Screen title={t('street.title')} subtitle={t('street.subtitle')}>
        <Txt>{t('street.story')}</Txt>
        <Btn icon={Play} label={t('street.start')} onPress={begin} />
        <Card>
          <Txt variant="lead">{t('street.settings')}</Txt>
          <Txt variant="label">{t('street.difficulty')}</Txt>
          <Choices
            label={t('street.difficulty')}
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: 'gentle', label: t('street.gentle') },
              { value: 'classic', label: t('street.classic') },
            ]}
          />
          <Txt variant="label">{t('street.look')}</Txt>
          <Choices label={t('street.look')} value={look} onChange={setLook} options={LOOK_IDS.map((id) => ({ value: id, label: `${LETTER[id]}. ${t(`styles.look.${id}`)}` }))} />
          <Txt variant="label">{t('street.pack')}</Txt>
          <Choices
            label={t('street.pack')}
            value={frost ? 'on' : 'off'}
            onChange={(v) => setFrost(v === 'on')}
            options={[
              { value: 'off', label: t('street.packOff') },
              { value: 'on', label: tl(FROST_EXAMPLE.name) },
            ]}
          />
          <Txt variant="small" tone="secondary">
            {t('street.packNote', { name: tl(skins.shambler.name) })}
          </Txt>
          <CheckRow label={t('street.watch')} hint={t('street.watchHint')} checked={auto} onChange={setAuto} />
        </Card>
        <Txt tone="secondary">{t('street.controlsHint')}</Txt>
        {Platform.OS === 'web' ? <Txt tone="secondary">{t('street.keysHint')}</Txt> : null}
        <Notice icon={Hammer} tone="notice" title={t('common.draft')} body={`${t('workshop.draft')} ${t('street.noSound')}`} />
      </Screen>
    );
  }

  const hero = heroOf(w);
  const boss = w.actors.find((a) => a.role === 'boss');
  const showBoss = boss && w.phase === 'boss' && boss.state !== 'statue';
  const scene = buildScene(w, skins, session.fx);
  const ended = w.phase === 'won' || w.phase === 'lost';
  const overlay = ended || paused;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ backgroundColor: c.sample, paddingTop: insets.top }}>
        <Txt variant="label" style={{ color: c.onSample, textAlign: 'center', paddingVertical: 5, fontSize: 13 }}>
          {t('draft.banner')}
        </Txt>
      </View>
      <View onLayout={(e) => setWidth(Math.min(e.nativeEvent.layout.width, MAX_CONTENT_WIDTH))} style={{ flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingBottom: insets.bottom }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => setMode('lobby')} style={{ minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, flexDirection: 'row', alignItems: 'center' }}>
            <ChevronLeft color={c.primary} size={24} />
            <Txt tone="primary" variant="lead">
              {t('common.back')}
            </Txt>
          </Pressable>
          <Txt accessibilityRole="header" variant="label" numberOfLines={2} maxFontSizeMultiplier={1.6} style={{ flex: 1, textAlign: 'center' }}>
            {t('street.title')}
          </Txt>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? t('street.resume') : t('street.pause')}
            disabled={ended}
            onPress={() => setPaused((p) => !p)}
            style={{ minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, opacity: ended ? 0.4 : 1 }}>
            {paused ? <Play color={c.primary} size={22} /> : <Pause color={c.primary} size={22} />}
            <Txt tone="primary" variant="lead">
              {paused ? t('street.resume') : t('street.pause')}
            </Txt>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: space.xs, gap: space.md }}>
          <Meter label={t('street.health', { now: hero.hp, max: hero.maxHp })} now={hero.hp} max={hero.maxHp} color={c.good} />
          {showBoss ? <Meter label={t('street.bossHealth', { name: tl(skins.boss.name), now: boss.hp, max: boss.maxHp })} now={boss.hp} max={boss.maxHp} color={c.urgent} caption={tl(skins.boss.name)} /> : <Txt variant="label">{t('street.score', { score: w.score })}</Txt>}
        </View>

        <View>
          <Stage scene={scene} look={look} scale={scale} viewW={viewW} label={t('street.stageLabel')} />
          {!w.locked && w.phase === 'play' ? (
            <View pointerEvents="none" style={{ position: 'absolute', top: 8, right: 12, backgroundColor: c.primary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 2, opacity: Math.floor(w.time * 2) % 2 ? 1 : 0.55 }}>
              <Txt variant="label" tone="onPrimary">
                {t('street.go')} ▶
              </Txt>
            </View>
          ) : null}
          {overlay ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: VIEW_H * scale, backgroundColor: 'rgba(16,14,34,0.72)', alignItems: 'center', justifyContent: 'center', padding: space.md }}>
              <View style={{ backgroundColor: c.background, borderRadius: 12, padding: space.md, gap: space.sm, width: '100%', maxWidth: 330 }}>
                {w.phase === 'won' ? (
                  <>
                    <Txt variant="title">{t('street.wonTitle')}</Txt>
                    <Txt>{t('street.wonBody', { names: w.rescued.map((k) => tl(skins[k as SkinRole].name)).join(', ') })}</Txt>
                    <Txt variant="small" tone="secondary">
                      {t('street.wonNote')}
                    </Txt>
                    <Btn icon={RotateCcw} label={t('street.playAgain')} onPress={begin} />
                  </>
                ) : w.phase === 'lost' ? (
                  <>
                    <Txt variant="title">{t('street.lostTitle')}</Txt>
                    <Txt>{t('street.lostBody')}</Txt>
                    <Btn
                      icon={RotateCcw}
                      label={t('street.tryAgain')}
                      onPress={() => session.tryAgain()}
                    />
                  </>
                ) : (
                  <>
                    <Txt variant="title">{t('street.paused')}</Txt>
                    <Btn icon={Play} label={t('street.resume')} onPress={() => setPaused(false)} />
                    <Btn kind="secondary" icon={RotateCcw} label={t('street.restart')} onPress={begin} />
                  </>
                )}
              </View>
            </View>
          ) : null}
        </View>

        <Txt accessibilityLiveRegion="polite" aria-live="polite" variant="label" maxFontSizeMultiplier={1.6} style={{ textAlign: 'center', paddingHorizontal: space.md, paddingVertical: space.sm, minHeight: 44 }}>
          {t(`street.status.${session.status}`)}
        </Txt>

        {auto ? (
          <View style={{ padding: space.lg, gap: space.sm }}>
            <Notice icon={Eye} tone="primary" title={t('street.watch')} body={t('street.watchHint')} />
          </View>
        ) : (
          <Pad onInput={(x, z, bonk) => session.setInput(x, z, bonk)} moveLabel={t('street.move')} bonkLabel={t('street.bonk')} label={t('street.padLabel')} disabled={overlay} />
        )}
      </View>
    </View>
  );
}

/** A segmented bar, as on old arcade score strips. The words are in the label for screen readers. */
function Meter({ label, now, max, color, caption }: { label: string; now: number; max: number; color: string; caption?: string }) {
  const { c } = useUI();
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max, now }} style={{ gap: 2, flexShrink: 1 }}>
      {caption ? (
        <Txt variant="small" numberOfLines={1}>
          {caption}
        </Txt>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 2, flexWrap: 'wrap', direction: 'ltr' }}>
        {Array.from({ length: max }, (_, i) => (
          <View key={i} style={{ width: max > 14 ? 6 : 10, height: 14, borderRadius: 2, borderWidth: 1.5, borderColor: c.text, backgroundColor: i < now ? color : 'transparent' }} />
        ))}
      </View>
    </View>
  );
}

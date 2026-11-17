import { router } from 'expo-router';
import { Gamepad2, MessageSquare } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';

import { Lineup } from '@/components/arcade/stage';
import { LOOK_IDS, Sprite, type LookId } from '@/components/arcade/sprite';
import { Btn, Card, CheckRow, Notice, Screen, SectionTitle, Txt, useUI } from '@/components/ui';
import { MENU } from '@/lib/arcade/menu-colors';
import { frameOf } from '@/lib/arcade/scene';
import { BASE_PACK } from '@/lib/arcade/skins';
import { useT } from '@/lib/i18n';
import { MIN_TOUCH, space } from '@/lib/theme';

const LETTER: Record<LookId, string> = { thinFlat: 'A', thinShaded: 'B', thickFlat: 'C', thickShaded: 'D' };

export default function StyleSheetsScreen() {
  const { t, tl } = useT();
  const { c } = useUI();
  const [chosen, setChosen] = useState<LookId>('thickShaded');
  const [moving, setMoving] = useState(false);
  const [clock, setClock] = useState(0);

  useEffect(() => {
    // People who ask their phone for less motion start with still pictures.
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => setMoving(!reduce))
      .catch(() => setMoving(true));
  }, []);
  useEffect(() => {
    if (!moving) return;
    const timer = setInterval(() => setClock((n) => n + 0.12), 120);
    return () => clearInterval(timer);
  }, [moving]);

  const time = moving ? clock : 0;
  const walk = moving ? 'walk' : 'idle';
  const outline = chosen.startsWith('thin') ? t('styles.thin') : t('styles.thick');
  const shading = chosen.endsWith('Flat') ? t('styles.flat') : t('styles.shaded');

  return (
    <Screen title={t('styles.title')} subtitle={t('styles.subtitle')}>
      <Txt>{t('styles.intro')}</Txt>
      <CheckRow label={t('styles.moving')} checked={moving} onChange={setMoving} />

      {LOOK_IDS.map((look) => {
        const selected = look === chosen;
        const name = t(`styles.look.${look}`);
        return (
          <Card key={look} style={{ borderWidth: 3, borderColor: selected ? c.primary : 'transparent' }}>
            <Txt variant="label" tone="primary">
              {t('styles.letter', { letter: LETTER[look] })}
            </Txt>
            <Txt variant="title">{name}</Txt>
            <Txt tone="secondary">{t(`styles.note.${look}`)}</Txt>
            <View style={{ gap: space.sm, alignItems: 'center' }}>
              <Lineup
                look={look}
                scale={2}
                width={296}
                label={t('styles.picture', { look: name })}
                items={[
                  { sheet: 'hero', frame: frameOf('hero', walk, time), x: 26 },
                  { sheet: 'dog', frame: frameOf('dog', moving ? 'run' : 'idle', time), x: 68 },
                  { sheet: 'shambler', frame: frameOf('shambler', walk, time * 0.7), x: 118, flip: true },
                ]}
              />
              <Lineup look={look} scale={2} width={296} label={tl(BASE_PACK.skins.boss!.name)} items={[{ sheet: 'boss', frame: frameOf('boss', moving ? 'walk' : 'idle', time * 0.7), x: 70 }]} />
            </View>
            <Btn kind={selected ? 'primary' : 'secondary'} label={selected ? t('styles.chosen') : t('styles.choose')} onPress={() => setChosen(look)} />
          </Card>
        );
      })}

      <SectionTitle>{t('styles.menuTitle')}</SectionTitle>
      <Txt tone="secondary">{t('styles.menuBody')}</Txt>
      <MenuSample look={chosen} />

      <Btn icon={Gamepad2} label={t('styles.playIt')} onPress={() => router.push({ pathname: '/workshop/street', params: { look: chosen } })} />

      <Notice icon={MessageSquare} tone="primary" title={t('styles.pickTitle')} body={t('styles.pickBody')}>
        <Txt selectable variant="label" style={{ minHeight: MIN_TOUCH, textAlignVertical: 'center' }}>
          {t('styles.pickLine', { outline, shading })}
        </Txt>
      </Notice>
    </Screen>
  );
}

/** Wood-and-parchment menu: tabs across the top, an item grid, and a pet card with a framed portrait. */
function MenuSample({ look }: { look: LookId }) {
  const { t, tl } = useT();
  const { fs } = useUI();
  const [tab, setTab] = useState<'guide' | 'pets' | 'rescues'>('guide');
  const text = { color: MENU.ink, fontSize: fs('small') };
  const critters = ['squirrel', 'armadillo', 'cottontail'] as const;
  const slot = { width: 64, height: 64, borderRadius: 6, borderWidth: 2, borderColor: MENU.woodLight, backgroundColor: MENU.parchmentDeep, alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <View style={{ backgroundColor: MENU.wood, borderColor: MENU.woodDark, borderWidth: 3, borderRadius: 10, padding: 6, gap: 6 }}>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4 }}>
        {(['guide', 'pets', 'rescues'] as const).map((id) => {
          const on = id === tab;
          return (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              aria-selected={on}
              accessibilityLabel={t(`styles.tab.${id}`)}
              onPress={() => setTab(id)}
              style={{ flex: 1, minHeight: MIN_TOUCH, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: on ? MENU.parchment : MENU.woodDark }}>
              <Txt variant="label" style={{ color: on ? MENU.ink : MENU.parchment, textAlign: 'center' }}>
                {t(`styles.tab.${id}`)}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      <View style={{ backgroundColor: MENU.parchment, borderRadius: 6, padding: space.md, gap: space.md }}>
        {tab === 'pets' ? (
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <View accessible accessibilityRole="image" accessibilityLabel={`${t('styles.petName')}. ${t('styles.petKind')}`} style={{ borderWidth: 4, borderColor: MENU.wood, borderRadius: 6, backgroundColor: MENU.teal, padding: 2 }}>
              <Sprite sheet="dog" frame={frameOf('dog', 'cheer', 0)} look={look} scale={3} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt variant="lead" style={{ color: MENU.ink }}>
                {t('styles.petName')}
              </Txt>
              <Txt style={{ ...text, color: MENU.inkSoft }}>{t('styles.petKind')}</Txt>
              {(
                [
                  ['zoomies', 5],
                  ['snack', 4],
                  ['bravery', 2],
                ] as const
              ).map(([stat, value]) => (
                <View key={stat} accessible accessibilityLabel={t('styles.statValue', { name: t(`styles.stat.${stat}`), value })} style={{ gap: 2 }}>
                  <Txt style={text}>{t(`styles.stat.${stat}`)}</Txt>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <View key={n} style={{ width: 16, height: 10, borderRadius: 2, borderWidth: 1.5, borderColor: MENU.ink, backgroundColor: n <= value ? MENU.gold : MENU.parchmentDeep }} />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {critters.map((id) => {
              const name = tl(BASE_PACK.skins[id]!.name);
              return (
                <View key={id} accessible accessibilityRole="image" accessibilityLabel={t('styles.slotFound', { name })} style={slot}>
                  <Sprite sheet={id} frame={frameOf(id, tab === 'rescues' ? 'cheer' : 'idle', 0)} look={look} scale={1.5} />
                </View>
              );
            })}
            <View accessible accessibilityRole="image" accessibilityLabel={t('styles.slotEmpty')} style={[slot, { opacity: 0.6 }]}>
              <Txt variant="title" style={{ color: MENU.inkSoft }}>
                ?
              </Txt>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

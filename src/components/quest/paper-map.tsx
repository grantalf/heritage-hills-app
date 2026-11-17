/**
 * The storybook map: Critter Club's world (D-070, D-071).
 *
 * STAND-IN PICTURE. The founder chose painted artwork for the map (D-075,
 * D-076). Until those pieces arrive, the picture below is drawn in code, plain
 * on purpose. What matters here and stays when the art arrives:
 *  - the layout (lib/quest/map.ts), traced from the founder's sketch;
 *  - places as real buttons, at least 48 points, with real text labels;
 *  - the hero token travelling along the roads.
 * Painted pieces go in MAP_PIECES (map units), drawn above the stand-in.
 *
 * Shows roads, public places and made-up lands only: no houses, lots, house
 * numbers or pins. Not to scale and not for finding your way.
 */
import { Ghost } from 'lucide-react-native';
import { memo, useMemo, type ReactNode } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ink, PAPER, Shrub, Tree, wobbler } from '@/components/arcade/paper-map-sample';
import { Sprite } from '@/components/arcade/sprite';
import { frameOf } from '@/lib/arcade/scene';
import { Txt, useUI } from '@/components/ui';
import { CREEK, GARDEN_OUTLINE, ROADS, WORLD_H, WORLD_W, angleAt, pointAlong, toWorld, type Pt } from '@/lib/quest/map';
import { PLACES, placePoint, type Place, type PlaceId } from '@/lib/quest/places';
import { ZONE_EXTRA } from '@/lib/quest/palette';

import { PixelCritter } from './pixel-critter';

/** Painted map pieces (D-076): an image placed by code on the real layout, in map units. Empty until the art arrives. */
export type MapPiece = { uri: string; x: number; y: number; w: number; h: number };
export const MAP_PIECES: MapPiece[] = [];

const w = (p: Pt) => toWorld(p);
const roadPath = (pts: Pt[], seed: number) => ink(pts.map((p) => [...w(p)] as [number, number]), 0.5, seed);

/** Is a point at least `gap` map units from every road? Used to keep trees off the roads. */
function clearOfRoads(p: Pt, gap: number): boolean {
  for (const road of ROADS) {
    const pts = road.points.map(w);
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const len = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / len));
      if (Math.hypot(ax + t * dx - p[0], ay + t * dy - p[1]) < gap) return false;
    }
  }
  return true;
}

function Landmarks() {
  const bridge = w([1172, 228]);
  const statue = w([955, 1080]);
  const school = w([1450, 1410]);
  const hill = w([150, 105]);
  const sign = w([548, 1960]);
  return (
    <G>
      {/* The Mighty Bridge. */}
      <Rect x={bridge[0] - 9} y={bridge[1] - 20} width={18} height={40} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1.4} rx={2} />
      <Path d={`M${bridge[0] - 9} ${bridge[1] - 17} q-6 17 0 34 M${bridge[0] + 9} ${bridge[1] - 17} q6 17 0 34`} fill="none" stroke={PAPER.ink} strokeWidth={1.8} strokeLinecap="round" />
      {/* The Triceratops sculpture: a small ink drawing, our own. */}
      <G transform={`translate(${statue[0]} ${statue[1]})`}>
        <Rect x={-16} y={8} width={32} height={6} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1} />
        <Path d="M-14 8 q2 -14 16 -14 q10 0 12 8 l6 -4 l-2 8 l4 2 l-6 2 l-2 -2 M-14 8 l0 -2 M-8 8 l0 -4 M8 8 l0 -4 M-14 -2 l-6 -2" fill="#b9c6cf" stroke={PAPER.ink} strokeWidth={1.1} strokeLinejoin="round" />
        <Path d="M10 -8 l3 -9 M14 -4 l6 -6" stroke={PAPER.ink} strokeWidth={1.2} strokeLinecap="round" />
        <Circle cx={-6} cy={-1} r={0.9} fill={PAPER.ink} />
        <Circle cx={0} cy={-3} r={0.9} fill={PAPER.ink} />
      </G>
      {/* The school: a little schoolhouse with a flag. A quiet landmark only. */}
      <G transform={`translate(${school[0]} ${school[1]})`}>
        <Rect x={-14} y={-6} width={28} height={16} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1.1} />
        <Path d="M-17 -6 L0 -17 L17 -6 Z" fill={PAPER.red} opacity={0.75} stroke={PAPER.ink} strokeWidth={1.1} strokeLinejoin="round" />
        <Rect x={-3} y={2} width={6} height={8} fill={PAPER.ink} opacity={0.8} />
        <Path d="M0 -17 l0 -9 l7 2.5 l-7 2.5" fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={0.9} />
      </G>
      {/* Lookout Hill, with a little tower (made up). */}
      <G transform={`translate(${hill[0]} ${hill[1]})`}>
        <Path d="M-40 18 q20 -30 40 -30 q20 0 40 30 Z" fill={PAPER.grass} opacity={0.75} stroke={PAPER.ink} strokeWidth={1.1} />
        <Path d="M-4 -12 l0 -16 l8 0 l0 16 M-7 -28 l14 0 l-7 -7 Z" fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1} />
        <Path d="M-26 10 l-2 3 M-20 6 l-2 3 M22 8 l2 3 M28 12 l2 3" stroke={PAPER.ink} strokeWidth={0.7} />
      </G>
      {/* "To the Big City" signpost. */}
      <G transform={`translate(${sign[0]} ${sign[1]})`}>
        <Path d="M0 12 L0 -14" stroke={PAPER.ink} strokeWidth={2} strokeLinecap="round" />
        <Path d="M-2 -14 l22 0 l6 5 l-6 5 l-22 0 Z" fill="#d9b98a" stroke={PAPER.ink} strokeWidth={1.1} strokeLinejoin="round" />
      </G>
    </G>
  );
}

function Edges() {
  const r = wobbler(77);
  const out: ReactNode[] = [];
  // The Frontier Lands: scrub forest to the east.
  for (let i = 0; i < 46; i++) {
    const x = 680 + r() * 40 + 40 + (i % 3) * 8;
    const y = 100 + i * 16 + r() * 6;
    if (y < WORLD_H - 40) out.push(<Shrub key={`f${i}`} x={x} y={y} />);
  }
  // The Roaring Wall: the highway at the far west, joked about as a wall of noise (not about who lives near it).
  const wall = `M22 40 L22 ${WORLD_H - 30}`;
  out.push(<Path key="wall" d={wall} stroke={PAPER.ink} strokeWidth={14} opacity={0.75} />);
  out.push(<Path key="wall2" d={wall} stroke={PAPER.paperLight} strokeWidth={10} strokeDasharray="10 8" />);
  for (let y = 70; y < WORLD_H - 40; y += 70) out.push(<Path key={`cone${y}`} d={`M34 ${y} l4 -10 l4 10 Z`} fill="#e8833a" stroke={PAPER.ink} strokeWidth={0.8} />);
  return <>{out}</>;
}

const Picture = memo(function Picture({ width, height }: { width: number; height: number }) {
  const trees = useMemo(() => {
    const r = wobbler(5);
    const list: Pt[] = [];
    for (let i = 0; list.length < 70 && i < 900; i++) {
      const p: Pt = [80 + ((r() + 1) / 2) * 590, 175 + ((r() + 1) / 2) * 640];
      if (clearOfRoads(p, 16) && list.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 26)) list.push(p);
    }
    return list;
  }, []);
  const creek = ink(CREEK.north.map((p) => [...w(p)] as [number, number]), 0.8, 3) + ' L' + ink([...CREEK.south].reverse().map((p) => [...w(p)] as [number, number]), 0.8, 4).slice(1) + 'Z';
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}>
      <Defs>
        <RadialGradient id="age" cx="50%" cy="48%" r="75%">
          <Stop offset="0.55" stopColor={PAPER.paper} stopOpacity={0} />
          <Stop offset="1" stopColor={PAPER.stain} stopOpacity={0.7} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={WORLD_W} height={WORLD_H} fill={PAPER.paper} />
      {/* Washes: green land, purple-gray far west, scrub east. */}
      <Rect x={60} y={150} width={600} height={700} fill={PAPER.grass} opacity={0.22} />
      <Rect x={0} y={0} width={56} height={WORLD_H} fill="#8f86a6" opacity={0.28} />
      <Rect x={664} y={0} width={WORLD_W - 664} height={WORLD_H} fill={PAPER.scrub} opacity={0.4} />

      {/* The creek. */}
      <Path d={creek} fill={PAPER.water} opacity={0.85} />
      <Path d={ink(CREEK.north.map((p) => [...w(p)] as [number, number]), 0.8, 3)} fill="none" stroke={PAPER.ink} strokeWidth={1.4} />
      <Path d={ink(CREEK.south.map((p) => [...w(p)] as [number, number]), 0.8, 4)} fill="none" stroke={PAPER.ink} strokeWidth={1.4} />

      {/* The garden site. */}
      <Path d={ink(GARDEN_OUTLINE.map((p) => [...w(p)] as [number, number]), 0.6, 31, true)} fill={PAPER.grass} opacity={0.85} stroke={PAPER.ink} strokeWidth={1.1} />

      {trees.map(([x, y]) => (
        <Tree key={`t${x.toFixed(0)}${y.toFixed(0)}`} x={x} y={y} s={1.2} />
      ))}
      <Edges />

      {/* Roads: ink first, then the pale middle, so crossings join up. Made-up paths are dashed. */}
      {ROADS.map((road, i) => (
        <Path key={`rc${road.id}`} d={roadPath(road.points, 20 + i)} fill="none" stroke={PAPER.ink} strokeWidth={road.madeUp ? 2 : 7} strokeDasharray={road.madeUp ? '6 5' : undefined} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {ROADS.filter((r) => !r.madeUp).map((road, i) => (
        <Path key={`rf${road.id}`} d={roadPath(road.points, 20 + ROADS.indexOf(road))} fill="none" stroke={PAPER.paperLight} strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {ROADS.filter((r) => r.culDeSac).map((road) => {
        const [x, y] = w(road.points[road.points.length - 1]);
        return <Circle key={`cul${road.id}`} cx={x} cy={y} r={5.5} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1.4} />;
      })}
      <Landmarks />

      {/* Compass rose. North is up. */}
      <G transform="translate(110 836)">
        <Circle r={17} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={0.9} opacity={0.9} />
        <Path d="M0 -22 l4 18 l-4 4 l-4 -4 Z M0 22 l4 -18 l-4 -4 l-4 4 Z M-22 0 l18 -4 l4 4 l-4 4 Z M22 0 l-18 -4 l-4 4 l4 4 Z" fill={PAPER.paper} stroke={PAPER.ink} strokeWidth={0.9} strokeLinejoin="round" />
        <Path d="M0 -22 l4 18 l-4 4 Z" fill={PAPER.red} opacity={0.85} />
      </G>
      <Rect x={4} y={4} width={WORLD_W - 8} height={WORLD_H - 8} fill="none" stroke={PAPER.ink} strokeWidth={2} />
      <Rect x={0} y={0} width={WORLD_W} height={WORLD_H} fill="url(#age)" />
    </Svg>
  );
});

/** Labels sit beside their place's button, on a pale patch, as real text. */
type Side = 'below' | 'above' | 'left' | 'right' | 'belowStart' | 'belowEnd';
const LABEL_SIDE: Record<PlaceId, Side> = {
  statue: 'below',
  creek: 'below',
  garden: 'below',
  bridge: 'below',
  lookout: 'below',
  signpost: 'right',
  school: 'below',
  frontier: 'belowEnd',
  shadowlands: 'belowStart',
};

/** Nudges (in screen points at the smallest zoom) so neighboring buttons never overlap. A thin line joins the button to its spot. */
const NUDGE: Partial<Record<PlaceId, Pt>> = { garden: [-20, 22], bridge: [26, -6], shadowlands: [16, 0], frontier: [-8, 0], lookout: [4, 4] };

/** Where a place's button sits on screen at a zoom, in points. Travel starts and ends here. */
export function markerPos(place: Place, scale: number): Pt {
  const [x, y] = placePoint(place);
  const n = scale < FIT_BELOW ? (NUDGE[place.id] ?? [0, 0]) : [0, 0];
  return [x * scale + n[0], y * scale + n[1]];
}

/** Below this zoom the buttons are nudged apart and street names are hidden. */
export const FIT_BELOW = 0.7;

export type MarkerInfo = { label: string; a11y: string };

const MARK = 48;

function Marker({ place, x, y, info, here, onPress, scale }: { place: Place; x: number; y: number; info: MarkerInfo; here: boolean; onPress: () => void; scale: number }) {
  const { fs } = useUI();
  const side = LABEL_SIDE[place.id];
  const spooky = place.kind === 'rescue';
  // The picture cannot reflow, so map labels grow only a little with the text-size setting. The list view has full-size text.
  const size = Math.round(Math.min(fs('small'), 16) * 0.9);
  const toEnd = side === 'left' || side === 'belowEnd';
  const toStart = side === 'right' || side === 'belowStart';
  const labelBox = { position: 'absolute' as const, width: 150, alignItems: toEnd ? ('flex-end' as const) : toStart ? ('flex-start' as const) : ('center' as const) };
  const labelPos = {
    below: { top: MARK - 2, left: MARK / 2 - 75 },
    above: { bottom: MARK - 2, left: MARK / 2 - 75 },
    right: { left: MARK + 2, top: MARK / 2 - size },
    left: { right: MARK + 2, top: MARK / 2 - size },
    belowStart: { top: MARK - 2, left: 0 },
    belowEnd: { top: MARK - 2, right: 0 },
  }[side];
  return (
    <View style={{ position: 'absolute', left: x - MARK / 2, top: y - MARK / 2, width: MARK, height: MARK }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={info.a11y}
        accessibilityState={{ selected: here }}
        onPress={onPress}
        hitSlop={4}
        style={({ pressed }) => ({
          width: MARK,
          height: MARK,
          borderRadius: MARK / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: spooky ? ZONE_EXTRA.spooky : PAPER.paperLight,
          borderWidth: here ? 4 : 2.5,
          borderColor: here ? ZONE_EXTRA.gold : PAPER.ink,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        })}>
        {place.host ? (
          <PixelCritter id={place.host} size={36} />
        ) : spooky ? (
          <Ghost color={ZONE_EXTRA.gold} size={28} />
        ) : (
          <Txt accessible={false} style={{ fontSize: 24, lineHeight: 30 }}>
            🏫
          </Txt>
        )}
      </Pressable>
      <View pointerEvents="none" style={[labelBox, labelPos]}>
        <Txt
          accessible={false}
          numberOfLines={2}
          style={{
            fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
            fontWeight: '700',
            fontSize: size,
            lineHeight: size * 1.2,
            color: spooky ? PAPER.red : PAPER.ink,
            backgroundColor: PAPER.patch,
            paddingHorizontal: 4,
            borderRadius: 3,
            textAlign: toEnd ? 'right' : toStart ? 'left' : 'center',
            maxWidth: 150,
          }}>
          {info.label}
        </Txt>
      </View>
      {void scale}
    </View>
  );
}

export type WorldMapProps = {
  /** Points per map unit. */
  scale: number;
  at: PlaceId;
  /** Hero token position while travelling, in map units. */
  token?: Pt;
  walking?: boolean;
  /** Animation clock in seconds, for the walking frames. */
  clock?: number;
  facingLeft?: boolean;
  info: Record<PlaceId, MarkerInfo>;
  onPlace: (id: PlaceId) => void;
  showRoadNames: boolean;
  /** Patterns on the map: critters drawn at the creek with how many were seen there. */
  creekCritters?: { ids: string[]; label: string };
  alt: string;
  notToScale: string;
  regionLabels: { frontier: string; shadow: string; title: string };
};

export function WorldMap(p: WorldMapProps) {
  const width = WORLD_W * p.scale;
  const height = WORLD_H * p.scale;
  const { fs } = useUI();
  const roadSize = Math.min(fs('small') * 0.72, 14);
  const fit = p.scale < FIT_BELOW;
  const pos = (place: Place): Pt => markerPos(place, p.scale);
  const here = PLACES.find((pl) => pl.id === p.at)!;
  const tokenAt: Pt = p.token ?? (() => {
    const [x, y] = pos(here);
    return [x / p.scale, y / p.scale] as Pt;
  })();
  const walk = frameOf('hero', p.walking ? 'walk' : 'idle', p.clock ?? 0);

  const region = (text: string, x: number, y: number, rotate = 0, color = PAPER.red) => (
    <View pointerEvents="none" style={{ position: 'absolute', left: x * p.scale - 100, top: y * p.scale - 12, width: 200, alignItems: 'center', transform: [{ rotate: `${rotate}deg` }] }}>
      <Txt accessible={false} style={{ color, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }), fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: Math.min(fs('small'), 17) * 0.9, backgroundColor: PAPER.patch, paddingHorizontal: 4, borderRadius: 3 }}>
        {text}
      </Txt>
    </View>
  );

  return (
    <View style={{ width, height, direction: 'ltr', overflow: 'hidden', borderRadius: 4 }}>
      <View accessible accessibilityRole="image" accessibilityLabel={p.alt} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Picture width={width} height={height} />
        {MAP_PIECES.map((piece, i) => (
          <Image key={i} source={{ uri: piece.uri }} accessibilityIgnoresInvertColors style={{ position: 'absolute', left: piece.x * p.scale, top: piece.y * p.scale, width: piece.w * p.scale, height: piece.h * p.scale }} />
        ))}
      </View>

      {/* Big region names, in red as on old maps. */}
      {region(p.regionLabels.frontier, 736, 250, 90)}
      {region(p.regionLabels.shadow, 40, 650, -90)}
      <View pointerEvents="none" style={{ position: 'absolute', left: 400 * p.scale - 110, top: 14 * p.scale, width: 220, alignItems: 'center' }}>
        <Txt accessible={false} style={{ color: PAPER.ink, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }), fontWeight: '700', fontSize: Math.min(fs('lead'), 22), backgroundColor: PAPER.patch, paddingHorizontal: 6, borderRadius: 4 }}>
          {p.regionLabels.title}
        </Txt>
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', right: 8, bottom: 6, maxWidth: '60%' }}>
        <Txt accessible={false} style={{ color: PAPER.ink, fontStyle: 'italic', fontSize: Math.min(fs('small'), 16) * 0.8, backgroundColor: PAPER.patch, paddingHorizontal: 4, textAlign: 'right' }}>
          {p.notToScale}
        </Txt>
      </View>

      {/* Street names: proper names, not translated. Shown when zoomed in. */}
      {p.showRoadNames
        ? ROADS.filter((r) => r.name).map((road) => {
            const pts = road.points.map(w);
            const [x, y] = pointAlong(pts, road.labelAt ?? 0.5);
            return (
              <View key={road.id} pointerEvents="none" style={{ position: 'absolute', left: x * p.scale - 80, top: y * p.scale - roadSize, width: 160, alignItems: 'center', transform: [{ rotate: `${angleAt(pts, road.labelAt ?? 0.5)}deg` }] }}>
                <Txt accessible={false} style={{ color: PAPER.ink, fontStyle: 'italic', fontSize: roadSize, lineHeight: roadSize * 1.25, backgroundColor: PAPER.patch, paddingHorizontal: 2, borderRadius: 2 }}>
                  {road.name}
                </Txt>
              </View>
            );
          })
        : null}

      {/* Thin lines from a nudged button to its real spot. */}
      {fit ? (
        <Svg pointerEvents="none" width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          {PLACES.filter((pl) => NUDGE[pl.id]).map((pl) => {
            const [rx, ry] = placePoint(pl);
            const [bx, by] = pos(pl);
            return <Path key={pl.id} d={`M${rx * p.scale} ${ry * p.scale} L${bx} ${by}`} stroke={PAPER.ink} strokeWidth={1.2} strokeDasharray="3 2" />;
          })}
        </Svg>
      ) : null}

      {/* Patterns: critters seen at the creek. */}
      {p.creekCritters && p.creekCritters.ids.length > 0
        ? (() => {
            const creek = PLACES.find((pl) => pl.id === 'creek')!;
            const [cx, cy] = pos(creek);
            return (
              <View pointerEvents="none" style={{ position: 'absolute', left: cx + 30, top: cy - 30, flexDirection: 'row', alignItems: 'center', backgroundColor: PAPER.patch, borderRadius: 6, borderWidth: 1.5, borderColor: PAPER.ink, padding: 2, gap: 2 }}>
                {p.creekCritters.ids.map((id) => (
                  <PixelCritter key={id} id={id} size={28} />
                ))}
                <Txt accessible={false} style={{ color: PAPER.ink, fontWeight: '700', fontSize: 13, paddingHorizontal: 2 }}>
                  {p.creekCritters.label}
                </Txt>
              </View>
            );
          })()
        : null}

      {PLACES.map((place) => {
        const [x, y] = pos(place);
        return <Marker key={place.id} place={place} x={x} y={y} info={p.info[place.id]} here={place.id === p.at && !p.walking} onPress={() => p.onPlace(place.id)} scale={p.scale} />;
      })}

      {/* The hero token: a made-up traveler, never the phone's location. */}
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', left: tokenAt[0] * p.scale - 26 + (p.walking ? 0 : -28), top: tokenAt[1] * p.scale - 53 + (p.walking ? 0 : -4) }}>
        <Sprite sheet="hero" frame={walk} look="thickShaded" scale={1} flip={p.facingLeft} />
      </View>
    </View>
  );
}

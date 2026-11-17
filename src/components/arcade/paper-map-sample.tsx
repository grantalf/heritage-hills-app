/**
 * One corner of the storybook map, to show the look (style brief, D-071).
 *
 * Drawn from the founder's hand sketch, not from map data. Not to scale and
 * not for finding your way. It shows roads, public places and made-up lands
 * only: no houses, lots, house numbers or pins.
 *
 * The picture is drawn in code. Every label is real text laid over it, so it
 * is sharp, follows the text-size setting, changes language and can be read
 * aloud. Block 3 builds the whole map; this file is only the style sample.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Txt, useUI } from '@/components/ui';
import { useT } from '@/lib/i18n';

const W = 360;
const H = 300;
/** Colors of the paper map. Label pairs are checked for contrast in tests/arcade-skins.test.ts. */
export const PAPER = { paper: '#ecdcb2', paperLight: '#f6ecd0', stain: '#c9a96a', ink: '#33261a', water: '#8cc3d8', waterDeep: '#5d9fbd', grass: '#a8cf86', scrub: '#c9c27a', red: '#9b2d1f', patch: 'rgba(246,236,208,0.88)' };

type Pt = [number, number];

/** A small repeatable wobble, so lines look inked by hand but never change between runs. */
function wobbler(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}

/** A smooth line through the points, each nudged a little. */
function ink(points: Pt[], wobble = 0.9, seed = 1, close = false): string {
  const r = wobbler(seed);
  const p = points.map(([x, y]) => [x + r() * wobble, y + r() * wobble] as Pt);
  const at = (i: number) => (close ? p[(i + p.length) % p.length] : p[Math.max(0, Math.min(p.length - 1, i))]);
  const n = close ? p.length : p.length - 1;
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  return close ? d + 'Z' : d;
}

const CREEK_TOP: Pt[] = [[44, 60], [90, 55], [140, 62], [195, 57], [250, 63], [305, 57], [346, 61]];
const CREEK_LOW: Pt[] = [[44, 87], [90, 83], [140, 90], [195, 84], [250, 91], [305, 85], [346, 89]];

const ROADS: Pt[][] = [
  // Hermitage Drive, bending south into Furness Drive.
  [[44, 128], [90, 124], [140, 128], [190, 123], [240, 122], [266, 126], [282, 140], [290, 170], [292, 205], [286, 245], [288, 284]],
  // The road that crosses the Mighty Bridge.
  [[238, 122], [240, 100], [239, 74], [241, 48], [239, 24]],
  // Durham Drive.
  [[176, 124], [190, 150], [216, 176], [250, 193], [291, 204]],
  // Danville Drive.
  [[250, 193], [258, 232], [254, 284]],
  // Loralinda Drive.
  [[112, 127], [117, 170], [111, 218], [115, 284]],
  // Weeping Willow Drive.
  [[114, 200], [160, 207], [212, 213], [257, 222]],
];

function Tree({ x, y, s = 1, wash = PAPER.grass }: { x: number; y: number; s?: number; wash?: string }) {
  return (
    <G>
      <Path d={`M${x} ${y} L${x} ${y - 5 * s}`} stroke={PAPER.ink} strokeWidth={1.1} strokeLinecap="round" />
      <Circle cx={x} cy={y - 9 * s} r={5.2 * s} fill={wash} opacity={0.85} />
      <Path d={ink([[x - 5 * s, y - 7 * s], [x - 4 * s, y - 12 * s], [x, y - 14.5 * s], [x + 4.5 * s, y - 12 * s], [x + 5 * s, y - 7 * s], [x, y - 4.5 * s]], 0.5, x * 7 + y, true)} fill="none" stroke={PAPER.ink} strokeWidth={0.9} />
      <Path d={`M${x - 1.5 * s} ${y - 9 * s} q${1.5 * s} ${1.5 * s} ${3 * s} 0`} fill="none" stroke={PAPER.ink} strokeWidth={0.6} />
    </G>
  );
}

function Shrub({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Ellipse cx={x} cy={y - 2.5} rx={5} ry={3.2} fill={PAPER.scrub} opacity={0.9} />
      <Path d={`M${x - 5} ${y} q1 -6 3.5 -3 q1.5 -5 3 0 q2.5 -3 3.5 3`} fill="none" stroke={PAPER.ink} strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}

/** The six critter groups, as small ink drawings in round badges. */
function Badge({ y, kind }: { y: number; kind: number }) {
  const x = 24;
  const glyphs = [
    // Paw: mammals.
    <G key="g">
      <Ellipse cx={x} cy={y + 2} rx={3.2} ry={2.6} fill={PAPER.ink} />
      {[-3.6, -1.2, 1.2, 3.6].map((dx) => (
        <Circle key={dx} cx={x + dx} cy={y - 2.4 - (Math.abs(dx) < 2 ? 1 : 0)} r={1.15} fill={PAPER.ink} />
      ))}
    </G>,
    // Bird.
    <Path key="g" d={`M${x - 5} ${y - 1} q2.5 -4 5 0 q2.5 -4 5 0 M${x} ${y - 1} l0 4`} fill="none" stroke={PAPER.ink} strokeWidth={1.3} strokeLinecap="round" />,
    // Lizard: reptiles.
    <Path key="g" d={`M${x - 5} ${y + 3} q3 -2 4 -3 q2 -3 5 -3 M${x - 2} ${y + 1} l-2 -3 M${x - 1} ${y} l1 3 M${x + 2} ${y - 2} l-1 -3 M${x + 2} ${y - 2} l2 2`} fill="none" stroke={PAPER.ink} strokeWidth={1.2} strokeLinecap="round" />,
    // Frog: amphibians.
    <G key="g">
      <Ellipse cx={x} cy={y + 1.5} rx={4.5} ry={3} fill="none" stroke={PAPER.ink} strokeWidth={1.2} />
      <Circle cx={x - 2.4} cy={y - 2.4} r={1.4} fill={PAPER.ink} />
      <Circle cx={x + 2.4} cy={y - 2.4} r={1.4} fill={PAPER.ink} />
    </G>,
    // Butterfly: insects.
    <Path key="g" d={`M${x} ${y - 3} l0 6 M${x} ${y} q-6 -7 -5 0 q-1 5 5 0 M${x} ${y} q6 -7 5 0 q1 5 -5 0`} fill="none" stroke={PAPER.ink} strokeWidth={1.1} strokeLinejoin="round" />,
    // Spider: the others.
    <G key="g">
      <Circle cx={x} cy={y} r={2.2} fill={PAPER.ink} />
      {[-1, 1].map((sx) => [-3, -1, 1, 3].map((dy) => <Path key={`${sx}${dy}`} d={`M${x} ${y} l${sx * 3} ${dy * 0.8} l${sx * 2} ${dy > 0 ? 2 : -2}`} fill="none" stroke={PAPER.ink} strokeWidth={0.8} />))}
    </G>,
  ];
  return (
    <G>
      <Circle cx={x} cy={y} r={10} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1.2} />
      <Circle cx={x} cy={y} r={8} fill="none" stroke={PAPER.ink} strokeWidth={0.5} />
      {glyphs[kind]}
    </G>
  );
}

function Leaves() {
  const r = wobbler(42);
  const leaf = (x: number, y: number, angle: number, key: string) => (
    <Path key={key} d="M0 0 q3 -4 7 0 q-4 4 -7 0" fill={PAPER.grass} stroke={PAPER.ink} strokeWidth={0.7} transform={`translate(${x} ${y}) rotate(${angle})`} />
  );
  const out: ReactNode[] = [];
  for (let x = 48; x < W - 14; x += 13) {
    out.push(leaf(x, 9 + r(), -35 + r() * 12, `t${x}`), leaf(x + 6, 11 + r(), 35 + r() * 12, `t2${x}`));
    out.push(leaf(x, H - 9 + r(), -35 + r() * 12, `b${x}`), leaf(x + 6, H - 7 + r(), 35 + r() * 12, `b2${x}`));
  }
  for (let y = 22; y < H - 14; y += 13) out.push(leaf(W - 9 + r(), y, 55 + r() * 12, `r${y}`), leaf(W - 9 + r(), y + 6, 125 + r() * 12, `r2${y}`));
  for (const y of [16, 36, 232, 252, 272]) out.push(leaf(18, y, -40, `l${y}`), leaf(24, y + 7, 40, `l2${y}`));
  return <>{out}</>;
}

function Picture() {
  const creek = ink(CREEK_TOP, 0.8, 3) + ' L' + ink([...CREEK_LOW].reverse(), 0.8, 4).slice(1) + 'Z';
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <RadialGradient id="age" cx="50%" cy="46%" r="72%">
          <Stop offset="0.55" stopColor={PAPER.paper} stopOpacity={0} />
          <Stop offset="1" stopColor={PAPER.stain} stopOpacity={0.75} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={PAPER.paper} />
      {/* Stains of age. */}
      <Ellipse cx={95} cy={215} rx={46} ry={30} fill={PAPER.stain} opacity={0.13} />
      <Ellipse cx={300} cy={110} rx={38} ry={50} fill={PAPER.stain} opacity={0.12} />
      <Ellipse cx={205} cy={262} rx={30} ry={16} fill={PAPER.stain} opacity={0.12} />

      {/* Light watercolor washes: green land, scrubby east. */}
      <Path d={ink([[52, 100], [150, 96], [232, 100], [228, 118], [150, 120], [52, 122]], 2, 9, true)} fill={PAPER.grass} opacity={0.35} />
      <Path d={ink([[125, 138], [170, 134], [205, 180], [240, 200], [245, 276], [125, 278]], 2.5, 10, true)} fill={PAPER.grass} opacity={0.3} />
      <Path d={ink([[52, 138], [104, 136], [104, 278], [52, 278]], 2.5, 11, true)} fill={PAPER.grass} opacity={0.3} />
      <Path d={ink([[50, 22], [228, 22], [228, 50], [50, 50]], 2, 12, true)} fill={PAPER.grass} opacity={0.3} />
      <Path d={ink([[300, 96], [346, 92], [346, 286], [298, 286], [302, 200]], 2.5, 13, true)} fill={PAPER.scrub} opacity={0.45} />

      {/* The creek: two washes that do not quite line up, then ink banks. */}
      <Path d={creek} fill={PAPER.water} opacity={0.8} />
      <Path d={creek} fill={PAPER.waterDeep} opacity={0.22} transform="translate(2 2)" />
      <Path d={ink(CREEK_TOP, 0.8, 3)} fill="none" stroke={PAPER.ink} strokeWidth={1.3} strokeLinecap="round" />
      <Path d={ink(CREEK_LOW, 0.8, 4)} fill="none" stroke={PAPER.ink} strokeWidth={1.3} strokeLinecap="round" />
      {[[66, 72], [118, 76], [170, 70], [212, 76], [272, 78], [322, 71]].map(([x, y]) => (
        <Path key={`w${x}`} d={`M${x} ${y} q3 -3 6 0 q3 3 6 0`} fill="none" stroke={PAPER.ink} strokeWidth={0.8} strokeLinecap="round" opacity={0.75} />
      ))}
      {/* Sparse hatching on the banks. */}
      {[[60, 90], [104, 88], [150, 93], [300, 90], [84, 53], [160, 55], [290, 54]].map(([x, y]) => (
        <Path key={`h${x}`} d={`M${x} ${y} l-2 3 M${x + 3} ${y} l-2 3 M${x + 6} ${y} l-2 3`} stroke={PAPER.ink} strokeWidth={0.6} opacity={0.7} />
      ))}

      {/* Roads: ink first, then the pale middle, so crossings join up. */}
      {ROADS.map((road, i) => (
        <Path key={`rc${i}`} d={ink(road, 0.7, 20 + i)} fill="none" stroke={PAPER.ink} strokeWidth={6.4} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {ROADS.map((road, i) => (
        <Path key={`rf${i}`} d={ink(road, 0.7, 20 + i)} fill="none" stroke={PAPER.paperLight} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* The Mighty Bridge: stone arch with two rails. */}
      <Rect x={231} y={57} width={18} height={34} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1.2} rx={2} />
      <Path d="M231 60 q-5 14 0 28 M249 60 q5 14 0 28" fill="none" stroke={PAPER.ink} strokeWidth={1.6} strokeLinecap="round" />
      {[64, 70, 76, 82].map((y) => (
        <Path key={`p${y}`} d={`M231 ${y} l18 0`} stroke={PAPER.ink} strokeWidth={0.6} opacity={0.8} />
      ))}

      {/* The garden site: beds and a sprout. */}
      <Path d={ink([[152, 97], [190, 94], [228, 97], [229, 114], [190, 117], [153, 115]], 1, 31, true)} fill={PAPER.grass} opacity={0.75} stroke={PAPER.ink} strokeWidth={1.1} />
      {[204, 213, 222].map((x) => (
        <G key={`bed${x}`}>
          <Rect x={x - 3} y={100} width={6} height={12} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={0.7} />
          <Path d={`M${x - 3} 103 l6 0 M${x - 3} 106 l6 0 M${x - 3} 109 l6 0`} stroke={PAPER.ink} strokeWidth={0.5} />
        </G>
      ))}

      {/* Small drawings: trees along the creek and between the roads. */}
      {[[62, 44], [84, 38], [130, 46], [176, 40], [208, 46], [274, 44], [302, 40], [328, 46]].map(([x, y]) => (
        <Tree key={`n${x}`} x={x} y={y} />
      ))}
      {[[66, 162, 1.1], [86, 226, 1], [60, 196, 0.9], [150, 164, 1.1], [168, 250, 1], [142, 236, 0.9], [214, 252, 1], [226, 150, 0.9], [258, 160, 1], [196, 236, 0.9]].map(([x, y, s]) => (
        <Tree key={`s${x}`} x={x} y={y} s={s} />
      ))}
      {[[312, 112], [332, 130], [316, 150], [336, 168], [314, 196], [334, 212], [312, 228], [336, 236]].map(([x, y]) => (
        <Shrub key={`f${x}${y}`} x={x} y={y} />
      ))}
      {/* A small armadillo in the Frontier Lands. */}
      <G>
        <Ellipse cx={322} cy={268} rx={8} ry={4.6} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1} />
        <Path d="M317 264 l0 8 M320 263.5 l0 9 M323 263.5 l0 9 M326 264 l0 8" stroke={PAPER.ink} strokeWidth={0.6} />
        <Path d="M330 268 q4 -1 6 1.5 q-3 1.5 -6 0.5 M314 269 q-4 1 -6 3 M317 272 l0 2.5 M327 272 l0 2.5 M331 265 l1 -2.5" fill="none" stroke={PAPER.ink} strokeWidth={0.9} strokeLinecap="round" />
      </G>

      {/* Compass rose. North is up. */}
      <G>
        <Circle cx={74} cy={256} r={15} fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={0.9} opacity={0.9} />
        <Path d="M74 236 l4 16 l-4 4 l-4 -4 Z M74 276 l4 -16 l-4 -4 l-4 4 Z M54 256 l16 -4 l4 4 l-4 4 Z M94 256 l-16 -4 l-4 4 l4 4 Z" fill={PAPER.paper} stroke={PAPER.ink} strokeWidth={0.9} strokeLinejoin="round" />
        <Path d="M74 236 l4 16 l-4 4 Z M74 276 l-4 -16 l4 -4 Z" fill={PAPER.red} opacity={0.85} />
      </G>

      {/* Title scroll. */}
      <G>
        <Path d="M56 21 q-7 2 -6 9.5 q1 8 8 8 l108 0 q7 0 8 -8 q1 -7.5 -6 -9.5 Z" fill={PAPER.paperLight} stroke={PAPER.ink} strokeWidth={1.2} />
        <Path d="M56 21 q5 3 2 9 M168 21 q-5 3 -2 9" fill="none" stroke={PAPER.ink} strokeWidth={0.9} />
      </G>

      {/* Leafy border with the badge column. */}
      <Rect x={5} y={5} width={W - 10} height={H - 10} fill="none" stroke={PAPER.ink} strokeWidth={1.6} />
      <Rect x={41} y={14} width={W - 55} height={H - 28} fill="none" stroke={PAPER.ink} strokeWidth={0.8} />
      <Leaves />
      {[62, 92, 122, 152, 182, 212].map((y, i) => (
        <Badge key={`b${y}`} y={y} kind={i} />
      ))}
      <Rect x={0} y={0} width={W} height={H} fill="url(#age)" />
    </Svg>
  );
}

type LabelKind = 'title' | 'region' | 'place' | 'road';

function Label({ x, y, rotate = 0, kind, children }: { x: number; y: number; rotate?: number; kind: LabelKind; children: string }) {
  const { scale } = useUI();
  const color = kind === 'region' ? PAPER.red : PAPER.ink;
  const size = (kind === 'road' ? 10.5 : kind === 'title' ? 14 : 11.5) * scale;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, width: 0, height: 0, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 220, alignItems: 'center', transform: [{ rotate: `${rotate}deg` }] }}>
        <Txt
          variant={kind === 'title' ? 'label' : 'small'}
          numberOfLines={1}
          style={{
            color,
            fontFamily: 'Georgia',
            fontStyle: kind === 'road' || kind === 'place' ? 'italic' : 'normal',
            fontWeight: kind === 'region' || kind === 'title' ? '700' : '400',
            letterSpacing: kind === 'region' ? 1.2 : 0,
            textTransform: kind === 'region' ? 'uppercase' : 'none',
            fontSize: size,
            lineHeight: size * 1.3,
            backgroundColor: kind === 'title' ? 'transparent' : PAPER.patch,
            paddingHorizontal: 3,
            borderRadius: 3,
            textAlign: 'center',
          }}>
          {children}
        </Txt>
      </View>
    </View>
  );
}

export function PaperMapSample() {
  const { t } = useT();
  return (
    <View style={{ width: '100%', aspectRatio: W / H, direction: 'ltr', borderRadius: 6, overflow: 'hidden' }}>
      <View accessible accessibilityRole="image" accessibilityLabel={t('papermap.alt')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Picture />
      </View>
      {/* Road names are proper names, so they are not translated. */}
      <Label x={74} y={232} kind="road">N</Label>
      <Label x={112} y={30} kind="title">{t('papermap.mapTitle')}</Label>
      <Label x={118} y={73} kind="place">{t('papermap.creek')}</Label>
      <Label x={292} y={73} kind="place">{t('papermap.bridge')}</Label>
      <Label x={176} y={106} kind="place">{t('papermap.garden')}</Label>
      <Label x={84} y={115} kind="road">Hermitage Drive</Label>
      <Label x={214} y={164} rotate={36} kind="road">Durham Drive</Label>
      <Label x={184} y={199} rotate={6} kind="road">Weeping Willow Drive</Label>
      <Label x={125} y={248} rotate={90} kind="road">Loralinda Drive</Label>
      <Label x={243} y={252} rotate={90} kind="road">Danville Drive</Label>
      <Label x={277} y={176} rotate={86} kind="road">Furness Drive</Label>
      <Label x={328} y={158} rotate={90} kind="region">{t('papermap.frontier')}</Label>
      <Label x={300} y={249} kind="place">{t('papermap.armadillos')}</Label>
    </View>
  );
}

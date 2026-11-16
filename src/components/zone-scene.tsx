/**
 * Small drawings of the six kinds of places in the neighborhood.
 * They are pictures of a kind of place, not a map of real streets or homes.
 */
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';

import type { Zone } from '@/lib/data/game-types';

const SKY = '#CDE8F7';
const GRASS = '#8CC77A';
const DARK = '#2B2B2B';

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <>
      <Rect x={x - 4 * s} y={y - 30 * s} width={8 * s} height={30 * s} fill="#8B5A2B" />
      <Circle cx={x} cy={y - 42 * s} r={22 * s} fill="#4E9A4A" />
      <Circle cx={x - 14 * s} cy={y - 32 * s} r={14 * s} fill="#5DAA57" />
      <Circle cx={x + 14 * s} cy={y - 32 * s} r={14 * s} fill="#5DAA57" />
    </>
  );
}

function House({ x, color }: { x: number; color: string }) {
  return (
    <>
      <Rect x={x} y={62} width={70} height={48} fill={color} />
      <Polygon points={`${x - 8},64 ${x + 35},32 ${x + 78},64`} fill="#A0522D" />
      <Rect x={x + 28} y={82} width={16} height={28} fill="#6B4423" />
      <Rect x={x + 8} y={74} width={14} height={14} fill="#FFF3B0" />
      <Rect x={x + 50} y={74} width={14} height={14} fill="#FFF3B0" />
    </>
  );
}

export function ZoneScene({ zone, height = 120 }: { zone: Zone; height?: number }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      {zone === 'sky' ? (
        <>
          <Rect width={320} height={140} fill="#27335C" />
          <Rect y={90} width={320} height={50} fill="#F2A65A" opacity={0.55} />
          <Circle cx={250} cy={36} r={18} fill="#FFF3B0" />
          {[30, 80, 130, 180, 60, 210, 290].map((x, i) => (
            <Circle key={i} cx={x} cy={18 + ((i * 23) % 50)} r={2} fill="#FFFFFF" />
          ))}
          <Path d="M0 140 L0 112 L30 112 L50 96 L70 112 L120 112 L120 100 L160 100 L160 112 L210 112 L232 94 L254 112 L320 112 L320 140 Z" fill="#141A33" />
          <Path d="M96 52 q6 -8 12 0 q6 -8 12 0 M150 70 q5 -7 10 0 q5 -7 10 0" stroke={DARK} strokeWidth={2.5} fill="none" />
        </>
      ) : (
        <Rect width={320} height={140} fill={SKY} />
      )}
      {zone === 'yard' ? (
        <>
          <Rect y={104} width={320} height={36} fill={GRASS} />
          <House x={40} color="#F4E1C1" />
          <House x={190} color="#DCE6F2" />
          {Array.from({ length: 9 }, (_, i) => (
            <Rect key={i} x={126 + i * 7} y={90} width={4} height={20} fill="#FFFFFF" stroke="#B9B9B9" strokeWidth={0.6} />
          ))}
          <Tree x={150} y={108} s={0.7} />
        </>
      ) : null}
      {zone === 'garden' ? (
        <>
          <Rect y={96} width={320} height={44} fill={GRASS} />
          <Circle cx={278} cy={30} r={16} fill="#FFD95A" />
          {[24, 124, 224].map((x) => (
            <Rect key={x} x={x} y={92} width={76} height={26} fill="#A9713F" stroke="#7A4E28" strokeWidth={2} />
          ))}
          {[36, 58, 80, 136, 158, 180, 236, 258, 280].map((x, i) => (
            <Path key={x} d={`M${x} 92 q-8 -14 0 -24 q8 10 0 24`} fill={i % 3 === 1 ? '#E0527A' : '#3F9A4A'} />
          ))}
          <Rect x={0} y={118} width={320} height={6} fill="#D9C7A3" />
        </>
      ) : null}
      {zone === 'street' ? (
        <>
          <Rect y={92} width={320} height={10} fill="#D5D5D5" />
          <Rect y={102} width={320} height={38} fill="#6E6E6E" />
          {[20, 100, 180, 260].map((x) => (
            <Rect key={x} x={x} y={119} width={40} height={4} fill="#F5D547" />
          ))}
          <Tree x={60} y={94} />
          <Tree x={170} y={94} s={1.1} />
          <Rect x={262} y={36} width={4} height={58} fill="#555555" />
          <Circle cx={264} cy={34} r={7} fill="#FFF3B0" stroke="#555555" strokeWidth={2} />
        </>
      ) : null}
      {zone === 'park' ? (
        <>
          <Ellipse cx={160} cy={150} rx={240} ry={64} fill={GRASS} />
          <Tree x={84} y={104} s={1.25} />
          <Tree x={258} y={98} s={0.8} />
          <Rect x={150} y={96} width={54} height={5} fill="#8B5A2B" />
          <Rect x={150} y={84} width={54} height={4} fill="#8B5A2B" />
          <Rect x={154} y={96} width={4} height={14} fill="#6B4423" />
          <Rect x={196} y={96} width={4} height={14} fill="#6B4423" />
        </>
      ) : null}
      {zone === 'creek' ? (
        <>
          <Rect y={78} width={320} height={62} fill={GRASS} />
          <Path d="M-10 96 C60 76 110 126 180 104 S290 84 330 108 L330 140 L-10 140 Z" fill="#5BA8D9" />
          <Path d="M20 116 q14 -6 28 0 M120 126 q14 -6 28 0 M220 114 q14 -6 28 0" stroke="#CFEAF8" strokeWidth={2.5} fill="none" />
          <Ellipse cx={96} cy={112} rx={12} ry={6} fill="#9A9A9A" />
          <Ellipse cx={206} cy={124} rx={15} ry={7} fill="#8A8A8A" />
          {[250, 262, 274].map((x) => (
            <Path key={x} d={`M${x} 92 q-3 -22 2 -38`} stroke="#3F7A3A" strokeWidth={3} fill="none" />
          ))}
          <Tree x={40} y={84} s={0.8} />
        </>
      ) : null}
    </Svg>
  );
}

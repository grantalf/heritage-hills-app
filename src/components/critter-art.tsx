/**
 * Original cartoon characters for the field guide and pet pages.
 *
 * Every character is drawn from a short list of traits (colors, ears, tail,
 * wings...), so the whole set looks like one family and a pet's family can
 * build their pet's character by picking traits. No photo is uploaded and no
 * outside service is used.
 */
import Svg, { Circle, Ellipse, G, Line, Path, Polygon } from 'react-native-svg';

export type ArtSpec = {
  plan?: 'chibi' | 'serpent';
  base: string;
  belly?: string;
  ears?: 'round' | 'pointy' | 'long' | 'floppy' | 'tuft';
  earInner?: string;
  mask?: string;
  stripe?: string;
  crest?: string;
  beak?: 'short' | 'long' | 'hook';
  beakColor?: string;
  wings?: 'bird' | 'bat' | 'butterfly' | 'insect' | 'double';
  wingColor?: string;
  wingSpots?: string;
  shell?: 'dome' | 'spiral' | 'banded';
  /** A long pointed snout, for animals that root in the soil. */
  snout?: boolean;
  shellColor?: string;
  legs?: 0 | 4 | 6 | 8;
  antennae?: boolean;
  whiskers?: boolean;
  tail?: 'bushy' | 'ringed' | 'thin' | 'long' | 'puff' | 'scorpion';
  tailColor?: string;
  spots?: string;
  cheeks?: string;
  eyes?: 'front' | 'top' | 'many';
  eyeColor?: string;
  stripes?: string;
  pincers?: boolean;
  glow?: boolean;
  bands?: string[];
};

const INK = '#2B2B2B';
const LINE = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const MIRROR = 'translate(120 0) scale(-1 1)';

/** Draws the left-hand part and its mirror image. */
function Both({ children }: { children: React.ReactNode }) {
  return (
    <>
      <G>{children}</G>
      <G transform={MIRROR}>{children}</G>
    </>
  );
}

function Eye({ x, y, r, color }: { x: number; y: number; r: number; color?: string }) {
  return (
    <>
      <Circle cx={x} cy={y} r={r} fill={color ?? '#FFFFFF'} {...LINE} strokeWidth={2} />
      <Circle cx={x + 1} cy={y + 1} r={r * 0.55} fill={INK} />
      <Circle cx={x - r * 0.2} cy={y - r * 0.3} r={r * 0.22} fill="#FFFFFF" />
    </>
  );
}

function Serpent({ spec }: { spec: ArtSpec }) {
  const bands = spec.bands?.length ? spec.bands : [spec.base];
  const coils = [
    { cy: 98, rx: 42, ry: 13 },
    { cy: 84, rx: 32, ry: 12 },
    { cy: 71, rx: 22, ry: 10 },
  ];
  return (
    <>
      {coils.map((coil, i) => (
        <G key={i}>
          <Ellipse cx={60} cy={coil.cy} rx={coil.rx} ry={coil.ry} fill={bands[i % bands.length]} {...LINE} />
          {bands.length > 1
            ? [-0.6, -0.2, 0.2, 0.6].map((f, j) => (
                <Ellipse key={j} cx={60 + f * coil.rx} cy={coil.cy} rx={coil.rx * 0.09} ry={coil.ry * (1 - Math.abs(f) * 0.45)} fill={bands[(i + j + 1) % bands.length]} />
              ))
            : null}
        </G>
      ))}
      <Path d="M60 60 L60 70 M60 70 L55 76 M60 70 L65 76" stroke="#D62828" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Ellipse cx={60} cy={44} rx={22} ry={19} fill={bands[bands.length > 1 ? 2 % bands.length : 0]} {...LINE} />
      {spec.belly ? <Ellipse cx={60} cy={52} rx={12} ry={7} fill={spec.belly} /> : null}
      <Eye x={50} y={40} r={7} color={spec.eyeColor} />
      <Eye x={70} y={40} r={7} color={spec.eyeColor} />
      <Path d="M54 54 Q60 58 66 54" {...LINE} strokeWidth={2} fill="none" />
    </>
  );
}

function Chibi({ spec }: { spec: ArtSpec }) {
  const legs = spec.legs ?? 4;
  const eyes = spec.eyes ?? 'front';
  const tailColor = spec.tailColor ?? spec.base;
  const wingColor = spec.wingColor ?? spec.base;
  return (
    <>
      {/* Behind the body */}
      {spec.wings === 'butterfly' ? (
        <Both>
          <Ellipse cx={27} cy={50} rx={25} ry={27} fill={wingColor} {...LINE} />
          <Ellipse cx={32} cy={90} rx={19} ry={18} fill={wingColor} {...LINE} />
          {spec.wingSpots ? (
            <>
              <Circle cx={18} cy={42} r={5} fill={spec.wingSpots} />
              <Circle cx={30} cy={62} r={4} fill={spec.wingSpots} />
              <Circle cx={28} cy={94} r={4} fill={spec.wingSpots} />
            </>
          ) : null}
        </Both>
      ) : null}
      {spec.wings === 'bat' ? (
        <Both>
          <Path d="M36 62 L4 40 L8 66 L15 60 L18 80 L26 72 L32 90 Z" fill={wingColor} {...LINE} />
        </Both>
      ) : null}
      {spec.wings === 'insect' || spec.wings === 'double' ? (
        <Both>
          <Ellipse cx={24} cy={52} rx={22} ry={10} fill="#FFFFFF" opacity={0.85} {...LINE} strokeWidth={2} transform="rotate(-24 24 52)" />
          {spec.wings === 'double' ? <Ellipse cx={24} cy={74} rx={20} ry={8} fill="#FFFFFF" opacity={0.85} {...LINE} strokeWidth={2} transform="rotate(14 24 74)" /> : null}
        </Both>
      ) : null}
      {spec.shell === 'dome' ? (
        <>
          <Ellipse cx={60} cy={86} rx={46} ry={28} fill={spec.shellColor ?? spec.base} {...LINE} />
          <Path d="M30 74 Q60 62 90 74 M22 90 Q60 78 98 90 M44 66 L40 108 M76 66 L80 108" {...LINE} strokeWidth={1.8} fill="none" opacity={0.6} />
        </>
      ) : null}
      {spec.shell === 'banded' ? (
        <>
          <Ellipse cx={60} cy={88} rx={50} ry={27} fill={spec.shellColor ?? spec.base} {...LINE} />
          <Both>
            <Path d="M17 80 Q13 90 18 100 M25 70 Q19 90 26 107 M34 65 Q28 90 35 112" {...LINE} strokeWidth={2} fill="none" opacity={0.75} />
          </Both>
        </>
      ) : null}
      {spec.shell === 'spiral' ? (
        <>
          <Circle cx={86} cy={82} r={26} fill={spec.shellColor ?? spec.base} {...LINE} />
          <Path d="M86 82 m-4 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -18 0 a15 15 0 1 1 30 0" {...LINE} strokeWidth={2} fill="none" opacity={0.7} />
        </>
      ) : null}
      {spec.tail === 'bushy' || spec.tail === 'ringed' ? (
        <>
          <Ellipse cx={96} cy={88} rx={13} ry={22} fill={tailColor} {...LINE} transform="rotate(24 96 88)" />
          {spec.tail === 'ringed' ? <Path d="M88 74 Q98 70 106 78 M86 90 Q98 86 108 94" stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none" /> : null}
        </>
      ) : null}
      {spec.tail === 'thin' ? <Path d="M78 102 Q104 108 104 82" stroke={tailColor} strokeWidth={5} strokeLinecap="round" fill="none" /> : null}
      {spec.tail === 'long' ? (
        <>
          <Path d="M76 100 Q114 112 108 70" stroke={INK} strokeWidth={12} strokeLinecap="round" fill="none" />
          <Path d="M76 100 Q114 112 108 70" stroke={tailColor} strokeWidth={8} strokeLinecap="round" fill="none" />
        </>
      ) : null}
      {spec.tail === 'puff' ? <Circle cx={90} cy={102} r={9} fill="#FFFFFF" {...LINE} /> : null}
      {spec.tail === 'scorpion' ? (
        <>
          <Path d="M82 98 Q112 96 106 62 Q102 44 86 50" stroke={INK} strokeWidth={11} strokeLinecap="round" fill="none" />
          <Path d="M82 98 Q112 96 106 62 Q102 44 86 50" stroke={tailColor} strokeWidth={7} strokeLinecap="round" fill="none" />
          <Polygon points="86,44 78,52 88,56" fill={INK} />
        </>
      ) : null}
      {legs === 6 || legs === 8 ? (
        <Both>
          {Array.from({ length: legs / 2 }, (_, i) => (
            <Line key={i} x1={42} y1={88 + i * 5} x2={16} y2={76 + i * 12} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          ))}
        </Both>
      ) : null}
      {spec.pincers ? (
        <Both>
          <Line x1={38} y1={82} x2={20} y2={70} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Path d="M20 70 a11 11 0 1 1 -2 -14 l-7 6 z" fill={spec.base} {...LINE} />
        </Both>
      ) : null}
      {spec.wings === 'bird' ? (
        <Both>
          <Ellipse cx={30} cy={88} rx={11} ry={19} fill={wingColor} {...LINE} transform="rotate(18 30 88)" />
        </Both>
      ) : null}

      {/* Body and feet */}
      {legs === 4 ? (
        <Both>
          <Ellipse cx={47} cy={111} rx={9} ry={5} fill={spec.base} {...LINE} />
        </Both>
      ) : null}
      <Ellipse cx={60} cy={95} rx={24} ry={17} fill={spec.base} {...LINE} />
      {spec.stripes ? <Path d="M40 90 Q60 96 80 90 M42 100 Q60 106 78 100" stroke={spec.stripes} strokeWidth={5} strokeLinecap="round" fill="none" /> : null}
      {spec.glow ? (
        <>
          <Circle cx={60} cy={104} r={18} fill="#FFF27A" opacity={0.45} />
          <Circle cx={60} cy={104} r={10} fill="#FFE94D" {...LINE} strokeWidth={2} />
        </>
      ) : null}

      {/* Ears and top of head */}
      {spec.ears === 'round' ? (
        <Both>
          <Circle cx={33} cy={30} r={12} fill={spec.base} {...LINE} />
          <Circle cx={33} cy={30} r={6} fill={spec.earInner ?? '#F4B6B6'} />
        </Both>
      ) : null}
      {spec.ears === 'pointy' ? (
        <Both>
          <Polygon points="28,40 33,6 54,26" fill={spec.base} {...LINE} />
          <Polygon points="34,32 36,16 46,27" fill={spec.earInner ?? '#F4B6B6'} />
        </Both>
      ) : null}
      {spec.ears === 'long' ? (
        <Both>
          <Ellipse cx={44} cy={15} rx={8} ry={22} fill={spec.base} {...LINE} transform="rotate(-10 44 15)" />
          <Ellipse cx={44} cy={17} rx={3.5} ry={14} fill={spec.earInner ?? '#F4B6B6'} transform="rotate(-10 44 17)" />
        </Both>
      ) : null}
      {spec.ears === 'tuft' ? (
        <Both>
          <Polygon points="34,34 30,10 50,24" fill={spec.base} {...LINE} />
        </Both>
      ) : null}
      {spec.crest ? <Polygon points="50,28 58,2 72,26" fill={spec.crest} {...LINE} /> : null}
      {spec.antennae ? (
        <Both>
          <Path d="M52 28 Q46 12 38 8" {...LINE} fill="none" />
          <Circle cx={38} cy={8} r={3.5} fill={INK} />
        </Both>
      ) : null}
      {eyes === 'top' ? (
        <Both>
          <Circle cx={42} cy={30} r={13} fill={spec.base} {...LINE} />
        </Both>
      ) : null}

      {/* Head */}
      <Circle cx={60} cy={56} r={34} fill={spec.base} {...LINE} />
      {spec.ears === 'floppy' ? (
        <Both>
          <Ellipse cx={27} cy={56} rx={10} ry={22} fill={spec.earInner ?? spec.base} {...LINE} transform="rotate(8 27 56)" />
        </Both>
      ) : null}
      {spec.stripe ? <Ellipse cx={60} cy={36} rx={7} ry={15} fill={spec.stripe} /> : null}
      {spec.spots ? (
        <>
          <Circle cx={44} cy={34} r={4.5} fill={spec.spots} />
          <Circle cx={62} cy={28} r={3.5} fill={spec.spots} />
          <Circle cx={78} cy={36} r={4.5} fill={spec.spots} />
          <Circle cx={52} cy={98} r={3.5} fill={spec.spots} />
          <Circle cx={68} cy={94} r={3.5} fill={spec.spots} />
        </>
      ) : null}
      {spec.mask ? (
        <Both>
          <Ellipse cx={46} cy={56} rx={15} ry={11} fill={spec.mask} />
        </Both>
      ) : null}
      {spec.belly ? <Ellipse cx={60} cy={72} rx={17} ry={12} fill={spec.belly} /> : null}
      {spec.cheeks ? (
        <Both>
          <Ellipse cx={33} cy={66} rx={6} ry={4} fill={spec.cheeks} />
        </Both>
      ) : null}

      {/* Face */}
      {eyes === 'front' ? (
        <>
          <Eye x={46} y={56} r={9} color={spec.eyeColor} />
          <Eye x={74} y={56} r={9} color={spec.eyeColor} />
        </>
      ) : null}
      {eyes === 'top' ? (
        <>
          <Eye x={42} y={30} r={9} color={spec.eyeColor} />
          <Eye x={78} y={30} r={9} color={spec.eyeColor} />
        </>
      ) : null}
      {eyes === 'many' ? (
        <>
          <Eye x={46} y={58} r={9} color={spec.eyeColor} />
          <Eye x={74} y={58} r={9} color={spec.eyeColor} />
          <Circle cx={36} cy={42} r={3.5} fill={INK} />
          <Circle cx={52} cy={38} r={3.5} fill={INK} />
          <Circle cx={68} cy={38} r={3.5} fill={INK} />
          <Circle cx={84} cy={42} r={3.5} fill={INK} />
        </>
      ) : null}
      {spec.beak === 'short' ? <Polygon points="51,66 69,66 60,79" fill={spec.beakColor ?? '#F2A33A'} {...LINE} /> : null}
      {spec.beak === 'hook' ? <Path d="M51 65 L69 65 Q66 80 57 80 Q62 74 51 65 Z" fill={spec.beakColor ?? '#F2A33A'} {...LINE} /> : null}
      {spec.beak === 'long' ? <Polygon points="54,66 66,66 60,104" fill={spec.beakColor ?? '#F2A33A'} {...LINE} /> : null}
      {!spec.beak && eyes === 'top' ? <Path d="M38 66 Q60 84 82 66" {...LINE} fill="none" /> : null}
      {spec.snout ? (
        <>
          <Path d="M49 62 Q60 58 71 62 Q69 84 60 88 Q51 84 49 62 Z" fill={spec.belly ?? spec.base} {...LINE} strokeWidth={2} />
          <Ellipse cx={60} cy={84} rx={4} ry={3} fill={INK} />
        </>
      ) : null}
      {!spec.beak && !spec.snout && eyes !== 'top' ? (
        <>
          {legs === 4 || legs === 0 ? <Ellipse cx={60} cy={67} rx={4.5} ry={3.2} fill={INK} /> : null}
          <Path d="M53 73 Q60 79 67 73" {...LINE} strokeWidth={2} fill="none" />
        </>
      ) : null}
      {spec.whiskers ? (
        <Both>
          <Path d="M40 68 L20 64 M40 72 L20 76" stroke={INK} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        </Both>
      ) : null}
    </>
  );
}

export function CritterArt({ spec, size = 96, dim }: { spec: ArtSpec; size?: number; dim?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" opacity={dim ? 0.28 : 1} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      {spec.plan === 'serpent' ? <Serpent spec={spec} /> : <Chibi spec={spec} />}
    </Svg>
  );
}

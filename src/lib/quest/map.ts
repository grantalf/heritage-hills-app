/**
 * The storybook map's layout: roads, the creek and the edges of the world.
 *
 * Traced from the founder's own pen sketch (Project file IMG_4460.jpeg, D-071),
 * which he drew "not exactly" on purpose. It is not map data, not to scale and
 * not for finding your way. It holds roads and public places only: no houses,
 * lots, house numbers or pins.
 *
 * Points are written in the sketch photo's own pixels (1500 wide, 2000 tall,
 * north up), so anyone can check a road against the photo. toWorld() turns them
 * into map units. The painted map pieces (D-076) are placed in the same units.
 *
 * Nothing here draws. The drawing is in components/quest/paper-map.tsx.
 */

export type Pt = readonly [number, number];

/** Map units. The painted artwork should be made at this size or a whole multiple of it. */
export const WORLD_W = 780;
export const WORLD_H = 900;
/** Room around the sketch for the made-up lands at the edges. */
const PAD_X = 60;
const PAD_Y = 40;
const SKETCH_SCALE = 1 / 2.5;

export const toWorld = ([x, y]: Pt): Pt => [PAD_X + x * SKETCH_SCALE, PAD_Y + y * SKETCH_SCALE];

// Points where two roads meet. Shared by both roads so the road network joins up.
const J = {
  hermGray: [195, 368],
  hermShen: [545, 318],
  hermLora: [790, 350],
  hermDurham: [965, 335],
  hermBridge: [1145, 352],
  furnessTop: [1300, 550],
  durhamDanville: [1188, 545],
  willowDanville: [1195, 655],
  willowLora: [845, 600],
  willowWisteria: [1000, 590],
  loraChantilly: [870, 960],
  wisteriaCircle: [1000, 950],
  loraWisteria: [1048, 1432],
  loraBridgetown: [1130, 1470],
  loraFurness: [1350, 1555],
  danvilleBridgetown: [1250, 1130],
  danvilleFurness: [1385, 1212],
  coveFurness: [1390, 1680],
  shenPepperell: [505, 455],
  shenPotomac: [620, 685],
  shenChantilly: [642, 962],
  shenValley: [492, 1268],
  grayPotomac: [268, 722],
  grayValley: [238, 1236],
  tecumsehValley: [85, 1170],
  tecumsehBranch: [85, 945],
  furnessTrail: [1395, 1000],
  hermWest: [60, 358],
} as const satisfies Record<string, Pt>;

export type RoadId =
  | 'hermitage' | 'bridgeRoad' | 'durham' | 'furness' | 'danville' | 'willow' | 'loralinda' | 'wisteriaTrail' | 'wisteriaCircle'
  | 'bridgetown' | 'brettonwoods' | 'furnessCove' | 'chantilly' | 'shenandoah' | 'pepperell' | 'potomac' | 'grayledge'
  | 'valleyForge' | 'tecumseh' | 'tecumsehBranch' | 'frontierTrail' | 'steppingStones' | 'bigCityRoad';

export type Road = {
  id: RoadId;
  points: Pt[];
  /** Real street names are shown as written. Made-up paths have a text key instead. */
  name?: string;
  /** Made-up paths at the edges of the map, not real streets. */
  madeUp?: boolean;
  /** Ends in a small circle (cul-de-sac), as in the sketch. */
  culDeSac?: boolean;
  /** Where along the road to put its name, 0 to 1. */
  labelAt?: number;
};

export const ROADS: Road[] = [
  { id: 'hermitage', name: 'Hermitage Dr', labelAt: 0.42, points: [J.hermWest, J.hermGray, [380, 345], J.hermShen, [680, 330], J.hermLora, [880, 345], J.hermDurham, [1060, 338], J.hermBridge, [1230, 420], [1290, 500], J.furnessTop] },
  { id: 'bridgeRoad', points: [[1205, -60], [1200, 40], [1185, 140], [1170, 230], J.hermBridge] },
  { id: 'durham', name: 'Durham Dr', labelAt: 0.4, points: [J.hermDurham, [1010, 430], [1100, 505], J.durhamDanville, J.furnessTop] },
  { id: 'furness', name: 'Furness Dr', labelAt: 0.3, points: [J.furnessTop, [1385, 640], [1410, 760], J.furnessTrail, J.danvilleFurness, [1345, 1400], J.loraFurness, J.coveFurness, [1440, 1860]] },
  { id: 'danville', name: 'Danville Dr', labelAt: 0.3, points: [J.durhamDanville, J.willowDanville, [1172, 800], [1160, 950], [1195, 1050], J.danvilleBridgetown, J.danvilleFurness] },
  { id: 'willow', name: 'Weeping Willow Dr', labelAt: 0.5, points: [J.willowLora, [940, 578], J.willowWisteria, [1100, 615], J.willowDanville] },
  { id: 'loralinda', name: 'Loralinda Dr', labelAt: 0.3, points: [J.hermLora, [800, 480], J.willowLora, [860, 760], J.loraChantilly, [865, 1100], [890, 1260], [960, 1360], J.loraWisteria, J.loraBridgetown, [1240, 1520], J.loraFurness] },
  { id: 'wisteriaTrail', name: 'Wisteria Trl', labelAt: 0.25, culDeSac: true, points: [J.willowWisteria, [1000, 780], J.wisteriaCircle, [1035, 1100], [1050, 1300], J.loraWisteria, [985, 1460], [930, 1478]] },
  { id: 'wisteriaCircle', name: 'Wisteria Cir', labelAt: 0.5, culDeSac: true, points: [J.wisteriaCircle, [1050, 925], [1105, 918]] },
  { id: 'bridgetown', name: 'Bridgetown Dr', labelAt: 0.45, points: [J.danvilleBridgetown, [1215, 1230], [1165, 1360], J.loraBridgetown] },
  { id: 'brettonwoods', name: 'Brettonwoods Ln', labelAt: 0.55, points: [J.loraWisteria, [1000, 1520], [900, 1560], [810, 1620], [765, 1740], [750, 1860]] },
  { id: 'furnessCove', name: 'Furness Cv', labelAt: 0.45, culDeSac: true, points: [J.coveFurness, [1280, 1685], [1100, 1648], [960, 1660], [885, 1700]] },
  { id: 'chantilly', name: 'Chantilly Ln', labelAt: 0.5, points: [J.loraChantilly, [770, 950], [700, 1000], J.shenChantilly] },
  { id: 'shenandoah', name: 'Shenandoah Dr', labelAt: 0.62, points: [J.hermShen, [500, 400], J.shenPepperell, [560, 530], [612, 600], J.shenPotomac, [622, 850], [650, 910], J.shenChantilly, [585, 1050], [525, 1180], J.shenValley, [530, 1360], [560, 1460], [525, 1600], [545, 1860]] },
  { id: 'pepperell', name: 'Pepperell Ct', labelAt: 0.5, culDeSac: true, points: [J.shenPepperell, [420, 462], [335, 500], [275, 548]] },
  { id: 'potomac', name: 'Potomac Path', labelAt: 0.5, points: [J.shenPotomac, [450, 668], [330, 690], J.grayPotomac] },
  { id: 'grayledge', name: 'Grayledge Dr', labelAt: 0.55, points: [J.hermGray, [185, 450], [212, 560], J.grayPotomac, [292, 830], [270, 960], [222, 1100], J.grayValley, [290, 1350], [292, 1500], [232, 1700], [230, 1860]] },
  { id: 'valleyForge', name: 'Valley Forge Dr', labelAt: 0.3, points: [J.shenValley, [400, 1232], [300, 1226], J.grayValley, [160, 1228], J.tecumsehValley] },
  { id: 'tecumseh', name: 'Tecumseh Dr', labelAt: 0.55, points: [J.grayPotomac, [175, 800], [100, 900], J.tecumsehBranch, [78, 1060], J.tecumsehValley] },
  { id: 'tecumsehBranch', points: [J.tecumsehBranch, [0, 960], [-90, 980]] },
  // Made-up paths at the edges (storybook features, not streets).
  { id: 'frontierTrail', madeUp: true, points: [J.furnessTrail, [1480, 985], [1560, 1010], [1640, 990]] },
  { id: 'steppingStones', madeUp: true, points: [J.hermWest, [70, 300], [95, 230], [120, 160], [150, 110]] },
  { id: 'bigCityRoad', madeUp: true, points: [[545, 1860], [548, 1960]] },
];

/** The creek: a band across the top, west to east (north is up). */
export const CREEK = {
  north: [[-150, 270], [150, 262], [420, 225], [600, 212], [900, 205], [1150, 200], [1300, 215], [1650, 250]] as Pt[],
  south: [[-150, 335], [150, 330], [420, 300], [600, 288], [900, 285], [1150, 280], [1300, 292], [1650, 320]] as Pt[],
};

/** The garden site: a patch between the creek and Hermitage Drive, west of the bridge road. */
export const GARDEN_OUTLINE: Pt[] = [[960, 300], [985, 278], [1050, 286], [1120, 285], [1140, 300], [1120, 322], [1040, 326], [975, 320]];

// ---------- the road network, for travel ----------

type Graph = { nodes: Pt[]; edges: Map<number, { to: number; len: number }[]> };

/** Two road points closer than this (map units) are treated as the same crossing. */
const JOIN = 1.5;

let cached: Graph | undefined;

export function roadGraph(): Graph {
  if (cached) return cached;
  const nodes: Pt[] = [];
  const edges = new Map<number, { to: number; len: number }[]>();
  const nodeFor = (p: Pt): number => {
    const found = nodes.findIndex((n) => Math.hypot(n[0] - p[0], n[1] - p[1]) < JOIN);
    if (found >= 0) return found;
    nodes.push(p);
    edges.set(nodes.length - 1, []);
    return nodes.length - 1;
  };
  for (const road of ROADS) {
    const ids = road.points.map((p) => nodeFor(toWorld(p)));
    for (let i = 0; i < ids.length - 1; i++) {
      const a = ids[i];
      const b = ids[i + 1];
      if (a === b) continue;
      const len = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);
      edges.get(a)!.push({ to: b, len });
      edges.get(b)!.push({ to: a, len });
    }
  }
  cached = { nodes, edges };
  return cached;
}

/** The road point nearest to a spot on the map. */
export function nearestNode(p: Pt): number {
  const { nodes } = roadGraph();
  let best = 0;
  let bestD = Infinity;
  nodes.forEach((n, i) => {
    const d = Math.hypot(n[0] - p[0], n[1] - p[1]);
    if (d < bestD) [best, bestD] = [i, d];
  });
  return best;
}

/** Shortest way along the roads between two road points (Dijkstra). Empty if there is none. */
export function shortestPath(from: number, to: number): number[] {
  const { nodes, edges } = roadGraph();
  const dist = new Array<number>(nodes.length).fill(Infinity);
  const prev = new Array<number>(nodes.length).fill(-1);
  const done = new Array<boolean>(nodes.length).fill(false);
  dist[from] = 0;
  for (;;) {
    let u = -1;
    for (let i = 0; i < nodes.length; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) break;
    if (u === to) break;
    done[u] = true;
    for (const { to: v, len } of edges.get(u) ?? []) {
      if (dist[u] + len < dist[v]) {
        dist[v] = dist[u] + len;
        prev[v] = u;
      }
    }
  }
  if (dist[to] === Infinity) return [];
  const path = [to];
  while (path[0] !== from) path.unshift(prev[path[0]]);
  return path;
}

export const pathLength = (pts: readonly Pt[]): number => pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/** The point a share of the way (0 to 1) along a line. */
export function pointAlong(pts: readonly Pt[], share: number): Pt {
  if (pts.length === 0) return [0, 0];
  if (pts.length === 1 || share <= 0) return pts[0];
  const total = pathLength(pts);
  let left = Math.min(1, share) * total;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (left <= seg && seg > 0) {
      const t = left / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
    left -= seg;
  }
  return pts[pts.length - 1];
}

/** Which way a road label should lean at a point: the road's angle, kept upright for reading. */
export function angleAt(pts: readonly Pt[], share: number): number {
  const a = pointAlong(pts, Math.max(0, share - 0.04));
  const b = pointAlong(pts, Math.min(1, share + 0.04));
  let deg = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  if (deg > 90) deg -= 180;
  if (deg < -90) deg += 180;
  return deg;
}

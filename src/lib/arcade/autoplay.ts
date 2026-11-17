/**
 * A simple self-playing hero. Two jobs: tests use it to prove a level can be
 * finished, and "Watch it play" lets someone who cannot use the buttons still
 * see the story.
 */
import { DEPTH, HERO, heroOf, isEnemy, type Actor, type Input, type World } from './rules';

export function autoplay(w: World): Input {
  const hero = heroOf(w);
  const boss = w.actors.find((a) => a.role === 'boss');
  const tap: Input = { x: 0, z: 0, attack: !w.prevAttack };
  const away = (fromZ: number) => (hero.z >= fromZ ? (hero.z < DEPTH - 1 ? 1 : -1) : hero.z > 1 ? -1 : 1);
  const goBonk = (t: Actor, reach: number): Input => {
    const dx = t.x - hero.x;
    const dz = t.z - hero.z;
    if (Math.abs(dz) > 5) return { x: Math.abs(dx) > reach ? Math.sign(dx) : 0, z: Math.sign(dz), attack: false };
    if (Math.abs(dx) > reach) return { x: Math.sign(dx), z: 0, attack: false };
    if (Math.sign(dx) !== hero.face && Math.abs(dx) > 4) return { x: Math.sign(dx), z: 0, attack: false };
    return tap;
  };
  if (w.phase === 'boss' && boss && boss.state !== 'statue' && boss.state !== 'settle') {
    if (boss.state === 'stun') return goBonk(boss, HERO.reach + 14);
    // Keep out of its lane and out of stomping range until it tires itself out.
    const dz = Math.abs(hero.z - boss.z);
    const dx = Math.abs(hero.x - boss.x);
    return { x: dx < 52 ? Math.sign(hero.x - boss.x) || 1 : 0, z: dz < 15 ? away(boss.z) : 0, attack: false };
  }
  const shot = w.actors.find((a) => a.role === 'shot' && Math.abs(a.x - hero.x) < 40 && Math.abs(a.z - hero.z) < 9);
  if (shot) return { x: 0, z: away(shot.z), attack: false };
  const lunging = w.actors.find((a) => a.role === 'lunger' && (a.state === 'wind' || a.state === 'attack') && Math.abs(a.z - hero.z) < 9);
  if (lunging) return { x: 0, z: away(lunging.z), attack: false };
  const enemies = w.actors.filter(isEnemy).sort((p, q) => Math.abs(p.x - hero.x) - Math.abs(q.x - hero.x));
  if (enemies.length) return goBonk(enemies[0], HERO.reach - 6);
  return { x: 1, z: 0, attack: false };
}

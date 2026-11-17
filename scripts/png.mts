/** A tiny PNG writer for sprite sheets (no packages). Shared by the sprite scripts. */
import { deflateSync } from 'node:zlib';

import type { Sprite } from '../src/lib/pixel/raster.ts';

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
}
export function png(sprite: Sprite): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(sprite.w, 0);
  header.writeUInt32BE(sprite.h, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const stride = sprite.w * 4;
  const raw = Buffer.alloc((stride + 1) * sprite.h);
  for (let y = 0; y < sprite.h; y++) {
    // Filter "Up": a row that repeats the one above becomes zeros, so enlarged art stays tiny.
    raw[y * (stride + 1)] = 2;
    for (let x = 0; x < stride; x++) {
      const above = y === 0 ? 0 : sprite.rgba[(y - 1) * stride + x];
      raw[y * (stride + 1) + 1 + x] = (sprite.rgba[y * stride + x] - above) & 255;
    }
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array())]);
}

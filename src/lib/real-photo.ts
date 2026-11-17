/**
 * Real photos of wildlife, loaded only when a person asks for one.
 *
 * Source: the public iNaturalist API (GET /v1/taxa). Each species there has a
 * "default photo" with a license code and a ready-made credit line.
 *
 * Rules:
 *  - Nothing is loaded until the person taps the button (their device then
 *    contacts inaturalist.org, which is a third party).
 *  - A photo is shown only if it carries a Creative Commons license or is CC0.
 *    Photos with no license are "all rights reserved" and are skipped.
 *  - The credit line is always shown with the photo.
 *  - One request per animal per session, well under the API's asked-for limits.
 *
 * NOT YET CHECKED against the live service: the build environment could not
 * reach it. The parsing below follows the published response shape and fails
 * safe (no photo, link to the site instead).
 */
export type RealPhoto = { url: string; credit: string; license: string; ratio: number };

export const realPhotoApiUrl = (scientificName: string) => 'https://api.inaturalist.org/v1/taxa?rank=species&per_page=5&q=' + encodeURIComponent(scientificName);

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const SAFE_HOSTS = ['inaturalist-open-data.s3.amazonaws.com', 'static.inaturalist.org'];

/** Picks a freely licensed photo out of an API answer, or nothing. */
export function pickPhoto(json: unknown, scientificName: string): RealPhoto | undefined {
  if (!isRecord(json) || !Array.isArray(json.results)) return undefined;
  const taxa = json.results.filter(isRecord);
  const taxon = taxa.find((x) => typeof x.name === 'string' && x.name.toLowerCase() === scientificName.toLowerCase());
  const photo = taxon?.default_photo;
  if (!isRecord(photo)) return undefined;
  const license = photo.license_code;
  const url = photo.medium_url ?? photo.url;
  const credit = photo.attribution;
  if (typeof license !== 'string' || !license.toLowerCase().startsWith('cc')) return undefined;
  if (typeof url !== 'string' || typeof credit !== 'string' || !credit.trim()) return undefined;
  let host = '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return undefined;
    host = parsed.hostname;
  } catch {
    return undefined;
  }
  if (!SAFE_HOSTS.includes(host)) return undefined;
  const dims = photo.original_dimensions;
  const ratio = isRecord(dims) && typeof dims.width === 'number' && typeof dims.height === 'number' && dims.height > 0 ? dims.width / dims.height : 4 / 3;
  return { url, credit: credit.trim(), license: license.toUpperCase(), ratio: Math.min(2, Math.max(0.6, ratio)) };
}

const cache = new Map<string, RealPhoto | null>();
/** After a failed request, wait before asking again, to be polite to the photo site (block 5 review, S-23). */
const RETRY_AFTER_MS = 5 * 60_000;
const failedAt = new Map<string, number>();

/** Returns a photo, null when none can be shown, and throws when the network fails. */
export async function loadRealPhoto(scientificName: string): Promise<RealPhoto | null> {
  const hit = cache.get(scientificName);
  if (hit !== undefined) return hit;
  const failed = failedAt.get(scientificName);
  if (failed !== undefined && Date.now() - failed < RETRY_AFTER_MS) throw new Error('photo service failed recently; try again later');
  let response: Response;
  try {
    response = await fetch(realPhotoApiUrl(scientificName), { headers: { Accept: 'application/json' } });
  } catch (e) {
    failedAt.set(scientificName, Date.now());
    throw e;
  }
  if (!response.ok) {
    failedAt.set(scientificName, Date.now());
    throw new Error('photo service answered ' + response.status);
  }
  const found = pickPhoto(await response.json(), scientificName) ?? null;
  cache.set(scientificName, found);
  return found;
}

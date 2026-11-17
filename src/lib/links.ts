/** Only web pages (https), phone calls and email open from the app. Anything else is ignored (block 5 review, S-18). */
export function isSafeLink(url: string): boolean {
  try {
    return ['https:', 'tel:', 'mailto:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

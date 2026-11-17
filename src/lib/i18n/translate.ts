/** Text lookup with no phone code in it, so tests can use it too. */
import type { Language } from '../prefs';
import { en, type StringKey } from './en';
import { es } from './es';

export const dictionaries: Record<Language, Record<StringKey, string>> = { en, es };

/**
 * When `count` is 1 and a `key_one` string exists, it is used: "1 neighbor is going",
 * not "1 neighbors are going" (block 5 review, P-05). English and Spanish both use
 * one form for 1 and another for everything else. Languages with more forms (such
 * as Arabic) will need Intl.PluralRules here.
 */
export function translate(language: Language, key: StringKey, vars?: Record<string, string | number>): string {
  const dict = dictionaries[language] as Record<string, string>;
  const one = vars?.count === 1 ? dict[key + '_one'] ?? (en as Record<string, string>)[key + '_one'] : undefined;
  let text = one ?? dictionaries[language][key] ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.split('{' + name + '}').join(String(value));
  }
  return text;
}

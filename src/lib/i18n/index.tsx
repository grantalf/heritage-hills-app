import { useMemo } from 'react';

import type { L } from '../data/types';
import { usePrefs, type Language } from '../prefs';
import { en, type StringKey } from './en';
import { es } from './es';

export const dictionaries: Record<Language, Record<StringKey, string>> = { en, es };

export function translate(language: Language, key: StringKey, vars?: Record<string, string | number>): string {
  let text = dictionaries[language][key] ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.split('{' + name + '}').join(String(value));
  }
  return text;
}

export function useT() {
  const { language } = usePrefs();
  return useMemo(
    () => ({
      language,
      /** Interface text by key. */
      t: (key: StringKey, vars?: Record<string, string | number>) => translate(language, key, vars),
      /** Content that carries its own translations. */
      tl: (text: L) => text[language] || text.en,
    }),
    [language],
  );
}

export type { StringKey };

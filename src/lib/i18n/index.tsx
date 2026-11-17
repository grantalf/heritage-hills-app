import { useMemo } from 'react';

import type { L } from '../data/types';
import { usePrefs } from '../prefs';
import type { StringKey } from './en';
import { translate } from './translate';

export { dictionaries, translate } from './translate';

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

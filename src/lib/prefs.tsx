import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { LOOK_IDS, type LookId } from './theme';

export type Language = 'en' | 'es';
export const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

/** Extra text size on top of the phone's own setting. */
export type TextScale = 1 | 1.15 | 1.3;
export const TEXT_SCALES: TextScale[] = [1, 1.15, 1.3];

type Prefs = { language: Language; textScale: TextScale; look: LookId };
type PrefsContext = Prefs & {
  ready: boolean;
  setLanguage: (language: Language) => void;
  setTextScale: (scale: TextScale) => void;
  setLook: (look: LookId) => void;
};

const KEY = 'hh.prefs.v1';

export function deviceLanguage(): Language {
  try {
    const code = getLocales()[0]?.languageCode;
    return code === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

const Ctx = createContext<PrefsContext | undefined>(undefined);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>({ language: deviceLanguage(), textScale: 1, look: 'neutral' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const saved = JSON.parse(raw) as Partial<Prefs>;
        setPrefs((p) => ({
          language: saved.language === 'en' || saved.language === 'es' ? saved.language : p.language,
          textScale: TEXT_SCALES.includes(saved.textScale as TextScale) ? (saved.textScale as TextScale) : p.textScale,
          look: LOOK_IDS.includes(saved.look as LookId) ? (saved.look as LookId) : p.look,
        }));
      })
      .catch(() => undefined)
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<PrefsContext>(() => {
    const save = (next: Prefs) => {
      setPrefs(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
    };
    return {
      ...prefs,
      ready,
      setLanguage: (language) => save({ ...prefs, language }),
      setTextScale: (textScale) => save({ ...prefs, textScale }),
      setLook: (look) => save({ ...prefs, look }),
    };
  }, [prefs, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): PrefsContext {
  const value = useContext(Ctx);
  if (!value) throw new Error('usePrefs must be used inside PrefsProvider');
  return value;
}

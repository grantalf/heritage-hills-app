import type { Language } from './prefs';

const LOCALE: Record<Language, string> = { en: 'en-US', es: 'es-US' };

function fmt(language: Language, options: Intl.DateTimeFormatOptions, date: Date): string {
  try {
    return new Intl.DateTimeFormat(LOCALE[language], options).format(date);
  } catch {
    return date.toDateString();
  }
}

/** "Thursday, November 19" */
export function longDay(iso: string, language: Language): string {
  return capitalize(fmt(language, { weekday: 'long', month: 'long', day: 'numeric' }, new Date(iso)));
}

/** "Nov 19" */
export function shortDay(iso: string, language: Language): string {
  return fmt(language, { month: 'short', day: 'numeric' }, new Date(iso));
}

/** "6:30 PM" */
export function clock(iso: string, language: Language): string {
  return fmt(language, { hour: 'numeric', minute: '2-digit' }, new Date(iso));
}

export function monthName(month: number, language: Language): string {
  return fmt(language, { month: 'long' }, new Date(2026, month - 1, 15));
}

/** Accepts YYYY-MM or YYYY-MM-DD. */
export function checkedDate(value: string, language: Language): string {
  const parts = value.split('-').map(Number);
  if (parts.length === 2) return capitalize(fmt(language, { month: 'long', year: 'numeric' }, new Date(parts[0], parts[1] - 1, 15)));
  return fmt(language, { month: 'short', day: 'numeric', year: 'numeric' }, new Date(parts[0], parts[1] - 1, parts[2]));
}

export function dayParts(iso: string, language: Language): { month: string; day: string; weekday: string } {
  const d = new Date(iso);
  return {
    month: fmt(language, { month: 'short' }, d).replace('.', '').toUpperCase(),
    day: String(d.getDate()),
    weekday: capitalize(fmt(language, { weekday: 'short' }, d).replace('.', '')),
  };
}

function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

import type { DivineName } from "./names";

const ARABIC_CHARS = /[؀-ۿ]/;
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** "Ar-Raḥmān" → "arrahman": strips diacritics, ʿ/ʾ, hyphens and spaces. */
export function latinKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ʿʾ'’‘`\-\s]/g, "")
    .toLowerCase();
}

/** Removes Arabic vowel marks and unifies alif forms. */
export function arabicKey(value: string): string {
  return value
    .normalize("NFC")
    .replace(ARABIC_MARKS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesQuery(name: DivineName, rawQuery: string): boolean {
  const query = rawQuery.trim();
  if (!query) return true;
  if (/^\d+$/.test(query)) return name.order === Number(query);
  if (ARABIC_CHARS.test(query)) {
    return arabicKey(name.arabic).includes(arabicKey(query));
  }
  const key = latinKey(query);
  return (
    latinKey(name.transliteration).includes(key) ||
    latinKey(name.shortMeaning).includes(key)
  );
}

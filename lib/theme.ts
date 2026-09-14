export type ThemePreference = "system" | "light" | "dark";

/**
 * The theme preference is mirrored into localStorage so the inline script can
 * apply it before first paint; IndexedDB (async) remains the source of truth.
 */
export const THEME_STORAGE_KEY = "khn-theme";

const THEME_COLORS = { light: "#f6f3eb", dark: "#0e1512" } as const;

/** Runs in <head> before paint. Keep it tiny and dependency-free. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(preference: ThemePreference) {
  const theme = resolveTheme(preference);
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", THEME_COLORS[theme]));
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies.
  }
}

export function readStoredTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    // Fall through to the default.
  }
  return "system";
}

export { THEME_COLORS };

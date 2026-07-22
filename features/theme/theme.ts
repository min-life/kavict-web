export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "kavict-theme";

export type ThemeStorage = Pick<Storage, "getItem" | "setItem">;
export type ThemeClassList = Pick<DOMTokenList, "toggle">;

export function readTheme(storage: ThemeStorage | null): Theme {
  try {
    return storage?.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function writeTheme(theme: Theme, storage: ThemeStorage | null): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage is optional; the in-memory preference still changes.
  }
}

export function applyTheme(theme: Theme, classList: ThemeClassList): void {
  classList.toggle("dark", theme === "dark");
}

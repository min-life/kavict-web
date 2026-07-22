"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { applyTheme, readTheme, type Theme, writeTheme } from "./theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme(theme: Theme): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const nextTheme = readTheme(browserStorage());
    setThemeState(nextTheme);
    applyTheme(nextTheme, document.documentElement.classList);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme, document.documentElement.classList);
    writeTheme(nextTheme, browserStorage());
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

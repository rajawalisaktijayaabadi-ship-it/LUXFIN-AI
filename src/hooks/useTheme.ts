import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export type ThemeMode = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (storage.getTheme() as ThemeMode) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    let effectiveTheme = theme;
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemPrefersDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'light') {
      root.classList.add('light-theme');
      body.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
      body.classList.remove('light-theme');
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    storage.setTheme(mode);
  };

  return { theme, setTheme };
}

import { useEffect, useState } from 'react';

const ThemeSetting = {
  Light: 'light',
  Dark: 'dark',
  Auto: 'auto',
} as const;

type ThemeSetting = (typeof ThemeSetting)[keyof typeof ThemeSetting];

const THEME_STORAGE_KEY = 'theme';

/**
 * Requires the `dark` variant to be defined in global CSS
 * @see https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
 */
function toggleDarkMode(isDark: boolean) {
  if (!document.startViewTransition) {
    document.documentElement.classList.toggle('dark', isDark);
  } else {
    document.startViewTransition(() => {
      document.documentElement.classList.toggle('dark', isDark);
    });
  }
}

export function useThemeSetting() {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(
    ThemeSetting.Auto,
  );

  useEffect(() => {
    const storedThemeSetting = localStorage.getItem(THEME_STORAGE_KEY);
    if (
      typeof storedThemeSetting === 'string' &&
      Object.values(ThemeSetting).includes(storedThemeSetting as ThemeSetting)
    ) {
      setThemeSetting(storedThemeSetting as ThemeSetting);
    } else {
      setThemeSetting(ThemeSetting.Auto);
    }
  }, []);

  const switchThemeSetting = (themeSetting: ThemeSetting) => {
    if (themeSetting === ThemeSetting.Auto) {
      toggleDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      toggleDarkMode(themeSetting === ThemeSetting.Dark);
      localStorage.setItem(THEME_STORAGE_KEY, themeSetting);
    }
    setThemeSetting(themeSetting);
  };

  return {
    ThemeSetting,
    currentThemeSetting: themeSetting,
    switchThemeSetting,
  };
}

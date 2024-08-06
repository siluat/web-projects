export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export function getThemeByPreferColorScheme(): Theme {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  return isDarkMode ? Theme.Dark : Theme.Light
}

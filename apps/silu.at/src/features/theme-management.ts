const THEME_KEY = 'theme'

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export const ALLOWED_THEMES = Object.values(THEMES)

export type Theme = (typeof ALLOWED_THEMES)[number]

export async function applyTheme(
  element: HTMLElement,
  theme: Theme,
): Promise<void> {
  element.dataset.theme = theme
}

/**
 * 사용자 환경에 대한 테마값을 반환
 * @returns LocalStorage에 유효한 테마값이 저장되어 있다면 해당 값을 반환, 그렇지 않다면 시스템 설정에 따라 테마값을 반환
 */
export async function detectTheme(): Promise<Theme> {
  const storedTheme = localStorage.getItem(THEME_KEY) ?? ''

  if (isAllowedTheme(storedTheme)) {
    return storedTheme
  }

  return getThemeByPreferColorScheme()
}

function isAllowedTheme(theme: string | null | undefined): theme is Theme {
  return ALLOWED_THEMES.includes(theme as Theme)
}

function getThemeByPreferColorScheme(): Theme {
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  return darkMode ? THEMES.DARK : THEMES.LIGHT
}

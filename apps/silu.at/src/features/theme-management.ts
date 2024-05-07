const THEME_KEY = 'theme'

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export const ALLOWED_THEMES = Object.values(THEMES)

export type Theme = (typeof ALLOWED_THEMES)[number]

export type ThemeOptions = {
  /**
   * 테마를 적용할 루트 엘리먼트
   */
  rootElement: HTMLElement
}

export async function initTheme({ rootElement }: ThemeOptions): Promise<void> {
  const theme = await detectTheme()
  applyTheme(rootElement, theme)
}

/**
 * 사용자 환경에 대한 테마값을 반환
 * @returns LocalStorage에 유효한 테마값이 저장되어 있다면 해당 값을 반환, 그렇지 않다면 시스템 설정에 따라 테마값을 반환
 */
async function detectTheme(): Promise<Theme> {
  const storedTheme = localStorage.getItem(THEME_KEY) ?? ''
  return isAllowedTheme(storedTheme)
    ? storedTheme
    : getThemeByPreferColorScheme()
}

/**
 * 특정 엘리먼트에 테마 속성을 적용
 * @description Panda CSS의 Multi-Theme Tokens 기능에 의존한다.
 * @see https://panda-css.com/docs/guides/multiple-themes#multi-theme-tokens
 * @todo Panda CSS 기능에 의존함을 더 명확하게 드러낼 수 있는 방법이 있다면 변경한다.
 */
function applyTheme(element: HTMLElement, theme: Theme) {
  element.dataset.theme = theme
}

function isAllowedTheme(theme: string | null | undefined): theme is Theme {
  return ALLOWED_THEMES.includes(theme as Theme)
}

function getThemeByPreferColorScheme(): Theme {
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  return darkMode ? THEMES.DARK : THEMES.LIGHT
}

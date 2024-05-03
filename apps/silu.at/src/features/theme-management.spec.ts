import { ALLOWED_THEMES, applyTheme, detectTheme } from './theme-management'

describe('applyTheme', () => {
  test.each(ALLOWED_THEMES)(
    '유효한 테마값("%s")을 전달하면 해당 테마값을 대상 HTML Element에 설정한다.',
    async (theme) => {
      const targetElement = document.documentElement

      await applyTheme(targetElement, theme)

      expect(targetElement.dataset.theme).toBe(theme)
    },
  )
})

describe('detectTheme', () => {
  test.each(ALLOWED_THEMES)(
    'localStorage에 저장된 테마값이 "%s"라면 해당 테마값을 반환한다.',
    async (storedTheme) => {
      vitest.stubGlobal('localStorage', {
        getItem: () => storedTheme,
      })

      expect(await detectTheme()).toBe(storedTheme)
    },
  )

  test.each([
    { storedTheme: null, matchMedia: { matches: false }, expected: 'light' },
    { storedTheme: null, matchMedia: { matches: true }, expected: 'dark' },
  ])(
    `localStorage에 저장된 테마값이 유효하지 않다면 prefers-color-scheme에 따라 테마값을 반환한다.`,
    async ({ storedTheme, matchMedia, expected }) => {
      vitest.stubGlobal('localStorage', {
        getItem: () => storedTheme,
      })
      vitest.stubGlobal('matchMedia', () => matchMedia)

      expect(await detectTheme()).toBe(expected)
    },
  )
})

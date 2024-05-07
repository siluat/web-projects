import { ALLOWED_THEMES, initTheme } from './theme-management'

describe('initTheme', () => {
  test.each([
    { storedTheme: null, matchMedia: { matches: false }, expected: 'light' },
    { storedTheme: null, matchMedia: { matches: true }, expected: 'dark' },
  ])(
    `localStorage에 저장된 테마값이 유효하지 않다면 prefers-color-scheme에 따라 테마값을 설정한다.`,
    async ({ storedTheme, matchMedia, expected }) => {
      vitest.stubGlobal('localStorage', {
        getItem: () => storedTheme,
      })
      vitest.stubGlobal('matchMedia', () => matchMedia)

      const rootElement = document.documentElement
      await initTheme({ rootElement })
      expect(rootElement.dataset.theme).toBe(expected)
    },
  )

  test.each(ALLOWED_THEMES)(
    'localStorage에 저장된 테마값이 "%s"라면 해당 테마값을 설정한다.',
    async (storedTheme) => {
      vitest.stubGlobal('localStorage', {
        getItem: () => storedTheme,
      })

      const rootElement = document.documentElement
      await initTheme({ rootElement })
      expect(rootElement.dataset.theme).toBe(storedTheme)
    },
  )
})

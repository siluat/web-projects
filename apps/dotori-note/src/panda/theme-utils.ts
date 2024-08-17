import { Theme } from '~/utils/theme'

export const themeAttributes = {
  [Theme.Light]: '[data-theme=light]',
  [Theme.Dark]: '[data-theme=dark]',
}

/**
 * @reference https://panda-css.com/docs/customization/conditions
 */
export const themeConditions = {
  [Theme.Light]: `${themeAttributes[Theme.Light]} &`,
  [Theme.Dark]: `${themeAttributes[Theme.Dark]} &`,
}

/**
 * rootElement 포함 하위 엘리먼트에 테마를 적용한다.
 * @description Panda CSS의 Multi-Theme Tokens 기능에 의존한다.
 * @reference https://panda-css.com/docs/guides/multiple-themes
 */
export function applyTheme(rootElement: HTMLElement, theme: Theme) {
  rootElement.dataset.theme = theme
}

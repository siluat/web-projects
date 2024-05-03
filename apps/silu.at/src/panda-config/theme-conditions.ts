import { ALLOWED_THEMES } from '@/features/theme-management'

export const themeConditions = ALLOWED_THEMES.reduce(
  (acc, theme) => ({
    ...acc,
    [theme]: `[data-theme=${theme}] &`,
  }),
  {} as Record<string, string>,
)

import { defineSemanticTokens } from '@pandacss/dev'

export const semanticTokens = defineSemanticTokens({
  colors: {
    text: {
      value: {
        _light: '{colors.neutral.950}',
        _dark: '{colors.neutral.50}',
      },
    },
    background: {
      value: {
        _light: '{colors.neutral.50}',
        _dark: '{colors.neutral.950}',
      },
    },
  },
})

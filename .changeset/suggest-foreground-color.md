---
"@siluat/color-contrast-cli": minor
---

Add `--suggest` flag that recommends an accessible foreground color meeting a target WCAG contrast ratio. The algorithm adjusts only OkLCH lightness to preserve hue and saturation, then verifies the hex output passes the target after quantization.

Related PRs: #100, #101

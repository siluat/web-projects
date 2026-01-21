# @repo/color-tokens

색상 토큰 시스템 패키지입니다. CSS Custom Properties를 사용하여 Tailwind 독립적인 색상 토큰을 제공합니다.

## 특징

- **Light/Dark 테마**: `data-theme` 속성으로 테마 전환
- **Primary Color 커스터마이징**: `data-primary` 속성으로 primary color 변경
- **시스템 설정 지원**: `prefers-color-scheme` 미디어 쿼리 자동 대응
- **Tailwind 호환**: CSS 변수 기반으로 Tailwind와 완벽 호환
- **접근성 검사**: Storybook addon-a11y를 통한 WCAG 대비 비율 검사

## 설치

```bash
bun add @repo/color-tokens
```

## 사용법

### CSS 가져오기

```css
@import '@repo/color-tokens/themes.css';
```

### 테마 및 Primary Color 설정

```html
<!-- 라이트 테마 + 파란색 primary (기본값) -->
<html data-theme="light">

<!-- 다크 테마 + 보라색 primary -->
<html data-theme="dark" data-primary="purple">

<!-- 시스템 설정 따르기 + 초록색 primary -->
<html data-primary="green">
```

### CSS에서 사용

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
}

.my-card {
  background-color: var(--color-background);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
}
```

### Tailwind CSS와 함께 사용

```css
/* Tailwind CSS v4 */
@import '@repo/color-tokens/themes.css';
@import 'tailwindcss';

@theme {
  --color-primary: var(--color-primary-500);
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
}
```

```html
<button class="bg-primary text-primary-foreground">Click</button>
```

### TypeScript에서 사용

```typescript
import { setTheme, setPrimaryColor, themes, primaryColors } from '@repo/color-tokens';

// 테마 변경
setTheme(document.documentElement, 'dark');

// Primary color 변경
setPrimaryColor(document.documentElement, 'purple');

// 색상 값 직접 접근
import { primaryColorPalettes, themeColors } from '@repo/color-tokens';
const blue500 = primaryColorPalettes.blue['500']; // '#3b82f6'
const lightBg = themeColors.light.background; // '#ffffff'
```

## 사용 가능한 CSS 변수

### 시맨틱 토큰

| 변수명 | 설명 |
|--------|------|
| `--color-background` | 배경색 |
| `--color-foreground` | 전경색 (텍스트) |
| `--color-primary` | 주요 색상 |
| `--color-primary-foreground` | 주요 색상 위의 텍스트 |
| `--color-muted` | 음소거된 배경 |
| `--color-muted-foreground` | 음소거된 텍스트 |
| `--color-border` | 테두리 색상 |

### Primary Color 단계

각 primary color는 50~950 단계의 색상을 제공합니다:

- `--color-primary-50` ~ `--color-primary-950`

## 테마 목록

- `light` (기본값)
- `dark`

## Primary Color 목록

- `blue` (기본값)
- `green`
- `purple`
- `orange`

## 개발

### Storybook 실행

```bash
bun run storybook
```

### Storybook 빌드

```bash
bun run build-storybook
```

## 라이선스

MIT

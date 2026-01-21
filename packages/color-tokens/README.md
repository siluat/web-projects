# @repo/color-tokens

색상 토큰 시스템 패키지입니다. CSS Custom Properties를 사용하여 Tailwind 독립적인 색상 토큰을 제공합니다.

## 특징

- **다중 테마 지원**: Blue, Green, Purple, Orange 테마 제공
- **Color Scheme 지원**: 각 테마별 라이트/다크 color scheme 지원
- **Tailwind 독립적**: CSS Custom Properties 기반으로 모든 환경에서 사용 가능
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

또는

```css
@import '@repo/color-tokens/index.css';
```

### 테마 및 Color Scheme 설정

HTML 요소에 `data-theme`과 `data-color-scheme` 속성을 추가하여 테마와 color scheme을 설정합니다:

```html
<html data-theme="blue" data-color-scheme="light">
  <!-- 콘텐츠 -->
</html>
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

### TypeScript에서 사용

```typescript
import { setTheme, setColorScheme, themeColors, colorThemes } from '@repo/color-tokens';

// 테마 변경
setTheme(document.documentElement, 'purple');

// Color scheme 변경
setColorScheme(document.documentElement, 'dark');

// 색상 값 직접 접근
const primaryBlue500 = themeColors.blue['500']; // '#3b82f6'
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

### Primary 색상 단계

각 테마는 50~950 단계의 색상을 제공합니다:

- `--color-primary-50` ~ `--color-primary-950`

## 테마 목록

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

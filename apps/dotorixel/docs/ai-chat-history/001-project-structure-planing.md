# Dotorixel 프로젝트 초기 코드 구성
_Exported on 12/10/2025 at 18:07:53 GMT+9 from Cursor (2.1.50)_
_Model: Opus 4.5_
---

**User**

@apps/dotorixel/README.md:1-10 다음과 같은 구성으로 만들어보려고한다. 아주 기본적인 수준의 코드 뼈대를 구성해줘

- apps/dotorixel: Web (아마도 astro.js)

- packages/dotorixel-core: 프레임워크 의존성 없는 핵심 코드

- packages/dotorixel-react: React 컴포넌트로 픽셀 에디터를 제공

---

**Cursor**

현재 Ask 모드여서 직접 파일을 생성할 수 없습니다. 먼저 기존 모노레포의 구조와 패턴을 확인해서 적절한 코드 뼈대를 안내해 드릴게요.

기존 패키지들의 구조를 더 확인해볼게요.

Astro 앱의 구조도 확인해볼게요.

기존 모노레포의 패턴을 분석했습니다. 아래에 각 패키지별로 필요한 파일과 코드 뼈대를 안내해 드릴게요. Agent 모드로 전환하시면 이 파일들을 직접 생성해 드릴 수 있습니다.

---

## 1. `packages/dotorixel-core` - 핵심 코드

프레임워크 의존성 없는 순수 TypeScript 코드입니다.

### `packages/dotorixel-core/package.json`

```json
{
  "name": "@siluat/dotorixel-core",
  "version": "0.0.0",
  "description": "Core logic for DOTORIXEL pixel editor",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "test": "vitest"
  },
  "devDependencies": {
    "@siluat/typescript-config": "workspace:*",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

### `packages/dotorixel-core/tsconfig.json`

```json
{
  "extends": "@siluat/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### `packages/dotorixel-core/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

### `packages/dotorixel-core/src/index.ts`

```typescript
export * from './types';
export * from './canvas';
export * from './color';
```

### `packages/dotorixel-core/src/types.ts`

```typescript
export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface PixelCanvas {
  size: CanvasSize;
  pixels: Map<string, Pixel>;
}

export type Tool = 'pen' | 'eraser' | 'fill' | 'picker';
```

### `packages/dotorixel-core/src/canvas.ts`

```typescript
import type { CanvasSize, Pixel, PixelCanvas } from './types';

export function createPixelCanvas(size: CanvasSize): PixelCanvas {
  return {
    size,
    pixels: new Map(),
  };
}

export function getPixelKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function setPixel(canvas: PixelCanvas, pixel: Pixel): PixelCanvas {
  const key = getPixelKey(pixel.x, pixel.y);
  const newPixels = new Map(canvas.pixels);
  newPixels.set(key, pixel);
  return { ...canvas, pixels: newPixels };
}

export function getPixel(canvas: PixelCanvas, x: number, y: number): Pixel | undefined {
  return canvas.pixels.get(getPixelKey(x, y));
}

export function clearPixel(canvas: PixelCanvas, x: number, y: number): PixelCanvas {
  const key = getPixelKey(x, y);
  const newPixels = new Map(canvas.pixels);
  newPixels.delete(key);
  return { ...canvas, pixels: newPixels };
}
```

### `packages/dotorixel-core/src/color.ts`

```typescript
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}
```

---

## 2. `packages/dotorixel-react` - React 컴포넌트

### `packages/dotorixel-react/package.json`

```json
{
  "name": "@siluat/dotorixel-react",
  "version": "0.0.0",
  "description": "React components for DOTORIXEL pixel editor",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.tsx"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "@siluat/dotorixel-core": "workspace:*"
  },
  "devDependencies": {
    "@siluat/typescript-config": "workspace:*",
    "@testing-library/react": "^16.3.0",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "happy-dom": "^18.0.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### `packages/dotorixel-react/tsconfig.json`

```json
{
  "extends": "@siluat/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### `packages/dotorixel-react/vitest.config.ts`

```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});
```

### `packages/dotorixel-react/src/index.ts`

```typescript
export { PixelEditor } from './PixelEditor';
export { usePixelCanvas } from './usePixelCanvas';
```

### `packages/dotorixel-react/src/usePixelCanvas.ts`

```typescript
import { useCallback, useState } from 'react';
import {
  type CanvasSize,
  type Pixel,
  type PixelCanvas,
  type Tool,
  clearPixel,
  createPixelCanvas,
  setPixel,
} from '@siluat/dotorixel-core';

export function usePixelCanvas(initialSize: CanvasSize) {
  const [canvas, setCanvas] = useState<PixelCanvas>(() => createPixelCanvas(initialSize));
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentTool, setCurrentTool] = useState<Tool>('pen');

  const handlePixelClick = useCallback(
    (x: number, y: number) => {
      if (currentTool === 'pen') {
        setCanvas((prev) => setPixel(prev, { x, y, color: currentColor }));
      } else if (currentTool === 'eraser') {
        setCanvas((prev) => clearPixel(prev, x, y));
      }
    },
    [currentColor, currentTool]
  );

  const clearCanvas = useCallback(() => {
    setCanvas(createPixelCanvas(canvas.size));
  }, [canvas.size]);

  return {
    canvas,
    currentColor,
    setCurrentColor,
    currentTool,
    setCurrentTool,
    handlePixelClick,
    clearCanvas,
  };
}
```

### `packages/dotorixel-react/src/PixelEditor.tsx`

```tsx
import type { CanvasSize } from '@siluat/dotorixel-core';
import { usePixelCanvas } from './usePixelCanvas';

interface PixelEditorProps {
  size?: CanvasSize;
  pixelSize?: number;
}

export function PixelEditor({ size = { width: 16, height: 16 }, pixelSize = 20 }: PixelEditorProps) {
  const { canvas, currentColor, setCurrentColor, handlePixelClick } = usePixelCanvas(size);

  return (
    <div>
      <div>
        <label>
          Color:{' '}
          <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} />
        </label>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size.width}, ${pixelSize}px)`,
          gap: '1px',
          backgroundColor: '#ccc',
          padding: '1px',
        }}
      >
        {Array.from({ length: size.height }, (_, y) =>
          Array.from({ length: size.width }, (_, x) => {
            const pixel = canvas.pixels.get(`${x},${y}`);
            return (
              <div
                key={`${x},${y}`}
                onClick={() => handlePixelClick(x, y)}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: pixel?.color ?? '#fff',
                  cursor: 'pointer',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
```

---

## 3. `apps/dotorixel` - Astro 웹 앱

### `apps/dotorixel/package.json`

```json
{
  "name": "dotorixel",
  "description": "2D Pixel Editor Web Application",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/react": "^4.3.0",
    "@siluat/dotorixel-react": "workspace:*",
    "@tailwindcss/vite": "^4.1.11",
    "astro": "^5.11.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tailwindcss": "^4.1.11"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6"
  }
}
```

### `apps/dotorixel/astro.config.ts`

```typescript
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### `apps/dotorixel/tsconfig.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### `apps/dotorixel/src/pages/index.astro`

```astro
---
import { PixelEditor } from '@siluat/dotorixel-react';
import Layout from '../layouts/Layout.astro';
---

<Layout title="DOTORIXEL">
  <main class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">DOTORIXEL</h1>
    <PixelEditor client:load size={{ width: 16, height: 16 }} pixelSize={24} />
  </main>
</Layout>
```

### `apps/dotorixel/src/layouts/Layout.astro`

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### `apps/dotorixel/src/styles/global.css`

```css
@import 'tailwindcss';
```

---

## 디렉토리 구조 요약

```text
apps/dotorixel/
├── astro.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── layouts/
    │   └── Layout.astro
    ├── pages/
    │   └── index.astro
    └── styles/
        └── global.css

packages/dotorixel-core/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── canvas.ts
    └── color.ts

packages/dotorixel-react/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── index.ts
    ├── usePixelCanvas.ts
    └── PixelEditor.tsx
```

---

**Agent 모드로 전환하시면 이 파일들을 모두 생성해 드릴 수 있습니다.** 추가로 궁금한 점이나 수정하고 싶은 부분이 있으면 말씀해 주세요!

```json
{
  "name": "@siluat/dotorixel-core",
  "version": "0.0.0",
  "description": "Core logic for DOTORIXEL pixel editor",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "test": "vitest"
  },
  "devDependencies": {
    "@siluat/typescript-config": "workspace:*",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

```json
{
  "extends": "@siluat/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

```typescript
export * from './types';
export * from './canvas';
export * from './color';
```

```typescript
export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface PixelCanvas {
  size: CanvasSize;
  pixels: Map<string, Pixel>;
}

export type Tool = 'pen' | 'eraser' | 'fill' | 'picker';
```

```typescript
import type { CanvasSize, Pixel, PixelCanvas } from './types';

export function createPixelCanvas(size: CanvasSize): PixelCanvas {
  return {
    size,
    pixels: new Map(),
  };
}

export function getPixelKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function setPixel(canvas: PixelCanvas, pixel: Pixel): PixelCanvas {
  const key = getPixelKey(pixel.x, pixel.y);
  const newPixels = new Map(canvas.pixels);
  newPixels.set(key, pixel);
  return { ...canvas, pixels: newPixels };
}

export function getPixel(canvas: PixelCanvas, x: number, y: number): Pixel | undefined {
  return canvas.pixels.get(getPixelKey(x, y));
}

export function clearPixel(canvas: PixelCanvas, x: number, y: number): PixelCanvas {
  const key = getPixelKey(x, y);
  const newPixels = new Map(canvas.pixels);
  newPixels.delete(key);
  return { ...canvas, pixels: newPixels };
}
```

```typescript
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}
```

```json
{
  "name": "@siluat/dotorixel-react",
  "version": "0.0.0",
  "description": "React components for DOTORIXEL pixel editor",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.tsx"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "@siluat/dotorixel-core": "workspace:*"
  },
  "devDependencies": {
    "@siluat/typescript-config": "workspace:*",
    "@testing-library/react": "^16.3.0",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "happy-dom": "^18.0.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

```json
{
  "extends": "@siluat/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});
```

```typescript
export { PixelEditor } from './PixelEditor';
export { usePixelCanvas } from './usePixelCanvas';
```

```typescript
import { useCallback, useState } from 'react';
import {
  type CanvasSize,
  type Pixel,
  type PixelCanvas,
  type Tool,
  clearPixel,
  createPixelCanvas,
  setPixel,
} from '@siluat/dotorixel-core';

export function usePixelCanvas(initialSize: CanvasSize) {
  const [canvas, setCanvas] = useState<PixelCanvas>(() => createPixelCanvas(initialSize));
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentTool, setCurrentTool] = useState<Tool>('pen');

  const handlePixelClick = useCallback(
    (x: number, y: number) => {
      if (currentTool === 'pen') {
        setCanvas((prev) => setPixel(prev, { x, y, color: currentColor }));
      } else if (currentTool === 'eraser') {
        setCanvas((prev) => clearPixel(prev, x, y));
      }
    },
    [currentColor, currentTool]
  );

  const clearCanvas = useCallback(() => {
    setCanvas(createPixelCanvas(canvas.size));
  }, [canvas.size]);

  return {
    canvas,
    currentColor,
    setCurrentColor,
    currentTool,
    setCurrentTool,
    handlePixelClick,
    clearCanvas,
  };
}
```

```typescriptreact
import type { CanvasSize } from '@siluat/dotorixel-core';
import { usePixelCanvas } from './usePixelCanvas';

interface PixelEditorProps {
  size?: CanvasSize;
  pixelSize?: number;
}

export function PixelEditor({ size = { width: 16, height: 16 }, pixelSize = 20 }: PixelEditorProps) {
  const { canvas, currentColor, setCurrentColor, handlePixelClick } = usePixelCanvas(size);

  return (
    <div>
      <div>
        <label>
          Color:{' '}
          <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} />
        </label>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size.width}, ${pixelSize}px)`,
          gap: '1px',
          backgroundColor: '#ccc',
          padding: '1px',
        }}
      >
        {Array.from({ length: size.height }, (_, y) =>
          Array.from({ length: size.width }, (_, x) => {
            const pixel = canvas.pixels.get(`${x},${y}`);
            return (
              <div
                key={`${x},${y}`}
                onClick={() => handlePixelClick(x, y)}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: pixel?.color ?? '#fff',
                  cursor: 'pointer',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
```

```json
{
  "name": "dotorixel",
  "description": "2D Pixel Editor Web Application",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/react": "^4.3.0",
    "@siluat/dotorixel-react": "workspace:*",
    "@tailwindcss/vite": "^4.1.11",
    "astro": "^5.11.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tailwindcss": "^4.1.11"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6"
  }
}
```

```typescript
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

```astro
---
import { PixelEditor } from '@siluat/dotorixel-react';
import Layout from '../layouts/Layout.astro';
---

<Layout title="DOTORIXEL">
  <main class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">DOTORIXEL</h1>
    <PixelEditor client:load size={{ width: 16, height: 16 }} pixelSize={24} />
  </main>
</Layout>
```

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

```css
@import 'tailwindcss';
```

```plaintext
apps/dotorixel/
├── astro.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── layouts/
    │   └── Layout.astro
    ├── pages/
    │   └── index.astro
    └── styles/
        └── global.css

packages/dotorixel-core/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── canvas.ts
    └── color.ts

packages/dotorixel-react/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── index.ts
    ├── usePixelCanvas.ts
    └── PixelEditor.tsx
```

---

**User**

이 구성에 대해 평가를 해줘

---

**Cursor**

## 구조 평가

### ✅ 장점

**1. 관심사 분리가 잘 되어 있음**
- `dotorixel-core`: 순수 로직 (프레임워크 무관)
- `dotorixel-react`: UI 바인딩
- `dotorixel` (app): 실제 배포 환경

이 구조는 향후 다른 프레임워크(Vue, Svelte 등)나 플랫폼(Electron, Tauri)으로 확장할 때 `core`를 재사용할 수 있어 README의 "ultimately platform-agnostic" 목표에 부합합니다.

**2. 기존 모노레포 패턴과 일관성**
- `@siluat/ui-craft` 패키지와 동일한 구조를 따름
- workspace 의존성 패턴 (`workspace:*`) 활용
- 공유 TypeScript 설정 재사용

**3. 테스트 가능한 구조**
- `core`는 DOM 의존성 없이 순수 함수로 구성되어 단위 테스트가 쉬움
- `react` 패키지는 happy-dom으로 컴포넌트 테스트 가능

---

### ⚠️ 개선 고려사항

**1. Core 패키지의 상태 관리 방식**

현재 `Map`을 사용한 불변 업데이트 방식은 작은 캔버스에는 괜찮지만, 큰 캔버스(64x64 이상)에서는 성능 이슈가 있을 수 있습니다.

```typescript
// 현재 방식 - 매번 새 Map 생성
export function setPixel(canvas: PixelCanvas, pixel: Pixel): PixelCanvas {
  const newPixels = new Map(canvas.pixels); // O(n) 복사
  newPixels.set(key, pixel);
  return { ...canvas, pixels: newPixels };
}
```

**대안 고려:**
- 2D 배열 (`Uint32Array`) 사용 - 메모리 효율적
- Immer 같은 라이브러리로 구조적 공유
- 또는 처음엔 단순하게 시작하고 필요할 때 최적화

**2. React 패키지의 렌더링 구조**

현재 구조는 매 렌더링마다 모든 픽셀을 다시 생성합니다:

```tsx
{Array.from({ length: size.height }, (_, y) =>
  Array.from({ length: size.width }, (_, x) => {
    // 16x16 = 256개 div 매번 재생성
  })
)}
```

**개선 방향:**
- Canvas API 사용 (대부분의 픽셀 에디터가 선택하는 방식)
- 또는 React의 `memo`로 개별 픽셀 최적화
- WebGL은 나중에 고려

**3. Core에서 누락된 기능들**

픽셀 에디터에 필수적인 기능들이 빠져 있습니다:

| 기능 | 설명 |
|------|------|
| Undo/Redo | 히스토리 관리 |
| Export/Import | PNG, JSON 등 |
| 레이어 | 여러 레이어 지원 |
| 선택 영역 | 사각형/자유 선택 |

물론 "기본 뼈대"이므로 처음부터 모두 필요하진 않습니다.

---

### 🤔 구조적 질문

**Astro가 최선의 선택인가?**

Astro는 콘텐츠 중심 사이트에 최적화되어 있습니다. 픽셀 에디터는:
- 상호작용이 많은 SPA
- 빈번한 상태 변경
- 클라이언트 사이드 렌더링 필수 (`client:load`)

**대안:**
- **Next.js**: React 생태계에 더 밀착
- **Vite + React**: 가장 단순한 SPA 구성
- **Astro 유지**: 나중에 문서/랜딩 페이지 추가 시 유리

현재 모노레포에 dotori-note(Astro)가 있어서 Astro에 익숙하시다면 괜찮은 선택입니다.

---

### 📊 종합 평가

| 항목 | 점수 | 코멘트 |
|------|------|--------|
| 확장성 | ⭐⭐⭐⭐⭐ | 플랫폼 독립적 구조 우수 |
| 모노레포 일관성 | ⭐⭐⭐⭐⭐ | 기존 패턴과 완벽히 일치 |
| 시작 복잡도 | ⭐⭐⭐⭐ | 적절한 수준의 추상화 |
| 성능 고려 | ⭐⭐⭐ | 초기엔 OK, 스케일 시 개선 필요 |
| 기능 완성도 | ⭐⭐ | 뼈대로서는 충분, 핵심 기능 추가 필요 |

---

### 💡 권장 다음 단계

1. **현재 뼈대로 시작** - 먼저 동작하게 만들기
2. **Canvas API로 렌더링 전환** - 성능 문제 전에 미리
3. **Undo/Redo 추가** - 가장 자주 쓰이는 기능
4. **Export 기능** - PNG로 저장

시작점으로는 좋은 구조입니다. "minimal dependencies" 원칙과 "platform-agnostic" 목표에 부합하고, 점진적으로 확장하기 좋은 기반입니다.

```typescript
// 현재 방식 - 매번 새 Map 생성
export function setPixel(canvas: PixelCanvas, pixel: Pixel): PixelCanvas {
  const newPixels = new Map(canvas.pixels); // O(n) 복사
  newPixels.set(key, pixel);
  return { ...canvas, pixels: newPixels };
}
```

```typescriptreact
{Array.from({ length: size.height }, (_, y) =>
  Array.from({ length: size.width }, (_, x) => {
    // 16x16 = 256개 div 매번 재생성
  })
)}
```

---

**User**

core 패키지가 입력 -> 그리기 커맨드 변환과 같은 도구만을 제공하는 방식은 어때?

---

**Cursor**

굉장히 좋은 아이디어입니다! 이 방식은 **"Command Pattern"** 또는 **"Thin Core"** 접근법으로, 몇 가지 큰 장점이 있습니다.

---

## 제안하신 구조

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  사용자 입력     │ --> │  dotorixel-core │ --> │  렌더러 (React, │
│  (마우스, 터치)  │     │  (커맨드 생성)   │     │  Canvas, WebGL) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              v
                        DrawCommand[]
```

**Core의 역할:**
- 입력 이벤트 해석
- 그리기 커맨드 생성
- 커맨드 직렬화/역직렬화

**Core가 하지 않는 것:**
- 실제 픽셀 데이터 저장
- 렌더링

---

## 코드 예시

### `dotorixel-core` - 커맨드만 정의

```typescript
// commands.ts
export type DrawCommand =
  | { type: 'setPixel'; x: number; y: number; color: string }
  | { type: 'clearPixel'; x: number; y: number }
  | { type: 'fill'; x: number; y: number; color: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; color: string }
  | { type: 'rect'; x: number; y: number; width: number; height: number; color: string };

export type ToolType = 'pen' | 'eraser' | 'fill' | 'line' | 'rect';

// tool-handlers.ts
export function createPenCommand(x: number, y: number, color: string): DrawCommand {
  return { type: 'setPixel', x, y, color };
}

export function createEraserCommand(x: number, y: number): DrawCommand {
  return { type: 'clearPixel', x, y };
}

// Bresenham 알고리즘으로 선 그리기 좌표 생성
export function createLineCommands(
  x1: number, y1: number, 
  x2: number, y2: number, 
  color: string
): DrawCommand[] {
  const commands: DrawCommand[] = [];
  // ... Bresenham 알고리즘
  // 각 점에 대해 setPixel 커맨드 생성
  return commands;
}

// input-interpreter.ts
export interface PointerEvent {
  x: number;
  y: number;
  pressed: boolean;
}

export function interpretInput(
  event: PointerEvent,
  tool: ToolType,
  color: string,
  prevEvent?: PointerEvent
): DrawCommand[] {
  if (!event.pressed) return [];
  
  switch (tool) {
    case 'pen':
      if (prevEvent?.pressed) {
        // 드래그 중이면 선으로 연결
        return createLineCommands(prevEvent.x, prevEvent.y, event.x, event.y, color);
      }
      return [createPenCommand(event.x, event.y, color)];
    case 'eraser':
      return [createEraserCommand(event.x, event.y)];
    // ...
  }
}
```

### `dotorixel-react` - 커맨드를 실행하는 렌더러

```typescript
// useCommandExecutor.ts
export function useCommandExecutor(canvasRef: RefObject<HTMLCanvasElement>) {
  const execute = useCallback((command: DrawCommand) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    switch (command.type) {
      case 'setPixel':
        ctx.fillStyle = command.color;
        ctx.fillRect(command.x, command.y, 1, 1);
        break;
      case 'clearPixel':
        ctx.clearRect(command.x, command.y, 1, 1);
        break;
      // ...
    }
  }, []);
  
  return { execute };
}
```

---

## 장점

| 장점 | 설명 |
|------|------|
| **플랫폼 완전 독립** | Core는 DOM, Canvas, React 어떤 것도 모름 |
| **Undo/Redo 자연스러움** | 커맨드 스택만 관리하면 됨 |
| **네트워크 전송 용이** | 협업 편집 시 커맨드만 전송 |
| **테스트 극도로 쉬움** | 입력 → 커맨드 변환만 테스트 |
| **렌더러 교체 자유** | Canvas 2D → WebGL 전환이 Core 변경 없이 가능 |

---

## 단점 / 고려사항

| 단점 | 설명 |
|------|------|
| **Fill 알고리즘** | Flood fill은 현재 픽셀 상태를 알아야 함 |
| **Color Picker** | 현재 픽셀 색상을 읽어야 함 |
| **상태 쿼리** | "이 좌표에 뭐가 있나?" 같은 질문에 Core가 답 못함 |

### 해결 방법

**방법 1: 쿼리 인터페이스 주입**

```typescript
// Core는 상태를 직접 갖지 않고, 필요할 때 물어봄
export function createFillCommands(
  x: number, 
  y: number, 
  newColor: string,
  getPixelColor: (x: number, y: number) => string | null  // 주입
): DrawCommand[] {
  const targetColor = getPixelColor(x, y);
  // Flood fill 알고리즘...
}
```

**방법 2: 하이브리드 - Core에 최소한의 상태**

```typescript
// Core가 "그리기에 필요한 최소 정보"만 가짐
export interface DrawingState {
  width: number;
  height: number;
  getPixelColor: (x: number, y: number) => string | null;
}
```

---

## 수정된 구조 제안

```text
dotorixel-core/
├── commands/
│   ├── types.ts          # DrawCommand 타입 정의
│   └── serialization.ts  # JSON 직렬화/역직렬화
├── tools/
│   ├── pen.ts            # 펜 도구 커맨드 생성
│   ├── eraser.ts         # 지우개
│   ├── line.ts           # 선 (Bresenham)
│   └── fill.ts           # 채우기 (Flood fill)
├── input/
│   └── interpreter.ts    # 입력 → 커맨드 변환
└── index.ts

dotorixel-react/
├── hooks/
│   ├── usePixelCanvas.ts     # Canvas 상태 관리
│   ├── useCommandHistory.ts  # Undo/Redo
│   └── useInputHandler.ts    # 마우스/터치 이벤트 처리
├── renderers/
│   ├── Canvas2DRenderer.tsx  # Canvas 2D 렌더러
│   └── DOMRenderer.tsx       # (옵션) div 기반 렌더러
└── PixelEditor.tsx
```

---

## 결론

**이 방식을 추천합니다.** 이유:

1. **"minimal dependencies"** 원칙에 더 부합 - Core가 정말 순수해짐
2. **"platform-agnostic"** 목표에 완벽히 맞음 - 렌더러만 바꾸면 어디서든 동작
3. **확장성** - 나중에 협업 편집, 매크로 녹화 등 추가 용이
4. **테스트** - 알고리즘 로직만 분리되어 있어 테스트 커버리지 높이기 쉬움

Fill이나 Color Picker 같은 상태 의존 기능은 "쿼리 함수 주입" 방식으로 깔끔하게 해결됩니다.

```plaintext
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  사용자 입력     │ --> │  dotorixel-core │ --> │  렌더러 (React, │
│  (마우스, 터치)  │     │  (커맨드 생성)   │     │  Canvas, WebGL) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              v
                        DrawCommand[]
```

```typescript
// commands.ts
export type DrawCommand =
  | { type: 'setPixel'; x: number; y: number; color: string }
  | { type: 'clearPixel'; x: number; y: number }
  | { type: 'fill'; x: number; y: number; color: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; color: string }
  | { type: 'rect'; x: number; y: number; width: number; height: number; color: string };

export type ToolType = 'pen' | 'eraser' | 'fill' | 'line' | 'rect';

// tool-handlers.ts
export function createPenCommand(x: number, y: number, color: string): DrawCommand {
  return { type: 'setPixel', x, y, color };
}

export function createEraserCommand(x: number, y: number): DrawCommand {
  return { type: 'clearPixel', x, y };
}

// Bresenham 알고리즘으로 선 그리기 좌표 생성
export function createLineCommands(
  x1: number, y1: number, 
  x2: number, y2: number, 
  color: string
): DrawCommand[] {
  const commands: DrawCommand[] = [];
  // ... Bresenham 알고리즘
  // 각 점에 대해 setPixel 커맨드 생성
  return commands;
}

// input-interpreter.ts
export interface PointerEvent {
  x: number;
  y: number;
  pressed: boolean;
}

export function interpretInput(
  event: PointerEvent,
  tool: ToolType,
  color: string,
  prevEvent?: PointerEvent
): DrawCommand[] {
  if (!event.pressed) return [];
  
  switch (tool) {
    case 'pen':
      if (prevEvent?.pressed) {
        // 드래그 중이면 선으로 연결
        return createLineCommands(prevEvent.x, prevEvent.y, event.x, event.y, color);
      }
      return [createPenCommand(event.x, event.y, color)];
    case 'eraser':
      return [createEraserCommand(event.x, event.y)];
    // ...
  }
}
```

```typescript
// useCommandExecutor.ts
export function useCommandExecutor(canvasRef: RefObject<HTMLCanvasElement>) {
  const execute = useCallback((command: DrawCommand) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    switch (command.type) {
      case 'setPixel':
        ctx.fillStyle = command.color;
        ctx.fillRect(command.x, command.y, 1, 1);
        break;
      case 'clearPixel':
        ctx.clearRect(command.x, command.y, 1, 1);
        break;
      // ...
    }
  }, []);
  
  return { execute };
}
```

```typescript
// Core는 상태를 직접 갖지 않고, 필요할 때 물어봄
export function createFillCommands(
  x: number, 
  y: number, 
  newColor: string,
  getPixelColor: (x: number, y: number) => string | null  // 주입
): DrawCommand[] {
  const targetColor = getPixelColor(x, y);
  // Flood fill 알고리즘...
}
```

```typescript
// Core가 "그리기에 필요한 최소 정보"만 가짐
export interface DrawingState {
  width: number;
  height: number;
  getPixelColor: (x: number, y: number) => string | null;
}
```

```plaintext
dotorixel-core/
├── commands/
│   ├── types.ts          # DrawCommand 타입 정의
│   └── serialization.ts  # JSON 직렬화/역직렬화
├── tools/
│   ├── pen.ts            # 펜 도구 커맨드 생성
│   ├── eraser.ts         # 지우개
│   ├── line.ts           # 선 (Bresenham)
│   └── fill.ts           # 채우기 (Flood fill)
├── input/
│   └── interpreter.ts    # 입력 → 커맨드 변환
└── index.ts

dotorixel-react/
├── hooks/
│   ├── usePixelCanvas.ts     # Canvas 상태 관리
│   ├── useCommandHistory.ts  # Undo/Redo
│   └── useInputHandler.ts    # 마우스/터치 이벤트 처리
├── renderers/
│   ├── Canvas2DRenderer.tsx  # Canvas 2D 렌더러
│   └── DOMRenderer.tsx       # (옵션) div 기반 렌더러
└── PixelEditor.tsx
```

---

**User**

픽셀 상태는 코어가 관리하고, 코어는 입력 이벤트를 받아 그리기 커맨드를 반환, 리액트 컴포넌트는 그리기 이벤트를 구독하여, 그리기 커맨드에 따라 캔버스 API에 렌더링 처리를 실행, 이런 방식은 어때? 모든 픽셀을 매번 새로 그릴 필요 없음, React 쪽에서 복잡하게 메모이제이션을 할 필요도 없음

---

**Cursor**

아주 좋은 설계입니다! **이벤트 기반 증분 렌더링** 방식이네요. 이게 실제로 대부분의 픽셀 에디터들이 사용하는 패턴입니다.

---

## 제안하신 구조

```text
┌─────────────────────────────────────────────────────────────┐
│                     dotorixel-core                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │PixelCanvas  │<-->│ 입력 처리    │--->│ EventEmitter    │  │
│  │(상태 저장)   │    │ (커맨드 생성) │    │ (커맨드 발행)   │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ subscribe('draw', command => ...)
                              v
┌─────────────────────────────────────────────────────────────┐
│                   dotorixel-react                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Canvas2DRenderer                                    │    │
│  │  - 커맨드 받으면 해당 픽셀만 다시 그림               │    │
│  │  - React 상태 업데이트 없음 → 리렌더링 없음          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 코드 예시

### `dotorixel-core`

```typescript
// event-emitter.ts
export type DrawCommand =
  | { type: 'setPixel'; x: number; y: number; color: string }
  | { type: 'clearPixel'; x: number; y: number }
  | { type: 'clearAll' };

type EventMap = {
  draw: DrawCommand;
  historyChange: { canUndo: boolean; canRedo: boolean };
};

export class EventEmitter<T extends Record<string, unknown>> {
  private listeners = new Map<keyof T, Set<(data: never) => void>>();

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as (data: never) => void);
    return () => this.off(event, callback);
  }

  off<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    this.listeners.get(event)?.delete(callback as (data: never) => void);
  }

  protected emit<K extends keyof T>(event: K, data: T[K]) {
    this.listeners.get(event)?.forEach((cb) => cb(data as never));
  }
}

// pixel-editor.ts
export interface PixelEditorOptions {
  width: number;
  height: number;
}

export class PixelEditor extends EventEmitter<EventMap> {
  private pixels: Map<string, string> = new Map(); // "x,y" -> color
  private width: number;
  private height: number;

  constructor(options: PixelEditorOptions) {
    super();
    this.width = options.width;
    this.height = options.height;
  }

  // 입력 이벤트 처리 → 상태 변경 → 커맨드 발행
  setPixel(x: number, y: number, color: string) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    
    const key = `${x},${y}`;
    this.pixels.set(key, color);
    this.emit('draw', { type: 'setPixel', x, y, color });
  }

  clearPixel(x: number, y: number) {
    const key = `${x},${y}`;
    if (this.pixels.has(key)) {
      this.pixels.delete(key);
      this.emit('draw', { type: 'clearPixel', x, y });
    }
  }

  getPixel(x: number, y: number): string | null {
    return this.pixels.get(`${x},${y}`) ?? null;
  }

  // Fill 같은 복잡한 작업도 여러 커맨드 발행
  fill(x: number, y: number, newColor: string) {
    const targetColor = this.getPixel(x, y);
    if (targetColor === newColor) return;
    
    // Flood fill 알고리즘
    const stack = [[x, y]];
    const visited = new Set<string>();
    
    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      const key = `${cx},${cy}`;
      
      if (visited.has(key)) continue;
      if (cx < 0 || cx >= this.width || cy < 0 || cy >= this.height) continue;
      if (this.getPixel(cx, cy) !== targetColor) continue;
      
      visited.add(key);
      this.pixels.set(key, newColor);
      this.emit('draw', { type: 'setPixel', x: cx, y: cy, color: newColor });
      
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
  }

  // 전체 상태 반환 (초기 렌더링용)
  getAllPixels(): Array<{ x: number; y: number; color: string }> {
    return Array.from(this.pixels.entries()).map(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y, color };
    });
  }

  getSize() {
    return { width: this.width, height: this.height };
  }
}
```

### `dotorixel-react`

```typescript
// usePixelEditor.ts
import { useEffect, useRef } from 'react';
import { PixelEditor, type DrawCommand } from '@siluat/dotorixel-core';

export function usePixelEditor(width: number, height: number) {
  const editorRef = useRef<PixelEditor | null>(null);

  if (!editorRef.current) {
    editorRef.current = new PixelEditor({ width, height });
  }

  return editorRef.current;
}

// PixelCanvas.tsx
interface PixelCanvasProps {
  editor: PixelEditor;
  pixelSize?: number;
}

export function PixelCanvas({ editor, pixelSize = 16 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = editor.getSize();

  // 초기 렌더링
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // 배경 (그리드)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);

    // 기존 픽셀 그리기
    for (const { x, y, color } of editor.getAllPixels()) {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }, [editor, pixelSize, width, height]);

  // 커맨드 구독 → 증분 렌더링
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const handleDraw = (command: DrawCommand) => {
      switch (command.type) {
        case 'setPixel':
          ctx.fillStyle = command.color;
          ctx.fillRect(
            command.x * pixelSize, 
            command.y * pixelSize, 
            pixelSize, 
            pixelSize
          );
          break;
        case 'clearPixel':
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(
            command.x * pixelSize, 
            command.y * pixelSize, 
            pixelSize, 
            pixelSize
          );
          break;
        case 'clearAll':
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);
          break;
      }
    };

    return editor.on('draw', handleDraw);
  }, [editor, pixelSize, width, height]);

  // 마우스 이벤트 → Core로 전달
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    editor.setPixel(x, y, '#000000'); // TODO: 선택된 색상
  };

  return (
    <canvas
      ref={canvasRef}
      width={width * pixelSize}
      height={height * pixelSize}
      onPointerDown={handlePointerDown}
      onPointerMove={(e) => e.buttons === 1 && handlePointerDown(e)}
      style={{ cursor: 'crosshair' }}
    />
  );
}
```

---

## 이 방식의 장점

| 장점 | 설명 |
|------|------|
| **증분 렌더링** | 변경된 픽셀만 다시 그림 → 64x64, 128x128도 버벅임 없음 |
| **React 리렌더링 없음** | Canvas는 명령형, React 상태와 분리됨 |
| **메모이제이션 불필요** | React의 복잡한 최적화 고민 제거 |
| **상태 일관성** | Core가 Single Source of Truth |
| **Undo/Redo 쉬움** | 커맨드 히스토리만 저장하면 됨 |
| **직렬화 용이** | 상태 전체를 JSON으로 저장/복원 가능 |

---

## 추가 고려사항

### 1. Undo/Redo 구현

```typescript
// Core에 히스토리 추가
class PixelEditor {
  private history: DrawCommand[][] = [];
  private historyIndex = -1;
  
  private executeAndRecord(commands: DrawCommand[]) {
    // 현재 위치 이후 히스토리 삭제
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(commands);
    this.historyIndex++;
    
    for (const cmd of commands) {
      this.applyCommand(cmd);
      this.emit('draw', cmd);
    }
  }
  
  undo() { /* 역방향 커맨드 실행 */ }
  redo() { /* 정방향 커맨드 재실행 */ }
}
```

### 2. 배치 커맨드 (선 그리기 등)

```typescript
// 드래그로 선을 그릴 때 여러 픽셀을 한 번에 처리
editor.on('draw', (command) => {
  // 개별 픽셀마다 이벤트가 오지만
  // requestAnimationFrame으로 배치 처리 가능
});
```

### 3. React 상태가 필요한 UI

```typescript
// 도구 선택, 색상 선택 등은 여전히 React 상태로
const [currentTool, setCurrentTool] = useState<Tool>('pen');
const [currentColor, setCurrentColor] = useState('#000000');

// Undo/Redo 버튼 활성화 상태
const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);

useEffect(() => {
  return editor.on('historyChange', ({ canUndo, canRedo }) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  });
}, [editor]);
```

---

## 결론

**이 구조가 가장 균형 잡혀 있습니다:**

1. ✅ Core가 상태를 가짐 → Fill, Undo 등 구현 쉬움
2. ✅ 이벤트 기반 → 렌더러가 교체 가능 (Canvas, WebGL, SVG 등)
3. ✅ 증분 렌더링 → 성능 문제 없음
4. ✅ React와 분리 → 메모이제이션 지옥 탈출

이 방식으로 뼈대를 구성하는 게 좋겠습니다. 처음 제안했던 구조보다 훨씬 실용적이고 확장성도 좋습니다!

```plaintext
┌─────────────────────────────────────────────────────────────┐
│                     dotorixel-core                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │PixelCanvas  │<-->│ 입력 처리    │--->│ EventEmitter    │  │
│  │(상태 저장)   │    │ (커맨드 생성) │    │ (커맨드 발행)   │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ subscribe('draw', command => ...)
                              v
┌─────────────────────────────────────────────────────────────┐
│                   dotorixel-react                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Canvas2DRenderer                                    │    │
│  │  - 커맨드 받으면 해당 픽셀만 다시 그림               │    │
│  │  - React 상태 업데이트 없음 → 리렌더링 없음          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

```typescript
// event-emitter.ts
export type DrawCommand =
  | { type: 'setPixel'; x: number; y: number; color: string }
  | { type: 'clearPixel'; x: number; y: number }
  | { type: 'clearAll' };

type EventMap = {
  draw: DrawCommand;
  historyChange: { canUndo: boolean; canRedo: boolean };
};

export class EventEmitter<T extends Record<string, unknown>> {
  private listeners = new Map<keyof T, Set<(data: never) => void>>();

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as (data: never) => void);
    return () => this.off(event, callback);
  }

  off<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    this.listeners.get(event)?.delete(callback as (data: never) => void);
  }

  protected emit<K extends keyof T>(event: K, data: T[K]) {
    this.listeners.get(event)?.forEach((cb) => cb(data as never));
  }
}

// pixel-editor.ts
export interface PixelEditorOptions {
  width: number;
  height: number;
}

export class PixelEditor extends EventEmitter<EventMap> {
  private pixels: Map<string, string> = new Map(); // "x,y" -> color
  private width: number;
  private height: number;

  constructor(options: PixelEditorOptions) {
    super();
    this.width = options.width;
    this.height = options.height;
  }

  // 입력 이벤트 처리 → 상태 변경 → 커맨드 발행
  setPixel(x: number, y: number, color: string) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    
    const key = `${x},${y}`;
    this.pixels.set(key, color);
    this.emit('draw', { type: 'setPixel', x, y, color });
  }

  clearPixel(x: number, y: number) {
    const key = `${x},${y}`;
    if (this.pixels.has(key)) {
      this.pixels.delete(key);
      this.emit('draw', { type: 'clearPixel', x, y });
    }
  }

  getPixel(x: number, y: number): string | null {
    return this.pixels.get(`${x},${y}`) ?? null;
  }

  // Fill 같은 복잡한 작업도 여러 커맨드 발행
  fill(x: number, y: number, newColor: string) {
    const targetColor = this.getPixel(x, y);
    if (targetColor === newColor) return;
    
    // Flood fill 알고리즘
    const stack = [[x, y]];
    const visited = new Set<string>();
    
    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      const key = `${cx},${cy}`;
      
      if (visited.has(key)) continue;
      if (cx < 0 || cx >= this.width || cy < 0 || cy >= this.height) continue;
      if (this.getPixel(cx, cy) !== targetColor) continue;
      
      visited.add(key);
      this.pixels.set(key, newColor);
      this.emit('draw', { type: 'setPixel', x: cx, y: cy, color: newColor });
      
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
  }

  // 전체 상태 반환 (초기 렌더링용)
  getAllPixels(): Array<{ x: number; y: number; color: string }> {
    return Array.from(this.pixels.entries()).map(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y, color };
    });
  }

  getSize() {
    return { width: this.width, height: this.height };
  }
}
```

```typescript
// usePixelEditor.ts
import { useEffect, useRef } from 'react';
import { PixelEditor, type DrawCommand } from '@siluat/dotorixel-core';

export function usePixelEditor(width: number, height: number) {
  const editorRef = useRef<PixelEditor | null>(null);

  if (!editorRef.current) {
    editorRef.current = new PixelEditor({ width, height });
  }

  return editorRef.current;
}

// PixelCanvas.tsx
interface PixelCanvasProps {
  editor: PixelEditor;
  pixelSize?: number;
}

export function PixelCanvas({ editor, pixelSize = 16 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = editor.getSize();

  // 초기 렌더링
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // 배경 (그리드)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);

    // 기존 픽셀 그리기
    for (const { x, y, color } of editor.getAllPixels()) {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }, [editor, pixelSize, width, height]);

  // 커맨드 구독 → 증분 렌더링
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const handleDraw = (command: DrawCommand) => {
      switch (command.type) {
        case 'setPixel':
          ctx.fillStyle = command.color;
          ctx.fillRect(
            command.x * pixelSize, 
            command.y * pixelSize, 
            pixelSize, 
            pixelSize
          );
          break;
        case 'clearPixel':
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(
            command.x * pixelSize, 
            command.y * pixelSize, 
            pixelSize, 
            pixelSize
          );
          break;
        case 'clearAll':
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);
          break;
      }
    };

    return editor.on('draw', handleDraw);
  }, [editor, pixelSize, width, height]);

  // 마우스 이벤트 → Core로 전달
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    editor.setPixel(x, y, '#000000'); // TODO: 선택된 색상
  };

  return (
    <canvas
      ref={canvasRef}
      width={width * pixelSize}
      height={height * pixelSize}
      onPointerDown={handlePointerDown}
      onPointerMove={(e) => e.buttons === 1 && handlePointerDown(e)}
      style={{ cursor: 'crosshair' }}
    />
  );
}
```

```typescript
// Core에 히스토리 추가
class PixelEditor {
  private history: DrawCommand[][] = [];
  private historyIndex = -1;
  
  private executeAndRecord(commands: DrawCommand[]) {
    // 현재 위치 이후 히스토리 삭제
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(commands);
    this.historyIndex++;
    
    for (const cmd of commands) {
      this.applyCommand(cmd);
      this.emit('draw', cmd);
    }
  }
  
  undo() { /* 역방향 커맨드 실행 */ }
  redo() { /* 정방향 커맨드 재실행 */ }
}
```

```typescript
// 드래그로 선을 그릴 때 여러 픽셀을 한 번에 처리
editor.on('draw', (command) => {
  // 개별 픽셀마다 이벤트가 오지만
  // requestAnimationFrame으로 배치 처리 가능
});
```

```typescript
// 도구 선택, 색상 선택 등은 여전히 React 상태로
const [currentTool, setCurrentTool] = useState<Tool>('pen');
const [currentColor, setCurrentColor] = useState('#000000');

// Undo/Redo 버튼 활성화 상태
const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);

useEffect(() => {
  return editor.on('historyChange', ({ canUndo, canRedo }) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  });
}, [editor]);
```

---

**User**

예시 코드를 작성해줘. 프로젝트 설정 같은 코드는 필요없어. 핵심 코드만. 마우스 클릭과 드래그로 그리기 기능만을 대상으로.

---

**Cursor**

## `dotorixel-core`

### `src/event-emitter.ts`

```typescript
type Listener<T> = (data: T) => void;

export class EventEmitter<EventMap extends Record<string, unknown>> {
  private listeners = new Map<keyof EventMap, Set<Listener<never>>>();

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener<never>);

    return () => this.off(event, listener);
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<never>);
  }

  protected emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(data as never));
  }
}
```

### `src/types.ts`

```typescript
export type DrawCommand =
  | { type: 'setPixel'; x: number; y: number; color: string }
  | { type: 'clearPixel'; x: number; y: number };

export interface EditorEvents {
  draw: DrawCommand;
}

export interface EditorOptions {
  width: number;
  height: number;
}

export interface Pixel {
  x: number;
  y: number;
  color: string;
}
```

### `src/pixel-editor.ts`

```typescript
import { EventEmitter } from './event-emitter';
import type { DrawCommand, EditorEvents, EditorOptions, Pixel } from './types';

export class PixelEditor extends EventEmitter<EditorEvents> {
  private pixels = new Map<string, string>();
  readonly width: number;
  readonly height: number;

  constructor(options: EditorOptions) {
    super();
    this.width = options.width;
    this.height = options.height;
  }

  private key(x: number, y: number): string {
    return `${x},${y}`;
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  setPixel(x: number, y: number, color: string): void {
    if (!this.isInBounds(x, y)) return;

    const key = this.key(x, y);
    if (this.pixels.get(key) === color) return;

    this.pixels.set(key, color);
    this.emit('draw', { type: 'setPixel', x, y, color });
  }

  clearPixel(x: number, y: number): void {
    if (!this.isInBounds(x, y)) return;

    const key = this.key(x, y);
    if (!this.pixels.has(key)) return;

    this.pixels.delete(key);
    this.emit('draw', { type: 'clearPixel', x, y });
  }

  getPixel(x: number, y: number): string | null {
    return this.pixels.get(this.key(x, y)) ?? null;
  }

  getAllPixels(): Pixel[] {
    return Array.from(this.pixels.entries()).map(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y, color };
    });
  }
}
```

### `src/line.ts`

```typescript
// Bresenham's line algorithm
export function getLinePixels(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): Array<{ x: number; y: number }> {
  const pixels: Array<{ x: number; y: number }> = [];

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    pixels.push({ x, y });

    if (x === x1 && y === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return pixels;
}
```

### `src/index.ts`

```typescript
export { PixelEditor } from './pixel-editor';
export { getLinePixels } from './line';
export type { DrawCommand, EditorEvents, EditorOptions, Pixel } from './types';
```

---

## `dotorixel-react`

### `src/PixelCanvas.tsx`

```tsx
import { useEffect, useRef } from 'react';
import { type DrawCommand, type PixelEditor, getLinePixels } from '@siluat/dotorixel-core';

interface PixelCanvasProps {
  editor: PixelEditor;
  pixelSize?: number;
  color?: string;
  backgroundColor?: string;
}

export function PixelCanvas({
  editor,
  pixelSize = 16,
  color = '#000000',
  backgroundColor = '#ffffff',
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const colorRef = useRef(color);

  colorRef.current = color;

  const canvasWidth = editor.width * pixelSize;
  const canvasHeight = editor.height * pixelSize;

  // Initial render
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (const { x, y, color } of editor.getAllPixels()) {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }, [editor, pixelSize, canvasWidth, canvasHeight, backgroundColor]);

  // Subscribe to draw commands
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const handleDraw = (command: DrawCommand) => {
      switch (command.type) {
        case 'setPixel':
          ctx.fillStyle = command.color;
          ctx.fillRect(command.x * pixelSize, command.y * pixelSize, pixelSize, pixelSize);
          break;
        case 'clearPixel':
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(command.x * pixelSize, command.y * pixelSize, pixelSize, pixelSize);
          break;
      }
    };

    return editor.on('draw', handleDraw);
  }, [editor, pixelSize, backgroundColor]);

  const getPixelCoords = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / pixelSize),
      y: Math.floor((e.clientY - rect.top) / pixelSize),
    };
  };

  const drawAt = (x: number, y: number) => {
    editor.setPixel(x, y, colorRef.current);
  };

  const drawLine = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const pixels = getLinePixels(from.x, from.y, to.x, to.y);
    for (const { x, y } of pixels) {
      drawAt(x, y);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    canvasRef.current?.setPointerCapture(e.pointerId);
    const pos = getPixelCoords(e);
    drawAt(pos.x, pos.y);
    lastPosRef.current = pos;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!lastPosRef.current) return;

    const pos = getPixelCoords(e);
    if (pos.x !== lastPosRef.current.x || pos.y !== lastPosRef.current.y) {
      drawLine(lastPosRef.current, pos);
      lastPosRef.current = pos;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    lastPosRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ cursor: 'crosshair', touchAction: 'none' }}
    />
  );
}
```

### `src/usePixelEditor.ts`

```typescript
import { useRef } from 'react';
import { PixelEditor, type EditorOptions } from '@siluat/dotorixel-core';

export function usePixelEditor(options: EditorOptions): PixelEditor {
  const editorRef = useRef<PixelEditor | null>(null);

  if (!editorRef.current) {
    editorRef.current = new PixelEditor(options);
  }

  return editorRef.current;
}
```

### `src/index.ts`

```typescript
export { PixelCanvas } from './PixelCanvas';
export { usePixelEditor } from './usePixelEditor';
```

---

## 사용 예시

```tsx
import { PixelCanvas, usePixelEditor } from '@siluat/dotorixel-react';
import { useState } from 'react';

export function App() {
  const editor = usePixelEditor({ width: 32, height: 32 });
  const [color, setColor] = useState('#000000');

  return (
    <div>
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <PixelCanvas editor={editor} pixelSize={16} color={color} />
    </div>
  );
}
```

---

## 핵심 포인트

| 컴포넌트 | 역할 |
|----------|------|
| `PixelEditor` | 픽셀 상태 관리 + 변경 시 이벤트 발행 |
| `getLinePixels` | 드래그 시 Bresenham 알고리즘으로 중간 픽셀 계산 |
| `PixelCanvas` | 이벤트 구독 → 변경된 픽셀만 Canvas에 렌더링 |

- 드래그 시 `setPointerCapture`로 캔버스 밖으로 나가도 추적
- `lastPosRef`로 이전 위치 저장 → 빠른 드래그에도 선이 끊기지 않음
- `colorRef`로 색상 변경 시 리렌더링 없이 반영

```typescript
type Listener<T> = (data: T) => void;

export class EventEmitter<EventMap extends Record<string, unknown>> {
  private listeners = new Map<keyof EventMap, Set<Listener<never>>>();

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener<never>);

    return () => this.off(event, listener);
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<never>);
  }

  protected emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(data as never));
  }
}
```

```typescript
export type DrawCommand =
  | { type: 'setPixel'; x: number; y: number; color: string }
  | { type: 'clearPixel'; x: number; y: number };

export interface EditorEvents {
  draw: DrawCommand;
}

export interface EditorOptions {
  width: number;
  height: number;
}

export interface Pixel {
  x: number;
  y: number;
  color: string;
}
```

```typescript
import { EventEmitter } from './event-emitter';
import type { DrawCommand, EditorEvents, EditorOptions, Pixel } from './types';

export class PixelEditor extends EventEmitter<EditorEvents> {
  private pixels = new Map<string, string>();
  readonly width: number;
  readonly height: number;

  constructor(options: EditorOptions) {
    super();
    this.width = options.width;
    this.height = options.height;
  }

  private key(x: number, y: number): string {
    return `${x},${y}`;
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  setPixel(x: number, y: number, color: string): void {
    if (!this.isInBounds(x, y)) return;

    const key = this.key(x, y);
    if (this.pixels.get(key) === color) return;

    this.pixels.set(key, color);
    this.emit('draw', { type: 'setPixel', x, y, color });
  }

  clearPixel(x: number, y: number): void {
    if (!this.isInBounds(x, y)) return;

    const key = this.key(x, y);
    if (!this.pixels.has(key)) return;

    this.pixels.delete(key);
    this.emit('draw', { type: 'clearPixel', x, y });
  }

  getPixel(x: number, y: number): string | null {
    return this.pixels.get(this.key(x, y)) ?? null;
  }

  getAllPixels(): Pixel[] {
    return Array.from(this.pixels.entries()).map(([key, color]) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y, color };
    });
  }
}
```

```typescript
// Bresenham's line algorithm
export function getLinePixels(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): Array<{ x: number; y: number }> {
  const pixels: Array<{ x: number; y: number }> = [];

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    pixels.push({ x, y });

    if (x === x1 && y === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return pixels;
}
```

```typescript
export { PixelEditor } from './pixel-editor';
export { getLinePixels } from './line';
export type { DrawCommand, EditorEvents, EditorOptions, Pixel } from './types';
```

```typescriptreact
import { useEffect, useRef } from 'react';
import { type DrawCommand, type PixelEditor, getLinePixels } from '@siluat/dotorixel-core';

interface PixelCanvasProps {
  editor: PixelEditor;
  pixelSize?: number;
  color?: string;
  backgroundColor?: string;
}

export function PixelCanvas({
  editor,
  pixelSize = 16,
  color = '#000000',
  backgroundColor = '#ffffff',
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const colorRef = useRef(color);

  colorRef.current = color;

  const canvasWidth = editor.width * pixelSize;
  const canvasHeight = editor.height * pixelSize;

  // Initial render
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (const { x, y, color } of editor.getAllPixels()) {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }, [editor, pixelSize, canvasWidth, canvasHeight, backgroundColor]);

  // Subscribe to draw commands
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const handleDraw = (command: DrawCommand) => {
      switch (command.type) {
        case 'setPixel':
          ctx.fillStyle = command.color;
          ctx.fillRect(command.x * pixelSize, command.y * pixelSize, pixelSize, pixelSize);
          break;
        case 'clearPixel':
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(command.x * pixelSize, command.y * pixelSize, pixelSize, pixelSize);
          break;
      }
    };

    return editor.on('draw', handleDraw);
  }, [editor, pixelSize, backgroundColor]);

  const getPixelCoords = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / pixelSize),
      y: Math.floor((e.clientY - rect.top) / pixelSize),
    };
  };

  const drawAt = (x: number, y: number) => {
    editor.setPixel(x, y, colorRef.current);
  };

  const drawLine = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const pixels = getLinePixels(from.x, from.y, to.x, to.y);
    for (const { x, y } of pixels) {
      drawAt(x, y);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    canvasRef.current?.setPointerCapture(e.pointerId);
    const pos = getPixelCoords(e);
    drawAt(pos.x, pos.y);
    lastPosRef.current = pos;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!lastPosRef.current) return;

    const pos = getPixelCoords(e);
    if (pos.x !== lastPosRef.current.x || pos.y !== lastPosRef.current.y) {
      drawLine(lastPosRef.current, pos);
      lastPosRef.current = pos;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    lastPosRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ cursor: 'crosshair', touchAction: 'none' }}
    />
  );
}
```

```typescript
import { useRef } from 'react';
import { PixelEditor, type EditorOptions } from '@siluat/dotorixel-core';

export function usePixelEditor(options: EditorOptions): PixelEditor {
  const editorRef = useRef<PixelEditor | null>(null);

  if (!editorRef.current) {
    editorRef.current = new PixelEditor(options);
  }

  return editorRef.current;
}
```

```typescript
export { PixelCanvas } from './PixelCanvas';
export { usePixelEditor } from './usePixelEditor';
```

```typescriptreact
import { PixelCanvas, usePixelEditor } from '@siluat/dotorixel-react';
import { useState } from 'react';

export function App() {
  const editor = usePixelEditor({ width: 32, height: 32 });
  const [color, setColor] = useState('#000000');

  return (
    <div>
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <PixelCanvas editor={editor} pixelSize={16} color={color} />
    </div>
  );
}
```


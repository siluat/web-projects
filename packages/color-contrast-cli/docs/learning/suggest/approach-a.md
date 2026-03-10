# Approach A: Target Luminance + OkLCH Binary Search

Origin: Chrome DevTools의 `findFgColorForContrast` + OkLCH 색공간 적용

## Summary

WCAG 대비비 공식을 역산하여 **목표 luminance를 먼저 계산**한 뒤, OkLCH lightness를 이진 탐색하여 해당 luminance를 달성하는 색을 찾는다.

## Algorithm

```text
suggestForeground(fg, bg, targetRatio):
  1. bg → sRGB → linear → bgLum (배경 luminance 계산)
  2. fg → sRGB → linear → fgLum (현재 전경 luminance 계산)
  3. 현재 대비비 >= targetRatio이면 return null (이미 통과)
  4. fg → OkLCH (C, H 고정용)
  5. 목표 luminance 계산:
     darker:  targetLum = (bgLum + 0.05) / targetRatio - 0.05
     lighter: targetLum = (bgLum + 0.05) * targetRatio - 0.05
  6. 각 방향에 대해:
     a. targetLum이 [0, 1] 범위 밖이면 해당 방향 불가
     b. OkLCH L을 이진 탐색 (C, H 고정):
        - 후보 OkLCH(L, C, H) → gamutMapOklch → sRGB → linear → luminance
        - |luminance - targetLum| < epsilon이면 수렴
     c. 수렴한 색을 후보로 저장
  7. 두 후보 중 원본 L과의 차이(|L_suggested - L_original|)가 작은 쪽 반환
     - 한쪽만 가능하면 그 쪽 반환
     - 둘 다 불가능하면 null 반환
```

## Characteristics

**수렴 대상:** luminance (단일 스칼라 값)

**사전 판별:** 목표 luminance가 [0, 1] 범위 밖인지 계산만으로 즉시 확인 가능. 불가능한 방향에 대해 탐색을 시도하지 않으므로 불필요한 반복 없음.

**반복 횟수:** OkLCH L의 범위 [0, 1]에서 이진 탐색. epsilon = 1e-6 기준 약 20회. 각 반복마다 gamut mapping + luminance 계산 파이프라인 1회 실행.

**Chrome DevTools와의 차이:**

- DevTools는 HSV 공간에서 V를 먼저 조정, 실패 시 S를 조정하는 2단계 전략 사용
- DevTools는 순수 이진 탐색이 아닌 gradient-guided 수렴 (dLuminance를 스텝 크기로 사용)
- 이 접근법은 OkLCH에서 L만 조정하는 단일 단계 (OkLCH의 L이 HSV의 V+S 역할을 모두 포함)

## Required Changes

### New infrastructure

- `srgbToOklch()`: sRGB → linear sRGB → XYZ → OkLab → OkLCH
  - `gamut-map.ts`의 private `linearRgbToXyz()`, `xyzToOklab()` 추출 필요
  - `oklabToOklch()` (convert/oklab-to-oklch.ts)는 이미 존재

### New module

- `src/suggest.ts`:
  - `computeTargetLuminance(bgLum, targetRatio, direction)` — WCAG 역산
  - `suggestForeground(fg, bg, targetRatio)` — 메인 함수
  - 이진 탐색 루프

### Existing reuse

- `gamutMapOklch()` — OkLCH → sRGB (gamut mapping 포함)
- `srgbToLinear()` + `relativeLuminance()` — luminance 계산
- `alphaComposite()` — 알파 처리
- `parseColor()` / `parseOrThrow()` — 색상 파싱

## Edge Cases

| Case | Handling |
|---|---|
| 목표 luminance < 0 | 해당 방향 불가 (darker 방향에서 발생 가능) |
| 목표 luminance > 1 | 해당 방향 불가 (lighter 방향에서 발생 가능) |
| 양쪽 모두 불가 | null 반환 (e.g., mid-gray 배경에 21:1 요구) |
| Gamut mapping으로 인한 luminance 비단조성 | 실측 결과 비단조성이 존재하나 최대 luminance 감소 ~4.6e-5, 대비비 영향 < 0.001. 이진 탐색 수렴에 실질적 영향 없음 (검증: `docs/designs/suggest/verify-monotonicity.ts`). |
| 알파 < 1 | 알파를 유지하고 L만 조정. 알파 합성 후의 대비비로 판정. |

## References

- Chrome DevTools `findFgColorForContrast`, `desiredLuminance`, `approachColorValue` — [Chromium source](https://source.chromium.org/chromium/_/chromium/devtools/devtools-frontend/+/234d846cbaa82c0417b3f540062087a8c95813b9:front_end/core/common/Color.ts;l=2187)
- DevTools는 목표 대비비에 +0.1 마진을 추가하여 경계선 문제 방지

# Approach C: Constrained Optimization (Binary Search + Delta E Minimization)

Origin: arXiv:2512.05067 (Lalitha A R, 2025) — "Perceptually-Minimal Color Optimization for Web Accessibility"

## Summary

대비비 충족을 제약 조건으로, 원본과의 지각적 차이(Delta E)를 최소화하는 **제약 최적화 문제**로 정식화. 이진 탐색으로 초기 후보를 찾은 뒤, gradient descent로 Delta E를 추가 최소화한다.

## Algorithm

```text
suggestForeground(fg, bg, targetRatio):
  1. bg → sRGB → bgLum
  2. fg → sRGB → fgLum. 현재 대비비 >= targetRatio이면 return null
  3. fg → OkLCH (원본 L₀, C₀, H₀ 기록)

  Phase 1 — Binary search on L (C, H 고정):
  4. Approach A 또는 B와 동일한 이진 탐색으로 초기 후보 (L₁, C₀, H₀) 확보
  5. 후보의 대비비가 targetRatio 이상인지 확인

  Phase 2 — Gradient descent on Delta E:
  6. 목적 함수: minimize DeltaE(OkLab(L,C,H), OkLab(L₀,C₀,H₀))
     제약: contrastRatio(oklchToSrgb(L,C,H), bg) >= targetRatio
  7. L₁에서 시작, L을 원본 L₀ 방향으로 미세 조정
     - 각 스텝: L += step * direction
     - 대비비가 targetRatio 미만이 되면 직전 값으로 복귀
     - step을 절반으로 줄여 반복
     - 수렴 조건: step < epsilon

  Phase 3 — Constraint relaxation (optional):
  8. Phase 1-2에서 해를 못 찾으면:
     a. C(chroma)를 줄여가며 Phase 1-2 반복
     b. C=0(무채색)까지 시도
     c. 그래도 불가능하면 null 반환
```

## Characteristics

**수렴 대상:** Delta E (Phase 1은 luminance/ratio, Phase 2는 Delta E)

**Phase 2의 실질적 효과 — 분석:**

Phase 2는 L을 원본 L₀ 방향으로 되돌리며 "대비비를 간신히 충족하는 L"을 정밀하게 찾는다. C와 H가 고정이면, Delta E = |L₁ - L₀| (OkLCH에서 L축 거리)이므로 Delta E 최소화 = L을 L₀에 최대한 가깝게 = 대비비를 간신히 충족.

**즉, C/H 고정 시 Phase 2는 Phase 1의 이진 탐색을 더 정밀하게 수렴시키는 것과 동일한 효과.**

Phase 2가 독립적인 가치를 갖는 경우:
- C도 자유 변수로 열었을 때: (L, C) 2차원 공간에서 Delta E를 최소화하므로, L만 조정하는 것보다 더 가까운 색을 찾을 수 있음
- H도 자유 변수로 열었을 때: 3차원 최적화 (이 프로젝트의 v1 범위 밖)

**Phase 3의 의미:**

L만으로 불가능한 경우(주로 고채도 색이 gamut 경계에 있을 때), C를 줄여 gamut 내에서 더 넓은 L 범위를 확보한다.

**반복 횟수:** Phase 1 ~20회 + Phase 2 ~10-20회 + Phase 3 (필요 시) 외부 루프 * Phase 1-2. 최악의 경우 Approach A/B 대비 2-3배.

**구현 복잡도:** Approach A/B 대비 높음:
- Phase 2의 gradient descent 로직
- Phase 3의 C 축소 + 재탐색 로직
- Delta E 계산 함수 (OkLab 유클리드 거리 — `gamut-map.ts`의 `deltaEOK`로 이미 존재하나 private)

## Required Changes

### New infrastructure

- `srgbToOklch()`: Approach A/B와 동일
- `deltaEOklab()`: OkLab 유클리드 거리 (public 버전). `gamut-map.ts`의 `deltaEOK` 추출.

### New module

- `src/suggest.ts`:
  - Phase 1: 이진 탐색 (A 또는 B 방식)
  - Phase 2: gradient descent 루프
  - Phase 3: chroma 축소 + 재시도 루프
  - `suggestForeground(fg, bg, targetRatio)` — 통합 메인 함수

### Existing reuse

- Approach A/B와 동일 + `deltaEOK` (gamut-map.ts)

## Edge Cases

| Case | Handling |
|---|---|
| Phase 1에서 즉시 해 발견 | Phase 2 생략 가능 (이미 대비비를 간신히 충족하는 경우) |
| Phase 2에서 개선 없음 | Phase 1 결과 그대로 반환 |
| C=0에서도 불가 | null 반환 (무채색으로도 대비비 달성 불가) |
| Gamut mapping 비단조성 | 실측 결과 비단조성이 존재하나 대비비 영향 < 0.001. Phase 1 이진 탐색 수렴에 실질적 영향 없음 (검증: `docs/designs/suggest/verify-monotonicity.ts`). |
| Gradient descent 진동 | step 크기 감소로 완화. 최대 반복 횟수 제한. |
| 알파 < 1 | Approach A/B와 동일 |

## References

- arXiv:2512.05067 — "Perceptually-Minimal Color Optimization for Web Accessibility: A Multi-Phase Constrained Approach" (Lalitha A R, Dec 2025)
- arXiv:2512.07623 — "Context-Adaptive Color Optimization for Web Accessibility" (확장 논문, 3개 모드 비교)
- 논문 자체 평가: 10,000쌍 테스트, 77.22% 성공률, 성공 시 88.51%가 Delta E 기준 "구별 불가". 단, 외부 도구와의 비교 없음.
- 10,000쌍 데이터셋: [GitHub Gist](https://gist.github.com/lalithaar/54580c7c46ad563198f83d8e4f751ee5)

## Key Observation

C/H 고정(자유 변수 = L 하나) 조건에서, 이 접근법의 Phase 1 결과는 Approach A/B의 결과와 동일하며, Phase 2는 이진 탐색의 수렴 정밀도를 높이는 것 이상의 효과가 없다.

Phase 2-3이 진정한 가치를 갖는 것은 C를 자유 변수로 여는 경우이며, 이는 v1 이후의 확장 과제에 해당한다.

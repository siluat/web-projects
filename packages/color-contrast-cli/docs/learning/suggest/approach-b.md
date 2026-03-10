# Approach B: Direct Contrast Ratio Binary Search

Origin: Adobe Leonardo의 `searchColors` — 색상 스케일 위에서 목표 대비비 지점을 이진 탐색

## Summary

목표 luminance를 사전 계산하지 않고, OkLCH lightness를 이진 탐색하면서 **매 단계마다 대비비를 직접 계산**하여 목표 대비비를 충족하는 지점을 찾는다.

## Algorithm

```text
suggestForeground(fg, bg, targetRatio):
  1. bg → sRGB (배경 색상 준비)
  2. fg → sRGB → 대비비 계산. >= targetRatio이면 return null (이미 통과)
  3. fg → OkLCH (C, H 고정용)
  4. 각 방향(darker, lighter)에 대해:
     a. 탐색 범위 설정:
        darker:  L ∈ [0, fg.L]
        lighter: L ∈ [fg.L, 1]
     b. 이진 탐색:
        - mid = (lo + hi) / 2
        - OkLCH(mid, C, H) → gamutMapOklch → sRGB → 배경과 대비비 계산
        - 대비비 >= targetRatio이면 범위를 원본 쪽으로 좁힘 (더 가까운 색 탐색)
        - 대비비 < targetRatio이면 범위를 반대쪽으로 좁힘
        - |대비비 - targetRatio| < epsilon이면 수렴
     c. 수렴한 색을 후보로 저장
  5. 두 후보 중 원본 L과의 차이가 작은 쪽 반환
```

## Characteristics

**수렴 대상:** 대비비 (targetRatio에 직접 수렴)

**사전 판별:** 없음. 탐색 범위 끝(L=0 또는 L=1)에서의 대비비가 targetRatio에 미달하면 탐색 중 발견됨. Approach A보다 1~2회 추가 반복이 필요할 수 있음.

**반복 횟수:** Approach A와 동일 (~20회). 각 반복의 비용도 동일 (gamut mapping + luminance 계산). 추가 비용은 대비비 계산 1회(나눗셈 1회)뿐으로 무시 가능.

**Adobe Leonardo와의 차이:**

- Leonardo는 3000포인트의 색상 스케일을 미리 생성하고 캐싱. 여러 목표 대비비에 대해 반복 탐색할 때 효율적.
- 이 접근법은 스케일 없이 즉시 이진 탐색. 단일 목표 대비비에 대해 더 단순.
- Leonardo는 여러 key color 간 보간을 지원하지만, 이 프로젝트에서는 단일 색상 조정만 필요.

**Approach A와의 관계:**

- 자유 변수가 L 하나이고 C/H가 고정이면, "목표 luminance를 달성하는 L"과 "목표 대비비를 달성하는 L"은 수학적으로 동일한 L에 수렴.
- 실질적 차이는 수렴 판정 기준뿐: A는 |luminance - target| < ε, B는 |ratio - target| < ε.
- 탐색 방향 결정에서의 차이: A는 불가능한 방향을 사전에 배제, B는 탐색 중 발견.

## Required Changes

### New infrastructure

- `srgbToOklch()`: Approach A와 동일

### New module

- `src/suggest.ts`:
  - `suggestForeground(fg, bg, targetRatio)` — 메인 함수
  - 이진 탐색 루프 (대비비 기반 판정)

### Existing reuse

- Approach A와 동일

## Edge Cases

| Case | Handling |
|---|---|
| L=0에서도 대비비 부족 | 해당 방향(darker) 불가. 탐색 종료 후 판별. |
| L=1에서도 대비비 부족 | 해당 방향(lighter) 불가. 탐색 종료 후 판별. |
| 양쪽 모두 불가 | null 반환 |
| Gamut mapping 비단조성 | 실측 결과 비단조성이 존재하나 대비비 영향 < 0.001. 이진 탐색 수렴에 실질적 영향 없음 (검증: `docs/designs/suggest/verify-monotonicity.ts`). |
| 알파 < 1 | Approach A와 동일 |

## References

- Adobe Leonardo `searchColors`, `colorSearch` — [GitHub: adobe/leonardo](https://github.com/adobe/leonardo), `packages/contrast-colors/lib/utils.js`
- Leonardo는 목표 대비비에 +0.005 오프셋을 추가하여 양자화 오차 방지

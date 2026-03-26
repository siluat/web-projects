# 색상 제안 알고리즘 조사

`--suggest` 기능의 설계 과정에서, 기존 도구들의 알고리즘을 조사하여 세 가지 접근법을 도출하고 비교 분석했다.

## 배경

색상 쌍이 WCAG 대비비를 충족하지 못할 때, 충족하는 가장 가까운 색을 자동으로 제안하려면 "어떻게 탐색할 것인가"를 결정해야 한다. 기존 도구들이 이 문제를 어떻게 해결하는지 조사하고, 이 프로젝트에 적합한 방법을 선택하기 위해 분석을 수행했다.

## 조사한 도구

| 도구 | 접근 방식 | 색공간 |
|---|---|---|
| Chrome DevTools | 목표 luminance 계산 + gradient-guided 수렴 | HSV |
| Adobe Leonardo | 3000포인트 색상 스케일 + 이진 탐색 | 사용자 선택 (LAB, OKLCH 등) |
| Tanaguru Contrast-Finder | 브루트포스 격자 탐색 | HSB + RGB |
| arXiv:2512.05067 (Lalitha, 2025) | 이진 탐색 + gradient descent + 제약 완화 | OKLCH |

도구 간 제안 품질을 직접 비교한 연구는 존재하지 않았다.

## 도출한 접근법

- [Approach A](approach-a.md) — 목표 luminance 직접 계산 + OkLCH L 이진 탐색 (DevTools 계열)
- [Approach B](approach-b.md) — 대비비를 직접 평가하며 OkLCH L 이진 탐색 (Leonardo 계열)
- [Approach C](approach-c.md) — 이진 탐색 + Delta E gradient descent + chroma 축소 (논문 계열)

## 핵심 결론

- **세 접근법 모두 OkLCH에서 hue/chroma를 고정하고 lightness만 조정**하면, 자유 변수가 1개이므로 동일한 결과에 수렴한다.
- 이진 탐색의 전제인 **OkLCH L → luminance 단조성**을 실측 검증했다. 비단조성이 존재하나 대비비 영향 < 0.001로 무시 가능하다 ([verify-monotonicity.ts](../../designs/suggest/verify-monotonicity.ts)).
- Approach C의 Phase 2(gradient descent)는 L만 조정할 때 이진 탐색 대비 추가 효과가 없다. Phase 3(chroma 축소)은 A/B에 독립적으로 추가할 수 있는 확장이다.
- **알고리즘 선택보다 색공간 선택(OkLCH)이 결과 품질에 더 큰 영향**을 미친다.

최종적으로 Approach A를 채택했다. 사전에 불가능한 방향을 판별할 수 있어 코드 흐름이 명확하고, 구현이 단순하다. 상세 설계는 [design.md](../../designs/suggest/design.md)에 기록되어 있다.

# dotori-note

이것저것 기록하고 관리하기 위한 노트

## 프로젝트 구조

Astro 프로젝트 기본 구조와 FSD(Feature-Sliced Design) 구조를 조합하여 다음과 같은 레이어 규칙을 따른다.

| 레이어 | 컨벤션 | 부가 설명 |
| --- | --- | --- |
| `notes` | Astro | MDX 형식의 콘텐츠 파일 관리 |
| `src/app` | FSD | |
| `src/pages` | Astro | |
| `src/widgets` | FSD | |
| `src/features` | FSD | |
| `src/entities` | FSD | |
| `src/shared` | FSD | |

- FSD 레이어 규칙과 동일하게 모든 레이어는 하위 레이어만을 참조할 수 있다.

### 참고

- [Astro 프로젝트 구조](https://docs.astro.build/en/basics/project-structure/)
- [Feature-Sliced Design](https://feature-sliced.github.io/documentation/docs/get-started/overview#concepts)

## 기술/패키지 의존성

- 콘텐츠 관리
  - 의존: [MDX](https://mdxjs.com/)
  - 선택 이유: 널리 사용되는 포맷이므로 나중에 다른 부분의 기술을 변경할 때, 비교적 마이그레이션 비용이 적을 것이라 기대할 수 있다.
- 웹 프레임워크
  - 의존: [Astro](https://astro.build/)
  - 선택 이유:
    - 일반적으로 고성능의 사이트를 생성할 것으로 기대된다. (참고: https://docs.astro.build/en/concepts/why-astro/#fast-by-default) 개인적인 경험은 간단한 수준의 프로젝트 경험만 있지만 그래도 다른 유사 프레임워크 사용 경험에 비해 확실히 좋은 결과를 경험했다.
    - 공식 문서의 품질이 좋다.
    - 주요 프론트엔드 프레임워크/라이브러리(e.g. React) 기반의 컴포넌트를 재사용할 수 있다. (참고: https://docs.astro.build/en/guides/framework-components/)
    - 콘텐츠 관리를 위해 내가 필요로 하는 기능들을 충분히 제공하고 있다. (e.g. [Multiple collections](https://docs.astro.build/en/guides/content-collections/#organizing-with-multiple-collections), [Defining custom slugs](https://docs.astro.build/en/guides/content-collections/#defining-custom-slugs))
- CSS & 스타일링
  - ~~의존: Panda CSS~~
  - ~~선택 이유:~~
    - ~~제공하는 기능이 많아, 웬만한 것은 그냥 그대로 의존하면 돼서 편리하다.~~
    - ~~공식 문서도 잘되어 있다.~~
  - 의존: tailwindcss
  - 전환 이유
    - 다른 스타일링 방식에 비해 tailwindcss에 대한 숙련도가 낮다. 숙련도를 높이기 위해 의도적으로 더 사용할 곳을 만드려고 한다.
    - 최초에는 UI를 한땀한땀 직접 구성하고 싶은 의도로 시작했지만, 그보다는 콘텐츠에 더 집중하기 위해 shadcn/ui를 적극 활용하기로 결정했다. shadcn/ui를 사용하기에는 tailwindcss가 더 최적이다.
    - 전환을 결정한 시점에 이미 작성된 CSS 코드가 많지 않아서 전환 비용이 크지 않다.

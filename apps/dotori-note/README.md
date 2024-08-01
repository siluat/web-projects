# dotori-note

이것저것 기록하고 관리하기 위한 노트

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
  - 의존: Panda CSS
  - 선택 이유:
    - 제공하는 기능이 많아, 웬만한 것은 그냥 그대로 의존하면 돼서 편리하다.
    - 공식 문서도 잘되어 있다.
- 컬러 팔레트
  - 의존: [Radix Colors](https://www.radix-ui.com/colors)
  - 선택 이유:
    - 다크 모드를 위한 팔레트를 함께 제공하고 있어, 개발자인 내가 UI 디자인적 요소를 고민하는 비용을 줄여준다.
    - 라이트 / 다크 모드간 색상의 이름이 동일한 목적의 색상이라면 동일한 번호로 구성되어 있어, 코드로 제어하기 편리할 것으로 기대된다.

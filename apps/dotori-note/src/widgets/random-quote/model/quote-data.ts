import type { NonEmptyArray } from '@/shared-types/utility-types';
import type { Quote } from './quote-types';

export const quotes: NonEmptyArray<Quote> = [
  {
    source: 'Linus Torvalds',
    original: 'Talk is cheap. Show me the code.',
  },
  {
    source: '채석장 일꾼의 신조, 실용주의 프로그래머',
    translated:
      '우리가 단지 돌을 자를지라도 언제나 대성당을 마음속에 그려야한다.',
  },
  {
    source: 'Jacques-Bénigne Bossuet (보쉬에)',
    translated: '가장 큰 약점은 약점을 보일 것에 대한 두려움이다.',
  },
  {
    source: '리어왕',
    translated: '우리는 종종 뭔가 나아지게 하려다가 괜찮은 것마저 망친다.',
  },
  {
    source: '알프레드 노스 화이트헤드',
    translated:
      '생각 없이 행할 수 있는 중요한 작업의 수가 늘어남에 따라 문명은 발전한다.',
  },
  {
    source: 'Antoine de Saint-Exupéry (앙투안 드 생텍쥐페리)',
    translated:
      '완벽함은 아무것도 더할 것이 없을 때가 아닌, 아무것도 제거할 것이 남지 않았을 때 달성된다.',
  },
  {
    source: '브라이언 W. 커니핸, P.J. 플라우거',
    translated: '나쁜 코드에 주석을 달지 마라. 새로 짜라.',
  },
  {
    source: 'Ken Thompson',
    translated:
      '내게 가장 생산적인 날 중 하나는, 1000 라인 이상의 코드를 버렸던 날이다.',
  },
  {
    source: 'Oliver Wendell Holmes',
    original:
      'It is the province of knowledge to speak and it is the privilege of wisdom to listen.',
  },
];

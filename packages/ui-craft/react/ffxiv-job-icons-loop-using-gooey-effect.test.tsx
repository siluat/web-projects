import { act, renderHook } from '@testing-library/react';
import { useGooeyEffectClassName } from './ffxiv-job-icons-loop-using-gooey-effect.js';

// Mock CSS module
vi.mock('./ffxiv-job-icons-loop-using-gooey-effect.module.css', () => ({
  default: {
    showing: 'showing',
    hiding: 'hiding',
    hidden: 'hidden',
  },
}));

describe('useGooeyEffectClassName', () => {
  it('should return the correct initial class names', () => {
    const { result } = renderHook(() => useGooeyEffectClassName(3));
    expect(result.current.classNames).toEqual(['showing', 'hidden', 'hidden']);
  });

  it('should return the correct class names after transit', () => {
    const { result } = renderHook(() => useGooeyEffectClassName(3));

    act(() => {
      result.current.transit();
    });

    expect(result.current.classNames).toEqual(['hiding', 'showing', 'hidden']);
  });
});

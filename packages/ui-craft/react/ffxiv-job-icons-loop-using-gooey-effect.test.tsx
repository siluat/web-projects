import { describe, expect, it, mock } from 'bun:test';
import { act, renderHook } from '@testing-library/react';

mock.module('./ffxiv-job-icons-loop-using-gooey-effect.module.css', () => ({
  default: {
    showing: 'showing',
    hiding: 'hiding',
    hidden: 'hidden',
  },
}));

const { useGooeyEffectClassName } = await import(
  './ffxiv-job-icons-loop-using-gooey-effect.js'
);

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

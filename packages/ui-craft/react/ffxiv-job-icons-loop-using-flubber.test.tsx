import { act, renderHook } from '@testing-library/react';
import { useIncrementingTuple } from './ffxiv-job-icons-loop-using-flubber.js';

describe('useIncrementingTuple', () => {
  test('size <= 1 should always return [0, 0]', () => {
    const { result } = renderHook(() => useIncrementingTuple(1));
    expect(result.current[0]).toEqual([0, 0]);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toEqual([0, 0]);
  });

  test('size = 2 should toggle between [0, 1] and [1, 0]', () => {
    const { result } = renderHook(() => useIncrementingTuple(2));

    expect(result.current[0]).toEqual([0, 1]);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toEqual([1, 0]);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toEqual([0, 1]);
  });

  test('increment function updates the tuple correctly for size > 2', () => {
    const { result } = renderHook(() => useIncrementingTuple(3));

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toEqual([1, 2]);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toEqual([2, 0]);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toEqual([0, 1]);
  });
});

import { describe, expect, it } from 'bun:test';
import { computeContrastRatio, evaluateContrast } from './contrast';

describe('computeContrastRatio', () => {
  it('returns 21 for black vs white', () => {
    expect(computeContrastRatio(0, 1)).toBe(21);
  });

  it('returns 1 for same color', () => {
    expect(computeContrastRatio(0.5, 0.5)).toBe(1);
  });

  it('is order-independent', () => {
    expect(computeContrastRatio(0, 1)).toBe(computeContrastRatio(1, 0));
  });
});

describe('evaluateContrast', () => {
  it('grades ratio >= 7 as AAA for both text sizes', () => {
    const result = evaluateContrast(0, 1);
    expect(result.ratio).toBe(21);
    expect(result.normalText).toBe('AAA');
    expect(result.largeText).toBe('AAA');
  });

  it('grades ratio exactly 7 as AAA/AAA', () => {
    // Solve: (L + 0.05) / 0.05 = 7 → L = 0.3
    const result = evaluateContrast(0.3, 0);
    expect(result.ratio).toBe(7);
    expect(result.normalText).toBe('AAA');
    expect(result.largeText).toBe('AAA');
  });

  it('grades ratio exactly 4.5 as AA/AAA', () => {
    // Solve: (L + 0.05) / 0.05 = 4.5 → L = 0.175
    const result = evaluateContrast(0.175, 0);
    expect(result.ratio).toBe(4.5);
    expect(result.normalText).toBe('AA');
    expect(result.largeText).toBe('AAA');
  });

  it('grades ratio exactly 3 as Fail/AA', () => {
    // Solve: (L + 0.05) / 0.05 = 3 → L = 0.1
    const result = evaluateContrast(0.1, 0);
    expect(result.ratio).toBe(3);
    expect(result.normalText).toBe('Fail');
    expect(result.largeText).toBe('AA');
  });

  it('grades ratio below 3 as Fail/Fail', () => {
    const result = evaluateContrast(0.05, 0);
    expect(result.ratio).toBe(2);
    expect(result.normalText).toBe('Fail');
    expect(result.largeText).toBe('Fail');
  });
});

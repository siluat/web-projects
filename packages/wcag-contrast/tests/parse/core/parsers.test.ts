import { describe, expect, it } from 'vitest';
import {
  clamp,
  createRgbChannelParser,
  parseAlpha,
  parseHue,
  parseNumeric,
  parsePercentage,
  parsePercentageClamped,
} from '../../../src/parse/core/parsers';

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('should return min when value is below range', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it('should return max when value is above range', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});

describe('parseNumeric', () => {
  it('should parse integer', () => {
    expect(parseNumeric('42')).toEqual({ ok: true, value: 42 });
  });

  it('should parse negative integer', () => {
    expect(parseNumeric('-10')).toEqual({ ok: true, value: -10 });
  });

  it('should parse decimal', () => {
    expect(parseNumeric('3.14')).toEqual({ ok: true, value: 3.14 });
  });

  it('should parse negative decimal', () => {
    expect(parseNumeric('-0.5')).toEqual({ ok: true, value: -0.5 });
  });

  it('should trim whitespace', () => {
    expect(parseNumeric('  42  ')).toEqual({ ok: true, value: 42 });
  });

  it('should fail for percentage', () => {
    expect(parseNumeric('50%')).toEqual({ ok: false });
  });

  it('should fail for non-numeric', () => {
    expect(parseNumeric('abc')).toEqual({ ok: false });
  });

  it('should fail for trailing characters', () => {
    expect(parseNumeric('10px')).toEqual({ ok: false });
  });
});

describe('parsePercentage', () => {
  it('should parse percentage', () => {
    expect(parsePercentage('50%')).toEqual({ ok: true, value: 50 });
  });

  it('should parse negative percentage', () => {
    expect(parsePercentage('-25%')).toEqual({ ok: true, value: -25 });
  });

  it('should parse decimal percentage', () => {
    expect(parsePercentage('33.33%')).toEqual({ ok: true, value: 33.33 });
  });

  it('should trim whitespace', () => {
    expect(parsePercentage('  100%  ')).toEqual({ ok: true, value: 100 });
  });

  it('should fail for non-percentage', () => {
    expect(parsePercentage('50')).toEqual({ ok: false });
  });

  it('should fail for trailing characters', () => {
    expect(parsePercentage('50%px')).toEqual({ ok: false });
  });
});

describe('parsePercentageClamped', () => {
  it('should clamp values over 100', () => {
    expect(parsePercentageClamped('150%')).toEqual({ ok: true, value: 100 });
  });

  it('should clamp negative values to 0', () => {
    expect(parsePercentageClamped('-50%')).toEqual({ ok: true, value: 0 });
  });

  it('should pass through valid values', () => {
    expect(parsePercentageClamped('75%')).toEqual({ ok: true, value: 75 });
  });
});

describe('parseAlpha', () => {
  it('should parse numeric alpha', () => {
    expect(parseAlpha('0.5')).toEqual({ ok: true, value: 0.5 });
  });

  it('should parse percentage alpha', () => {
    expect(parseAlpha('50%')).toEqual({ ok: true, value: 0.5 });
  });

  it('should clamp alpha over 1', () => {
    expect(parseAlpha('1.5')).toEqual({ ok: true, value: 1 });
  });

  it('should clamp percentage over 100%', () => {
    expect(parseAlpha('150%')).toEqual({ ok: true, value: 1 });
  });

  it('should clamp negative alpha to 0', () => {
    expect(parseAlpha('-0.5')).toEqual({ ok: true, value: 0 });
  });

  it('should parse 0', () => {
    expect(parseAlpha('0')).toEqual({ ok: true, value: 0 });
  });

  it('should parse 1', () => {
    expect(parseAlpha('1')).toEqual({ ok: true, value: 1 });
  });

  it('should fail for invalid format', () => {
    expect(parseAlpha('abc')).toEqual({ ok: false });
  });

  it('should fail for trailing characters', () => {
    expect(parseAlpha('0.5abc')).toEqual({ ok: false });
  });
});

describe('parseHue', () => {
  it('should parse degrees without unit', () => {
    expect(parseHue('180')).toEqual({ ok: true, value: 180 });
  });

  it('should parse degrees with deg unit', () => {
    expect(parseHue('180deg')).toEqual({ ok: true, value: 180 });
  });

  it('should parse turn unit', () => {
    expect(parseHue('0.5turn')).toEqual({ ok: true, value: 180 });
  });

  it('should parse rad unit', () => {
    const result = parseHue('3.14159rad');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(180, 0);
    }
  });

  it('should parse grad unit', () => {
    expect(parseHue('200grad')).toEqual({ ok: true, value: 180 });
  });

  it('should normalize values over 360', () => {
    expect(parseHue('720')).toEqual({ ok: true, value: 0 });
    expect(parseHue('450')).toEqual({ ok: true, value: 90 });
  });

  it('should normalize negative values', () => {
    expect(parseHue('-90')).toEqual({ ok: true, value: 270 });
    expect(parseHue('-360')).toEqual({ ok: true, value: 0 });
  });

  it('should be case insensitive', () => {
    expect(parseHue('180DEG')).toEqual({ ok: true, value: 180 });
    expect(parseHue('0.5TURN')).toEqual({ ok: true, value: 180 });
  });

  it('should fail for invalid format', () => {
    expect(parseHue('abc')).toEqual({ ok: false });
  });

  it('should fail for trailing characters', () => {
    expect(parseHue('180degfoo')).toEqual({ ok: false });
  });
});

describe('createRgbChannelParser', () => {
  describe('numeric mode', () => {
    const parser = createRgbChannelParser(false);

    it('should parse numeric value', () => {
      expect(parser('128')).toEqual({ ok: true, value: 128 });
    });

    it('should round decimal values', () => {
      expect(parser('128.6')).toEqual({ ok: true, value: 129 });
    });

    it('should clamp values over 255', () => {
      expect(parser('300')).toEqual({ ok: true, value: 255 });
    });

    it('should clamp negative values to 0', () => {
      expect(parser('-10')).toEqual({ ok: true, value: 0 });
    });

    it('should fail for percentage', () => {
      expect(parser('50%')).toEqual({ ok: false });
    });
  });

  describe('percentage mode', () => {
    const parser = createRgbChannelParser(true);

    it('should parse percentage value', () => {
      expect(parser('50%')).toEqual({ ok: true, value: 128 });
    });

    it('should parse 100%', () => {
      expect(parser('100%')).toEqual({ ok: true, value: 255 });
    });

    it('should parse 0%', () => {
      expect(parser('0%')).toEqual({ ok: true, value: 0 });
    });

    it('should clamp values over 100%', () => {
      expect(parser('150%')).toEqual({ ok: true, value: 255 });
    });

    it('should clamp negative values to 0', () => {
      expect(parser('-50%')).toEqual({ ok: true, value: 0 });
    });

    it('should fail for numeric', () => {
      expect(parser('128')).toEqual({ ok: false });
    });
  });
});

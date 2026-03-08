import { describe, expect, it } from 'bun:test';
import { diagnoseColorError } from './diagnose';

describe('diagnoseColorError', () => {
  describe('hex diagnostics', () => {
    it('reports invalid characters', () => {
      const msg = diagnoseColorError('#gg0000');
      expect(msg).toContain('Invalid color: "#gg0000"');
      expect(msg).toContain('Hex colors use characters 0-9 and a-f');
    });

    it('reports wrong digit count', () => {
      const msg = diagnoseColorError('#abcde');
      expect(msg).toContain('must be 3, 4, 6, or 8 digits after #');
      expect(msg).toContain('Got 5');
    });

    it('reports invalid characters for short hex', () => {
      const msg = diagnoseColorError('#xyz');
      expect(msg).toContain('Hex colors use characters 0-9 and a-f');
    });
  });

  describe('RGB diagnostics', () => {
    it('reports missing closing parenthesis', () => {
      const msg = diagnoseColorError('rgb(255 0 0');
      expect(msg).toContain('Missing closing parenthesis');
    });

    it('reports wrong channel count', () => {
      const msg = diagnoseColorError('rgb(255 0)');
      expect(msg).toContain('rgb() requires 3 color channels');
    });

    it('reports mixed number/percentage types', () => {
      const msg = diagnoseColorError('rgb(255 50% 0)');
      expect(msg).toContain(
        'RGB channels must be all numbers (0-255) or all percentages',
      );
    });

    it('reports wrong channel count for too many values', () => {
      const msg = diagnoseColorError('rgb(255 0 0 0)');
      expect(msg).toContain('rgb() requires 3 color channels');
    });

    it('uses rgba() in message for rgba() input', () => {
      const msg = diagnoseColorError('rgba(255, 0)');
      expect(msg).toContain('rgba() requires 3 color channels');
    });
  });

  describe('HSL diagnostics', () => {
    it('reports missing percentage on saturation/lightness', () => {
      const msg = diagnoseColorError('hsl(0 100 50)');
      expect(msg).toContain('Saturation and lightness must be percentages');
    });

    it('reports wrong channel count', () => {
      const msg = diagnoseColorError('hsl(120 100%)');
      expect(msg).toContain(
        'hsl() requires 3 values (hue, saturation, lightness)',
      );
    });

    it('reports missing closing parenthesis', () => {
      const msg = diagnoseColorError('hsl(120 100% 50%');
      expect(msg).toContain('Missing closing parenthesis');
    });

    it('uses hsla() in message for hsla() input', () => {
      const msg = diagnoseColorError('hsla(120 100%)');
      expect(msg).toContain('hsla() requires 3 values');
    });
  });

  describe('space-only format diagnostics', () => {
    it('reports comma usage in hwb()', () => {
      const msg = diagnoseColorError('hwb(0, 0%, 100%)');
      expect(msg).toContain('hwb() uses space-separated values, not commas');
    });

    it('reports missing percentage in hwb() whiteness/blackness', () => {
      const msg = diagnoseColorError('hwb(0 0 100)');
      expect(msg).toContain('Whiteness and blackness must be percentages');
    });

    it('reports comma usage in lab()', () => {
      const msg = diagnoseColorError('lab(50, 25, -25)');
      expect(msg).toContain('lab() uses space-separated values, not commas');
    });

    it('reports comma usage in lch()', () => {
      const msg = diagnoseColorError('lch(50, 72.2, 50)');
      expect(msg).toContain('lch() uses space-separated values, not commas');
    });

    it('reports comma usage in oklab()', () => {
      const msg = diagnoseColorError('oklab(0.6, 0.1, 0.1)');
      expect(msg).toContain('oklab() uses space-separated values, not commas');
    });

    it('reports comma usage in oklch()', () => {
      const msg = diagnoseColorError('oklch(60%, 0.15, 50)');
      expect(msg).toContain('oklch() uses space-separated values, not commas');
    });

    it('reports wrong value count in lab()', () => {
      const msg = diagnoseColorError('lab(50 25)');
      expect(msg).toContain('lab() requires 3 values');
    });
  });

  describe('bare hex detection', () => {
    it('suggests adding # for 6-digit bare hex', () => {
      const msg = diagnoseColorError('ff0000');
      expect(msg).toContain('Hex colors must start with #');
      expect(msg).toContain('Try: #ff0000');
    });

    it('suggests adding # for 3-digit bare hex', () => {
      const msg = diagnoseColorError('fff');
      expect(msg).toContain('Try: #fff');
    });

    it('suggests adding # for 8-digit bare hex', () => {
      const msg = diagnoseColorError('ff000080');
      expect(msg).toContain('Try: #ff000080');
    });

    it('does not suggest # for non-standard length hex digits', () => {
      const msg = diagnoseColorError('abcde');
      expect(msg).toContain('Supported formats');
    });
  });

  describe('unknown format fallback', () => {
    it('lists supported formats for completely unknown input', () => {
      const msg = diagnoseColorError('notacolor');
      expect(msg).toContain('Invalid color: "notacolor"');
      expect(msg).toContain('Supported formats');
    });

    it('lists supported formats for empty string', () => {
      const msg = diagnoseColorError('');
      expect(msg).toContain('Invalid color: ""');
      expect(msg).toContain('Supported formats');
    });

    it('lists supported formats for whitespace-only string', () => {
      const msg = diagnoseColorError('   ');
      expect(msg).toContain('Supported formats');
    });
  });

  describe('message format', () => {
    it('always starts with Invalid color header', () => {
      const msg = diagnoseColorError('#gg0000');
      expect(msg.startsWith('Invalid color: "#gg0000"')).toBe(true);
    });

    it('includes a hint on the second line', () => {
      const msg = diagnoseColorError('#gg0000');
      const lines = msg.split('\n');
      expect(lines.length).toBe(2);
      expect(lines[1]).toMatch(/^\s{2}\S/);
    });
  });
});

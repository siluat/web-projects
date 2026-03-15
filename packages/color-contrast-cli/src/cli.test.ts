import { describe, expect, it } from 'bun:test';
import { resolve } from 'node:path';

const CLI_PATH = resolve(import.meta.dirname, 'cli.ts');

async function run(
  args: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(['bun', 'run', CLI_PATH, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

describe('CLI', () => {
  describe('human-readable output', () => {
    it('shows AAA pass for high-contrast pair', async () => {
      const { stdout, exitCode } = await run(['#000', '#fff']);
      expect(stdout).toContain('Contrast ratio: 21:1');
      expect(stdout).toContain('AAA \u2713');
      expect(exitCode).toBe(0);
    });

    it('shows Fail for low-contrast pair', async () => {
      const { stdout, exitCode } = await run(['#999', '#fff']);
      expect(stdout).toContain('Fail \u2717');
      expect(exitCode).toBe(0);
    });

    it('aligns Normal text and Large text labels', async () => {
      const { stdout } = await run(['#000', '#fff']);
      // "Large text:  " has extra space so the level text aligns with "Normal text: "
      expect(stdout).toContain('Normal text: AAA \u2713');
      expect(stdout).toContain('Large text:  AAA \u2713');
    });
  });

  describe('JSON output', () => {
    it('outputs single-line JSON to stdout', async () => {
      const { stdout, exitCode } = await run(['#333', '#fff', '--json']);
      const result = JSON.parse(stdout);
      expect(result).toEqual({
        ratio: 12.63,
        normalText: 'AAA',
        largeText: 'AAA',
      });
      expect(exitCode).toBe(0);
    });
  });

  describe('--level mode', () => {
    it('exits 0 when --level AA passes', async () => {
      const { stdout, exitCode } = await run(['#333', '#fff', '--level', 'AA']);
      expect(stdout).toBe('');
      expect(exitCode).toBe(0);
    });

    it('exits 1 when --level AA fails', async () => {
      const { stdout, exitCode } = await run(['#999', '#fff', '--level', 'AA']);
      expect(stdout).toBe('');
      expect(exitCode).toBe(1);
    });

    it('exits 0 when --level AAA passes', async () => {
      const { exitCode } = await run(['#333', '#fff', '--level', 'AAA']);
      expect(exitCode).toBe(0);
    });

    it('exits 1 when --level AAA fails', async () => {
      const { exitCode } = await run(['#777', '#fff', '--level', 'AAA']);
      expect(exitCode).toBe(1);
    });
  });

  describe('--size mode', () => {
    it('exits 0 when --level AA --size large passes', async () => {
      // #777 vs #fff = 4.48:1, large text AA threshold = 3
      const { stdout, exitCode } = await run([
        '#777',
        '#fff',
        '--level',
        'AA',
        '--size',
        'large',
      ]);
      expect(stdout).toBe('');
      expect(exitCode).toBe(0);
    });

    it('exits 1 when --level AA --size large fails', async () => {
      // #999 vs #fff = 2.85:1, large text AA threshold = 3
      const { exitCode } = await run([
        '#999',
        '#fff',
        '--level',
        'AA',
        '--size',
        'large',
      ]);
      expect(exitCode).toBe(1);
    });

    it('exits 0 when --level AAA --size large passes', async () => {
      // #333 vs #fff = 12.63:1, large text AAA threshold = 4.5
      const { exitCode } = await run([
        '#333',
        '#fff',
        '--level',
        'AAA',
        '--size',
        'large',
      ]);
      expect(exitCode).toBe(0);
    });

    it('exits 1 when --level AAA --size large fails', async () => {
      // #777 vs #fff = 4.48:1, large text AAA threshold = 4.5
      const { exitCode } = await run([
        '#777',
        '#fff',
        '--level',
        'AAA',
        '--size',
        'large',
      ]);
      expect(exitCode).toBe(1);
    });

    it('defaults to normal text (existing behavior unchanged)', async () => {
      // #777 vs #fff = 4.48:1, normal text AA threshold = 4.5 → fail
      const { exitCode } = await run(['#777', '#fff', '--level', 'AA']);
      expect(exitCode).toBe(1);
    });

    it('--size normal behaves same as default', async () => {
      const { exitCode } = await run([
        '#777',
        '#fff',
        '--level',
        'AA',
        '--size',
        'normal',
      ]);
      expect(exitCode).toBe(1);
    });

    it('errors when --size is used without --level', async () => {
      const { stderr, exitCode } = await run([
        '#000',
        '#fff',
        '--size',
        'large',
      ]);
      expect(stderr).toContain('--size requires --level');
      expect(exitCode).toBe(2);
    });

    it('errors when --size value is missing', async () => {
      const { stderr, exitCode } = await run([
        '#000',
        '#fff',
        '--level',
        'AA',
        '--size',
      ]);
      expect(stderr).toContain('Invalid --size value');
      expect(exitCode).toBe(2);
    });

    it('errors for invalid --size value', async () => {
      const { stderr, exitCode } = await run([
        '#000',
        '#fff',
        '--level',
        'AA',
        '--size',
        'medium',
      ]);
      expect(stderr).toContain('Invalid --size value: "medium"');
      expect(exitCode).toBe(2);
    });

    it('works with --json + --level + --size', async () => {
      const { stdout, exitCode } = await run([
        '#777',
        '#fff',
        '--level',
        'AA',
        '--size',
        'large',
        '--json',
      ]);
      const result = JSON.parse(stdout);
      expect(result).toHaveProperty('ratio');
      expect(exitCode).toBe(0);
    });

    it('works regardless of flag order', async () => {
      const { exitCode } = await run([
        '#777',
        '#fff',
        '--size',
        'large',
        '--level',
        'AA',
      ]);
      expect(exitCode).toBe(0);
    });
  });

  describe('--help', () => {
    it('prints help text to stdout and exits 0', async () => {
      const { stdout, stderr, exitCode } = await run(['--help']);
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('Options:');
      expect(stdout).toContain('Supported color formats:');
      expect(stdout).toContain('Examples:');
      expect(stderr).toBe('');
      expect(exitCode).toBe(0);
    });

    it('takes priority over --json', async () => {
      const { stdout, exitCode } = await run(['--help', '--json']);
      expect(stdout).toContain('Usage:');
      expect(exitCode).toBe(0);
    });

    it('takes priority over --version', async () => {
      const { stdout, exitCode } = await run(['--help', '--version']);
      expect(stdout).toContain('Usage:');
      expect(exitCode).toBe(0);
    });

    it('takes priority over invalid --level', async () => {
      const { stdout, stderr, exitCode } = await run([
        '--level',
        'invalid',
        '--help',
      ]);
      expect(stdout).toContain('Usage:');
      expect(stderr).toBe('');
      expect(exitCode).toBe(0);
    });

    it('includes --size in help text', async () => {
      const { stdout } = await run(['--help']);
      expect(stdout).toContain('--size');
    });

    it('takes priority over invalid --size', async () => {
      const { stdout, stderr, exitCode } = await run([
        '--help',
        '--size',
        'invalid',
      ]);
      expect(stdout).toContain('Usage:');
      expect(stderr).toBe('');
      expect(exitCode).toBe(0);
    });
  });

  describe('--version', () => {
    it('prints version to stdout and exits 0', async () => {
      const { stdout, stderr, exitCode } = await run(['--version']);
      expect(stdout.trim()).not.toBe('');
      expect(stderr).toBe('');
      expect(exitCode).toBe(0);
    });
  });

  describe('--level + --json combined', () => {
    it('outputs JSON and exits 0 when level passes', async () => {
      const { stdout, stderr, exitCode } = await run([
        '#333',
        '#fff',
        '--level',
        'AA',
        '--json',
      ]);
      const result = JSON.parse(stdout);
      expect(result).toEqual({
        ratio: 12.63,
        normalText: 'AAA',
        largeText: 'AAA',
      });
      expect(stderr).toBe('');
      expect(exitCode).toBe(0);
    });

    it('outputs JSON and exits 1 when level fails', async () => {
      const { stdout, stderr, exitCode } = await run([
        '#999',
        '#fff',
        '--level',
        'AA',
        '--json',
      ]);
      const result = JSON.parse(stdout);
      expect(result).toHaveProperty('ratio');
      expect(result).toHaveProperty('normalText');
      expect(result).toHaveProperty('largeText');
      expect(stderr).toBe('');
      expect(exitCode).toBe(1);
    });

    it('works regardless of flag order', async () => {
      const { stdout, exitCode } = await run([
        '#333',
        '#fff',
        '--json',
        '--level',
        'AA',
      ]);
      const result = JSON.parse(stdout);
      expect(result).toEqual({
        ratio: 12.63,
        normalText: 'AAA',
        largeText: 'AAA',
      });
      expect(exitCode).toBe(0);
    });
  });

  describe('--verbose mode', () => {
    it('shows verbose trace for hex colors', async () => {
      const { stdout, exitCode } = await run(['#000', '#fff', '--verbose']);
      expect(stdout).toContain('Foreground: #000');
      expect(stdout).toContain('Parsed as HEX');
      expect(stdout).toContain('Background: #fff');
      expect(stdout).toContain('Contrast ratio:');
      expect(exitCode).toBe(0);
    });

    it('shows verbose trace for OKLCH with gamut mapping', async () => {
      const { stdout, exitCode } = await run([
        'oklch(0.6 0.15 50)',
        'white',
        '--verbose',
      ]);
      expect(stdout).toContain('Parsed as OKLCH');
      expect(stdout).toContain('Gamut mapped');
      expect(stdout).toContain('Parsed as NAMED');
      expect(exitCode).toBe(0);
    });

    it('shows alpha compositing applied for transparent colors', async () => {
      const { stdout, exitCode } = await run([
        '#00000080',
        '#ffffff',
        '--verbose',
      ]);
      expect(stdout).toContain('Alpha compositing: applied');
      expect(exitCode).toBe(0);
    });

    it('shows alpha compositing not needed for opaque colors', async () => {
      const { stdout } = await run(['#000', '#fff', '--verbose']);
      expect(stdout).toContain('Alpha compositing: not needed (both opaque)');
    });

    it('errors when combined with --json', async () => {
      const { stderr, stdout, exitCode } = await run([
        '#000',
        '#fff',
        '--verbose',
        '--json',
      ]);
      expect(stderr).toContain('--verbose and --json cannot be combined');
      expect(stdout).toBe('');
      expect(exitCode).toBe(2);
    });

    it('works with --level and sets exit code', async () => {
      const { stdout, exitCode } = await run([
        '#333',
        '#fff',
        '--verbose',
        '--level',
        'AA',
      ]);
      expect(stdout).toContain('Foreground:');
      expect(stdout).toContain('Contrast ratio:');
      expect(exitCode).toBe(0);
    });

    it('works with --level and exits 1 on failure', async () => {
      const { stdout, exitCode } = await run([
        '#999',
        '#fff',
        '--verbose',
        '--level',
        'AA',
      ]);
      expect(stdout).toContain('Foreground:');
      expect(exitCode).toBe(1);
    });

    it('shows HSL conversion step', async () => {
      const { stdout } = await run(['hsl(120 100% 50%)', '#000', '--verbose']);
      expect(stdout).toContain('Parsed as HSL');
      expect(stdout).toContain('Converted to sRGB');
    });

    it('shows relative luminance values', async () => {
      const { stdout } = await run(['#000', '#fff', '--verbose']);
      expect(stdout).toContain('Relative luminance:');
      expect(stdout).toContain('fg=0');
      expect(stdout).toContain('bg=1');
    });
  });

  describe('--help includes --verbose', () => {
    it('includes --verbose in help text', async () => {
      const { stdout } = await run(['--help']);
      expect(stdout).toContain('--verbose');
    });
  });

  describe('--suggest mode', () => {
    describe('human-readable output', () => {
      it('suggests a foreground color when contrast fails', async () => {
        const { stdout, exitCode } = await run([
          '#777',
          '#fff',
          '--suggest',
          '--level',
          'AA',
        ]);
        expect(stdout).toContain('Suggested foreground:');
        expect(exitCode).toBe(0);
      });

      it('reports already passing when contrast is sufficient', async () => {
        const { stdout, exitCode } = await run([
          '#333',
          '#fff',
          '--suggest',
          '--level',
          'AA',
        ]);
        expect(stdout).toContain('Already passes AA for normal text');
        expect(exitCode).toBe(0);
      });

      it('reports already passing for large text', async () => {
        const { stdout, exitCode } = await run([
          '#777',
          '#fff',
          '--suggest',
          '--level',
          'AA',
          '--size',
          'large',
        ]);
        expect(stdout).toContain('Already passes AA for large text');
        expect(exitCode).toBe(0);
      });

      it('suggests for large text when failing', async () => {
        const { stdout, exitCode } = await run([
          '#999',
          '#fff',
          '--suggest',
          '--level',
          'AA',
          '--size',
          'large',
        ]);
        expect(stdout).toContain('Suggested foreground:');
        expect(exitCode).toBe(0);
      });

      it('reports no suggestion when impossible', async () => {
        const { stdout, exitCode } = await run([
          '#808080',
          '#808080',
          '--suggest',
          '--level',
          'AAA',
        ]);
        expect(stdout).toContain('No suggestion available');
        expect(exitCode).toBe(1);
      });
    });

    describe('JSON output', () => {
      it('outputs JSON with suggested color', async () => {
        const { stdout, exitCode } = await run([
          '#777',
          '#fff',
          '--suggest',
          '--level',
          'AA',
          '--json',
        ]);
        const result = JSON.parse(stdout);
        expect(result.suggested).not.toBeNull();
        expect(result.suggested.color).toBeDefined();
        expect(exitCode).toBe(0);
      });

      it('outputs JSON with null suggested when already passing', async () => {
        const { stdout, exitCode } = await run([
          '#333',
          '#fff',
          '--suggest',
          '--level',
          'AA',
          '--json',
        ]);
        const result = JSON.parse(stdout);
        expect(result.suggested).toBeNull();
        expect(result.original).toBeDefined();
        expect(exitCode).toBe(0);
      });

      it('outputs JSON with null suggested when impossible', async () => {
        const { stdout, exitCode } = await run([
          '#808080',
          '#808080',
          '--suggest',
          '--level',
          'AAA',
          '--json',
        ]);
        const result = JSON.parse(stdout);
        expect(result.suggested).toBeNull();
        expect(result.original).toBeDefined();
        expect(exitCode).toBe(1);
      });
    });

    describe('validation and flag combinations', () => {
      it('errors when --suggest is used without --level', async () => {
        const { stderr, exitCode } = await run(['#777', '#fff', '--suggest']);
        expect(stderr).toContain('--suggest requires --level');
        expect(exitCode).toBe(2);
      });

      it('errors for invalid colors', async () => {
        const { stderr, exitCode } = await run([
          'xxx',
          '#fff',
          '--suggest',
          '--level',
          'AA',
        ]);
        expect(stderr).toContain('Error:');
        expect(exitCode).toBe(2);
      });

      it('works regardless of flag order', async () => {
        const { stdout, exitCode } = await run([
          '#777',
          '#fff',
          '--level',
          'AA',
          '--suggest',
        ]);
        expect(stdout).toContain('Suggested foreground:');
        expect(exitCode).toBe(0);
      });

      it('--help takes priority over --suggest', async () => {
        const { stdout, exitCode } = await run(['--help', '--suggest']);
        expect(stdout).toContain('Usage:');
        expect(stdout).not.toContain('Suggested foreground:');
        expect(exitCode).toBe(0);
      });

      it('help text includes --suggest', async () => {
        const { stdout } = await run(['--help']);
        expect(stdout).toContain('--suggest');
      });

      it('--suggest takes priority over --verbose', async () => {
        const { stdout, exitCode } = await run([
          '#777',
          '#fff',
          '--suggest',
          '--level',
          'AA',
          '--verbose',
        ]);
        expect(stdout).toContain('Suggested foreground:');
        expect(stdout).not.toContain('Foreground:');
        expect(exitCode).toBe(0);
      });
    });
  });

  describe('error handling', () => {
    it('prints error to stderr for invalid color', async () => {
      const { stderr, stdout, exitCode } = await run(['not-a-color', '#fff']);
      expect(stderr).toContain('Error: Invalid color: "not-a-color"');
      expect(stdout).toBe('');
      expect(exitCode).toBe(2);
    });

    it('prints error when no arguments given', async () => {
      const { stderr, exitCode } = await run([]);
      expect(stderr).toContain('Missing foreground and background colors');
      expect(exitCode).toBe(2);
    });

    it('prints error when only one color given', async () => {
      const { stderr, exitCode } = await run(['#000']);
      expect(stderr).toContain('Missing background color');
      expect(exitCode).toBe(2);
    });

    it('prints error when too many arguments given', async () => {
      const { stderr, exitCode } = await run(['#000', '#fff', '#aaa']);
      expect(stderr).toContain('Expected 2 color arguments, got 3');
      expect(exitCode).toBe(2);
    });

    it('reports both errors when both colors are invalid', async () => {
      const { stderr, stdout, exitCode } = await run(['#gg0000', '#zz0000']);
      expect(stderr).toContain('Error: Invalid color: "#gg0000"');
      expect(stderr).toContain('Error: Invalid color: "#zz0000"');
      expect(stdout).toBe('');
      expect(exitCode).toBe(2);
    });

    it('prints error as plain text even with --json flag', async () => {
      const { stderr, stdout, exitCode } = await run([
        'not-a-color',
        '#fff',
        '--json',
      ]);
      expect(stderr).toContain('Error: Invalid color: "not-a-color"');
      expect(stdout).toBe('');
      expect(exitCode).toBe(2);
      // Verify it's not JSON
      expect(() => JSON.parse(stderr)).toThrow();
    });
  });
});

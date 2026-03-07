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
  });

  describe('--version', () => {
    it('prints version to stdout and exits 0', async () => {
      const { stdout, stderr, exitCode } = await run(['--version']);
      expect(stdout.trim()).not.toBe('');
      expect(stderr).toBe('');
      expect(exitCode).toBe(0);
    });
  });

  describe('error handling', () => {
    it('prints error to stderr for invalid color', async () => {
      const { stderr, stdout, exitCode } = await run(['not-a-color', '#fff']);
      expect(stderr).toContain('Error: Invalid color: "not-a-color"');
      expect(stdout).toBe('');
      expect(exitCode).toBe(2);
    });

    it('prints help hint to stderr when arguments are missing', async () => {
      const { stderr, exitCode } = await run([]);
      expect(stderr).toContain("Try 'ccr --help' for more information.");
      expect(exitCode).toBe(2);
    });

    it('rejects --json and --level together', async () => {
      const { stderr, exitCode } = await run([
        '#333',
        '#fff',
        '--json',
        '--level',
        'AA',
      ]);
      expect(stderr).toContain('--json and --level cannot be used together');
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

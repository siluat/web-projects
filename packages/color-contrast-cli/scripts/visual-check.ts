#!/usr/bin/env bun
/**
 * Generate an HTML comparison page for visual verification of --suggest.
 * Usage: bun scripts/visual-check.ts > visual-check.html && open visual-check.html
 */
import { checkContrast, suggestForeground } from '../src/index';

interface TestCase {
  fg: string;
  bg: string;
  level: 'AA' | 'AAA';
  label: string;
}

const testCases: TestCase[] = [
  // Grays on white
  { fg: '#777777', bg: '#ffffff', level: 'AA', label: 'Gray on white (AA)' },
  { fg: '#777777', bg: '#ffffff', level: 'AAA', label: 'Gray on white (AAA)' },
  {
    fg: '#999999',
    bg: '#ffffff',
    level: 'AA',
    label: 'Light gray on white (AA)',
  },
  {
    fg: '#aaaaaa',
    bg: '#ffffff',
    level: 'AA',
    label: 'Very light gray on white (AA)',
  },

  // Colors on white
  { fg: '#e06060', bg: '#ffffff', level: 'AA', label: 'Red on white (AA)' },
  { fg: '#4488cc', bg: '#ffffff', level: 'AA', label: 'Blue on white (AA)' },
  { fg: '#55aa55', bg: '#ffffff', level: 'AA', label: 'Green on white (AA)' },
  { fg: '#cc8833', bg: '#ffffff', level: 'AA', label: 'Orange on white (AA)' },
  { fg: '#9966cc', bg: '#ffffff', level: 'AA', label: 'Purple on white (AA)' },

  // Colors on dark backgrounds
  { fg: '#888888', bg: '#222222', level: 'AA', label: 'Gray on dark (AA)' },
  { fg: '#cc6666', bg: '#1a1a2e', level: 'AA', label: 'Red on navy (AA)' },
  { fg: '#6699aa', bg: '#111111', level: 'AA', label: 'Teal on black (AA)' },

  // AAA on dark
  { fg: '#aaaaaa', bg: '#333333', level: 'AAA', label: 'Gray on dark (AAA)' },
];

const targetRatios = {
  AA: { normal: 4.5, large: 3 },
  AAA: { normal: 7, large: 4.5 },
} as const;

function generateRow(tc: TestCase): string {
  const targetRatio = targetRatios[tc.level].normal;
  const original = checkContrast(tc.fg, tc.bg);
  const suggestion = suggestForeground(tc.fg, tc.bg, targetRatio);

  const suggestedColor = suggestion.suggested ?? '—';
  const suggestedRatio = suggestion.result?.ratio ?? '—';
  const suggestedLevel = suggestion.result?.normalText ?? '';

  const afterSwatch = suggestion.suggested
    ? `<div class="swatch" style="background:${tc.bg};color:${suggestion.suggested}">
        <span class="text-normal">The quick brown fox jumps over the lazy dog</span>
        <span class="text-large">Large Text Sample</span>
        <span class="text-small">14px body text for readability check</span>
      </div>`
    : '<div class="swatch no-suggestion">Already passes or impossible</div>';

  return `
    <tr>
      <td>
        <div class="label">${tc.label}</div>
        <div class="meta">Target: ${tc.level} (${targetRatio}:1)</div>
      </td>
      <td>
        <div class="color-info">
          <span class="color-chip" style="background:${tc.fg}"></span>
          <code>${tc.fg}</code> on <code>${tc.bg}</code>
        </div>
        <div class="swatch" style="background:${tc.bg};color:${tc.fg}">
          <span class="text-normal">The quick brown fox jumps over the lazy dog</span>
          <span class="text-large">Large Text Sample</span>
          <span class="text-small">14px body text for readability check</span>
        </div>
        <div class="ratio ${original.normalText === 'Fail' ? 'fail' : 'pass'}">
          ${original.ratio}:1 (${original.normalText})
        </div>
      </td>
      <td>
        <div class="color-info">
          <span class="color-chip" style="background:${suggestedColor !== '—' ? suggestedColor : 'transparent'}"></span>
          <code>${suggestedColor}</code> on <code>${tc.bg}</code>
        </div>
        ${afterSwatch}
        <div class="ratio ${suggestedLevel === 'Fail' ? 'fail' : 'pass'}">
          ${suggestedRatio !== '—' ? `${suggestedRatio}:1 (${suggestedLevel})` : '—'}
        </div>
      </td>
    </tr>`;
}

const rows = testCases.map(generateRow).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>color-contrast-cli: --suggest Visual Check</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 2rem; color: #333; }
  h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .subtitle { color: #666; margin-bottom: 2rem; font-size: 0.9rem; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  th { background: #f8f8f8; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; color: #555; border-bottom: 2px solid #eee; }
  td { padding: 0.75rem 1rem; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .label { font-weight: 600; margin-bottom: 0.25rem; }
  .meta { font-size: 0.8rem; color: #888; }
  .color-info { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem; }
  .color-chip { width: 16px; height: 16px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .swatch { padding: 1rem; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.5rem; }
  .swatch .text-normal { font-size: 16px; }
  .swatch .text-large { font-size: 24px; font-weight: 700; }
  .swatch .text-small { font-size: 14px; }
  .no-suggestion { background: #f8f8f8; color: #999; font-style: italic; text-align: center; }
  .ratio { margin-top: 0.4rem; font-size: 0.85rem; font-weight: 600; }
  .ratio.pass { color: #2e7d32; }
  .ratio.fail { color: #c62828; }
</style>
</head>
<body>
<h1>--suggest Visual Check</h1>
<p class="subtitle">Side-by-side comparison of original and suggested foreground colors. Verify that hue is preserved and text is readable.</p>
<table>
  <thead>
    <tr>
      <th style="width:20%">Test Case</th>
      <th style="width:40%">Before (Original)</th>
      <th style="width:40%">After (Suggested)</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
</body>
</html>`;

process.stdout.write(html);

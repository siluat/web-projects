/**
 * Verify whether OkLCH L → WCAG luminance is monotonic
 * through the gamut mapping pipeline.
 *
 * For each test color, sweeps L from 0 to 1 (C/H fixed)
 * and checks if luminance always increases.
 */

import { srgbToLinear } from '../../../src/convert/srgb-linear';
import { gamutMapOklch } from '../../../src/gamut-map';
import { relativeLuminance } from '../../../src/luminance';
import type { OKLCHColor } from '../../../src/types';

function computeLuminance(l: number, c: number, h: number): number {
  const oklch: OKLCHColor = { space: 'oklch', l, c, h, alpha: 1 };
  const srgb = gamutMapOklch(oklch);
  const linear = srgbToLinear({ r: srgb.r, g: srgb.g, b: srgb.b });
  return relativeLuminance(linear);
}

interface TestColor {
  name: string;
  c: number;
  h: number;
}

const testColors: TestColor[] = [
  // In-gamut (low chroma)
  { name: 'Gray (C=0)', c: 0, h: 0 },
  { name: 'Low chroma red (C=0.05, H=25)', c: 0.05, h: 25 },
  { name: 'Low chroma blue (C=0.05, H=260)', c: 0.05, h: 260 },

  // Moderate chroma
  { name: 'Medium red (C=0.15, H=25)', c: 0.15, h: 25 },
  { name: 'Medium green (C=0.15, H=145)', c: 0.15, h: 145 },
  { name: 'Medium blue (C=0.15, H=260)', c: 0.15, h: 260 },

  // High chroma (gamut mapping will be active)
  { name: 'High chroma red (C=0.3, H=25)', c: 0.3, h: 25 },
  { name: 'High chroma green (C=0.3, H=145)', c: 0.3, h: 145 },
  { name: 'High chroma blue (C=0.3, H=260)', c: 0.3, h: 260 },
  { name: 'High chroma cyan (C=0.3, H=195)', c: 0.3, h: 195 },
  { name: 'High chroma magenta (C=0.3, H=330)', c: 0.3, h: 330 },

  // Extreme chroma
  { name: 'Extreme red (C=0.4, H=25)', c: 0.4, h: 25 },
  { name: 'Extreme blue (C=0.4, H=260)', c: 0.4, h: 260 },
  { name: 'Extreme green (C=0.4, H=145)', c: 0.4, h: 145 },
];

const STEPS = 1000;

for (const color of testColors) {
  let prevLum = -1;
  let monotonic = true;
  const violations: { l: number; prevLum: number; currLum: number }[] = [];

  for (let i = 0; i <= STEPS; i++) {
    const l = i / STEPS;
    const lum = computeLuminance(l, color.c, color.h);

    if (lum < prevLum - 1e-10) {
      monotonic = false;
      violations.push({ l, prevLum, currLum: lum });
    }
    prevLum = lum;
  }

  if (monotonic) {
    console.log(`✓ ${color.name}: monotonic`);
  } else {
    console.log(
      `✗ ${color.name}: NOT monotonic (${violations.length} violations)`,
    );
    for (const v of violations.slice(0, 5)) {
      const drop = v.prevLum - v.currLum;
      console.log(
        `    L=${v.l.toFixed(4)}: luminance dropped ${drop.toExponential(4)} (${v.prevLum.toFixed(8)} → ${v.currLum.toFixed(8)})`,
      );
    }
    if (violations.length > 5) {
      console.log(`    ... and ${violations.length - 5} more`);
    }
  }
}

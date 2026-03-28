'use client';

import {
  checkContrast,
  parseColor,
  suggestForeground,
  validateColors,
} from '@siluat/color-contrast';
import { useState } from 'react';

type ComplianceLevel = 'AAA' | 'AA' | 'Fail';

interface ContrastResult {
  ratio: number;
  normalText: ComplianceLevel;
  largeText: ComplianceLevel;
}

function ComplianceBadge({
  level,
  label,
}: {
  level: ComplianceLevel;
  label: string;
}) {
  const styles: Record<ComplianceLevel, string> = {
    AAA: 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300',
    AA: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    Fail: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300',
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-2 ${styles[level]}`}
    >
      <span className="text-xs text-fd-muted-foreground">{label}</span>
      <span className="text-xs font-semibold">
        {level === 'Fail' ? 'Fail' : level}
      </span>
    </div>
  );
}

function ColorInput({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-fd-muted-foreground"
      >
        {label}
      </label>
      <div className="flex items-stretch gap-3">
        <label className="block h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-fd-border shadow-sm transition-shadow hover:shadow-md">
          <input
            type="color"
            value={toHex6(value)}
            onChange={(e) => onChange(e.target.value)}
            className="h-full w-full scale-150 cursor-pointer appearance-none border-none"
          />
        </label>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-12 flex-1 rounded-lg border border-fd-border bg-fd-background px-3 font-mono text-sm transition-colors focus:border-fd-primary focus:outline-none focus:ring-2 focus:ring-fd-ring"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function RatioDisplay({ result }: { result: ContrastResult }) {
  const passing = result.normalText !== 'Fail';

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-fd-border p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-fd-muted-foreground">
          Contrast Ratio
        </span>
        <div className="flex gap-2">
          <ComplianceBadge level={result.normalText} label="Normal" />
          <ComplianceBadge level={result.largeText} label="Large" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span
          className={`text-5xl font-extrabold tabular-nums leading-none tracking-tight ${
            passing ? 'text-fd-foreground' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {result.ratio}
        </span>
        <span className="mb-1 text-lg font-medium text-fd-muted-foreground">
          :1
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-fd-secondary">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            result.ratio >= 7
              ? 'bg-green-500'
              : result.ratio >= 4.5
                ? 'bg-yellow-500'
                : result.ratio >= 3
                  ? 'bg-orange-500'
                  : 'bg-red-500'
          }`}
          style={{ width: `${Math.min((result.ratio / 21) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function PreviewSection({
  foreground,
  background,
}: {
  foreground: string;
  background: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-fd-border transition-colors duration-300"
      style={{ backgroundColor: background }}
    >
      <div className="flex flex-col gap-2 p-6">
        <p
          style={{ color: foreground }}
          className="text-xl font-bold leading-tight"
        >
          The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ color: foreground }} className="text-sm leading-relaxed">
          Normal body text at default size. This is what most of your content
          will look like to your readers.
        </p>
      </div>
    </div>
  );
}

function SuggestionPanel({
  original,
  suggested,
  suggestedResult,
  background,
  onApply,
}: {
  original: string;
  suggested: string;
  suggestedResult: ContrastResult;
  background: string;
  onApply: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-fd-border">
      <div className="border-b border-fd-border bg-fd-secondary/30 px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-fd-muted-foreground">
            Suggested Fix
          </span>
          <button
            type="button"
            onClick={onApply}
            className="rounded-md bg-fd-primary px-3 py-1 text-xs font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2">
        <div className="border-b border-fd-border p-4 sm:border-b-0 sm:border-r">
          <p className="mb-2 text-xs text-fd-muted-foreground">Current</p>
          <div
            className="mb-2 rounded-lg px-4 py-3"
            style={{ backgroundColor: background }}
          >
            <p style={{ color: original }} className="text-sm font-medium">
              Sample text
            </p>
          </div>
          <code className="text-xs text-fd-muted-foreground">{original}</code>
        </div>
        <div className="p-4">
          <p className="mb-2 text-xs text-fd-muted-foreground">Suggested</p>
          <div
            className="mb-2 rounded-lg px-4 py-3"
            style={{ backgroundColor: background }}
          >
            <p style={{ color: suggested }} className="text-sm font-medium">
              Sample text
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs">{suggested}</code>
            <span className="text-xs text-fd-muted-foreground">
              {suggestedResult.ratio}:1
            </span>
            <ComplianceBadge level={suggestedResult.normalText} label="AA" />
          </div>
        </div>
      </div>
      <div className="border-t border-fd-border bg-fd-secondary/20 px-5 py-2">
        <p className="text-xs text-fd-muted-foreground">
          Closest color meeting AA (4.5:1), preserving hue and chroma via OKLCH
          lightness adjustment.
        </p>
      </div>
    </div>
  );
}

/**
 * Best-effort conversion to 6-digit hex for the native color picker.
 * Falls back to black if the input is not a simple hex value.
 */
function toHex6(value: string): string {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [, r, g, b] = v;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '#000000';
}

export function ColorChecker() {
  const [foreground, setForeground] = useState('#1e293b');
  const [background, setBackground] = useState('#ffffff');

  const fgInvalid = parseColor(foreground) === null;
  const bgInvalid = parseColor(background) === null;
  const isValid = !fgInvalid && !bgInvalid;
  const errors = isValid ? [] : validateColors(foreground, background);
  const fgError = fgInvalid ? errors[0] : undefined;
  const bgError = bgInvalid ? errors[fgInvalid ? 1 : 0] : undefined;

  let result: ContrastResult | null = null;
  let suggestion: {
    suggested: string | null;
    result: ContrastResult | null;
  } | null = null;
  if (isValid) {
    result = checkContrast(foreground, background);
    if (result.normalText === 'Fail') {
      suggestion = suggestForeground(foreground, background, 4.5);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorInput
          id="color-checker-fg"
          label="Foreground"
          value={foreground}
          onChange={setForeground}
          error={fgError}
        />
        <ColorInput
          id="color-checker-bg"
          label="Background"
          value={background}
          onChange={setBackground}
          error={bgError}
        />
      </div>

      <PreviewSection
        foreground={isValid ? foreground : '#1e293b'}
        background={isValid ? background : '#ffffff'}
      />

      {result && <RatioDisplay result={result} />}

      {suggestion?.suggested &&
        suggestion.result &&
        (() => {
          const suggestedColor = suggestion.suggested;
          return (
            <SuggestionPanel
              original={foreground}
              suggested={suggestedColor}
              suggestedResult={suggestion.result}
              background={background}
              onApply={() => setForeground(suggestedColor)}
            />
          );
        })()}

      <p className="text-xs text-fd-muted-foreground">
        Based on{' '}
        <a
          href="https://www.w3.org/TR/WCAG21/#contrast-minimum"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          WCAG 2.1 SC 1.4.3
        </a>
        . Normal text: 4.5:1 (AA), 7:1 (AAA). Large text (18pt+): 3:1 (AA),
        4.5:1 (AAA).
      </p>
    </div>
  );
}

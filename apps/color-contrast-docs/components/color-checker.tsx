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

function ComplianceBadge({ level }: { level: ComplianceLevel }) {
  const styles: Record<ComplianceLevel, string> = {
    AAA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    AA: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Fail: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${styles[level]}`}
    >
      {level === 'Fail' ? 'Fail' : `Pass ${level}`}
    </span>
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
      className="flex flex-col gap-3 rounded-lg border border-fd-border p-6"
      style={{ backgroundColor: background }}
    >
      <p style={{ color: foreground }} className="text-2xl font-bold">
        Large Text (24px)
      </p>
      <p style={{ color: foreground }} className="text-base">
        Normal body text at default size. This is what most of your content will
        look like.
      </p>
      <p style={{ color: foreground }} className="text-sm">
        Small text is harder to read with low contrast.
      </p>
    </div>
  );
}

function ResultDisplay({ result }: { result: ContrastResult }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-fd-border p-4">
      <div className="text-center">
        <p className="text-sm text-fd-muted-foreground">Contrast Ratio</p>
        <p className="text-4xl font-bold">{result.ratio}:1</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-md bg-fd-secondary p-3">
          <span className="text-xs text-fd-muted-foreground">Normal Text</span>
          <ComplianceBadge level={result.normalText} />
        </div>
        <div className="flex flex-col items-center gap-1 rounded-md bg-fd-secondary p-3">
          <span className="text-xs text-fd-muted-foreground">Large Text</span>
          <ComplianceBadge level={result.largeText} />
        </div>
      </div>
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={toHex6(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 shrink-0 cursor-pointer rounded border border-fd-border"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-10 flex-1 rounded-md border border-fd-border bg-fd-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fd-ring"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SuggestionPanel({
  suggested,
  suggestedResult,
  background,
  onApply,
}: {
  suggested: string;
  suggestedResult: ContrastResult;
  background: string;
  onApply: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-fd-border bg-fd-secondary/50 p-4">
      <p className="text-sm font-medium">Suggested Foreground</p>
      <div className="flex items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-fd-border"
          style={{ backgroundColor: suggested }}
        />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <code className="text-sm">{suggested}</code>
            <span className="text-sm text-fd-muted-foreground">
              {suggestedResult.ratio}:1
            </span>
            <ComplianceBadge level={suggestedResult.normalText} />
          </div>
          <div
            className="rounded-md px-3 py-2"
            style={{ backgroundColor: background }}
          >
            <span style={{ color: suggested }} className="text-sm">
              Preview with suggested color
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onApply}
          className="shrink-0 rounded-md bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground"
        >
          Apply
        </button>
      </div>
      <p className="text-xs text-fd-muted-foreground">
        Closest color meeting AA contrast (4.5:1), preserving hue and chroma in
        the OKLCH color space.
      </p>
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
    <div className="flex flex-col gap-6">
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

      {result && <ResultDisplay result={result} />}

      {suggestion?.suggested &&
        suggestion.result &&
        (() => {
          const suggestedColor = suggestion.suggested;
          return (
            <SuggestionPanel
              suggested={suggestedColor}
              suggestedResult={suggestion.result}
              background={background}
              onApply={() => setForeground(suggestedColor)}
            />
          );
        })()}

      <div className="text-xs text-fd-muted-foreground">
        <p>
          Compliance is based on{' '}
          <a
            href="https://www.w3.org/TR/WCAG21/#contrast-minimum"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            WCAG 2.1 Success Criterion 1.4.3
          </a>
          . Normal text requires 4.5:1 (AA) or 7:1 (AAA). Large text (18pt+ or
          14pt+ bold) requires 3:1 (AA) or 4.5:1 (AAA).
        </p>
      </div>
    </div>
  );
}

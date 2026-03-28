'use client';

import { checkContrast, parseColor } from '@siluat/color-contrast';
import { useState } from 'react';

type ComplianceLevel = 'AAA' | 'AA' | 'Fail';

interface PaletteColor {
  id: number;
  name: string;
  value: string;
}

interface ContrastResult {
  ratio: number;
  normalText: ComplianceLevel;
  largeText: ComplianceLevel;
}

type FilterLevel = 'all' | 'AA' | 'AAA' | 'Fail';

const DEFAULT_PALETTE: PaletteColor[] = [
  { id: 1, name: 'Dark', value: '#1e293b' },
  { id: 2, name: 'White', value: '#ffffff' },
  { id: 3, name: 'Blue', value: '#2563eb' },
  { id: 4, name: 'Gray', value: '#64748b' },
  { id: 5, name: 'Light', value: '#f1f5f9' },
];

function toHex6(value: string): string {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [, r, g, b] = v;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '#000000';
}

function cellTint(level: ComplianceLevel): string {
  if (level === 'AAA') return 'bg-green-500/[0.07] dark:bg-green-400/[0.09]';
  if (level === 'AA') return 'bg-yellow-500/[0.07] dark:bg-yellow-400/[0.09]';
  return 'bg-red-500/[0.07] dark:bg-red-400/[0.09]';
}

function complianceText(level: ComplianceLevel): string {
  if (level === 'AAA') return 'text-green-600 dark:text-green-400';
  if (level === 'AA') return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

function PaletteInput({
  color,
  onChange,
  onRemove,
  canRemove,
}: {
  color: PaletteColor;
  onChange: (updated: PaletteColor) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const isValid = parseColor(color.value) !== null;

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-fd-secondary/30">
      <label className="block h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-fd-border shadow-sm transition-shadow hover:shadow-md">
        <input
          type="color"
          aria-label={`${color.name} color picker`}
          value={toHex6(color.value)}
          onChange={(e) => onChange({ ...color, value: e.target.value })}
          className="h-full w-full scale-150 cursor-pointer appearance-none border-none"
        />
      </label>
      <input
        type="text"
        aria-label={`${color.name || 'Color'} name`}
        value={color.name}
        onChange={(e) => onChange({ ...color, name: e.target.value })}
        placeholder="Name"
        className="h-8 w-24 rounded-lg border border-fd-border bg-fd-background px-2 text-sm transition-colors focus:border-fd-primary focus:outline-none focus:ring-2 focus:ring-fd-ring"
      />
      <input
        type="text"
        aria-label={`${color.name || 'Color'} value`}
        aria-invalid={!isValid}
        value={color.value}
        onChange={(e) => onChange({ ...color, value: e.target.value })}
        placeholder="#000000"
        className={`h-8 flex-1 rounded-lg border bg-fd-background px-2 font-mono text-xs transition-colors focus:border-fd-primary focus:outline-none focus:ring-2 focus:ring-fd-ring ${
          isValid ? 'border-fd-border' : 'border-red-400'
        }`}
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-secondary hover:text-fd-foreground"
          aria-label={`Remove ${color.name}`}
        >
          &times;
        </button>
      )}
    </div>
  );
}

function MatrixCell({
  result,
  fg,
  bg,
  highlight,
}: {
  result: ContrastResult;
  fg: PaletteColor;
  bg: PaletteColor;
  highlight: boolean;
}) {
  return (
    <td
      className={`min-w-20 border border-fd-border/40 p-0 transition-opacity duration-200 ${cellTint(result.normalText)} ${
        highlight ? '' : 'opacity-15'
      }`}
    >
      <div
        className="flex flex-col items-center gap-1 px-2 py-2.5"
        title={`${fg.name} on ${bg.name}\nRatio: ${result.ratio}:1\nNormal: ${result.normalText}\nLarge: ${result.largeText}`}
      >
        <div
          className="flex h-8 w-full items-center justify-center rounded-md text-sm font-semibold shadow-sm ring-1 ring-black/[0.05] dark:ring-white/[0.08]"
          style={{ color: fg.value, backgroundColor: bg.value }}
        >
          Aa
        </div>
        <span className="text-[11px] font-bold tabular-nums leading-none text-fd-foreground">
          {result.ratio}:1
        </span>
        <span
          className={`text-[10px] font-semibold leading-none ${complianceText(result.normalText)}`}
        >
          {result.normalText === 'Fail' ? 'Fail' : result.normalText}
        </span>
      </div>
    </td>
  );
}

function SameColorCell() {
  return (
    <td className="min-w-20 border border-fd-border/40 bg-fd-secondary/20 p-0">
      <div className="flex h-full items-center justify-center px-2 py-2.5">
        <span className="text-[10px] text-fd-muted-foreground/40">&mdash;</span>
      </div>
    </td>
  );
}

function ProportionBar({
  aaa,
  aa,
  fail,
  total,
}: {
  aaa: number;
  aa: number;
  fail: number;
  total: number;
}) {
  if (total === 0) return null;

  return (
    <div className="flex h-1.5 overflow-hidden rounded-full bg-fd-secondary">
      {aaa > 0 && (
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${(aaa / total) * 100}%` }}
        />
      )}
      {aa > 0 && (
        <div
          className="bg-yellow-500 transition-all duration-500"
          style={{ width: `${(aa / total) * 100}%` }}
        />
      )}
      {fail > 0 && (
        <div
          className="bg-red-500 transition-all duration-500"
          style={{ width: `${(fail / total) * 100}%` }}
        />
      )}
    </div>
  );
}

function Summary({ results }: { results: { result: ContrastResult }[] }) {
  const total = results.length;
  const aaa = results.filter((r) => r.result.normalText === 'AAA').length;
  const aa = results.filter((r) => r.result.normalText === 'AA').length;
  const fail = results.filter((r) => r.result.normalText === 'Fail').length;

  return (
    <div className="flex flex-col gap-3">
      <ProportionBar aaa={aaa} aa={aa} fail={fail} total={total} />
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-green-500/[0.07] p-3 text-center dark:bg-green-400/[0.09]">
          <div className="text-xl font-bold tabular-nums text-green-700 dark:text-green-300">
            {aaa}
          </div>
          <div className="text-[10px] font-medium text-fd-muted-foreground">
            AAA &middot; {total > 0 ? Math.round((aaa / total) * 100) : 0}%
          </div>
        </div>
        <div className="rounded-lg bg-yellow-500/[0.07] p-3 text-center dark:bg-yellow-400/[0.09]">
          <div className="text-xl font-bold tabular-nums text-yellow-700 dark:text-yellow-300">
            {aa}
          </div>
          <div className="text-[10px] font-medium text-fd-muted-foreground">
            AA &middot; {total > 0 ? Math.round((aa / total) * 100) : 0}%
          </div>
        </div>
        <div className="rounded-lg bg-red-500/[0.07] p-3 text-center dark:bg-red-400/[0.09]">
          <div className="text-xl font-bold tabular-nums text-red-700 dark:text-red-300">
            {fail}
          </div>
          <div className="text-[10px] font-medium text-fd-muted-foreground">
            Fail &middot; {total > 0 ? Math.round((fail / total) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}

let nextId = DEFAULT_PALETTE.length + 1;

export function BatchPaletteAudit() {
  const [colors, setColors] = useState<PaletteColor[]>(DEFAULT_PALETTE);
  const [filter, setFilter] = useState<FilterLevel>('all');

  const validColors = colors.filter((c) => parseColor(c.value) !== null);

  const allResults: {
    fg: PaletteColor;
    bg: PaletteColor;
    result: ContrastResult;
  }[] = [];
  const resultByPair: Record<string, ContrastResult> = {};
  for (const fg of validColors) {
    for (const bg of validColors) {
      if (fg.id !== bg.id) {
        const result = checkContrast(fg.value, bg.value);
        allResults.push({ fg, bg, result });
        resultByPair[`${fg.id}:${bg.id}`] = result;
      }
    }
  }

  const matchesFilter = (r: ContrastResult) => {
    if (filter === 'all') return true;
    if (filter === 'AAA') return r.normalText === 'AAA';
    if (filter === 'AA') return r.normalText === 'AA';
    return r.normalText === 'Fail';
  };

  const updateColor = (id: number, updated: PaletteColor) => {
    setColors((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const removeColor = (id: number) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  const addColor = () => {
    const id = nextId++;
    setColors((prev) => [
      ...prev,
      { id, name: `Color ${prev.length + 1}`, value: '#6b7280' },
    ]);
  };

  return (
    <div className="not-prose flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-fd-muted-foreground">
            Palette Colors
          </span>
          <button
            type="button"
            onClick={addColor}
            className="rounded-md bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            + Add Color
          </button>
        </div>
        <div className="rounded-xl border border-fd-border p-1">
          {colors.map((color) => (
            <PaletteInput
              key={color.id}
              color={color}
              onChange={(updated) => updateColor(color.id, updated)}
              onRemove={() => removeColor(color.id)}
              canRemove={colors.length > 2}
            />
          ))}
        </div>
      </div>

      {validColors.length >= 2 && (
        <>
          <Summary results={allResults} />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-fd-muted-foreground">
                Contrast Matrix
              </span>
              <div className="flex rounded-lg border border-fd-border p-0.5">
                {(['all', 'AAA', 'AA', 'Fail'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFilter(level)}
                    aria-pressed={filter === level}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      filter === level
                        ? 'bg-fd-primary text-fd-primary-foreground shadow-sm'
                        : 'text-fd-muted-foreground hover:text-fd-foreground'
                    }`}
                  >
                    {level === 'all' ? 'All' : level}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-fd-border">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center">
                  <thead>
                    <tr>
                      <th className="border border-fd-border/40 bg-fd-secondary/30 p-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-fd-muted-foreground">
                          FG \ BG
                        </span>
                      </th>
                      {validColors.map((bg) => (
                        <th
                          key={bg.id}
                          scope="col"
                          className="border border-fd-border/40 bg-fd-secondary/30 p-2"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="h-4 w-4 rounded-sm border border-fd-border/60 shadow-sm"
                              style={{ backgroundColor: bg.value }}
                            />
                            <span className="max-w-16 truncate text-[10px] leading-none text-fd-muted-foreground">
                              {bg.name}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validColors.map((fg) => (
                      <tr key={fg.id}>
                        <th
                          scope="row"
                          className="border border-fd-border/40 bg-fd-secondary/30 p-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <div
                              className="h-4 w-4 shrink-0 rounded-sm border border-fd-border/60 shadow-sm"
                              style={{ backgroundColor: fg.value }}
                            />
                            <span className="max-w-16 truncate text-[10px] leading-none text-fd-muted-foreground">
                              {fg.name}
                            </span>
                          </div>
                        </th>
                        {validColors.map((bg) => {
                          if (fg.id === bg.id) {
                            return <SameColorCell key={bg.id} />;
                          }
                          const result = resultByPair[`${fg.id}:${bg.id}`];
                          return (
                            <MatrixCell
                              key={bg.id}
                              result={result}
                              fg={fg}
                              bg={bg}
                              highlight={matchesFilter(result)}
                            />
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {validColors.length < 2 && (
        <div className="rounded-xl border border-fd-border bg-fd-secondary/20 px-5 py-4">
          <p className="text-sm text-fd-muted-foreground">
            Add at least 2 valid colors to see the contrast matrix.
          </p>
        </div>
      )}

      <p className="text-[11px] text-fd-muted-foreground">
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

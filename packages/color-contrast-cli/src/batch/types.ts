import type { ComplianceLevel, ContrastResult } from '../types';

/** Result of processing a single batch line — either a successful contrast check or an error. */
export type BatchLineResult =
  | {
      kind: 'ok';
      foreground: string;
      background: string;
      result: ContrastResult;
    }
  | {
      kind: 'error';
      foreground: string;
      background: string;
      message: string;
    };

/** Result of processing a single batch line in suggest mode. */
export type BatchSuggestLineResult =
  | {
      kind: 'ok';
      foreground: string;
      background: string;
      original: ContrastResult;
      alreadyPasses: boolean;
      suggested: {
        color: string;
        ratio: number;
        normalText: ComplianceLevel;
        largeText: ComplianceLevel;
      } | null;
    }
  | {
      kind: 'error';
      foreground: string;
      background: string;
      message: string;
    };

/** Aggregated batch result with exit code. */
export interface BatchResult<T> {
  results: T[];
  /** 0 = all pass, 1 = at least one level failure, 2 = at least one error */
  exitCode: number;
}

/** Options for batch processing. */
export interface BatchOptions {
  level: 'AA' | 'AAA' | null;
  size: 'normal' | 'large';
  suggest: boolean;
}

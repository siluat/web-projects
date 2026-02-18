# Implementation Guidelines

Principles to follow when implementing `@siluat/wcag-contrast`. Add new principles as needed during development.

## 1. Reviewable PR Units

Each pull request should form a self-contained unit that is easy to review and learn from. Prefer small, focused PRs over large ones that mix concerns.

## 2. Declarative Style

Prefer declarative code when it provides clear advantages in readability or correctness. Color transformations and validation rules are natural fits for declarative expression — favor data descriptions over imperative step sequences.

## 3. Type Safety

Leverage TypeScript's type system to prevent misuse at compile time. Distinguish between different color representations (parsed colors, sRGB values, linear RGB, etc.) using distinct types rather than passing raw numbers.

## 4. Spec Compliance

Follow WCAG 2.1 and CSS Color Level 4 specifications precisely. Reference the relevant spec section in comments where the implementation maps to a specific algorithm or formula.

**Rationale:** The core value of this package is correctness. Clear traceability between code and spec makes correctness verifiable.

## 5. Pure Functions

Keep all library API functions pure — no external state, no side effects. Given the same color inputs, always return the same result.

**Rationale:** Color computation is inherently an input-to-output transformation. Purity makes functions trivial to test and reason about.

## 6. Reference-Based Testing

Validate correctness using known reference values derived from specs (WCAG examples, W3C test cases, CSS Color Level 4 sample values). Do not invent expected values — trace them back to authoritative sources.

**Rationale:** Color conversion and contrast calculation involve rounding, gamma correction, and gamut mapping where subtle errors can hide. Spec-derived reference values are the only reliable ground truth.

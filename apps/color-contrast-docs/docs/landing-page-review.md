# Landing Page (`/docs`) Design Review

Current state analysis and improvement directions for the color-contrast-docs landing page.

## Current State

The landing page (`content/docs/index.mdx`) uses only default Fumadocs components and the neutral theme. The page structure is:

1. One-line intro text → code block showing `npx` usage and sample output
2. "Why ccr?" section with 4 generic `<Cards>` (CI/CD Ready, Color Suggestion, Batch Audit, 10 Color Formats)
3. "Quick Start" section with 4 bash code blocks
4. "Library" section with one sentence and an npm link

## Issues and Improvement Directions

### 1. Add hero section with embedded mini ColorChecker demo

**Problem:** The page opens with plain text and a code block. There is no visual hook — it reads like any other doc page, not a product landing.

**Direction:**
- Create a visually striking hero that communicates the tool's purpose at a glance.
- Embed a simplified version of the existing `ColorChecker` component so visitors can try the tool immediately.
- The hero should convey: "Check color contrast, right here, right now."

### 2. Redesign feature cards with icons and custom styling

**Problem:** The 4 feature cards use the default Fumadocs `<Cards>` component with no icons and no visual differentiation. All cards look identical.

**Direction:**
- Add meaningful icons per card (e.g., pipeline icon for CI/CD, magic wand for Suggest, grid for Batch, palette for Formats).
- Apply hover interactions (elevation shift, border color change).
- Consider a custom component if Fumadocs `<Card>` is too restrictive.

### 3. Add CTA buttons (Get Started / Try Online)

**Problem:** The only navigation aid is a plain text link at the bottom: "Read the Getting Started guide..." — easy to miss and weak as a call-to-action.

**Direction:**
- Add prominent CTA buttons offering two paths: CLI users ("Get Started") and browser users ("Try Color Checker").
- Place CTAs after the feature cards or hero section, not buried at the bottom.

### 4. Streamline Quick Start and Library sections

**Problem:** The Quick Start section repeats the `npx` command already shown in the hero. It also overlaps heavily with the Getting Started guide page. The Library section is a single sentence that feels like an afterthought.

**Direction:**
- Remove Quick Start or reduce it to a single "next step" that doesn't duplicate the hero.
- Fold the Library mention into a feature card or give it a proper subsection with a code example and a link to `/docs/reference/library-api`.
- Target page flow: **Hook (Hero) → Why (Features) → Try (Demo) → Next (CTAs)**.

### 5. Customize typography

**Problem:** The page uses Fumadocs' default system font stack. For a CLI tool about color, the typography carries no personality.

**Direction:**
- Use a monospace or monospace-adjacent display font for headings (e.g., JetBrains Mono, IBM Plex Mono) to reinforce the CLI identity.
- Keep body text in a readable sans-serif.
- Apply distinctive typographic treatment to key numbers (contrast ratios, version numbers).

### 6. Strengthen color identity

**Problem:** A tool about color contrast has zero color personality. The page is entirely the Fumadocs neutral theme — no accent colors, no domain-relevant visuals.

**Direction:**
- Introduce accent colors derived from WCAG compliance levels: green (AAA), yellow (AA), red (Fail) — already used in the `ColorChecker` component.
- Add subtle background treatments (gradient, noise texture, or spectrum bar) to create visual depth.
- Ensure dark mode variants are equally considered.

### 7. Add page load and scroll motion/animations

**Problem:** The page is completely static. No transitions, no scroll-triggered reveals, no micro-interactions.

**Direction:**
- Staggered fade-in on hero elements at page load.
- Scroll-triggered entrance for feature cards.
- Count-up animation on contrast ratio numbers in the demo.
- Keep it restrained — apply motion only at high-impact moments.

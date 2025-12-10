# AGENTS.md

## Development Commands

**Package Management:**

- `bun` is the package manager (version 1.3.4)
- Bun 1.3.4+ or Node.js 22.5.0+ and required

**Build & Development:**

- `turbo dev` - Start development servers for all apps
- `turbo run build` - Build all packages and apps
- `turbo run test` - Run tests across all packages
- `turbo gen package` - Generate new package using templates

**Code Quality:**

- `biome check .` - Check formatting and linting
- `biome check . --write` - Fix formatting and linting issues
- `turbo run check-types` - TypeScript type checking
- `turbo run static-check` - Combined type checking and linting

**Git Hooks:**

- Lefthook is configured with pre-commit Biome checks
- Use `lefthook install` to set up hooks

## Repository Architecture

This is a monorepo managed by Turborepo and bun workspaces with the following structure:

**Apps (`apps/`):**

- `dotori-note` - Personal blog built with Astro, React, TailwindCSS, and MDX
- `noumenon-front` - Frontend application (early development)

**Packages (`packages/`):**

- `@siluat/ui-craft` - Personal UI animation library using React, Framer Motion, and Vitest
- `@siluat/shadcn-ui` - shadcn/ui component library
- `@siluat/typescript-config` - Shared TypeScript configurations
- `noumenon-gleaner` - Rust CLI tool for data extraction with TypeScript schema generation
- `noumenon-librarian` - Data pipeline orchestrator for Noumenon project

**Playgrounds (`playgrounds/`):**

- `ui-craft-playground` - Next.js playground for testing UI components
- `noumenon-gleaner-runner` - Testing environment for the Rust CLI tool

## Technology Stack

- **Frontend:** Astro, React 19, Next.js 15
- **Styling:** TailwindCSS 4.0, Radix UI, Lucide React
- **Backend/CLI:** Rust with Cargo
- **Testing:** Vitest (React components), Playwright (E2E)
- **Build Tools:** Turborepo, Biome (formatting/linting)
- **Package Management:** bun workspaces

## Code Quality Standards

**Formatting:**

- Biome handles all JavaScript/TypeScript formatting and linting
- Single quotes for JavaScript/CSS strings
- Space indentation
- Astro files use Astro VSCode extension for formatting (excluded from Biome)

**Markdown:**

- All fenced code blocks MUST include language specifiers (prevents MD040 warnings)
- Use `text` as fallback when language is uncertain
- Supported languages: `text`, `bash`, `sh`, `typescript`, `javascript`, `json`, `yaml`, `toml`, `csv`, `rust`, `sql`, `html`, `css`
- This rule is enforced via Cursor rules and markdownlint

**TypeScript:**

- Shared configs available in `@siluat/typescript-config`
- Separate configs for different project types (base, Next.js, React library)

## Workspace Patterns

**Workspace Dependencies:**

- Use `workspace:*` for internal package references
- Example: `"@siluat/ui-craft": "workspace:*"`

**Package Types:**

- UI libraries export React components via `./react/*` pattern
- CLI tools provide binary exports in `bin/` field
- Shared configs use named JSON exports

**Testing Strategy:**

- UI components: Vitest with React Testing Library
- E2E tests: Playwright for user-facing applications
- Rust code: Standard Cargo test framework

## Build Dependencies

Key build dependencies and patterns:

- Turborepo handles task orchestration and caching
- Build outputs go to `dist/`, `.next/`, and Rust `target/` directories
- Rust packages require `cargo build --release` followed by Node.js postbuild scripts
- Test tasks depend on build completion

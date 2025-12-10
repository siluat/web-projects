# ADR 001: Event-Driven Incremental Rendering for Real-time Drawing

## Status

Proposed (Experimental)

## Context

DOTORIXEL is a pixel editor project with the following goals:

- **Minimal dependencies**: Reduce external library dependencies
- **Platform-agnostic**: Core logic independent of rendering platform
- **Incrementally extensible**: Easy to add features without major refactoring

A pixel editor requires handling frequent pixel updates during drawing operations. Approaches that re-render the entire canvas on every change or rely heavily on framework state management may not align with these goals.

The architecture needs to:

- Separate concerns between state management and rendering
- Allow different renderers (Canvas 2D, WebGL, etc.) without modifying the core logic
- Maintain smooth performance during real-time drawing operations
  - Incremental rendering for pixel changes
  - Full redraw for initial load, restore, resize, etc.

## Decision

Adopt an **event-driven incremental rendering** approach with a clear separation between core logic and rendering.

### Package Structure

| Package | Responsibility |
|---------|----------------|
| `dotorixel-core` | State management, coordinate utils, command publishing |
| `dotorixel-react` | Event handling, Core integration, Canvas rendering |
| `dotorixel` (app) | Astro-based web application |

### Core Responsibilities

- Pixel state storage (`Uint32Array`)
- Coordinate conversion (screen → pixel)
- Input handling → State mutation → Event publishing
- State-dependent features (Fill, Undo/Redo)

### Renderer Responsibilities

- Receive user input events
- Convert coordinates via Core utils
- Subscribe to Core events
- Render only affected pixels (incremental)
- Bypass framework re-renders

### Data Flow

1. User input → Renderer receives event
2. Convert screen coords → pixel coords (via Core utils)
3. Pass input to Core
4. Core mutates state + publishes event
5. Renderer receives event → Updates only affected pixels

### Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                       dotorixel-core                        │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐   │
│  │    State    │<-->│   Input     │--->│ EventEmitter   │   │
│  │ (Uint32Array)│    │   Handler   │    │                │   │
│  └─────────────┘    └─────────────┘    └────────────────┘   │
│                            ^                   │             │
│                     ┌──────┴──────┐            │             │
│                     │ Coord Utils │            │             │
│                     └─────────────┘            │             │
└──────────────────────────│─────────────────────│─────────────┘
                           │                     │
                    pass input             subscribe events
                           │                     │
┌──────────────────────────│─────────────────────│─────────────┐
│                       Renderer                 │             │
│                          │                     v             │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │  - Receives user input                                 │  │
│  │  - Converts coordinates (via Core utils)               │  │
│  │  - Subscribes to events for incremental rendering      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Incremental Rendering** | Only changed pixels are redrawn |
| **Framework Bypass** | Imperative canvas updates, no framework re-renders |
| **Single Source of Truth** | Core state is authoritative |
| **Event-based Architecture** | Enables Undo/Redo, collaborative editing |
| **Platform Independence** | Swap renderers without Core changes |

### Negative

- Debugging may require tracing events across core and renderer layers

### Future Extensions

- **Collaborative Editing**: Transmit only commands over network
- **Tool/Color Selection**: Manage via UI layer state
- **Export/Import**: Save/load as PNG, JSON, etc.
- **Layers**: Multiple layer support

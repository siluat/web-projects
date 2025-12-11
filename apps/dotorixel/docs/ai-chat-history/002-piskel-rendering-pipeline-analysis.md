# Piskel Rendering Pipeline Analysis

> **⚠️ Warning**: This analysis was performed by AI and may contain inaccuracies.

## Overview

Piskel is a web-based open-source sprite editor that uses the Canvas API for editing and rendering pixel art. This document analyzes the entire processing flow from user input to screen rendering.

**Source Code Repository**: [piskelapp/piskel](https://github.com/piskelapp/piskel)

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              User Input                                      │
│                    (Mouse click/drag, Touch, Keyboard)                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DrawingController                                   │
│                    (Input handling & coordinate transformation)              │
│  • onMousedown_ / onMousemove_ / onMouseup_                                 │
│  • getSpriteCoordinates(): Screen coords → Sprite coords                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               Tool System                                    │
│                    (SimplePen, Eraser, Line, etc.)                          │
│  • applyToolAt(): Tool start                                                │
│  • moveToolAt(): Tool drag                                                  │
│  • releaseToolAt(): Tool end & frame application                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
              ┌──────────────────┐     ┌──────────────────┐
              │   Overlay Frame   │     │   Actual Frame   │
              │    (Preview)      │     │  (Actual data)   │
              └──────────────────┘     └──────────────────┘
                          │                       │
                          └───────────┬───────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DrawingLoop                                       │
│                  (requestAnimationFrame based)                               │
│  • Callback list management & execution                                      │
│  • Delta time calculation                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CompositeRenderer                                    │
│              (Composites multiple renderers for final image)                 │
│  • FrameRenderer: Current frame                                             │
│  • OverlayRenderer: Overlay (tool preview)                                  │
│  • OnionSkinRenderer: Onion skin                                            │
│  • LayersRenderer: Other layer previews                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Canvas Output                                   │
│                         (HTML5 Canvas API)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Component Analysis

### 1. Input Handling - DrawingController

`DrawingController` is the entry point for all user input.

**Location**: `src/js/controller/DrawingController.js`

#### 1.1 Event Listener Registration

```javascript
ns.DrawingController.prototype.initMouseBehavior = function () {
  this.container.addEventListener('mousedown', this.onMousedown_.bind(this));
  this.container.addEventListener('wheel', this.onMousewheel_.bind(this));
  window.addEventListener('mouseup', this.onMouseup_.bind(this));
  window.addEventListener('mousemove', this.onMousemove_.bind(this));
  window.addEventListener('keyup', this.onKeyup_.bind(this));
  window.addEventListener('touchstart', this.onTouchstart_.bind(this));
  window.addEventListener('touchmove', this.onTouchmove_.bind(this));
  window.addEventListener('touchend', this.onTouchend_.bind(this));
  document.body.addEventListener('contextmenu', this.onCanvasContextMenu_.bind(this));
};
```

#### 1.2 Coordinate Transformation

Transforms screen coordinates (client coordinates) to sprite coordinates (pixel coordinates).

```javascript
ns.FrameRenderer.prototype.getCoordinates = function(x, y) {
  var containerRect = this.container.getBoundingClientRect();
  x = x - containerRect.left;
  y = y - containerRect.top;
  
  // Apply margins
  x = x - this.margin.x;
  y = y - this.margin.y;
  
  var cellSize = this.zoom;
  
  // Apply offset
  x = x + this.offset.x * cellSize;
  y = y + this.offset.y * cellSize;
  
  return {
    x : Math.floor(x / cellSize),
    y : Math.floor(y / cellSize)
  };
};
```

#### 1.3 Mouse Event Processing Flow

```javascript
// mousedown event
ns.DrawingController.prototype.onMousedown_ = function (event) {
  var coords = this.getSpriteCoordinates(event.clientX, event.clientY);
  this.isClicked = true;
  
  if (event.button === Constants.MIDDLE_BUTTON) {
    // Drag to move canvas
    this.dragHandler.startDrag(event.clientX, event.clientY);
  } else if (event.altKey && !this.currentToolBehavior.supportsAlt()) {
    // Eyedropper (color picker)
    this.isPickingColor = true;
  } else {
    // Start tool application
    this.currentToolBehavior.applyToolAt(coords.x, coords.y, frame, this.overlayFrame, event);
  }
};

// mousemove event (with throttling)
ns.DrawingController.prototype.onMousemove_ = function (event) {
  var currentTime = new Date().getTime();
  if ((currentTime - this.previousMousemoveTime) > Constants.MOUSEMOVE_THROTTLING) {
    this.moveTool_(this._clientX, this._clientY, event);
    this.previousMousemoveTime = currentTime;
  }
};
```

### 2. Tool System

Each tool implements a common interface.

**Location**: `src/js/tools/drawing/`

#### 2.1 BaseTool Interface

```javascript
ns.BaseTool.prototype.applyToolAt = function (col, row, frame, overlay, event) {};
ns.BaseTool.prototype.moveToolAt = function (col, row, frame, overlay, event) {};
ns.BaseTool.prototype.releaseToolAt = function (col, row, frame, overlay, event) {};
ns.BaseTool.prototype.moveUnactiveToolAt = function (col, row, frame, overlay, event) {
  // Display tool preview (highlight)
};
```

#### 2.2 SimplePen Implementation Example

```javascript
ns.SimplePen.prototype.applyToolAt = function(col, row, frame, overlay, event) {
  this.previousCol = col;
  this.previousRow = row;
  var color = this.getToolColor();
  this.drawUsingPenSize(color, col, row, frame, overlay);
};

ns.SimplePen.prototype.draw = function(color, col, row, frame, overlay) {
  // Immediately display on overlay (preview)
  overlay.setPixel(col, row, color);
  
  // For eraser, immediately apply to actual frame
  if (color === Constants.TRANSPARENT_COLOR) {
    frame.setPixel(col, row, color);
  }
  
  // Record pixel (for batch application later)
  this.pixels.push({ col: col, row: row, color: color });
};

ns.SimplePen.prototype.moveToolAt = function(col, row, frame, overlay, event) {
  // Linear interpolation to fill gaps during fast mouse movement
  if ((Math.abs(col - this.previousCol) > 1) || (Math.abs(row - this.previousRow) > 1)) {
    var interpolatedPixels = pskl.PixelUtils.getLinePixels(
      col, this.previousCol, row, this.previousRow
    );
    for (var i = 0; i < interpolatedPixels.length; i++) {
      var coords = interpolatedPixels[i];
      this.applyToolAt(coords.col, coords.row, frame, overlay, event);
    }
  } else {
    this.applyToolAt(col, row, frame, overlay, event);
  }
};

ns.SimplePen.prototype.releaseToolAt = function(col, row, frame, overlay, event) {
  // Batch apply to actual frame
  this.setPixelsToFrame_(frame, this.pixels);
  
  // Emit history save event
  this.raiseSaveStateEvent({
    pixels: this.pixels.slice(0),
    color: this.getToolColor()
  });
  
  // Reset used pixels
  this.resetUsedPixels_();
};
```

### 3. Data Model - Frame

Pixel data is stored as `Uint32Array` for memory efficiency.

**Location**: `src/js/model/Frame.js`

```javascript
ns.Frame = function (width, height) {
  this.width = width;
  this.height = height;
  this.id = __idCounter++;
  this.version = 0;  // Version for change detection
  this.pixels = ns.Frame.createEmptyPixelGrid_(width, height);
};

ns.Frame.createEmptyPixelGrid_ = function (width, height) {
  var pixels = new Uint32Array(width * height);
  var transparentColorInt = pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);
  pixels.fill(transparentColorInt);
  return new Uint32Array(pixels);
};

ns.Frame.prototype.setPixel = function (x, y, color) {
  if (this.containsPixel(x, y)) {
    var index = y * this.width + x;
    var p = this.pixels[index];
    color = pskl.utils.colorToInt(color);
    if (p !== color) {
      this.pixels[index] = color || pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);
      this.version++;  // Increment version on change
    }
  }
};

ns.Frame.prototype.getHash = function () {
  return [this.id, this.version].join('-');
};
```

### 4. Rendering Loop - DrawingLoop

**Location**: `src/js/rendering/DrawingLoop.js`

Game loop pattern using `requestAnimationFrame`.

```javascript
ns.DrawingLoop = function () {
  this.requestAnimationFrame = this.getRequestAnimationFrameShim_();
  this.isRunning = false;
  this.previousTime = 0;
  this.callbacks = [];
};

ns.DrawingLoop.prototype.loop_ = function () {
  var currentTime = Date.now();
  var delta = currentTime - this.previousTime;
  
  this.executeCallbacks_(delta);
  
  this.previousTime = currentTime;
  this.requestAnimationFrame.call(window, this.loop_);
};

ns.DrawingLoop.prototype.executeCallbacks_ = function (deltaTime) {
  for (var i = 0; i < this.callbacks.length; i++) {
    var cb = this.callbacks[i];
    cb.fn.call(cb.scope, deltaTime, cb.args);
  }
};
```

### 5. Renderer System

#### 5.1 CompositeRenderer

Composites multiple renderers.

**Location**: `src/js/rendering/CompositeRenderer.js`

```javascript
// Setup during DrawingController initialization
this.compositeRenderer = new pskl.rendering.CompositeRenderer();
this.compositeRenderer
  .add(this.overlayRenderer)     // Tool preview
  .add(this.renderer)            // Current frame
  .add(this.layersRenderer)      // Other layers
  .add(this.onionSkinRenderer);  // Onion skin
```

#### 5.2 CachedFrameRenderer (Change Detection Optimization)

**Location**: `src/js/rendering/frame/CachedFrameRenderer.js`

Uses frame hash to prevent unnecessary rendering.

```javascript
ns.CachedFrameRenderer.prototype.render = function (frame) {
  var offset = this.getOffset();
  var size = this.getDisplaySize();
  
  // Serialize rendering state to generate hash
  var serializedFrame = [
    this.getZoom(),
    this.getGridWidth(),
    this.getGridSpacing(),
    this.getGridColor(),
    pskl.UserSettings.get('SEAMLESS_MODE'),
    pskl.UserSettings.get('SEAMLESS_OPACITY'),
    offset.x,
    offset.y,
    size.width,
    size.height,
    frame.getHash()  // Frame's id + version
  ].join('-');
  
  // Only perform actual rendering when different from previous
  if (this.serializedFrame != serializedFrame) {
    this.serializedFrame = serializedFrame;
    this.superclass.render.call(this, frame);
  }
};
```

#### 5.3 FrameRenderer (Actual Canvas Rendering)

**Location**: `src/js/rendering/frame/FrameRenderer.js`

```javascript
ns.FrameRenderer.prototype.renderFrame_ = function (frame) {
  // 1. Draw to offscreen canvas at 1:1 pixel ratio
  pskl.utils.FrameUtils.drawToCanvas(frame, this.canvas);
  
  this.updateMargins_(frame);
  
  var displayContext = this.displayCanvas.getContext('2d');
  displayContext.save();
  
  // 2. Apply offset and zoom
  var translateX = this.margin.x - this.offset.x * z;
  var translateY = this.margin.y - this.offset.y * z;
  displayContext.translate(translateX, translateY);
  displayContext.scale(z, z);  // Apply zoom
  
  // 3. Clear and draw
  displayContext.clearRect(0, 0, w, h);
  displayContext.drawImage(this.canvas, 0, 0);
  
  // 4. Grid rendering
  var gridWidth = this.computeGridWidthForDisplay_();
  if (gridWidth > 0) {
    // Draw grid lines...
  }
  
  displayContext.restore();
};
```

### 6. Main App Initialization and Render Callback

**Location**: `src/js/app.js`

```javascript
ns.app = {
  init: function () {
    // ... Controller initialization ...
    
    // Start rendering loop
    this.drawingLoop = new pskl.rendering.DrawingLoop();
    this.drawingLoop.addCallback(this.render, this);
    this.drawingLoop.start();
  },
  
  render: function (delta) {
    this.drawingController.render(delta);
    this.previewController.render(delta);
    this.framesListController.render(delta);
  }
};
```

## Event System

Piskel uses jQuery's pub/sub pattern.

**Location**: `src/js/Events.js`

```javascript
var Events = {
  TOOL_SELECTED: 'TOOL_SELECTED',
  TOOL_RELEASED: 'TOOL_RELEASED',
  TOOL_PRESSED: 'TOOL_PRESSED',
  CURSOR_MOVED: 'CURSOR_MOVED',
  PISKEL_RESET: 'PISKEL_RESET',
  PISKEL_SAVE_STATE: 'PISKEL_SAVE_STATE',
  HISTORY_STATE_SAVED: 'HISTORY_STATE_SAVED',
  // ... more events ...
};

// Publish event
$.publish(Events.TOOL_PRESSED);

// Subscribe to event
$.subscribe(Events.TOOL_SELECTED, function (evt, toolBehavior) {
  this.currentToolBehavior = toolBehavior;
});
```

## Performance Optimization Strategies

### 1. Double Canvas Strategy

```text
Frame.pixels (Uint32Array)
         │
         ▼
┌─────────────────┐
│ Offscreen Canvas │  ← Draw at 1:1 pixel ratio
│  (this.canvas)   │
└─────────────────┘
         │
         │ scale(zoom, zoom)
         ▼
┌─────────────────┐
│ Display Canvas   │  ← Display with zoom/offset applied
│ (displayCanvas)  │
└─────────────────┘
```

### 2. Change Detection Based Rendering

- `Frame.version`: Incremented on pixel change
- `Frame.getHash()`: Hash in `id-version` format
- `CachedFrameRenderer`: Skip unnecessary rendering by comparing hashes

### 3. Overlay Separation

- **Overlay Frame**: For tool preview (updated every frame)
- **Actual Frame**: Actual data (updated only on tool release)

### 4. Mouse Event Throttling

```javascript
if ((currentTime - this.previousMousemoveTime) > Constants.MOUSEMOVE_THROTTLING) {
  this.moveTool_(...);
  this.previousMousemoveTime = currentTime;
}
```

### 5. Linear Interpolation for Fast Drawing

Fills pixel gaps during fast mouse movement with linear interpolation.

```javascript
if ((Math.abs(col - this.previousCol) > 1) || (Math.abs(row - this.previousRow) > 1)) {
  var interpolatedPixels = pskl.PixelUtils.getLinePixels(
    col, this.previousCol, row, this.previousRow
  );
  // Apply tool to all interpolated pixels
}
```

## Rendering Pipeline Summary

```text
1. [User Input]
   mousedown/mousemove/mouseup → DrawingController
   
2. [Coordinate Transformation]
   clientX/Y → getSpriteCoordinates() → col/row
   
3. [Tool Application]
   Tool.applyToolAt() → overlay.setPixel()
   Tool.moveToolAt() → overlay.setPixel() (+ linear interpolation)
   Tool.releaseToolAt() → frame.setPixel() (batch application)
   
4. [Change Detection]
   frame.setPixel() → frame.version++ → frame.getHash() changes
   
5. [Render Loop]
   DrawingLoop.loop_() (requestAnimationFrame)
   → app.render()
   → drawingController.render()
   
6. [Cache Check]
   CachedFrameRenderer.render()
   → Compare serializedFrame
   → Only render on change
   
7. [Canvas Rendering]
   FrameRenderer.renderFrame_()
   → Draw 1:1 to offscreen canvas
   → Draw to display canvas with zoom/offset
   → Draw grid overlay
```

## Implications for Dotorixel Project

1. **Event-Driven Architecture**: Piskel's pub/sub pattern provides loose coupling but can make event flow tracking difficult

2. **Change Detection Strategy**: Frame's version-based hash is a simple and effective change detection method

3. **Overlay Separation**: Separating preview overlay from actual data is a good pattern for improving responsiveness

4. **Optimization Techniques**:
   - Double canvas (offscreen + display)
   - Cache-based rendering skip
   - Mouse event throttling
   - Linear interpolation for fast drawing support

5. **Areas for Improvement**:
   - Tile-based incremental rendering (for large canvas support)
   - More sophisticated dirty region tracking
   - Parallel processing using Web Workers

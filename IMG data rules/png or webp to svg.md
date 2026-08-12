# Image Lagging Issue & Optimization Technical Requirements

## Overview
Guidelines for resolving image lagging issues, converting WebP/PNG game piece images to clean SVGs, and optimizing frontend rendering performance to ensure zero gameplay lag.

---

## Technical Requirements for Eliminating Drag & Lag

- **CSS Transformations**: Use `css transform: translate3d()` for smooth GPU-accelerated movement:
  - `transform: translate3d(x, y, 0)` or `transform: translate(x, y)`
- **Event Handling**: Use unified Pointer events with `requestAnimationFrame`.
- **Interaction Tweaks**: Disable native dragging and hit-testing by setting:
  - `pointer-events: none`

---

## Workflow: Convert WebP / PNG to Clean SVGs

### Step 1: Trace Raster Images into Vectors
- Run your `.webp` / `.png` files via tools such as:
  - **vectorizer.ai**
  - **Ezgif WebP to SVG** (using the `vtracer` or `ezgif-trace` engine)
  - **Recraft AI**
- These tools trace raster shapes into smooth vector paths.

### Step 2: Optimize the SVG Output
- **Minification**: Run every SVG through **SVGOMG**.
- **Cleanup**: Clean up unnecessary metadata, group tags, and hidden paths.
- **Coordinate Space Standardization**: Ensure the root SVG element uses a uniform coordinate space:
  - e.g., `viewBox="0 0 100 100"` or `viewBox="0 0 45 45"`
- **File Size Target**: Aim for file sizes under **5–15 kB per piece**.
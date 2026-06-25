# Bojectify — Fitted Furniture Builder: 3D Canvas Design

**Date:** 2026-06-16
**Status:** Draft for review
**Scope of this doc:** Technology and architecture decision for the interactive 3D canvas. The parametric _generation engine_ (turning raw room measurements into sensible drawer/wardrobe layouts) is acknowledged here but scoped as a **separate sub-project** (see "Out of Scope / Next").

---

## 1. Product summary

An easy-to-use, web-based fitted-furniture builder. Users provide measurements for a space; the tool formulates fitted drawers and wardrobes for that area. Results are shown on a zoomable 3D artboard (SketchUp / Shapr3D feel) that supports **light in-canvas editing**. Manufacturing output (cut lists, panel schedules) is a **core deliverable**.

## 2. Requirements (confirmed during brainstorming)

| Dimension               | Decision                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| In-canvas interactivity | **Light editing** — orbit/pan/zoom plus dragging/resizing a few elements (move a shelf, change drawer count). Not full CAD modelling. |
| Front-end framework     | **Open** — recommend Next.js (React) for the 3D ecosystem.                                                                            |
| Visual fidelity         | **Clean schematic** — lightly-shaded solids, crisp panel edges, dimension labels. Not photorealistic.                                 |
| Manufacturing output    | **Core feature** — cut lists, panel dimensions, exports.                                                                              |
| CMS                     | Existing CMS; site built in Next/Nuxt.                                                                                                |

## 3. Key architectural insight: data-model-first

The **source of truth is a parametric data model**, not the 3D mesh:

- Room dimensions → carcasses → panels / drawers / shelves, as plain TypeScript objects.
- The 3D canvas is a _renderer + interaction layer_ over that model.
- The cut list / manufacturing output is **derived from the same model**, never read back from mesh geometry (avoids floating-point error and keeps numbers exact).

Consequence: **no CAD/BREP kernel is needed.** Fitted furniture is almost entirely axis-aligned boxes — three.js box geometry covers it. This rules out OpenCascade.js / Shapr3D-style B-rep kernels.

```
┌─────────────────────────────────────────────────┐
│  Parametric model (source of truth)              │
│  Room dims → carcasses → panels/drawers/shelves  │
│  Plain TS objects. Drives BOTH outputs below.    │
└───────────────┬───────────────────┬──────────────┘
                │                   │
       ┌────────▼────────┐  ┌───────▼─────────────┐
       │ 3D canvas (r3f) │  │ Manufacturing output │
       │ schematic view  │  │ cut lists, panel     │
       │ + light editing │  │ schedules, exports   │
       └─────────────────┘  └──────────────────────┘
```

## 4. Technology decision

**Chosen stack: Next.js (React) + react-three-fiber (r3f) + drei + three.js**

### Options considered

1. **react-three-fiber + drei (CHOSEN).** Declarative React renderer for three.js. `drei` provides orbit/zoom controls, transform/drag gizmos, raycasting selection, fit-to-view bounds, grids, and lighting out of the box. React's reconciler diffs the scene when the parametric model changes — ideal for "regenerate furniture when measurements change." Best docs and largest community for exactly this orbit/zoom/drag-handle configurator UX. Trade-off: ties the project to React/Next.
2. **Raw three.js (framework-agnostic).** Maximum control, works with Next or Nuxt, no abstraction tax. Trade-off: hand-written scene graph, controls wiring, and framework integration — significantly more boilerplate and slower to build editing affordances. Not justified for box-based furniture.
3. **Babylon.js (framework-agnostic).** Batteries-included engine with strong built-in gizmos and TypeScript. Trade-off: heavier, more game-engine-oriented, smaller web-configurator community than three/r3f. More than this product needs.

**Ruled out:** full CAD kernels (OpenCascade.js / B-rep) and commercial configurator SaaS (e.g. Threekit) unless buying-to-skip-build becomes desirable.

### Why the chosen stack fits the specific requirements

- **Schematic look:** lightly-shaded `meshStandardMaterial` + `EdgesGeometry` for crisp panel outlines; `drei` `<Text>` / `<Html>` for dimension labels; `<Grid>` floor. No PBR texture pipeline required.
- **Light editing:** `drei` `<OrbitControls>` (SketchUp-style orbit/pan/zoom), `<TransformControls>` / `<DragControls>` for moving elements, built-in raycasting for click-to-select, `<Bounds>` for fit-to-view.
- **Regeneration on change:** change the data → React reconciles the scene; no manual scene teardown.
- **Exact manufacturing output:** cut lists come from the model via a pure `generateCutList(model)` function, independent of rendering.

## 5. Component breakdown

**Data layer (framework-agnostic, pure TS):**

- `model/types.ts` — `Room`, `Carcass`, `Panel`, `Drawer`, `Shelf` types.
- `model/generate.ts` — `generateModel({ room, config })` → model tree. _(Thin placeholder here; the real engine is the separate sub-project below.)_
- `model/cutList.ts` — `generateCutList(model)` → panel schedule. Pure function over the model.

**Render layer (r3f components, read-only over the model):**

- `<SceneCanvas>` — the `<Canvas>` wrapper, lighting, grid, controls, fit-to-view. Client component, SSR disabled.
- `<Carcass>`, `<Panel>`, `<Drawer>`, `<Shelf>` — render model nodes as box geometry + edges + labels.

**Interaction layer:**

- Selection (raycast → selected node id in state).
- Drag/resize handles that write changes _back into the parametric model_ (model stays source of truth), which then re-renders.

**Boundaries:** the data layer has no knowledge of three.js; the render layer reads the model and emits edit intents; manufacturing output depends only on the data layer. Each can be tested independently — the data/cut-list layer with plain unit tests, the render layer via component tests.

## 6. Next.js integration note

- The canvas must be a **client component** (`"use client"`) and **dynamically imported with SSR disabled** (`next/dynamic`, `{ ssr: false }`) — three.js cannot render server-side.
- All other routes (CMS-driven pages, measurement forms, marketing) remain normal SSR'd Next routes. This is a standard, well-supported pattern.

## 7. Phasing

1. **Phase 1 — Static schematic render.** Parametric model types + a hand-built sample model → r3f schematic scene with orbit/zoom and dimension labels.
2. **Phase 2 — Cut list.** `generateCutList(model)` + a panel-schedule view. Validates the data-model-first approach end to end.
3. **Phase 3 — Light editing.** Selection, drag/resize handles writing back to the model.
4. **Phase 4 — Generation engine integration.** Wire in the real measurements→layout engine (separate sub-project).

## 8. Out of scope / Next sub-project

The **parametric generation engine** — turning raw room measurements into sensible, manufacturable drawer/wardrobe layouts (clearances, standard panel sizes, hardware constraints, optimisation) — is the harder, more novel part of the product and deserves its own spec → plan → build cycle. This doc deliberately treats it as a black box (`generateModel`) so the canvas can be built and validated against sample models first.

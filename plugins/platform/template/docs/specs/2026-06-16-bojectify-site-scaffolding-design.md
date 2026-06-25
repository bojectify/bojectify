# Bojectify-site scaffolding design

**Date:** 2026-06-16
**Status:** Approved (design) — ready for implementation planning
**Related:** `docs/specs/2026-06-16-fitted-furniture-3d-canvas-design.md` (the 3D product this shell hosts)

## Goal

Stand up the `bojectify-site` repository fast on `boject-pixi`'s proven Next.js platform, and capture the _how_ as a reusable, shared Claude skill — without taking on package-publishing overhead that two sites don't justify.

This spec covers the **scaffolding shell only**. The 3D product build (canvas, furniture data model, cut lists) is out of scope and proceeds against the empty shell per its own architecture spec's build phasing.

## Context

`boject-pixi` is a mature Next.js 16 / React 19 app whose scaffolding is almost entirely reusable:

- Hardened dev container (`docker-compose` + redis cache handler + `Dockerfile.dev`), GraphQL/Apollo + codegen against a headless CMS, Storybook 10 + Vitest (unit/storybook/screenshots), lefthook + eslint + stylelint + prettier, and codegen scripts (`generate-routes`, `generate-tokens`).
- Already parameterised per-site (`site.config.ts`, `site-fonts.config.ts`).
- Pixi coupling is small and isolated — 7 files under `src/components/pixi/` plus two hero hooks and the hero integration point.

`bojectify-site` is the same platform with a different product: a 3D fitted-furniture builder using react-three-fiber instead of pixi.js, fed by a **different instance of the same CMS**.

A third repo, the `bojectify` Nx monorepo (`@bojectify/source`), already publishes `@bojectify/*` packages and is the home for shared Claude tooling.

## Key decision: clean copy, no shared packages

We considered extracting the shared platform into versioned `@bojectify/*` packages (configs, CMS client, a devcontainer base image) consumed by both apps. **Rejected for now.**

- The package strategy's payoff (automatic lockstep) only justifies its standing cost — versioning, a Verdaccio publish loop, dual adoption, a ghcr base image — across a _fleet_. This is two sites.
- The platform copies cleanly (pixi is isolated), which removes the main argument for packages.

**Accepted tradeoff:** no automatic lockstep. The two apps will drift over time. Mitigation: the scaffold skill keeps _new_ sites consistent at birth, and at two sites occasional manual sync is rare enough to absorb. If a third or fourth site appears, revisit extraction.

**Scope of this decision:** "no packages" covers _scaffolding and platform-tooling_ (configs, devcontainer, the CMS client wiring). It does **not** preclude genuinely-shared _UI component libraries_ coupled to the shared CMS — those are exactly what the `bojectify` monorepo already exists for (it publishes `react-carousel`, `react-reveal`, etc.). The CMS image-transformation layer is the first such case; see Out of scope.

## Topology

Three standalone repos; ownership unchanged, nothing merged or restructured.

| Repo                              | Role                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `boject-pixi`                     | Canonical platform reference — the source the scaffold copies _from_.          |
| `bojectify-site`                  | New app — scaffolded from the platform, hosts the 3D product.                  |
| `bojectify` (`@bojectify/source`) | Home for the shared `scaffold-project` skill, shipped as a Claude Code plugin. |

## Phase 1 — scaffold bojectify-site

### Copy allowlist (platform — pixi-free, reusable)

- **i18n:** `src/i18n/` (request, routing, navigation, pathnames) + the `next.config.ts` next-intl plugin wiring.
- **CMS / GraphQL:** `src/lib/apolloClient.ts`, `src/lib/graphql/__generated__/`, `src/lib/graphql/extractCacheTags.ts`, `codegen.ts`, `src/lib/verifyWebhookSignature.ts`.
- **Test harness:** `src/test/`, `vitest.config.ts`, `vitest.shims.d.ts`, `.storybook/`.
- **Styling + tokens:** `src/styles/`, `scripts/generate-tokens/`, `src/styles/figma-mode-map.json`.
- **Route codegen:** `scripts/generate-routes/`, consumed by `site.config.ts`.
- **Caching:** `cache-handler.mjs`.
- **Generic hooks:** `src/hooks/*` except `useHeroPhase`, `useIntroAnimation` — i.e. `useColorScheme`, `useThemePreference`, `useClickAway`, `usePointerType`, `useIntersectionObserver`, `useScrollTrigger`, `useFocusTrap`.
- **Generic utils / types:** `src/utils/*` (`cmsImage`, `artDirectionPresets`), `src/model/*` except `heroPhase.types`, generic `src/constants/*`.
- **Components:** `src/components/svg/`, `src/components/ui/{atoms,molecules,layout,site-chrome}/`, `src/components/vendor/`. Note `src/components/ui/organisms/` is **not** copied — organisms are page-section content (incl. the pixi-coupled hero) and are authored fresh against the new product.
- **Revalidation plumbing:** `src/transforms/revalidation/` and `src/app/api/revalidate/*` (structure; adapt payloads to the new CMS schema later).
- **Root config:** `tsconfig.json`, `eslint.config.mjs`, `stylelint.config.ts`, `site-fonts.config.ts`, `.prettierrc.yml`, `.prettierignore`, `lefthook.yml`, `.gitignore`, `.dockerignore`, `pnpm-workspace.yaml`.
- **Dev container:** `.devcontainer/`, `Dockerfile.dev`, `docker-compose.yml`, `scripts/host-shims/`, `.env.example`.
- **Claude tooling:** `.claude/commands/` (all 8 component/token scaffolding commands) and the `update-mds` skill. Scan for pixi references (expected clean).

### Strip list (pixi / product layer)

Two kinds of exclusion. First, directories simply **outside the copy allowlist** (never carried):

- `src/components/pixi/` (the 7 pixi files).
- `src/components/ui/organisms/` (product page-sections, incl. the pixi-coupled hero).

Second, files dropped from the **"all except" copies** (`src/hooks/*`, `src/model/*` are copied wholesale _minus_ these):

- `src/hooks/useHeroPhase/`, `src/hooks/useIntroAnimation/` (hooks + stores).
- `src/model/types/heroPhase.types.ts`.

### Reset (start empty per product owner)

- **`src/app/`** — minimal Next shell only: root layout + `[locale]` layout for i18n plumbing. **No routes** (no blog/articles/authors/tags). Home page is a placeholder.
- **Furniture data model** — **not authored now.** The architecture spec places it in `model/` (`types.ts` / `generate.ts` / `cutList.ts`); the product build writes those later. Caveat: boject-pixi already uses `src/model/` for generic _platform_ types (locales, api, theme guards), which **are** copied per the allowlist — so `model/` is not literally empty. The collision between these two uses of `model/` is an Open item to resolve (likely a `model/furniture/` namespace for the product layer).
- **Dependencies** — remove `@pixi/react`, `pixi.js`; add `three`, `@react-three/fiber`, `@react-three/drei`. Toolchain ready; **no canvas component built** in this phase.

### Repoint (per-site)

- `.env` — new CMS instance (`CMS_GRAPHQL_URL`, `CMS_API_KEY`), `REDIS_URL`.
- `site.config.ts` — brand `Bojectify`, locales (default a single `en` locale; collapsing is cheap, retrofitting next-intl later is not).
- `site-fonts.config.ts` — Bojectify fonts.
- Design tokens — point `figma_exports/` at Bojectify's design system (or a starter set); rerun `codegen:tokens`.

### Verify (Phase 1 done)

- `pnpm install` succeeds under the workspace's supply-chain settings.
- `codegen:graphql` runs against the new CMS instance and produces types.
- `codegen:routes` and `codegen:tokens` run clean.
- `pnpm typecheck`, `pnpm lint`, `pnpm lint:scss`, `pnpm test` all green.
- Dev container boots; `pnpm dev` serves the placeholder home page.

## Phase 2 — crystallize the `scaffold-project` skill

- **Build by doing.** Author the skill _from_ the real Phase 1 run, capturing decisions while fresh — not speculatively. `bojectify-site` becomes the skill's first worked example, so the manifest is battle-tested rather than guessed.
- **Boject-specific, not generic.** The skill encodes _this_ platform manifest (copy allowlist, strip list, reset, repoint, verify checklist). No attempt at a general-purpose project scaffolder (YAGNI).
- **Home:** the `bojectify` monorepo, shipped as a **Claude Code plugin** — the seed of the org's Claude plugin, installable in any repo including a fresh empty one. Authored with the writing-skills skill.
- **Input it captures:** what's platform vs product, the rendering-dep swap, the env/brand repoint points, and the verify checklist above.

## Out of scope

- The 3D product build — canvas (`<SceneCanvas>` dynamically imported with `{ ssr: false }`), the furniture data layer (`Room`/`Carcass`/`Panel`, `generateModel`, `generateCutList`), editing. Governed by `docs/specs/2026-06-16-fitted-furniture-3d-canvas-design.md`.
- Any `@bojectify/*` _config / platform-tooling_ package extraction or devcontainer base image (explicitly deferred — see Key decision).
- **The CMS image-transformation layer** — the `Image` atom + its `cmsImage` / `artDirectionPresets` utils (a coupled trio), tied to boject-cms's image-transform feature. A genuinely shared UI primitive that belongs as a **library component in the `bojectify` monorepo** (alongside `react-carousel` / `react-reveal`), extracted in its **own follow-up spec**, with boject-pixi adopting it as the proving consumer. Not needed by this component-free scaffold; bojectify-site consumes the published package when it first renders CMS images.
- The new CMS instance's content model and the marketing/CMS routes that will eventually fill `app/`.

## Open items (resolve during implementation)

- **`model/` namespace collision** — platform types (copied) vs. the furniture data model (authored later) both want `model/`. Decide the split (leaning: keep platform types where they are, give the product layer `model/furniture/`).
- Exact copy mechanism (selective file copy into the existing repo vs. clone-and-strip).
- The `bojectify` monorepo's existing plugin/marketplace structure — confirm before placing the skill.
- Single-locale vs multi-locale default for launch (leaning single `en`).

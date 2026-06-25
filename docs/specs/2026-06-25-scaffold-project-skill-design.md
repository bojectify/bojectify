# `scaffold-project` skill — Design

- **Status:** Design approved (pending written-spec review)
- **Date:** 2026-06-25
- **Issue:** [bojectify/bojectify#8](https://github.com/bojectify/bojectify/issues/8)
- **Bootstrap reference:** `bojectify-site@6619bfd` (Phase-1 scaffold commit, 2026-06-17)

---

## 1. Context & goal

Issue #8 calls for a `scaffold-project` Claude skill — shipped as a Claude Code **plugin** from this monorepo — that stands up a new Boject(ify) site. `bojectify-site` was the first hand-run worked example; this skill crystallizes that "how" into reusable tooling.

**Key reframe from the issue.** Issue #8 framed scaffolding **subtractively**: copy `boject-pixi`'s platform layer, then _strip_ the product layer (pixi, etc.), with "which layers to include/defer" left as an open question. This design instead is **additive**: lay down a fixed, minimal Boject shell from a **bundled template**, and treat CMS, rendering frameworks, and auth as **opt-in layers added later**. The base set is fixed and small, which dissolves the issue's hardest open question (parameterising include/defer).

**Scope of this spec.** Only the `scaffold-project` skill and the marketplace/plugin packaging it requires. `boject-sso`'s product/auth (Zitadel) architecture is a **separate, later spec**.

---

## 2. Scope boundary

`scaffold-project` is a skill inside this monorepo's org plugin whose **single steady-state job** is: materialize a minimal, Boject-branded Next.js **shell** into the current (empty) repo from a **bundled template**, repoint it to the new project's identity, wire it to the org plugin marketplace, and verify it boots.

**In scope (the shell — fixed, not parameterised):** dev container, i18n routing, design tokens/styles + codegen, test harness, root config, `.claude/` wiring.

**Explicitly out of scope:**

- **Deriving the template at runtime.** The template is produced by a **one-time bootstrap** from `bojectify-site@6619bfd` (§3) while building this — the finished skill never re-derives it and never touches `boject-pixi`; no live-copy machinery.
- **CMS layer** (Apollo + graphql-codegen + Redis/ISR) — a later opt-in layer (§3).
- **Rendering framework** (pixi/r3f) and furniture `model/` — not in the shell at all.
- **Auth / Zitadel** — `boject-sso`'s product layer, its own spec.

**Structural consequence:** this monorepo becomes the org's **plugin marketplace** (§5).

---

## 3. The shell, the CMS boundary, and the bootstrap source

**Finding that grounds this section:** `bojectify-site`'s executed Phase 1 (`6619bfd`) ≈ the target shell **plus** the CMS plumbing, and it was verified green. Its plan deferred _all_ of `src/components`, `src/hooks`, `src/utils`, organisms, blog routes, `src/app/api`, and `src/transforms`. So the shell is defined by a clean **subtraction** of the CMS layer from a known-good commit — not a fresh derivation from `boject-pixi`.

### Base shell (the bundled template)

- **Dev container** — `.devcontainer/`, `Dockerfile.dev`, `Dockerfile`, `docker-compose.yml` _(dev service only)_, `scripts/host-shims/`, `.dockerignore`
- **i18n** — `src/i18n/`, the `next-intl` plugin wiring in `next.config.ts`, locale data in `site.config.ts` + `src/model/constants/locales*`
- **Design tokens / styles + codegen** — `src/styles/` (globals, mixins, functions, `figma-mode-map.json`), `scripts/generate-tokens/`, a **starter** `figma_exports/` set
- **Route codegen** — `scripts/generate-routes/`
- **Test harness** — `src/test/`, `vitest.config.ts`, `vitest.shims.d.ts`, `.storybook/` (Vitest + Playwright + Storybook)
- **Root config** — `package.json` _(scripts minus `codegen:graphql`)_, `tsconfig.json`, `eslint.config.mjs`, `stylelint.config.ts`, `.prettierrc.yml`/`.prettierignore`, `lefthook.yml`, `.gitignore`, `pnpm-workspace.yaml`, `site.config.ts`, `site-fonts.config.ts`, `next.config.ts` _(minus cache-handler wiring)_
- **App skeleton** — `src/app/` root layout (**no chrome**) + `[locale]` layout + placeholder home; generic `src/model/*`, `src/constants/*` (+`__generated__`), `src/@types/`
- **`.claude/` wiring** — a `settings.json` pointing at the marketplace + enabling the plugin, plus project-local `settings.local.json` + memory scaffold. **Commands/skills are not copied** — they come from the installed plugin.

### Deferred → CMS follow-up option (captured here, not built in this spec)

`src/lib/apolloClient.ts`, `src/lib/graphql/*`, `verifyWebhookSignature.ts`, `codegen.ts` + `codegen:graphql`, CMS env vars, CMS image utils (`cmsImage`, `artDirectionPresets`), `src/app/api/revalidate/*`, `src/transforms/revalidation/` — **plus Redis/ISR** (`cache-handler.mjs`, the `redis` compose service, `REDIS_URL`, the `next.config.ts` cache wiring), since revalidation exists only to refresh CMS content. The Redis **port** is deconflicted as part of _this_ follow-up, not the base shell.

### Not in scope at all (product layer)

`src/components/*`, product hooks/utils, organisms, stores/builder, blog routes.

### Bootstrap source

The bundled template is crystallized **once** from **`bojectify-site@6619bfd` minus the CMS layer** (it's already pixi-stripped and was verified green), rather than re-deriving from `boject-pixi`. The bootstrap's **exit criterion**: _the `bojectify-site@6619bfd − CMS` template builds green with no Redis and no CMS_ (see §7).

---

## 4. Inputs & execution flow

### Inputs (the repoint set)

| Input                                | Required?                         | Repoints                                                                 |
| ------------------------------------ | --------------------------------- | ------------------------------------------------------------------------ |
| **Project name** (e.g. `boject-sso`) | ✅ required                       | `package.json` name, `devcontainer.json` container name                  |
| **Brand** (e.g. `Boject SSO`)        | ✅ required                       | `site.config.ts` `BRAND`, `src/app/layout.tsx` title                     |
| **Locale(s)**                        | default: single `en`/GB           | `site.config.ts` `LOCALES_OBJ` + default + (empty, home-only) `SEGMENTS` |
| **Ports**                            | default + note                    | `docker-compose.yml` + `devcontainer.json` (app, Storybook)              |
| **Fonts**                            | default: starter                  | `site-fonts.config.ts`                                                   |
| **Design tokens**                    | default: starter `figma_exports/` | regenerated via `codegen:tokens`; swap to real brand later               |

- **Locale note** (from the manifest): keep next-intl wired even for a single locale — "collapsing is cheap, retrofitting next-intl later is not."
- **Ports** — base shell repoints **app + Storybook** only. Known-taken: CMS `6006` (Storybook) + `4000` (GraphQL); pixi `3000`/`6007`; site `3001`/`6008`. New-site defaults → next free: app **`3002`**, Storybook **`6009`**. The skill states the known-taken set so the operator can adjust; a fresh empty repo can't see its siblings to auto-deconflict.

### Execution flow (ordered)

1. **Empty-target guard** — confirm the repo is empty (only `.git` tolerated); refuse/clarify before any overwrite.
2. Materialize `template/` (from `${CLAUDE_PLUGIN_ROOT}/template/`) into the repo.
3. Repoint the identity values above.
4. Wire `.claude/settings.json` → marketplace + enable the plugin (§5).
5. In-container `pnpm install`.
6. Run `codegen:tokens` + `codegen:routes` — **not** `codegen:graphql` (CMS deferred).
7. Verify (§6).

**Designed-out hazards:** because the template _is_ the already-minimal, home-only, pre-stripped Phase-1 snapshot, the original hand-run's ordering hazards (home-only-_before_-`codegen:routes`, strip-gates proving pixi/components didn't sneak in) no longer apply — the template is born clean.

---

## 5. Packaging, wiring, invocation

### Marketplace + plugin structure (added to `bojectify/bojectify`)

```
bojectify/
├── .claude-plugin/marketplace.json     # marketplace "bojectify"; lists the one plugin
├── plugins/platform/                   # plugin "platform"
│   ├── .claude-plugin/plugin.json
│   ├── skills/
│   │   ├── scaffold-project/SKILL.md
│   │   └── update-mds/SKILL.md         # migrated from .claude/skills/
│   └── template/                       # bundled shell (bojectify-site@6619bfd − CMS)
└── .claude/settings.json               # dogfood: this repo enables its own plugin
```

Confirmed against Claude Code docs (plugin-marketplaces, plugins-reference, settings):

- Marketplace manifest at `.claude-plugin/marketplace.json`; one repo can self-host the marketplace _and_ contain other projects.
- Plugin manifest at `plugins/platform/.claude-plugin/plugin.json`; skills as `skills/<name>/SKILL.md`, commands as flat `commands/*.md`.
- A skill reads its bundled assets via the `${CLAUDE_PLUGIN_ROOT}` variable — the mechanism for the `template/`.
- Installed plugins are copied to a cache, so the `template/` **must** live inside the plugin dir (it does) — it cannot reference sibling site repos at runtime.

### Naming

Marketplace **`bojectify`** (aligned with the npm scope `@bojectify`, the GitHub org, and this monorepo), plugin **`platform`**, hosted in `bojectify/bojectify`. (`boject` is the company/brand for the _sites_; `bojectify` is the library/org that hosts the tooling.)

### Wiring the scaffold writes into each new repo (`.claude/settings.json`)

```json
{
  "extraKnownMarketplaces": {
    "bojectify": {
      "source": { "source": "github", "repo": "bojectify/bojectify" }
    }
  },
  "enabledPlugins": { "platform@bojectify": true }
}
```

**Caveat (sets expectations):** this makes the marketplace _known_ and the plugin _enabled-on-trust_ — the scaffolded repo is **one "trust this workspace" prompt away** from having the plugin, not a silent zero-touch install.

### Invocation UX

Install the org plugin **once at user scope** → `/scaffold-project` is then available in any empty dir → it **interactively** collects the inputs (name, brand, locale, ports) → populates the **current** directory from the bundled template → repoints → writes the wiring above → verifies. This resolves the chicken-and-egg: the plugin lives at _user_ scope to run, and the scaffold writes _project_ scope so the new repo declares itself for the team. The scaffolded `.claude/` stays **thin** (wiring + local settings + memory).

---

## 6. Verify & error handling

**Verify (adapted from the manifest's Phase-1 checklist; CMS steps removed):**

1. In-container `pnpm install` succeeds under the workspace's supply-chain `allowBuilds` gating
2. `codegen:tokens` + `codegen:routes` run clean (starter `figma_exports/` present; no `codegen:graphql`)
3. `pnpm typecheck`, `pnpm lint`, `pnpm lint:scss`, `pnpm format:check` — all green
4. `pnpm build` (Next standalone) succeeds — **needs neither Redis nor a CMS** (the payoff of moving `cache-handler.mjs` into the CMS layer)
5. `pnpm test` — runs the minimal unit/script tests present; Storybook/screenshot suites are effectively empty until components exist (don't baseline screenshots at scaffold time)
6. Dev smoke: container boots, `pnpm dev` serves the placeholder home

**Error handling:**

- **Empty-target guard** — refuse to materialize into a non-empty repo (only `.git` tolerated); confirm before any overwrite.
- **Fail-stop-and-report** — run verify in order; on the first failure, halt and surface the failing step + output. Never report success on a failed step.
- **Surface the one manual step** — after scaffolding, instruct the operator to _trust the workspace_ in Claude Code to activate `platform@bojectify`.

---

## 7. Testing the skill itself

A generative skill is "tested" by proving a scaffolded site comes out green. Two mechanisms (YAGNI on anything heavier):

1. **The `boject-sso` run is the first acceptance test** — the first end-to-end run of the assembled skill against the bundled template; building `boject-sso` and passing §6 validates the skill for real. (The template itself is crystallized separately, from `bojectify-site@6619bfd` — §3.)
2. **A template-rot guard in this monorepo's CI** — a job that materializes `plugins/platform/template/` into a temp dir and runs §6 steps 1–4, asserting green. Catches a dependency bump or config drift breaking the shell _before_ it reaches any scaffolded site.

The **bootstrap exit criterion** ties them together: _the `bojectify-site@6619bfd − CMS` template builds green with no Redis and no CMS._

---

## 8. Decisions log

| #   | Decision                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Distribution = model B** (centralized, installable plugin; the scaffold _wires_ the new repo to the marketplace rather than copying skills in). |
| D2  | **Shell source = bundled template (A)**, crystallized once from `bojectify-site@6619bfd − CMS`; the finished skill never touches `boject-pixi`.   |
| D3  | **Additive shell model** — fixed minimal shell + opt-in layers (replaces the issue's subtractive copy-then-strip framing).                        |
| D4  | **Redis/ISR rides with the CMS follow-up**, not the base shell (so the shell builds with no Redis/CMS).                                           |
| D5  | **Names:** marketplace `bojectify`, plugin `platform`, hosted in `bojectify/bojectify`.                                                           |
| D6  | **Required inputs = project name + brand**; everything else defaulted.                                                                            |
| D7  | **Ports parameterised with defaults** (app `3002`, Storybook `6009`); Redis port deferred to the CMS follow-up.                                   |
| D8  | **Scaffold populates the current empty repo** (not a sibling dir), via **interactive prompts**.                                                   |
| D9  | **MVP plugin = `scaffold-project` + `update-mds` + `template`**; the component/token commands migrate in as a tracked fast-follow.                |

---

## 9. Open items / follow-ups

- **O1 — CMS/cache follow-up layer.** Define and build the opt-in CMS layer (Apollo, graphql-codegen, cache-handler/Redis, revalidation), including Redis port deconfliction. Separate spec.
- **O2 — Component/token command migration.** Lift the component/token commands (`scaffold-ui-component`, `build-ui-component`, `new-component`, `update-ui-component`, `get-component-tokens`, `get-semantic-tokens`, `scaffold-svg-component`) from the site repos into `plugins/platform/commands/` (final set confirmed at migration); reconcile/dedup with this monorepo's existing `ui-component` skill. (`scaffold-graphic-component` stays out — pixi-specific.)
- **O3 — `src/model/` namespace collision.** Generic platform model (locales, theme guards) vs. product furniture model share `model/`; resolve when a product layer is added (likely `model/furniture/`). Noted in the `bojectify-site` design doc.
- **O4 — Final manifest validation.** Plugin/marketplace schema is confirmed; validate exact `plugin.json`/`marketplace.json` fields at implementation.
- **O5 — Bootstrap build-green proof.** Confirm the CMS-stripped `next.config.ts` (no `cache-handler`) builds standalone with no Redis — the bootstrap exit criterion.

---

## 10. References

- Issue: [bojectify/bojectify#8](https://github.com/bojectify/bojectify/issues/8)
- First worked example: `bojectify-site@6619bfd`; its docs `docs/specs/2026-06-16-bojectify-site-scaffolding-design.md` and `docs/plans/2026-06-17-bojectify-site-scaffolding.md`
- Platform reference: `boject-pixi`
- Claude Code docs: [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces.md), [Plugins Reference](https://code.claude.com/docs/en/plugins-reference.md), [Settings](https://code.claude.com/docs/en/settings.md)

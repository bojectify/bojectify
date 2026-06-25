# scaffold-project Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `scaffold-project` Claude Code skill — inside a new `platform` plugin published from this monorepo's `bojectify` marketplace — that stands up a new, Boject-branded Next.js site shell from a bundled template, wires it back to the marketplace, and verifies it boots.

**Architecture:** This monorepo becomes a self-hosted Claude Code plugin marketplace. A `platform` plugin bundles three things: the `scaffold-project` skill, the migrated `update-mds` skill, and a `template/` directory holding a minimal Next.js shell (crystallized once from `bojectify-site@6619bfd` with the CMS layer subtracted). The skill is instruction-driven: it materializes `${CLAUDE_PLUGIN_ROOT}/template/` into the current empty repo, repoints a small set of identity values, writes the new repo's plugin-install wiring, and runs a verify checklist. A CI job guards the template against rot.

**Tech Stack:** Claude Code plugins/marketplaces (`.claude-plugin/*.json`, `SKILL.md`, `${CLAUDE_PLUGIN_ROOT}`), Next.js 15 (App Router, standalone), next-intl, Vitest + Playwright + Storybook, SCSS + custom design-token codegen, pnpm 11.5.2, Docker dev container, GitHub Actions.

## Global Constraints

- **Package manager:** `pnpm@11.5.2` only — never `npm`/`npx`; use `pnpx` for one-off binaries. (Repo + template both pin this.)
- **Nx workspace:** project config lives in each `package.json` `"nx"` field — there are **no** `project.json` files. The plugin/marketplace/template are plain files, **not** Nx projects.
- **Branch protection:** `main` is protected. All commits land on a `release/`-style feature branch and merge via PR. Never commit straight to `main`.
- **Commit footer:** end every commit message with `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **No unilateral commits/push:** the user must approve commits/pushes (standing preference). Each task ends with a prepared commit; **do not push** without approval.
- **Names (exact):** marketplace `bojectify`; plugin `platform`; enable key `platform@bojectify`; install source `{ "source": "github", "repo": "bojectify/bojectify" }`.
- **Template source (exact):** `bojectify-site@6619bfd` (Phase-1 commit) with the CMS layer subtracted. Local path: `/Users/ollyharkness/Sites/bojectify-site`.
- **Template build-green criterion (exact):** the bundled `template/` must pass, with **no Redis and no CMS**: in-container `pnpm install` → `codegen:tokens` → `codegen:routes` → `typecheck` → `lint` → `lint:scss` → `format:check` → `build`.
- **CLI uncertainty:** the exact `claude plugin …` subcommand syntax is **not assumed**. Where a step uses it, first run `claude plugin --help` / `claude plugin marketplace --help` and use the verified form. JSON-validity and build gates are the authoritative checks.
- **Spec:** `docs/specs/2026-06-25-scaffold-project-skill-design.md` is the source of truth; this plan implements it.

---

## File Structure

Created/modified in `bojectify/bojectify`:

- `.claude-plugin/marketplace.json` — **create**. Marketplace catalog listing the one `platform` plugin.
- `plugins/platform/.claude-plugin/plugin.json` — **create**. Plugin manifest.
- `plugins/platform/skills/update-mds/SKILL.md` — **create** (git-move from `.claude/skills/update-mds.md`).
- `plugins/platform/skills/scaffold-project/SKILL.md` — **create**. The skill instructions.
- `plugins/platform/template/**` — **create**. The minimal shell (bootstrapped, many files).
- `plugins/platform/scripts/verify-template.sh` — **create**. Template build-green runner (used locally + in CI).
- `.claude/settings.json` — **create/modify**. Dogfood: this repo trusts its own marketplace + enables `platform@bojectify`.
- `.claude/skills/update-mds.md` — **delete** (moved into the plugin).
- `.github/workflows/template-verify.yml` — **create**. CI template-rot guard.

**Task order & dependencies:** Task 1 (skeleton) → Task 2 (template) → Task 3 (skill) and Task 4 (CI guard) both depend on Task 2. Linear execution 1→2→3→4 is safe.

---

### Task 1: Marketplace + plugin skeleton, `update-mds` migration, dogfood wiring

**Files:**

- Create: `.claude-plugin/marketplace.json`
- Create: `plugins/platform/.claude-plugin/plugin.json`
- Create: `plugins/platform/skills/update-mds/SKILL.md` (git-move from `.claude/skills/update-mds.md`)
- Delete: `.claude/skills/update-mds.md`
- Create/Modify: `.claude/settings.json`

**Interfaces:**

- Produces: a loadable marketplace named `bojectify` containing plugin `platform`, whose skills directory resolves; the enable key `platform@bojectify`. Later tasks add `skills/scaffold-project/` and `template/` under `plugins/platform/`.

- [ ] **Step 1: Create a feature branch**

```bash
cd /Users/ollyharkness/Sites/bojectify
git checkout -b feat/scaffold-project-plugin
```

- [ ] **Step 2: Write the marketplace manifest**

Create `.claude-plugin/marketplace.json`:

```json
{
  "name": "bojectify",
  "owner": { "name": "Bojectify", "email": "dev@boject.com" },
  "description": "Internal Claude Code plugins for the Bojectify org",
  "metadata": { "pluginRoot": "./plugins" },
  "plugins": [
    {
      "name": "platform",
      "source": "./platform",
      "description": "Scaffolding and maintenance tooling for Boject sites"
    }
  ]
}
```

- [ ] **Step 3: Write the plugin manifest**

Create `plugins/platform/.claude-plugin/plugin.json`:

```json
{
  "name": "platform",
  "displayName": "Boject Platform Tools",
  "description": "Scaffold new Boject sites and maintain existing ones",
  "author": { "name": "Bojectify" },
  "skills": "./skills/"
}
```

(`version` is intentionally omitted so the plugin is versioned by git commit SHA — per the research, this avoids a manual bump on every change.)

- [ ] **Step 4: Migrate `update-mds` into the plugin**

```bash
mkdir -p plugins/platform/skills/update-mds
git mv .claude/skills/update-mds.md plugins/platform/skills/update-mds/SKILL.md
```

Then open `plugins/platform/skills/update-mds/SKILL.md` and confirm it begins with YAML frontmatter containing `name:` and `description:`. If the moved file has no frontmatter, prepend:

```markdown
---
name: update-mds
description: Update the project's README.md and CLAUDE.md to reflect the current state of the codebase.
---
```

- [ ] **Step 5: Write the dogfood settings**

Create/modify `.claude/settings.json` (merge these keys if the file exists):

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

- [ ] **Step 6: Verify the manifests are valid JSON and well-formed**

Run:

```bash
for f in .claude-plugin/marketplace.json plugins/platform/.claude-plugin/plugin.json .claude/settings.json; do
  echo "== $f =="; node --input-type=module -e "import fs from 'node:fs'; JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log('valid JSON')" "$f" || exit 1
done
test -f plugins/platform/skills/update-mds/SKILL.md && echo "update-mds present"
test ! -f .claude/skills/update-mds.md && echo "old update-mds removed"
```

Expected: three `valid JSON` lines, `update-mds present`, `old update-mds removed`.

- [ ] **Step 7: Verify the plugin loads (manual gate)**

Run `claude plugin marketplace --help` to confirm the add subcommand, then add the local marketplace and confirm `platform` is listed and `update-mds` is available. Example (confirm exact syntax from `--help`):

```bash
claude plugin marketplace add "$(pwd)"
```

Expected: the `bojectify` marketplace registers and lists the `platform` plugin; `/update-mds` resolves in a session for this repo. If the CLI form differs, use the form `--help` shows; do not guess.

- [ ] **Step 8: Stage the commit (do not push)**

```bash
git add .claude-plugin plugins/platform/.claude-plugin plugins/platform/skills/update-mds .claude/settings.json
git rm --cached .claude/skills/update-mds.md 2>/dev/null || true
git status
```

Prepare commit message (await approval before running `git commit`):

```
feat(platform): add bojectify marketplace + platform plugin skeleton

Self-hosted Claude Code marketplace listing the platform plugin; migrate
update-mds into it; dogfood via .claude/settings.json.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 2: Bootstrap the bundled template (`bojectify-site@6619bfd` − CMS)

**Files:**

- Create: `plugins/platform/template/**` (the shell)
- Create: `plugins/platform/scripts/verify-template.sh`

**Interfaces:**

- Consumes: the plugin dir from Task 1.
- Produces: `plugins/platform/template/` — a Next.js shell that passes the build-green criterion with no Redis/CMS. The skill (Task 3) and CI (Task 4) both consume it. Repoint anchors it exposes: `site.config.ts` (`BRAND`, `LOCALES_OBJ`, default, `SEGMENTS`), `package.json` `name`, `src/app/layout.tsx` title, `site-fonts.config.ts`, `.env.example`, `docker-compose.yml`/`.devcontainer/devcontainer.json` ports, `figma_exports/`.

- [ ] **Step 1: Write the build-green runner (the test for this task)**

Create `plugins/platform/scripts/verify-template.sh`:

```bash
#!/usr/bin/env bash
# Materialize the bundled template into a temp dir and prove it builds green
# with no Redis and no CMS. Usage: verify-template.sh [path-to-template]
set -euo pipefail

TEMPLATE_DIR="${1:-$(cd "$(dirname "$0")/.." && pwd)/template}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "Materializing $TEMPLATE_DIR -> $WORK"
cp -R "$TEMPLATE_DIR/." "$WORK/"
cd "$WORK"

# Guard: the CMS layer must be absent from the base template.
for forbidden in cache-handler.mjs codegen.ts src/lib/apolloClient.ts src/lib/graphql; do
  if [ -e "$forbidden" ]; then echo "FAIL: CMS artifact present: $forbidden"; exit 1; fi
done
if grep -RInq -e '@apollo/client' -e 'graphql-codegen' -e 'REDIS_URL' package.json; then
  echo "FAIL: CMS/Redis dependency or env still referenced in package.json"; exit 1
fi

corepack enable
pnpm install --frozen-lockfile=false
pnpm codegen:tokens
pnpm codegen:routes
pnpm typecheck
pnpm lint
pnpm lint:scss
pnpm format:check
pnpm build
echo "TEMPLATE GREEN"
```

```bash
chmod +x plugins/platform/scripts/verify-template.sh
```

- [ ] **Step 2: Run the runner to verify it fails (no template yet)**

Run: `plugins/platform/scripts/verify-template.sh`
Expected: FAIL — the `template/` directory does not exist / `cp` errors. This confirms the gate is wired before the content exists.

- [ ] **Step 3: Copy the shell out of the pinned commit**

Work from a clean checkout of the exact commit so later product work in `bojectify-site` can't leak in:

```bash
SRC="$(mktemp -d)"
git -C /Users/ollyharkness/Sites/bojectify-site worktree add "$SRC" 6619bfd
mkdir -p plugins/platform/template
# Copy the whole Phase-1 tree, excluding VCS/build/local artifacts.
rsync -a --exclude '.git' --exclude 'node_modules' --exclude '.next' \
  --exclude '.pnpm-store' --exclude '.vitest-attachments' --exclude '.env' \
  "$SRC/." plugins/platform/template/
git -C /Users/ollyharkness/Sites/bojectify-site worktree remove "$SRC"
```

At `6619bfd` the product layers (`src/components`, `src/hooks`, `src/utils`, `src/app/api`, `src/transforms`, organisms, blog routes) are already absent — only the CMS subtraction remains.

- [ ] **Step 4: Delete the CMS layer files**

```bash
cd plugins/platform/template
rm -f cache-handler.mjs codegen.ts src/lib/apolloClient.ts src/lib/verifyWebhookSignature.ts
rm -rf src/lib/graphql
# Remove now-empty src/lib if nothing else lives there:
rmdir src/lib 2>/dev/null || true
cd -
```

- [ ] **Step 5: Strip CMS/Redis from `package.json`**

In `plugins/platform/template/package.json`:

- Remove the `"codegen:graphql"` script and any `"codegen:watch"` that calls it.
- Remove the `redis:up` script.
- Remove dependencies: `@apollo/client`, `@apollo/client-integration-nextjs`, `graphql`, every `@graphql-codegen/*`, `dotenv-cli` (only used by `codegen:graphql`), and any redis client (e.g. `ioredis`/`redis`).
- Set `"name"` to a placeholder: `"__PROJECT_NAME__"`.

Then refresh the lockfile against the trimmed manifest:

```bash
cd plugins/platform/template && corepack enable && pnpm install && cd -
```

- [ ] **Step 6: Strip the cache handler from `next.config.ts`**

In `plugins/platform/template/next.config.ts`, remove the Redis cache-handler wiring (keep the next-intl plugin and `output: 'standalone'`). Remove these keys/usages from the config object and any now-unused imports:

```ts
// DELETE:
cacheHandler: path.resolve(process.cwd(), 'cache-handler.mjs'),
cacheMaxMemorySize: 0,
```

If `path`/`execSync` imports become unused after deletion, remove them too. (Confirm the exact surrounding lines against the file.)

- [ ] **Step 7: Strip the Redis service + env from the dev container**

- In `plugins/platform/template/docker-compose.yml`: remove the `redis` service, its volume entry, and the `REDIS_URL=redis://redis:6379` env override on the `dev` service.
- In `plugins/platform/template/.env.example`: remove `CMS_GRAPHQL_URL`, `CMS_API_KEY`, `NEXT_PUBLIC_CMS_URL`, `REDIS_URL`, `REVALIDATION_SECRET`. Keep `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`, `ALLOW_ROBOTS`.

- [ ] **Step 8: Insert repoint placeholders for ports**

In `plugins/platform/template/docker-compose.yml` and `plugins/platform/template/.devcontainer/devcontainer.json`, set the app port to `3002` and Storybook port to `6009` (the next-free defaults), and the container name to `__PROJECT_NAME__ dev`. In `package.json`, set `dev` to `next dev -p 3002` and `storybook` to `storybook dev -p 6009`.

- [ ] **Step 9: Run the build-green runner to verify it passes**

Run: `plugins/platform/scripts/verify-template.sh`
Expected: ends with `TEMPLATE GREEN`. Fix whatever the pipeline reports (a dangling CMS import, a stale path alias, an unused dep) until green — the build is the authoritative manifest check.

- [ ] **Step 10: Stage the commit (do not push)**

```bash
git add plugins/platform/template plugins/platform/scripts/verify-template.sh
git status
```

Commit message (await approval):

```
feat(platform): bundle the minimal site shell template

Crystallize plugins/platform/template from bojectify-site@6619bfd with the
CMS/Redis layer subtracted; add verify-template.sh proving it builds green
with no CMS and no Redis.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 3: The `scaffold-project` skill

**Files:**

- Create: `plugins/platform/skills/scaffold-project/SKILL.md`

**Interfaces:**

- Consumes: `${CLAUDE_PLUGIN_ROOT}/template/` (Task 2); the marketplace/plugin names (Task 1).
- Produces: a `/scaffold-project` skill that, run in an empty repo, yields a green site shell wired to `platform@bojectify`.

- [ ] **Step 1: Write the skill**

Create `plugins/platform/skills/scaffold-project/SKILL.md`:

```markdown
---
name: scaffold-project
description: Stand up a new Boject-branded Next.js site shell in the current empty repo from the bundled template, wire it to the bojectify plugin marketplace, and verify it boots. Use when starting a new Boject site.
---

# Scaffold a new Boject site

You are materializing a minimal Boject site shell into the **current directory**.
The shell lives at `${CLAUDE_PLUGIN_ROOT}/template/`. CMS, rendering frameworks,
and auth are deliberately excluded — they are later, opt-in layers.

## 1. Guard the target

- Confirm the current directory is empty except for an optional `.git`. If anything
  else is present, STOP and ask the user before writing — never overwrite.

## 2. Collect inputs (ask, one at a time)

- **Project name** (required) — kebab-case, e.g. `boject-sso`.
- **Brand** (required) — display string, e.g. `Boject SSO`.
- **Locale(s)** (default: a single `en`/GB). Keep next-intl wired even for one locale.
- **Ports** (default: app `3002`, Storybook `6009`). Known-taken: CMS `6006`/`4000`,
  pixi `3000`/`6007`, site `3001`/`6008` — tell the user, let them adjust.

## 3. Materialize

- Copy the entire contents of `${CLAUDE_PLUGIN_ROOT}/template/` into the current dir.

## 4. Repoint (edit these exact anchors)

- `package.json` → `name` = project name.
- `site.config.ts` → `BRAND`, `LOCALES_OBJ` (+ default), `SEGMENTS` (empty/home-only).
- `src/app/layout.tsx` → page title.
- `site-fonts.config.ts` → fonts (or leave the starter set).
- `.devcontainer/devcontainer.json` → container name = "<project> dev".
- `docker-compose.yml` + `package.json` dev/storybook scripts → chosen ports.
- `figma_exports/` → leave the starter set; the user swaps real brand tokens later.
- Replace any remaining `__PROJECT_NAME__` placeholders.

## 5. Wire the plugin marketplace

Create `.claude/settings.json`:

\`\`\`json
{
"extraKnownMarketplaces": {
"bojectify": { "source": { "source": "github", "repo": "bojectify/bojectify" } }
},
"enabledPlugins": { "platform@bojectify": true }
}
\`\`\`

## 6. Install & codegen (in the dev container)

- `pnpm install`
- `pnpm codegen:tokens`
- `pnpm codegen:routes`
- Do NOT run `codegen:graphql` — there is no CMS.

## 7. Verify (fail-stop — halt and report on the first failure; never claim success on a red step)

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm lint:scss`
4. `pnpm format:check`
5. `pnpm build` (needs neither Redis nor a CMS)
6. Dev smoke: container boots and `pnpm dev` serves the placeholder home.

## 8. Hand off

Tell the user: open the new repo in Claude Code and **trust the workspace** to
activate the `platform@bojectify` plugin (this is a one-time prompt, not automatic).
```

- [ ] **Step 2: Acceptance — scaffold a throwaway and verify green**

In a fresh empty directory, with the `platform` plugin available (from Task 1), invoke `/scaffold-project` with name `scaffold-smoke`, brand `Scaffold Smoke`, defaults otherwise. Expected: the §7 verify checklist passes end-to-end (through `pnpm build`), and `.claude/settings.json` contains `"platform@bojectify": true`. Tear the throwaway down afterward.

- [ ] **Step 3: Stage the commit (do not push)**

```bash
git add plugins/platform/skills/scaffold-project/SKILL.md
git status
```

Commit message (await approval):

```
feat(platform): add the scaffold-project skill

Instruction-driven skill: guard empty target, collect inputs, materialize the
bundled template, repoint identity, wire platform@bojectify, verify green.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 4: CI template-rot guard

**Files:**

- Create: `.github/workflows/template-verify.yml`

**Interfaces:**

- Consumes: `plugins/platform/scripts/verify-template.sh` + `plugins/platform/template/` (Task 2).
- Produces: a PR check that fails if the bundled template stops building green.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/template-verify.yml`:

```yaml
name: template-verify
on:
  pull_request:
    paths:
      - 'plugins/platform/template/**'
      - 'plugins/platform/scripts/verify-template.sh'
      - '.github/workflows/template-verify.yml'
jobs:
  verify-template:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: corepack enable
      - name: Build the bundled template green
        run: plugins/platform/scripts/verify-template.sh
```

- [ ] **Step 2: Verify the workflow runs the guard locally first**

Run: `plugins/platform/scripts/verify-template.sh`
Expected: `TEMPLATE GREEN` (same gate CI will run). If green locally, the workflow is correct by construction (it calls the same script).

- [ ] **Step 3: Lint the workflow YAML**

Run: `node --input-type=module -e "import fs from 'node:fs'; import {execSync} from 'node:child_process'; fs.readFileSync('.github/workflows/template-verify.yml','utf8'); console.log('readable')"`
(Optionally `pnpx yaml-lint .github/workflows/template-verify.yml` if available.)
Expected: no parse error.

- [ ] **Step 4: Stage the commit (do not push)**

```bash
git add .github/workflows/template-verify.yml
git status
```

Commit message (await approval):

```
ci(platform): guard the bundled template against rot

Run verify-template.sh on PRs that touch the template, asserting it still
builds green with no CMS and no Redis.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

## After the plan

The **first real acceptance run is `boject-sso`** (spec §7): once Tasks 1–4 are merged and the plugin is installed at user scope, run `/scaffold-project` to stand up `boject-sso` and confirm the §7 checklist passes. Building `boject-sso` itself (auth/Zitadel, tenancy) is a **separate spec**, not part of this plan.

**Tracked follow-ups (spec §9):** CMS/cache opt-in layer incl. Redis-port deconfliction (O1); migrating the component/token commands into `plugins/platform/commands/` (O2); resolving the `src/model/` namespace collision when a product layer is added (O3).

---

## Self-Review

**Spec coverage:**

- §2 scope (shell only, CMS/rendering/auth out) → Task 2 (template content) + Task 3 §1–§3 (skill excludes them). ✅
- §3 KEEP/DEFER + bootstrap source → Task 2. ✅
- §4 inputs + ordered flow + ports → Task 3 §2–§6. ✅
- §5 marketplace/plugin/wiring/invocation/names → Task 1 + Task 3 §5. ✅
- §6 verify + error handling (empty-target guard, fail-stop, trust prompt) → Task 3 §1, §7, §8. ✅
- §7 testing (acceptance + CI rot guard) → Task 3 §2 (throwaway), Task 4, "After the plan" (boject-sso). ✅
- §8 decisions, §9 open items → honored (D4 Redis-out enforced by verify-template.sh guard; O1–O3 listed as follow-ups). ✅

**Placeholder scan:** No `TBD`/`TODO`/"handle edge cases". `__PROJECT_NAME__` is a deliberate, defined template token (introduced Task 2 Step 5/8, replaced Task 3 Step 1 §4), not a plan placeholder. The CLI step (Task 1 Step 7) is explicitly gated on `--help` rather than a guessed flag, per the Global Constraints.

**Type/name consistency:** marketplace `bojectify`, plugin `platform`, key `platform@bojectify`, source `github:bojectify/bojectify`, port defaults `3002`/`6009`, and the verify pipeline order are identical across the spec, `verify-template.sh`, the workflow, and the skill. ✅

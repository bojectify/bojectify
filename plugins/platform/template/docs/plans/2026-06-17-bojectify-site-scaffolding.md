# Bojectify-site Scaffolding (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `bojectify-site` as a working, deployable Next.js platform shell — copied cleanly from `boject-pixi`'s platform layer, stripped of pixi and **all UI components** — with an empty `app/` (home placeholder only) and empty furniture `model/`, ready for the 3D product build to begin against it.

**Architecture:** Selective copy of `boject-pixi`'s non-component platform layer (i18n routing, Apollo/codegen CMS client, styling + design-token codegen, test harness, dev container, root config) into the new repo. **The entire UI component layer (`src/components/*`) is deferred — not needed yet** — which keeps the shell to routing + CMS + styling plumbing plus a bare root layout. Pixi, hero animation, and CMS-schema-coupled code (molecules, blog routes, article revalidation) are excluded.

**Tech Stack:** Next.js 16, React 19.2.3, TypeScript 5, pnpm 11.5.2, next-intl, Apollo Client + graphql-codegen, SCSS + design-token codegen, Storybook 10 + Vitest, three / @react-three/fiber / @react-three/drei (added, not yet used), Docker dev container (OrbStack).

**Source of truth for the copy:** `boject-pixi` at `/Users/ollyharkness/Sites/boject-pixi` (the canonical platform reference).
**Spec:** `docs/specs/2026-06-16-bojectify-site-scaffolding-design.md`.
**Dev-container design reference:** `/Users/ollyharkness/Sites/boject-cms-internal/docs/superpowers/specs/2026-05-14-dev-container-design.md`.

## Global Constraints

- **Package manager:** `pnpm@11.5.2`, pinned via `packageManager`. Copy `pnpm-workspace.yaml` verbatim (supply-chain `allowBuilds` gating must be preserved).
- **No pixi anywhere.** `@pixi/react`/`pixi.js` removed; no `@components/pixi` / `pixi.js` / `@pixi/react` import remains.
- **No UI components in Phase 1.** Nothing under `src/components/` is copied. The root layout is a bare shell (fonts + theme init + children).
- **Data layer stays three.js-free** (architecture spec). Not built in Phase 1 — `model/` holds only generic platform types.
- **Canvas constraint (for later):** the eventual 3D canvas must be a client component dynamically imported with `{ ssr: false }`. Not built in Phase 1.
- **Brand:** `Bojectify`. **Locale:** single `en` (GB) at launch.
- **Path aliases** (from `tsconfig.json`): `@components/*`, `@constants/*`, `@hooks/*`, `@lib/*`, `@model/*`, `@i18n/*`, `@styles/*`, `@siteConfig`, `@siteFontsConfig`, `@test-config/*`, `@transforms/*`, `@utils/*`. (Several alias targets aren't populated in Phase 1; that's fine — aliases only resolve when imported.)
- **Ports (deconflicted from sibling repos** — boject-cms 4000/6006, boject-pixi 3000/6007): bojectify-site uses **app 3001, Storybook 6008**.
- **All `pnpm`/`pnpx` run inside the dev container** via the host shims (transparent — call `pnpm` normally). Non-pnpm commands (`git`, `docker compose`) run on host.

## Preconditions

1. OrbStack installed and running (`docker version` mentions "orbstack").
2. Host shims installed at `~/.local/bin/{pnpm,pnpx}` with `~/.local/bin` ahead of other pnpm on PATH (one-time per machine; already set up if you run boject-pixi/boject-cms). Verify: `which pnpm` → `~/.local/bin/pnpm`.
3. Working from `bojectify-site` on `main` with the baseline commit (`CLAUDE.md` + specs) present.

## Deviations from the spec (intentional, flagged for review)

- **No UI components in Phase 1.** All of `src/components/*` (svg, atoms, layout, site-chrome, vendor — and molecules/organisms/templates/pixi) is deferred per the product owner. With components gone, `src/hooks` and `src/utils` are deferred too (UI-adjacent, and nothing in the kept shell imports them — verified). This also removes every hero-hook coupling edit (cookie-banner, footer, reveal-after-hero), since those files aren't copied. Generic CMS plumbing (`apolloClient`, `extractCacheTags`, `verifyWebhookSignature`, codegen) and i18n/styling/test infra are still copied.
- **Molecules, blog routes, `app/api/revalidate`, `src/transforms`** are deferred to the CMS content-model phase (CMS-schema-coupled).
- **Ports shifted to 3001/6008** to coexist with sibling dev containers.

## File Structure

| Path                                                                                                                                                                                                                                                                                                           | Action                                | Responsibility                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `package.json`                                                                                                                                                                                                                                                                                                 | create (from boject-pixi, modified)   | Scripts + deps; name `bojectify-site`; pixi removed, r3f added; dev/storybook ports shifted. |
| `pnpm-workspace.yaml`, `tsconfig.json`, `eslint.config.mjs`, `stylelint.config.ts`, `.prettierrc.yml`, `.prettierignore`, `lefthook.yml`, `vitest.config.ts`, `vitest.shims.d.ts`, `next.config.ts`, `next-env.d.ts`, `codegen.ts`, `cache-handler.mjs`, `site-fonts.config.ts`, `.gitignore`, `.dockerignore` | copy verbatim                         | Tooling/config baseline.                                                                     |
| `.devcontainer/devcontainer.json`, `docker-compose.yml`, `Dockerfile.dev`, `Dockerfile`, `scripts/host-shims/*`                                                                                                                                                                                                | copy + tweak                          | Hardened dev container; name + ports adjusted.                                               |
| `.storybook/`, `scripts/generate-routes/`, `scripts/generate-tokens/`, `scripts/patch-codegen-maybe.ts`, `scripts/update-screenshots.sh`, `figma_exports/`                                                                                                                                                     | copy verbatim                         | Storybook config, codegen scripts, token inputs.                                             |
| `src/{@types,i18n,lib,styles,test,constants,model}`, `src/proxy.ts`                                                                                                                                                                                                                                            | copy (with `heroPhase.types` removed) | Non-component platform source.                                                               |
| `site.config.ts`                                                                                                                                                                                                                                                                                               | create (rewrite)                      | Brand `Bojectify`, single `en` locale, empty route segments.                                 |
| `src/app/layout.tsx`                                                                                                                                                                                                                                                                                           | create (bare)                         | Root layout: fonts + theme init + GA/GTM + children. No site chrome / cookie banner.         |
| `src/app/[locale]/layout.tsx`, `src/app/favicon.ico`                                                                                                                                                                                                                                                           | copy verbatim                         | Locale shell + icon.                                                                         |
| `src/app/[locale]/page.tsx`, `src/app/[locale]/page.module.scss`                                                                                                                                                                                                                                               | create                                | Minimal home placeholder.                                                                    |
| `.env`                                                                                                                                                                                                                                                                                                         | create (from `.env.example`)          | Repointed CMS + base URL + port.                                                             |
| `.claude/commands/`, `.claude/skills/update-mds.md`                                                                                                                                                                                                                                                            | copy                                  | Component/token scaffolding commands + skill (for when components are built).                |
| `CLAUDE.md`                                                                                                                                                                                                                                                                                                    | modify                                | Replace greenfield note with real commands + dev-container note.                             |

**Not copied (deferred / strip set):** all of `src/components/`, `src/hooks/`, `src/utils/`, `src/transforms/`, `src/app/api/`, blog routes under `src/app/[locale]/`, `src/model/types/heroPhase.types.ts`, `public/`.

---

## Task 1: Branch

**Files:** none — branch only.

- [ ] **Step 1: Create the feature branch**

```bash
cd /Users/ollyharkness/Sites/bojectify-site
git checkout -b scaffold/phase-1-platform
```

- [ ] **Step 2: Confirm preconditions**

```bash
which pnpm            # expect: /Users/<you>/.local/bin/pnpm
docker version | grep -qi orbstack && echo "OrbStack: OK"
git log --oneline -1  # expect: the baseline commit (CLAUDE.md + specs)
```

Expected: shim path printed, `OrbStack: OK`, baseline commit shown.

---

## Task 2: Dev container + supply-chain environment

**Files:**

- Copy: `.devcontainer/devcontainer.json`, `docker-compose.yml`, `Dockerfile.dev`, `Dockerfile`, `.dockerignore`, `cache-handler.mjs`, `scripts/host-shims/`
- Create: `.env` (from boject-pixi `.env.example`)
- Modify: `.devcontainer/devcontainer.json`, `docker-compose.yml` (name + ports)

- [ ] **Step 1: Copy the dev-container files**

```bash
SRC=/Users/ollyharkness/Sites/boject-pixi
cp -R "$SRC/.devcontainer" .
cp "$SRC/docker-compose.yml" "$SRC/Dockerfile.dev" "$SRC/Dockerfile" "$SRC/.dockerignore" "$SRC/cache-handler.mjs" .
mkdir -p scripts && cp -R "$SRC/scripts/host-shims" scripts/
```

- [ ] **Step 2: Rename the dev container and shift ports in `.devcontainer/devcontainer.json`**

The file should read:

```json
{
  "name": "bojectify-site dev",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "dev",
  "workspaceFolder": "/workspace",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "stylelint.vscode-stylelint"
      ]
    }
  },
  "forwardPorts": [3001, 6008],
  "overrideCommand": false,
  "postCreateCommand": "pnpm install",
  "remoteUser": "node"
}
```

- [ ] **Step 3: Shift ports in `docker-compose.yml`**

In the `dev` service `ports:` block:

```yaml
ports:
  - '127.0.0.1:3001:3001' # next dev / standalone server
  - '127.0.0.1:6008:6008' # Storybook (deconflicted from boject-pixi 6007 / boject-cms 6006)
```

Leave the `redis`, `extra_hosts`, `env_file`, `environment` (incl. `REDIS_URL`, `LEFTHOOK=0`, `GIT_OPTIONAL_LOCKS`), and read-only `.git` volume blocks unchanged.

- [ ] **Step 4: Create `.env` from the example, repointed**

```bash
cp /Users/ollyharkness/Sites/boject-pixi/.env.example .env
```

Then edit `.env`:

- `NEXT_PUBLIC_BASE_URL=http://localhost:3001`
- `CMS_GRAPHQL_URL=` → the bojectify CMS instance GraphQL endpoint (the "different instance"). Leave the placeholder if the instance isn't reachable yet — Task 7 is gated on it.
- `CMS_API_KEY=` → the bojectify CMS API key (or leave placeholder).
- Leave `REDIS_URL=redis://localhost:6379` (compose overrides it to `redis://redis:6379` in-container).

- [ ] **Step 5: Build and start the dev container**

```bash
docker compose build dev
docker compose up -d dev redis
docker compose ps
```

Expected: `dev` and `redis` both `running` (build is ~2-3 min cold).

- [ ] **Step 6: Verify isolation (no host secrets, `.git` hidden)**

```bash
docker compose exec -T dev sh -c '
  test ! -e ~/.ssh && echo "no ~/.ssh: OK"
  test ! -e ~/.aws && echo "no ~/.aws: OK"
  test ! -e ~/.npmrc && echo "no ~/.npmrc: OK"
  test -z "$(ls -A /workspace/.git 2>/dev/null)" && echo ".git hidden: OK"
  ls /workspace/docker-compose.yml >/dev/null && echo "bind mount: OK"
'
```

Expected: five `OK` lines.

- [ ] **Step 7: Commit**

```bash
git add .devcontainer docker-compose.yml Dockerfile.dev Dockerfile .dockerignore cache-handler.mjs scripts/host-shims
git commit -m "chore: add hardened dev container (ports 3001/6008)

Copied from boject-pixi's platform; container renamed and dev/storybook
ports deconflicted from sibling repos. See boject-cms-internal dev-container
design spec for rationale."
```

(`.env` is gitignored — do not commit it.)

---

## Task 3: Root tooling + dependency swap

**Files:**

- Copy: `pnpm-workspace.yaml`, `tsconfig.json`, `eslint.config.mjs`, `stylelint.config.ts`, `.prettierrc.yml`, `.prettierignore`, `lefthook.yml`, `vitest.config.ts`, `vitest.shims.d.ts`, `next.config.ts`, `next-env.d.ts`, `codegen.ts`, `site-fonts.config.ts`, `.gitignore`
- Create: `package.json` (from boject-pixi, modified)

- [ ] **Step 1: Copy the root config files**

```bash
SRC=/Users/ollyharkness/Sites/boject-pixi
cp "$SRC/pnpm-workspace.yaml" "$SRC/tsconfig.json" "$SRC/eslint.config.mjs" \
   "$SRC/stylelint.config.ts" "$SRC/.prettierrc.yml" "$SRC/.prettierignore" \
   "$SRC/lefthook.yml" "$SRC/vitest.config.ts" "$SRC/vitest.shims.d.ts" \
   "$SRC/next.config.ts" "$SRC/next-env.d.ts" "$SRC/codegen.ts" \
   "$SRC/site-fonts.config.ts" "$SRC/.gitignore" .
cp "$SRC/package.json" package.json
```

- [ ] **Step 2: Modify `package.json` — name, ports, dep swap**

- `"name": "boject-pixi"` → `"name": "bojectify-site"`
- `"dev": "next dev"` → `"dev": "next dev -p 3001"`
- `"storybook": "storybook dev -p 6007"` → `"storybook": "storybook dev -p 6008"`
- Delete the two pixi dependency lines:

  ```
  "@pixi/react": "^8.0.5",
  "pixi.js": "^8.15.0",
  ```

- [ ] **Step 3: Install dependencies in the container**

```bash
pnpm install
```

Expected: completes without error. `[ERR_PNPM_IGNORED_BUILDS]` for the `allowBuilds: false` packages is expected (the supply-chain posture), not a failure.

- [ ] **Step 4: Add the react-three-fiber stack**

```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

Expected: resolves current versions compatible with React 19.2.3; updates `package.json` + lockfile.

- [ ] **Step 5: Verify no pixi remains in deps**

```bash
grep -E "pixi" package.json && echo "FAIL: pixi still present" || echo "no pixi in deps: OK"
```

Expected: `no pixi in deps: OK`.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json eslint.config.mjs stylelint.config.ts .prettierrc.yml .prettierignore lefthook.yml vitest.config.ts vitest.shims.d.ts next.config.ts next-env.d.ts codegen.ts site-fonts.config.ts .gitignore
git commit -m "chore: root tooling + dependency baseline

Copy boject-pixi config; rename to bojectify-site; drop pixi, add
three/@react-three/fiber/@react-three/drei; shift dev/storybook ports."
```

---

## Task 4: Copy the non-component platform source

**Files:** Copy the kept `src/` subtrees + `.storybook/`, codegen scripts, `figma_exports/`. No `src/components`, `src/hooks`, or `src/utils`.

- [ ] **Step 1: Copy the kept platform subtrees**

```bash
SRC=/Users/ollyharkness/Sites/boject-pixi
mkdir -p src
cp -R "$SRC/src/@types" "$SRC/src/i18n" "$SRC/src/lib" "$SRC/src/styles" \
      "$SRC/src/test" "$SRC/src/constants" "$SRC/src/model" src/
cp "$SRC/src/proxy.ts" src/
cp -R "$SRC/.storybook" .
cp -R "$SRC/scripts/generate-routes" "$SRC/scripts/generate-tokens" scripts/
cp "$SRC/scripts/patch-codegen-maybe.ts" "$SRC/scripts/update-screenshots.sh" scripts/
cp -R "$SRC/figma_exports" .
```

- [ ] **Step 2: Remove the stripped (pixi-era) model type**

```bash
rm -f src/model/types/heroPhase.types.ts
```

- [ ] **Step 3: Verify the component/hook/util/pixi layers are absent and unreferenced**

```bash
echo "--- these must be ABSENT ---"
for p in src/components src/hooks src/utils src/transforms src/model/types/heroPhase.types.ts ; do
  test -e "$p" && echo "FAIL present: $p" || echo "absent OK: $p"
done
echo "--- no kept file may import a component / hook / util ---"
grep -rEl "@components/|@hooks/|@utils/|@pixi/react|from 'pixi" src 2>/dev/null \
  | grep -v "src/app/" \
  && echo "FAIL: stray import above" || echo "no stray component/hook/util/pixi imports: OK"
```

Expected: all `absent OK:` lines and `no stray component/hook/util/pixi imports: OK`. (The `src/app/` exclusion is because the root layout, written in Task 5, legitimately imports `@constants`/`@siteFontsConfig` — not components.)

- [ ] **Step 4: Commit**

```bash
git add src .storybook scripts figma_exports
git commit -m "chore: copy non-component platform source

i18n routing, Apollo/codegen CMS client, styles + design tokens, test
harness, constants, model (platform types). Components, hooks, utils,
pixi, blog routes, and transforms excluded."
```

---

## Task 5: Configure site + build the bare app shell

**Files:**

- Create: `site.config.ts`, `src/app/layout.tsx`, `src/app/[locale]/page.tsx`, `src/app/[locale]/page.module.scss`
- Copy: `src/app/[locale]/layout.tsx`, `src/app/favicon.ico`

- [ ] **Step 1: Write `site.config.ts` (brand Bojectify, single `en` locale, empty segments)**

```ts
import { LocalesObj } from '@model/types/locales.types';
import { Pathnames } from 'next-intl/routing';
import {
  ROUTES,
  type RoutePattern,
} from '@constants/__generated__/routes.generated';
import { composePathnames, type SegmentTranslations } from '@i18n/pathnames';

const BRAND = 'Bojectify';

const LOCALES_OBJ = [
  {
    ROUTE: 'en',
    TERRITORY: 'GB',
    LABEL: 'English',
  },
] as const satisfies LocalesObj[];

const DEFAULT_LOCALE_ROUTE = LOCALES_OBJ[0].ROUTE;

type Locale = (typeof LOCALES_OBJ)[number]['ROUTE'];

// No translatable static route segments yet (home-only app). Add entries as
// CMS-driven routes land; a missing translation surfaces as a type error here.
const SEGMENTS = {} satisfies SegmentTranslations<RoutePattern, Locale>;

const LOCALES = LOCALES_OBJ.map(({ ROUTE }) => ROUTE);

const PATHNAMES = composePathnames(ROUTES, LOCALES, SEGMENTS);

type SiteConfig = {
  BRAND: string;
  LOCALISATION: {
    DEFAULT_LOCALE_ROUTE: string;
    LOCALES_OBJ: typeof LOCALES_OBJ;
  };
  NAVIGATION: {
    PATHNAMES: Pathnames<(typeof LOCALES_OBJ)[number]['ROUTE'][]>;
  };
};

export const SITE_CONFIG = {
  BRAND,
  LOCALISATION: {
    DEFAULT_LOCALE_ROUTE,
    LOCALES_OBJ,
  },
  NAVIGATION: {
    PATHNAMES,
  },
} satisfies SiteConfig;
```

- [ ] **Step 2: Copy the locale layout + favicon**

```bash
SRC=/Users/ollyharkness/Sites/boject-pixi
mkdir -p "src/app/[locale]"
cp "$SRC/src/app/[locale]/layout.tsx" "src/app/[locale]/layout.tsx"
cp "$SRC/src/app/favicon.ico" src/app/favicon.ico
```

- [ ] **Step 3: Write the bare root layout `src/app/layout.tsx`**

(No `SiteHeader`/`SiteFooter`/`CookieBanner` — those are components, deferred. Keeps fonts, the theme-init script, and env-gated GA/GTM.)

```tsx
import type { Metadata } from 'next';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { THEME_INIT_SCRIPT } from '@constants/themeScript';
import '../styles/globals.scss';
import { BODY_FONT, HEADING_FONT, MONO_FONT } from '@siteFontsConfig';

export const metadata: Metadata = {
  title: 'Bojectify',
  description: 'Fitted-furniture builder.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body
        className={`${HEADING_FONT.variable} ${BODY_FONT.variable} ${MONO_FONT.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Write the minimal home page `src/app/[locale]/page.tsx`**

```tsx
import styles from './page.module.scss';

export default function Home() {
  return (
    <section className={styles.content}>
      <h1>Bojectify</h1>
      <p>
        Fitted-furniture builder — platform shell. The 3D canvas will mount
        here.
      </p>
    </section>
  );
}
```

- [ ] **Step 5: Write `src/app/[locale]/page.module.scss`**

```scss
.content {
  padding: 2rem;
}
```

- [ ] **Step 6: Regenerate routes and tokens**

```bash
pnpm codegen:routes
pnpm codegen:tokens
```

Expected: `src/constants/__generated__/routes.generated.ts` now exports `ROUTES = ['/'] as const`. Token SCSS + `breakpoints.generated.ts` regenerate from `figma_exports/`.

- [ ] **Step 7: Verify the routes output is home-only**

```bash
grep -A3 "export const ROUTES" src/constants/__generated__/routes.generated.ts
```

Expected: the array contains only `'/'`. This is what makes `SEGMENTS = {}` typecheck.

- [ ] **Step 8: Typecheck + lint**

```bash
pnpm typecheck
pnpm lint
pnpm lint:scss
```

Expected: all three pass. (If `typecheck` flags `SEGMENTS`, re-run Step 6 — `routes.generated.ts` must be `['/']` before `site.config.ts` typechecks.)

- [ ] **Step 9: Commit**

```bash
git add site.config.ts src/app src/constants/__generated__ src/styles/__generated__
git commit -m "feat: site config + bare app shell

Brand Bojectify + single en locale; bare root layout (no chrome/cookie
banner — components deferred); minimal home placeholder. Routes/tokens
regenerated for the home-only app."
```

---

## Task 6: Build, dev smoke, unit tests

**Files:** none — verification.

- [ ] **Step 1: Production build**

```bash
pnpm build
```

Expected: `next build` completes, emits `.next/standalone`. No type or build errors.

- [ ] **Step 2: Start the dev server**

```bash
pnpm dev &
sleep 8
```

Expected: logs `Local: http://localhost:3001`.

- [ ] **Step 3: Verify the home page responds**

```bash
curl -sI http://localhost:3001/en | head -1
```

Expected: `HTTP/1.1 200 OK` (the `/en` prefix is `localePrefix: 'always'`). Then stop the dev server:

```bash
kill %1 2>/dev/null || true
```

- [ ] **Step 4: Run unit tests**

```bash
pnpm test:unit
```

Expected: passes — the kept `lib` tests (`verifyWebhookSignature.test.ts`, `extractCacheTags.test.ts`) run. (If Vitest errors with "No test files found", add `--passWithNoTests`; the `storybook`/`screenshots` projects are not Phase-1 gates.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify build + dev + unit tests green" --allow-empty
```

---

## Task 7: GraphQL codegen against the bojectify CMS instance (gated)

**Files:** `src/lib/graphql/__generated__/` (regenerated) — gated on CMS reachability.

- [ ] **Step 1: Check CMS reachability**

```bash
test -n "$(grep '^CMS_GRAPHQL_URL=' .env | cut -d= -f2-)" && \
  curl -s -o /dev/null -w "%{http_code}" "$(grep '^CMS_GRAPHQL_URL=' .env | cut -d= -f2-)" || echo "no CMS URL set"
```

- [ ] **Step 2a: If the CMS instance is reachable — regenerate**

```bash
pnpm codegen:graphql
pnpm typecheck
```

Expected: `src/lib/graphql/__generated__/` regenerates against the bojectify CMS schema; typecheck stays green (no `.graphql` documents are copied in Phase 1, so this produces the base SDK + types).

- [ ] **Step 2b: If the CMS instance is NOT reachable yet — defer**

Keep the copied `src/lib/graphql/__generated__/` (boject-pixi's base SDK) as a working stand-in so the Apollo client typechecks. Record the deferral:

```bash
echo "TODO: run 'pnpm codegen:graphql' once the bojectify CMS instance is reachable (set CMS_GRAPHQL_URL/CMS_API_KEY in .env)." >> docs/plans/2026-06-17-bojectify-site-scaffolding.md
```

- [ ] **Step 3: Commit (only if regenerated)**

```bash
git add src/lib/graphql/__generated__ && git commit -m "chore: codegen GraphQL types against bojectify CMS instance"
```

---

## Task 8: Carry the Claude scaffolding commands + skill

**Files:**

- Copy: `.claude/commands/`, `.claude/skills/update-mds.md`

These component/token scaffolding commands are tooling for _building_ components later — useful to have in place even though no components are copied in Phase 1.

- [ ] **Step 1: Copy the commands and skill**

```bash
mkdir -p .claude/skills
cp -R /Users/ollyharkness/Sites/boject-pixi/.claude/commands .claude/
cp /Users/ollyharkness/Sites/bojectify/.claude/skills/update-mds.md .claude/skills/update-mds.md
```

- [ ] **Step 2: Scan the copied commands for pixi references**

```bash
grep -rEln "pixi" .claude/commands && echo "REVIEW: pixi reference(s) above — edit or remove" || echo "commands clean of pixi: OK"
```

Expected: `commands clean of pixi: OK`. If any reference appears, edit it to be pixi-neutral.

- [ ] **Step 3: Commit**

```bash
git add .claude/commands .claude/skills
git commit -m "chore: carry Claude component/token scaffolding commands + update-mds skill"
```

---

## Task 9: Update CLAUDE.md and finalise

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the "Current state" greenfield section**

In `CLAUDE.md`, replace the "## Current state" paragraph with:

```markdown
## Current state

Scaffolded from boject-pixi's platform layer (Next.js 16 / React 19, next-intl,
Apollo + graphql-codegen, SCSS + design-token codegen, Storybook + Vitest). No
UI components yet — `src/components` is intentionally empty; the root layout is a
bare shell. The 3D product (canvas + furniture data model) is not yet built —
`app/` is a home placeholder and `src/model/` holds only generic platform types.

## Commands

All `pnpm`/`pnpx` run inside the dev container via host shims at
`scripts/host-shims/` (supply-chain hardening — see the dev-container design in
boject-cms-internal). Call `pnpm` normally; routing is transparent.

- `pnpm dev` — Next dev server on http://localhost:3001
- `pnpm build` — production (standalone) build
- `pnpm typecheck` / `pnpm lint` / `pnpm lint:scss` — static checks
- `pnpm test:unit` — unit tests (Vitest)
- `pnpm storybook` — Storybook on http://localhost:6008
- `pnpm codegen:graphql` / `pnpm codegen:routes` / `pnpm codegen:tokens` — codegen

Ports are deconflicted from sibling repos (boject-pixi 3000/6007, boject-cms
4000/6006): bojectify-site uses 3001/6008.
```

Leave the Product / Planned stack / Architecture / Build phasing sections intact.

- [ ] **Step 2: Verify formatting**

```bash
pnpm format:check || pnpm format
```

Expected: clean, or auto-formatted with no semantic change.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with real commands + dev-container note"
```

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin scaffold/phase-1-platform
gh pr create --title "Scaffold bojectify-site platform shell (Phase 1)" --body "$(cat <<'EOF'
## Summary

Scaffolds bojectify-site from boject-pixi's non-component platform layer:
hardened dev container, i18n routing, Apollo/codegen CMS client, styling +
design tokens, test harness. No UI components yet (deferred); bare root
layout. Pixi removed; r3f deps added (not yet used). Empty `app/` (home
placeholder) and empty furniture `model/`.

## Scope notes
- All `src/components`, `src/hooks`, `src/utils` deferred (not needed yet).
- CMS-schema-coupled code (molecules, blog routes, article revalidation) deferred.
- Ports deconflicted to 3001/6008.
- GraphQL codegen against the new CMS instance gated on reachability (Task 7).

## Verification
- [x] Dev container boots; host secrets + `.git` hidden
- [x] `pnpm install` + r3f deps resolve
- [x] `pnpm typecheck` / `lint` / `lint:scss` green
- [x] `pnpm build` succeeds; `pnpm dev` serves /en (200)
- [x] `pnpm test:unit` green

Spec: `docs/specs/2026-06-16-bojectify-site-scaffolding-design.md`
Plan: `docs/plans/2026-06-17-bojectify-site-scaffolding.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: `gh` prints the PR URL.

---

## Phase 2 (deferred — separate plan)

Per the spec, the `scaffold-project` skill is crystallised _from_ this Phase 1 run and shipped as a Claude Code plugin in the `bojectify` monorepo. It gets its own spec→plan once Phase 1 lands. Capture decisions/deviations from executing this plan (including the "no components" scope and the component/hook/util copy you'll want _parameterised_ in the skill) — they become the skill's manifest.

## Notes for the executing engineer

- **Copy faithfully, then verify.** The grep/find gates in Tasks 4-5 prove the deferred layers didn't sneak in. If one fails, fix before moving on.
- **Order matters in Task 5:** the app must be home-only _before_ `pnpm codegen:routes`, or `ROUTES` includes blog segments and `site.config.ts`'s empty `SEGMENTS` won't typecheck.
- **Don't copy `src/components`, `src/hooks`, `src/utils`, molecules/organisms/templates, blog routes, `src/app/api`, or `src/transforms`** — all deferred. If typecheck demands one, stop and reconsider scope rather than dragging UI/schema code in.
- **`.env` is gitignored** — never commit CMS keys.
- **Screenshot baselines** (`pnpm test:screenshots`) are site-specific; regenerate with `pnpm test:screenshots:update` when real UI exists, not at scaffold time.

```

```

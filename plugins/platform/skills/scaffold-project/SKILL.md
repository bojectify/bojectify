---
name: scaffold-project
description: Stand up a new Boject-branded Next.js site shell in the current empty repo from the bundled template — rebrand it, wire it to the bojectify plugin marketplace, and verify it builds. Use when starting a new Boject site.
---

# Scaffold a new Boject site

Materialize a minimal Boject site shell into the **current directory** from the
bundled template at `${CLAUDE_PLUGIN_ROOT}/template/`. CMS, rendering frameworks,
and auth are deliberately excluded — they are later, opt-in layers.

## 1. Guard the target

- The current directory must be empty except for an optional `.git`. If anything
  else is present, STOP and ask the user before writing — never overwrite.

## 2. Collect inputs (ask one at a time)

- **Project name** (required) — kebab-case, e.g. `boject-sso`. Becomes the
  `package.json` name and dev-container name.
- **Brand** (required) — e.g. `Boject SSO`. This is BOTH the UI display name AND
  the design-token brand (see §4) — they are intentionally the same.
- **Locale(s)** (default: a single `en`/GB). Keep next-intl wired even for one
  locale — collapsing is cheap, retrofitting it later is not.
- **Ports** (default: app `3002`, Storybook `6009`). Known-taken across sibling
  sites: CMS `6006`/`4000`, pixi `3000`/`6007`, site `3001`/`6008`. State these
  and let the user adjust.

## 3. Materialize

- Copy the entire contents of `${CLAUDE_PLUGIN_ROOT}/template/` into the current
  directory.

## 4. Repoint

- `package.json` → replace the `__PROJECT_NAME__` placeholder (the `name` field)
  with the project name.
- `.devcontainer/devcontainer.json` → replace `__PROJECT_NAME__` (the container
  display name).
- `docker-compose.yml`, `.devcontainer/devcontainer.json`, and the `dev` /
  `storybook` scripts in `package.json` → set the chosen ports (defaults
  `3002` / `6009`).
- `site.config.ts` → set `BRAND` to the brand; set `LOCALES_OBJ` (+ default
  locale); keep `SEGMENTS` empty (home-only).
- **Rebrand the design tokens.** `BRAND` is the design-token selector: the token
  generator reads each token file's `"com.figma.modeName"` and strips the `BRAND`
  prefix. The template ships with the `Boject` starter set, so rebrand it to the
  new brand in **every** `figma_exports/**/*.tokens.json`:
  - Rewrite the `"com.figma.modeName"` values, replacing the leading `Boject`
    with the new brand: `"Boject Light"` → `"<Brand> Light"`, `"Boject Dark"` →
    `"<Brand> Dark"`, `"Boject"` → `"<Brand>"`.
  - Rename the matching files likewise (`Boject Light.tokens.json` →
    `<Brand> Light.tokens.json`, etc.) — cosmetic but keeps them tidy.
  - Leave the `AnotherBrand` example files untouched (they demonstrate
    multi-brand support and are skipped during generation).
  - The token VALUES stay Boject's starter values — the owner swaps the real
    design system (and re-exports) later.
- `src/app/layout.tsx` and `src/app/[locale]/page.tsx` read `SITE_CONFIG.BRAND`,
  so they need no direct edit — they follow the brand automatically.

## 5. Wire the plugin marketplace

Create `.claude/settings.json`:

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

## 6. Install & codegen (in the dev container)

- `pnpm install`
- `pnpm codegen:tokens` — regenerates the SCSS design tokens for the new brand
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
activate the `platform@bojectify` plugin (a one-time prompt — it is not silent).
Then replace the placeholder home page and, when ready, the starter design
tokens in `figma_exports/`.

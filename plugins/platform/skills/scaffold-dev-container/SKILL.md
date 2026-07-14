---
name: scaffold-dev-container
description: Interactively assemble a Boject house-style Docker dev container (devcontainer.json + docker-compose + Dockerfile.dev + host-shims) into the current repo — new or existing. Walks through ports and sidecar services (redis/postgres/meilisearch), Playwright, and a prod build profile, then verifies it boots. Use when adding a dev container to a Boject project.
---

# Scaffold a dev container

Assemble a house-style Docker dev-container harness — `.devcontainer/devcontainer.json`,
`docker-compose.yml`, `Dockerfile.dev`, `scripts/host-shims/{pnpm,pnpx}`,
`.dockerignore`, `.env.example` — into the **current repo**, new or existing,
from the reference snippets in `blocks/`. Networking is always a single
`internal` bridge network with service-DNS (`redis:6379`, `db:5432`,
`meilisearch:7700`) — never a question, never `network_mode: service:db`.

## 1. Guard the target

If `.devcontainer/`, `docker-compose.yml`, `Dockerfile.dev`, or
`scripts/host-shims/` already exist in the target repo, STOP: show what is
present and ask before writing anything. Never clobber.

## 2. Detect (adopt mode)

If a `package.json` exists, read it for interview defaults:

- `name` → project name (item 1).
- A `dev -p <port>` script → app port (item 2).
- A `storybook -p <port>` script → Storybook port (item 3).
- `packageManager` → the pnpm version to inherit (§4).

Sniff the repo for CSS/SCSS, Tailwind, Prisma, and Nuxt to seed the VS Code
extension choices (item 7).

If there is no `package.json`, this is a new project: the directory may be
empty except an optional `.git`. Still write the full harness, and pin
`packageManager` per §4 (fetch-latest path).

## 3. Interview (one question at a time)

| #   | Prompt                              | Default / smart-detect                                                                                                                                                                                                                                                                      |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Project name**                    | Existing `package.json` `name`, else the directory name. → container display name (`"<name> dev"`).                                                                                                                                                                                         |
| 2   | **App dev port**                    | Next free app port in the registry below, suggested; user may override. Answering **"none"** (a headless infra/CDK/library project — the bare shape) drops the dev service's `ports`, `networks`, `extra_hosts`, and `env_file` sections entirely — see `examples/bare/docker-compose.yml`. |
| 3   | **Storybook? + port**               | Present only if a `storybook` script is detected; port = next free Storybook port. Skipped entirely if no Storybook.                                                                                                                                                                        |
| 4   | **Sidecar services** (multi-select) | none · **redis** · **postgres** · **meilisearch**. Drives `depends_on`, env, volumes, and the footer.                                                                                                                                                                                       |
| 5   | **Browser / Playwright testing?**   | Yes if Storybook or a Playwright/browser test tool is detected, else No. Adds the Dockerfile playwright fragment + `playwright-cache` volume.                                                                                                                                               |
| 6   | **Prod `app` image profile?**       | Yes for app projects, No for infra/libs (the bare shape).                                                                                                                                                                                                                                   |
| 7   | **VS Code extensions**              | `dbaeumer.vscode-eslint` + `esbenp.prettier-vscode` always; offer `stylelint.vscode-stylelint` (default on if CSS/SCSS present), plus `bradlc.vscode-tailwindcss`, `prisma.prisma`, `nuxtr.nuxt-vscode-extentions` per detected stack.                                                      |

### Port registry (known-taken across the family)

| Repo                  | App  | Storybook | Sidecar host ports                                                            |
| --------------------- | ---- | --------- | ----------------------------------------------------------------------------- |
| `boject-cms`          | 4000 | 6006      | 5432 (pg), 7700 (meili), 6379 (redis), 5050 (prisma studio), 24678 (vite hmr) |
| `boject-pixi`         | 3000 | 6007      | 6380 (redis)                                                                  |
| `bojectify-site`      | 3001 | 6008      | 6381 (redis)                                                                  |
| template / site-shell | 3002 | 6009      | —                                                                             |

Next-free at time of writing: **app `3003`**, **Storybook `6010`**, **redis
host `6382`**, **postgres host `5433`**, **meilisearch host `7701`**. Sidecar
_container_ ports never change (6379 / 5432 / 7700) — only the host-published
port is deconflicted so multiple family stacks can run at once.

Cross-check every chosen port against this registry **and** a grep of the
current repo for port literals before suggesting; on any collision, warn and
re-suggest.

## 4. Resolve pnpm

- **Adopt mode:** reuse the target repo's existing `package.json`
  `packageManager` version.
- **New project:** fetch the current latest from
  `https://registry.npmjs.org/pnpm/latest` and pin that value.
- **Unreachable + nothing to inherit:** STOP and ask the user for a version —
  never guess.

Pin the resolved value in lockstep in two places: `Dockerfile.dev`'s
`ARG PNPM_VERSION` and `package.json`'s `packageManager` field (creating or
patching it).

## 5. Assemble

Read `blocks/` and write the three generated files. Each block's header
comment documents exactly what to merge where — follow it literally.

- **`docker-compose.yml`** — start from `blocks/compose/dev-service.yml` (the
  always-present `dev` service). If item 2 was "none", drop `ports`,
  `networks`, `extra_hosts`, and `env_file` from it (`examples/bare/`).
  For each sidecar chosen in item 4, add its service block
  (`blocks/compose/{redis,postgres,meilisearch}.yml`), merge its documented
  `dev`-service additions (one `environment` key + one `depends_on` entry),
  and add its footer volume key. `examples/web/docker-compose.yml` shows one
  sidecar (redis) fully merged; `examples/data/docker-compose.yml` shows all
  three. When item 5 (Playwright) is Yes, add the `playwright-cache` volume
  mount to `dev` and its footer key. When item 6 (prod profile) is Yes, add
  `blocks/compose/app-prod.yml`'s `app` service (`profiles: [prod]`) — see
  `examples/web/docker-compose.yml`. Finish with `blocks/compose/footer.yml`:
  `volumes:` always lists `pnpm-store` plus one key per block actually used;
  `networks:` declares `internal` whenever any sidecar or published port
  exists, and is dropped entirely for the bare/"none"-port shape.
- **`Dockerfile.dev`** — start from `blocks/dockerfile/base.Dockerfile.dev`
  (the corrected `ENV PNPM_CONFIG_STORE_DIR=/pnpm-store` base — never the
  template's `PNPM_STORE_PATH`, which pnpm silently ignores). When item 5 is
  Yes, insert `blocks/dockerfile/playwright.fragment` before `USER node` —
  see `examples/web/Dockerfile.dev`.
- **`.devcontainer/devcontainer.json`** — start from
  `blocks/devcontainer/devcontainer.json`. Assemble `forwardPorts` from the
  app + Storybook ports (omit the key entirely if item 2 was "none" — see
  `examples/bare/.devcontainer/devcontainer.json`) and `extensions` from
  item 7.

## 6. Copy invariants

- Copy the host-shims **from the template**, never regenerate or hand-edit
  them — they are the single source of truth shared by every sibling repo:
  `cp ${CLAUDE_PLUGIN_ROOT}/template/scripts/host-shims/{pnpm,pnpx}` into
  `scripts/host-shims/` in the target repo, then `chmod +x` both.
- Write `.dockerignore` from `blocks/dockerignore.base` verbatim.
- Write `.env.example` from `blocks/env.example.base`, uncommenting the
  service-URL lines (`REDIS_URL` / `DATABASE_URL` / `MEILI_URL`) matching the
  sidecars chosen in item 4.

## 7. Verify (fail-stop — halt and report on the first red step; never claim success on a red step)

1. `docker compose config` parses with no error.
2. `docker compose up -d dev` starts the dev service.
3. `docker compose exec -T dev pnpm install` completes.
4. `docker compose exec -T dev sh -c 'node -v && pnpm -v'` — pnpm matches the
   pinned version from §4.
5. For each sidecar chosen: confirm it is healthy/reachable — redis via
   `redis-cli ping`, postgres via `pg_isready`, meilisearch via its `/health`
   endpoint.

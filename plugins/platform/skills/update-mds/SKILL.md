---
name: update-mds
description: Update the project's README.md and CLAUDE.md to reflect the current state of the codebase.
---

Update the project's `README.md`, `CLAUDE.md`, and all package `README.md` files to reflect the current state of the codebase.

## Steps

1. **Explore the codebase** — Read key files to understand the current project structure, dependencies, scripts, architecture, and conventions:
   - Root `package.json` (scripts, dependencies, package manager)
   - Config files (tsconfig, eslint, prettier, build config, nx.json, etc.)
   - Source directory structure
   - Each package's `package.json`, source files, and types
   - All existing `README.md` and `CLAUDE.md` files

2. **Update `CLAUDE.md`** — This file provides guidance to Claude Code. It should accurately document:
   - Available commands (dev, build, lint, test, format, typecheck, etc.)
   - Package manager and any workspace flags
   - Git hooks and CI checks
   - Architecture overview (framework, rendering strategy, key patterns)
   - Path aliases
   - Component/module conventions and directory structure
   - Styling approach
   - Formatting rules
   - Testing setup
   - Any other conventions or patterns that would help an AI assistant work effectively

   Keep it concise and factual. Remove anything that no longer applies. Add anything new that is missing. Do not invent conventions — only document what actually exists in the code.

3. **Update root `README.md`** — This file is for human developers. It should include:
   - Project name and brief description
   - Prerequisites (Node version, package manager)
   - Getting started / installation steps
   - Available scripts
   - Project structure overview
   - Tech stack summary
   - Any other useful context for onboarding

   Keep it practical and scannable. Match the tone of the existing README if one exists.

4. **Update each package `README.md`** — For every package under `packages/`, update its README to accurately reflect the current source code. For each package:
   - Read the component source files and type definitions
   - Compare the README's documented props/API against the actual TypeScript types
   - Compare the README's usage examples against the actual component behaviour
   - Update the props table to match the current type definitions exactly (types, defaults, descriptions)
   - Update usage examples if the API has changed
   - Update the CSS custom properties section if custom properties have changed
   - Update requirements (peer dependencies) to match `package.json`
   - Preserve the existing structure and tone of each README
   - Keep status badges at the top untouched unless they are broken

   **Critical:** The props table is the most likely section to drift. Always regenerate it from the TypeScript types, not from what the README currently says.

5. **Verify** — Run `pnpm nx format:check` to ensure all files pass formatting rules. If they fail, run `pnpm nx format:write` and verify again.

## Rules

- Do NOT add speculative or aspirational content — only document what currently exists
- Do NOT remove user-written prose sections (e.g. project description, contributing guidelines) unless they are factually wrong
- Do NOT add emojis unless the existing files already use them
- If a file does not exist yet, create it
- If a file exists, update it in place — preserve its overall structure where possible
- Always derive props tables from TypeScript source types, not from the existing README
- Do not document internal/unexported types — only document the public API

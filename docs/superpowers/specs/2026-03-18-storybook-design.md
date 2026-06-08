# Storybook Setup Design

## Overview

Add Storybook to the `@bojectify/react-carousel` and `@bojectify/react-reveal` component packages for visual development and testing. Use the Nx Storybook generator to scaffold configuration, ensuring correct version alignment with the Nx workspace.

## Approach

Use `@nx/storybook` plugin's `configuration` generator to add Storybook directly to each component package (not a separate app). Stories are co-located with components. Decline Cypress e2e — Storybook 10's built-in Playwright component testing is the preferred direction for future test coverage.

## Packages Affected

- `@bojectify/react-carousel` — gets `.storybook/` config + `Carousel.stories.tsx`
- `@bojectify/react-reveal` — gets `.storybook/` config + `Reveal.stories.tsx`

Store packages (`react-store`, `react-store-async`) do not get Storybook — they have no visual output.

## Setup

1. Install `@nx/storybook` plugin (`pnpm add -D @nx/storybook`)
2. Run `pnpm nx g @nx/storybook:configuration react-carousel` with Vite builder, decline Cypress
3. Run `pnpm nx g @nx/storybook:configuration react-reveal` with Vite builder, decline Cypress
4. The generator handles Storybook version selection, `.storybook/main.ts`, `.storybook/preview.ts`, and Nx target wiring

## Stories

### Carousel.stories.tsx

Located at `packages/react-carousel/src/Carousel.stories.tsx`.

Stories to include:

- **Default** — 3 slides with placeholder content
- **Many Slides** — 6+ slides to demonstrate scrolling
- **Custom Aria Label** — with `aria-label="Image gallery"`
- **Custom Slide Width** — override `--bojectify-carousel-slide-width` via CSS to show partial slides (e.g. 80%)
- **Custom Gap** — override `--bojectify-carousel-gap`

### Reveal.stories.tsx

Located at `packages/react-reveal/src/Reveal.stories.tsx`.

Stories to include:

- **Default** — fade + slide up (default props)
- **Directions** — up, down, left, right variants
- **Fade Only** — `distance="0"` (no slide, just opacity)
- **Slide Only** — `fadeIn={false}` (no opacity, just translate)
- **Custom Duration** — slow animation (`duration={2000}`)
- **Custom Delay** — delayed start (`delay={500}`)
- **Custom Element** — `as="section"` to demonstrate polymorphism

## Running

```bash
pnpm nx storybook react-carousel
pnpm nx storybook react-reveal
```

## Future

Storybook 10 ships with Playwright component testing. This can be added later for visual regression testing without needing a separate Cypress/Playwright project.

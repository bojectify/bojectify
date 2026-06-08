# @bojectify/react-reveal

[![CI](https://github.com/bojectify/bojectify/actions/workflows/ci.yml/badge.svg)](https://github.com/bojectify/bojectify/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bojectify/react-reveal)](https://www.npmjs.com/package/@bojectify/react-reveal)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@bojectify/react-reveal)](https://bundlephobia.com/package/@bojectify/react-reveal)
[![License](https://img.shields.io/npm/l/@bojectify/react-reveal)](https://github.com/bojectify/bojectify/blob/main/LICENSE)

CSS animation wrapper for React. Fade and slide elements into view with zero JavaScript animation — pure CSS transitions driven by props.

RSC-compatible. No `"use client"` directive required.

## Install

```bash
npm install @bojectify/react-reveal react
```

## Usage

```tsx
import { Reveal } from '@bojectify/react-reveal';
import '@bojectify/react-reveal/styles.css';

<Reveal>
  <h1>Fades and slides up</h1>
</Reveal>

<Reveal direction="left" duration={1200} delay={200}>
  <p>Slides in from the left after 200ms</p>
</Reveal>

<Reveal distance="0">
  <p>Fade only, no slide</p>
</Reveal>

<Reveal fadeIn={false} direction="down">
  <p>Slide only, no fade</p>
</Reveal>
```

## Props

| Prop        | Type                                  | Default      | Description               |
| ----------- | ------------------------------------- | ------------ | ------------------------- |
| `as`        | `ElementType`                         | `'div'`      | HTML tag to render        |
| `children`  | `ReactNode`                           | -            | Content to animate        |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'up'`       | Entrance direction        |
| `distance`  | `CssLength \| '0' \| null`            | `null`       | Translation distance      |
| `duration`  | `number`                              | `800`        | Animation duration in ms  |
| `delay`     | `number`                              | `0`          | Animation delay in ms     |
| `easing`    | `Easing`                              | `'ease-out'` | Animation timing function |
| `fadeIn`    | `boolean`                             | `true`       | Include opacity fade      |
| `className` | `string`                              | -            | Additional CSS class      |

All props are type-safe — `distance` accepts CSS length units (`px`, `rem`, `vh`, etc.), and `easing` accepts CSS timing functions (`ease`, `linear`, `cubic-bezier(...)`, `steps(...)`).

All other HTML attributes are spread onto the root element.

## CSS Custom Properties

Override these for global theming:

```css
.bojectify-reveal {
  --bojectify-reveal-duration: 800ms;
  --bojectify-reveal-delay: 0ms;
  --bojectify-reveal-distance: 36px;
  --bojectify-reveal-easing: ease-out;
}
```

Props take precedence over CSS custom properties.

## Requirements

- React >= 18.0.0

## License

MIT

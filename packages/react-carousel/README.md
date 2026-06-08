# @bojectify/react-carousel

[![CI](https://github.com/bojectify/bojectify/actions/workflows/ci.yml/badge.svg)](https://github.com/bojectify/bojectify/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bojectify/react-carousel)](https://www.npmjs.com/package/@bojectify/react-carousel)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@bojectify/react-carousel)](https://bundlephobia.com/package/@bojectify/react-carousel)
[![License](https://img.shields.io/npm/l/@bojectify/react-carousel)](https://github.com/bojectify/bojectify/blob/main/LICENSE)

CSS-only scroll-snap carousel for React. No JavaScript scroll handlers — just native browser scrolling with CSS scroll-snap. All slides are in the DOM and fully indexable by search engines.

RSC-compatible. No `"use client"` directive required.

## Install

```bash
npm install @bojectify/react-carousel react
```

## Usage

```tsx
import { Carousel } from '@bojectify/react-carousel';
import '@bojectify/react-carousel/styles.css';

<Carousel>
  <Carousel.Slide>First slide</Carousel.Slide>
  <Carousel.Slide>Second slide</Carousel.Slide>
  <Carousel.Slide>Third slide</Carousel.Slide>
</Carousel>;
```

The CSS import is required — it loads the carousel's scroll-snap, scroll-button, and indicator styles. Import it once in your app's root layout or entry point.

Navigation is native browser scroll: touch swipe, trackpad, keyboard (Tab to focus, arrow keys to scroll).

## Progressive Enhancement

In browsers that support the experimental CSS Overflow Module, the carousel automatically gains:

- **Scroll buttons** (`::scroll-button`) — previous/next buttons that auto-disable at boundaries
- **Scroll markers** (`::scroll-marker`) — dot indicators tracking the active slide

No extra markup or JavaScript needed. Browsers without support get the base scroll-snap carousel, which works perfectly on its own.

## Props

### Carousel

| Prop                             | Type        | Default       | Description                           |
| -------------------------------- | ----------- | ------------- | ------------------------------------- |
| `children`                       | `ReactNode` | -             | `Carousel.Slide` elements             |
| `aria-label`                     | `string`    | `'Carousel'`  | Accessible name for the region        |
| `className`                      | `string`    | -             | Additional CSS class                  |
| `gap`                            | `CssLength` | `'16px'`      | Space between slides                  |
| `slideWidth`                     | `CssLength` | `'100%'`      | Width of each slide                   |
| `snapAlign`                      | `SnapAlign` | `'start'`     | Scroll snap alignment                 |
| `buttonSize`                     | `CssLength` | `'1rem'`      | Scroll button font size               |
| `buttonColor`                    | `CssColor`  | blue/white    | Scroll button color (dark aware)      |
| `indicatorSize`                  | `CssLength` | `'12px'`      | Indicator dot diameter                |
| `indicatorColor`                 | `CssColor`  | grey          | Inactive indicator color (dark aware) |
| `indicatorActiveColor`           | `CssColor`  | blue/grey     | Active indicator color (dark aware)   |
| `scrollButtonOpacityEnabled`     | `string`    | `'0.9'`       | Scroll button opacity (enabled)       |
| `scrollButtonOpacityHover`       | `string`    | `'1'`         | Scroll button opacity (hover)         |
| `scrollButtonOpacityFocus`       | `string`    | `'1'`         | Scroll button opacity (focus)         |
| `scrollButtonOpacityDisabled`    | `string`    | `'0.5'`       | Scroll button opacity (disabled)      |
| `scrollButtonInset`              | `CssLength` | `'16px'`      | Button distance from carousel edge    |
| `scrollButtonBackground`         | `CssColor`  | white/blue    | Button background (dark aware)        |
| `scrollButtonBackgroundHover`    | `CssColor`  | -             | Button background (hover)             |
| `scrollButtonBackgroundActive`   | `CssColor`  | -             | Button background (active)            |
| `scrollButtonBackgroundDisabled` | `CssColor`  | -             | Button background (disabled)          |
| `scrollButtonBackgroundFocus`    | `CssColor`  | -             | Button background (focus)             |
| `scrollButtonBorder`             | `CssBorder` | `2px solid`   | Button border (dark aware)            |
| `scrollButtonBorderHover`        | `CssBorder` | -             | Button border (hover)                 |
| `scrollButtonBorderActive`       | `CssBorder` | -             | Button border (active)                |
| `scrollButtonBorderDisabled`     | `CssBorder` | -             | Button border (disabled)              |
| `scrollButtonBorderFocus`        | `CssBorder` | -             | Button border (focus)                 |
| `scrollButtonBorderRadius`       | `CssLength` | `'50%'`       | Button border radius                  |
| `scrollButtonWidth`              | `CssLength` | `'2.5rem'`    | Button width                          |
| `scrollButtonHeight`             | `CssLength` | `'2.5rem'`    | Button height                         |
| `scrollButtonPadding`            | `CssLength` | `'0.5rem'`    | Button padding                        |
| `scrollButtonPrevContent`        | `string`    | `'\2039'` (‹) | Previous button visual content        |
| `scrollButtonNextContent`        | `string`    | `'\203A'` (›) | Next button visual content            |
| `scrollButtonPrevLabel`          | `string`    | `'Previous'`  | Previous button accessible label      |
| `scrollButtonNextLabel`          | `string`    | `'Next'`      | Next button accessible label          |
| `indicatorGap`                   | `CssLength` | `'12px'`      | Space between indicators              |
| `indicatorPaddingBlock`          | `CssLength` | `'24px'`      | Vertical padding around indicators    |

All props are type-safe — lengths accept CSS units (`px`, `rem`, `%`, etc.), colors accept CSS color values, and `snapAlign` is a union of `'start' | 'center' | 'end' | 'none'`.

### Carousel.Slide

| Prop        | Type        | Default | Description          |
| ----------- | ----------- | ------- | -------------------- |
| `children`  | `ReactNode` | -       | Slide content        |
| `className` | `string`    | -       | Additional CSS class |

All other HTML attributes are spread onto the root element of both components.

### Show partial next slide

```tsx
<Carousel slideWidth="85%">...</Carousel>
```

### Custom gap and slide width

```tsx
<Carousel slideWidth="80%" gap="32px">
  ...
</Carousel>
```

### Dark mode

Indicator colours use `light-dark()` by default, so they adapt automatically when `color-scheme` is set on the page. To customise the light and dark values, pass `light-dark()` to the colour props:

```tsx
<Carousel
  indicatorColor="light-dark(#bbb, #666)"
  indicatorActiveColor="light-dark(#222, #eee)"
/>
```

## CSS Custom Properties

Props are the recommended way to customise the carousel. For advanced use cases (e.g. responsive values via media queries), you can also set CSS custom properties via a class on the carousel element:

```css
.responsive-carousel {
  --bojectify-carousel-slide-width: 100%;
}
@media (min-width: 640px) {
  .responsive-carousel {
    --bojectify-carousel-slide-width: calc(
      50% - var(--bojectify-carousel-gap) / 2
    );
  }
}
```

## Accessibility

- Scroll container: `role="region"`, `aria-roledescription="carousel"`, `tabindex="0"`
- Each slide: `role="group"`, `aria-roledescription="slide"`
- Keyboard navigable via Tab + arrow keys
- Scroll buttons have `focus-visible` outlines and accessible labels via CSS `content` alt text (customisable via `scrollButtonPrevLabel` / `scrollButtonNextLabel`)
- Scroll buttons remain visible on hybrid devices (tablet + keyboard) — only hidden on touch-only devices
- Respects `prefers-reduced-motion` (disables smooth scrolling)
- Indicator dots meet 3:1 non-text contrast and use size differentiation (not just colour) for the active state

### Labelling slides

Each `<Carousel.Slide>` should have an `aria-label` describing its content or position so screen readers can distinguish between slides:

```tsx
<Carousel aria-label="Product images">
  <Carousel.Slide aria-label="1 of 3">...</Carousel.Slide>
  <Carousel.Slide aria-label="2 of 3">...</Carousel.Slide>
  <Carousel.Slide aria-label="3 of 3">...</Carousel.Slide>
</Carousel>
```

Don't include the word "slide" in the label — `aria-roledescription` already conveys that.

### Interactive content in slides

If slides contain interactive elements (links, buttons, form controls), keyboard users may be able to Tab to elements in off-screen slides. For carousels with interactive slide content, consider managing `tabIndex` on off-screen slides via JavaScript.

## Requirements

- React >= 18.0.0

## License

MIT

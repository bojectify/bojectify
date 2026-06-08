import type { CarouselProps } from './Carousel.types.js';
import { Slide } from './Slide.js';
import './Carousel.css';

const toVar = (prop: string) =>
  `--bojectify-carousel-${prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

function CarouselRoot({
  children,
  'aria-label': ariaLabel = 'Carousel',
  className,
  gap,
  slideWidth,
  snapAlign,
  buttonSize,
  buttonColor,
  indicatorSize,
  indicatorColor,
  indicatorActiveColor,
  scrollButtonOpacityEnabled,
  scrollButtonOpacityHover,
  scrollButtonOpacityFocus,
  scrollButtonOpacityDisabled,
  scrollButtonInset,
  scrollButtonBackground,
  scrollButtonBackgroundHover,
  scrollButtonBackgroundActive,
  scrollButtonBackgroundDisabled,
  scrollButtonBackgroundFocus,
  scrollButtonBorder,
  scrollButtonBorderHover,
  scrollButtonBorderActive,
  scrollButtonBorderDisabled,
  scrollButtonBorderFocus,
  scrollButtonBorderRadius,
  scrollButtonWidth,
  scrollButtonHeight,
  scrollButtonPadding,
  scrollButtonPrevContent,
  scrollButtonNextContent,
  scrollButtonPrevLabel,
  scrollButtonNextLabel,
  indicatorGap,
  indicatorPaddingBlock,
  style,
  ...rest
}: CarouselProps) {
  const classes = ['bojectify-carousel', className].filter(Boolean).join(' ');

  const props: Record<string, string | undefined> = {
    gap,
    slideWidth,
    snapAlign,
    buttonSize,
    buttonColor,
    indicatorSize,
    indicatorColor,
    indicatorActiveColor,
    scrollButtonOpacityEnabled,
    scrollButtonOpacityHover,
    scrollButtonOpacityFocus,
    scrollButtonOpacityDisabled,
    scrollButtonInset,
    scrollButtonBackground,
    scrollButtonBackgroundHover,
    scrollButtonBackgroundActive,
    scrollButtonBackgroundDisabled,
    scrollButtonBackgroundFocus,
    scrollButtonBorder,
    scrollButtonBorderHover,
    scrollButtonBorderActive,
    scrollButtonBorderDisabled,
    scrollButtonBorderFocus,
    scrollButtonBorderRadius,
    scrollButtonWidth,
    scrollButtonHeight,
    scrollButtonPadding,
    scrollButtonPrevContent,
    scrollButtonNextContent,
    scrollButtonPrevLabel,
    scrollButtonNextLabel,
    indicatorGap,
    indicatorPaddingBlock,
  };

  const cssVars: Record<string, string> = {};
  for (const [prop, value] of Object.entries(props)) {
    if (value !== undefined) {
      cssVars[toVar(prop)] = value;
    }
  }

  const combinedStyle = { ...cssVars, ...style };

  return (
    <div
      className={classes}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export const Carousel = Object.assign(CarouselRoot, { Slide });

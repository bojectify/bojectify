import { createElement } from 'react';
import type { RevealProps, Direction } from './Reveal.types.js';
import './Reveal.css';

const directionMap: Record<Direction, (distance: string) => string> = {
  up: (d) => `translateY(${d})`,
  down: (d) => `translateY(-${d})`,
  left: (d) => `translateX(${d})`,
  right: (d) => `translateX(-${d})`,
};

export function Reveal({
  as = 'div',
  children,
  direction = 'up',
  distance = null,
  duration = 800,
  delay = 0,
  easing = 'ease-out',
  fadeIn = true,
  className,
  style,
  ...rest
}: RevealProps) {
  const hasTransform =
    distance !== null && distance !== '0' && distance !== '0px';

  const classes = [
    'bojectify-reveal',
    fadeIn && 'bojectify-reveal--fade-in',
    hasTransform && 'bojectify-reveal--transform',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const transformValue = hasTransform
    ? directionMap[direction](distance)
    : undefined;

  const combinedStyle = {
    '--bojectify-reveal-duration': `${duration}ms`,
    '--bojectify-reveal-delay': `${delay}ms`,
    '--bojectify-reveal-distance': distance,
    '--bojectify-reveal-easing': easing,
    '--bojectify-reveal-transform': transformValue,
    ...(fadeIn && { opacity: 0 }),
    ...(hasTransform && { transform: transformValue }),
    ...style,
  };

  return createElement(
    as,
    {
      className: classes,
      style: combinedStyle,
      ...rest,
    },
    children
  );
}

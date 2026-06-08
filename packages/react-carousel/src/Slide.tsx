import type { SlideProps } from './Carousel.types.js';

export function Slide({ children, className, ...rest }: SlideProps) {
  const classes = ['bojectify-carousel__slide', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="group"
      aria-roledescription="slide"
      {...rest}
    >
      {children}
    </div>
  );
}

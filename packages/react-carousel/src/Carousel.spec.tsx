import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Carousel } from './Carousel.js';

describe('Carousel', () => {
  it('merges custom className on container', () => {
    render(
      <Carousel data-testid="carousel" className="custom">
        <Carousel.Slide>Slide 1</Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('carousel');
    expect(el.className).toContain('bojectify-carousel');
    expect(el.className).toContain('custom');
  });

  it('merges custom className on slide', () => {
    render(
      <Carousel>
        <Carousel.Slide data-testid="slide" className="custom-slide">
          Slide 1
        </Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('slide');
    expect(el.className).toContain('bojectify-carousel__slide');
    expect(el.className).toContain('custom-slide');
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Carousel data-testid="carousel" id="my-carousel">
        <Carousel.Slide data-testid="slide" id="slide-1">
          Slide 1
        </Carousel.Slide>
      </Carousel>
    );
    expect(screen.getByTestId('carousel').id).toBe('my-carousel');
    expect(screen.getByTestId('slide').id).toBe('slide-1');
  });
});

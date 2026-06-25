export type ObjectValues<T> = T[keyof T];
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * CSSUnitValue is a template literal type that represents a string that ends with a valid CSS unit.
 * It can be used to ensure that a string value is formatted correctly as a CSS unit.
 */
export type Px = 'px';
export type Percent = '%';
export type Rem = 'rem';
export type Em = 'em';
export type CssUnit = Px | Percent | Rem | Em;
export type CssWidthUnit = 'vw';
export type CssWidthValues =
  | 'max-content'
  | 'min-content'
  | 'fit-content'
  | 'auto';
export type CssValue<T extends string = CssUnit> = `${string}${T}`;

export const LINK_TARGETS = {
  SELF: '_self',
  BLANK: '_blank',
  PARENT: '_parent',
  TOP: '_top',
} as const;

export type LinkTarget = ObjectValues<typeof LINK_TARGETS>;

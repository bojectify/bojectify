/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
export const isObject = <T extends { [key: string]: unknown }>(
  value: unknown
): value is T =>
  typeof value === 'object' &&
  value !== null &&
  !(value instanceof Date) &&
  !(value instanceof RegExp) &&
  !Array.isArray(value);

export const isT = <T>(value: unknown, property: string): value is T =>
  isObject(value) && Object.hasOwn(value, property);

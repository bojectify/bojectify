export class CyclicGetterError extends Error {
  readonly code = 'CYCLIC_GETTER_DEPENDENCY';
  constructor(readonly cycle: string[]) {
    super(`Cyclic getter dependency detected: ${cycle.join(' → ')}`);
  }
}

import { CyclicGetterError } from './errors.config.js';
import { resolveGetters } from './resolveGetters.js';

describe('resolveGetters', () => {
  it('throws a descriptive error naming the cycle when getters form a dependency loop', () => {
    const getters = {
      a: (_state: unknown, g: Record<string, unknown>) => g.b,
      b: (_state: unknown, g: Record<string, unknown>) => g.a,
    };

    expect(() => resolveGetters({}, getters)).toThrow(
      'Cyclic getter dependency detected: a → b → a'
    );
  });

  it('reports only the true cycle path, excluding unrelated getters resolved along the way', () => {
    const getters = {
      a: (_state: unknown, g: Record<string, unknown>) => {
        void g.mid; // unrelated getter, fully resolves before the cycle is hit
        return g.b;
      },
      mid: () => 1,
      b: (_state: unknown, g: Record<string, unknown>) => g.a,
    };

    expect(() => resolveGetters({}, getters)).toThrow(
      'Cyclic getter dependency detected: a → b → a'
    );

    try {
      resolveGetters({}, getters);
    } catch (error) {
      expect(error).toBeInstanceOf(CyclicGetterError);
      expect(error).toMatchObject({
        code: 'CYCLIC_GETTER_DEPENDENCY',
        message: 'Cyclic getter dependency detected: a → b → a',
        cycle: ['a', 'b', 'a'],
      });
    }
  });

  it('detects a getter that depends on itself', () => {
    const getters = {
      self: (_state: unknown, g: Record<string, unknown>) => g.self,
    };

    expect(() => resolveGetters({}, getters)).toThrow(CyclicGetterError);
    expect(() => resolveGetters({}, getters)).toThrow(
      'Cyclic getter dependency detected: self → self'
    );
  });

  it('names every getter in a cycle longer than two', () => {
    const getters = {
      a: (_state: unknown, g: Record<string, unknown>) => g.b,
      b: (_state: unknown, g: Record<string, unknown>) => g.c,
      c: (_state: unknown, g: Record<string, unknown>) => g.a,
    };

    expect(() => resolveGetters({}, getters)).toThrow(
      'Cyclic getter dependency detected: a → b → c → a'
    );
  });

  it('resolves shared (diamond) dependencies to correct values', () => {
    type S = { n: number };
    const getters = {
      base: (state: S) => state.n,
      left: (_state: S, g: Record<string, unknown>) => (g.base as number) + 1,
      right: (_state: S, g: Record<string, unknown>) => (g.base as number) + 2,
      total: (_state: S, g: Record<string, unknown>) =>
        (g.left as number) + (g.right as number),
    };

    const resolved = resolveGetters({ n: 10 }, getters);

    expect(resolved.base).toBe(10);
    expect(resolved.left).toBe(11);
    expect(resolved.right).toBe(12);
    expect(resolved.total).toBe(23);
  });
});

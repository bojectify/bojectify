import type { Getters, ResolvedGetters } from './createStore.types.js';
import { CyclicGetterError } from './errors.config.js';

export function resolveGetters<S, G extends Getters<S>>(
  state: S,
  getterDefs: G
): ResolvedGetters<G> {
  const cache = new Map<string, unknown>();
  const resolving: string[] = [];

  const proxy = new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      if (cache.has(prop)) {
        return cache.get(prop);
      }
      const getter = getterDefs[prop];
      if (!getter) {
        return undefined;
      }
      if (resolving.includes(prop)) {
        const cycle = [...resolving.slice(resolving.indexOf(prop)), prop];

        throw new CyclicGetterError(cycle);
      }
      resolving.push(prop);
      try {
        const value = getter(state, proxy);
        cache.set(prop, value);
        return value;
      } finally {
        resolving.pop();
      }
    },
  });

  // Force-resolve all getters so the returned object has real values
  for (const key of Object.keys(getterDefs)) {
    void proxy[key];
  }

  return proxy as ResolvedGetters<G>;
}

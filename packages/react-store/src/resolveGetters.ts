import type { Getters, ResolvedGetters } from './createStore.types.js';
import { CyclicGetterError } from './errors.config.js';

export function resolveGetters<S, G extends Getters<S>>(
  state: S,
  getterDefs: G
): ResolvedGetters<G> {
  const cache = new Map<string, unknown>();
  const resolving: string[] = [];

  // Lazily resolves getters on property access: computes a getter's value the
  // first time it's read and caches it. When a getter reads another getter off
  // `proxy`, this same trap re-enters (see the `getter(state, proxy)` call
  // below) — that re-entrancy is what resolves dependencies and lets
  // `resolving` track the active dependency chain for cycle detection.
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
      // Add the current getter to the stack of getters being resolved, so if it
      // is re-entered via a dependency, we can detect the cycle and throw an error.
      resolving.push(prop);
      try {
        // Re-enter the proxy to resolve any getters that this getter depends on.
        const value = getter(state, proxy);
        cache.set(prop, value);
        return value;
      } finally {
        // The getter has finished resolving, so it is no longer in-flight —
        // remove it from the stack. Doing this in `finally` keeps push/pop
        // balanced even if the getter throws, so `resolving` always reflects
        // exactly the chain currently being computed.
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

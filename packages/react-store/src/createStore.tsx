'use client';

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useRef,
  type ReactElement,
} from 'react';
import type {
  ActionPayload,
  Actions,
  Getters,
  StoreConfig,
  StoreValue,
  ProviderProps,
  ResolvedGetters,
} from './createStore.types.js';
import { resolveGetters } from './resolveGetters.js';

export function createStore<
  S,
  A extends Actions<S, Act>,
  G extends Getters<S>,
  Act extends ActionPayload = ActionPayload,
>(config: StoreConfig<S, A, G, Act>) {
  const StoreContext = createContext<StoreValue<S, A, G> | null>(null);

  function Provider({
    children,
    initialState: overrides,
  }: ProviderProps<S>): ReactElement {
    const merged = overrides
      ? { ...config.initialState, ...overrides }
      : config.initialState;

    const [state, dispatch] = useReducer(config.reducer, merged);

    const stateRef = useRef(state);
    stateRef.current = state;

    const actions = useMemo(() => {
      const bound = {} as Record<
        string,
        (payload?: unknown) => void | Promise<void>
      >;
      for (const [key, action] of Object.entries(config.actions)) {
        bound[key] = (payload?: unknown) =>
          action({ state: stateRef.current, dispatch }, payload);
      }
      return bound as StoreValue<S, A, G>['actions'];
    }, []);

    const getters = useMemo(() => {
      if (!config.getters) {
        return {} as ResolvedGetters<G>;
      }
      return resolveGetters(state, config.getters);
    }, [state]);

    const value = useMemo(
      () => ({ state, actions, getters }),
      [state, actions, getters]
    );

    return (
      <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
    );
  }

  function useStore(): StoreValue<S, A, G> {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error('useStore must be used within a Provider');
    }
    return context;
  }

  return { Provider, useStore };
}

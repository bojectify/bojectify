# @bojectify/react-store

[![CI](https://github.com/bojectify/bojectify/actions/workflows/ci.yml/badge.svg)](https://github.com/bojectify/bojectify/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bojectify/react-store)](https://www.npmjs.com/package/@bojectify/react-store)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@bojectify/react-store)](https://bundlephobia.com/package/@bojectify/react-store)
[![License](https://img.shields.io/npm/l/@bojectify/react-store)](https://github.com/bojectify/bojectify/blob/main/LICENSE)

A `createStore` factory that replaces manual `useReducer` + `createContext` + Provider boilerplate. Inspired by Vuex's getter pattern.

## Install

```bash
npm install @bojectify/react-store react
```

## Usage

### Define your store

```tsx
import { createStore } from '@bojectify/react-store';

const { Provider, useStore } = createStore({
  initialState: { count: 0, multiplier: 2 },
  reducer: (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + action.payload };
      default:
        return state;
    }
  },
  actions: {
    increment: ({ dispatch }, amount: number) => {
      dispatch({ type: 'INCREMENT', payload: amount });
    },
  },
  getters: {
    doubled: (state) => state.count * 2,
    multiplied: (state, getters) => getters.doubled * state.multiplier,
  },
});
```

### Type your actions (optional)

Annotate the `reducer`'s `action` with your own discriminated union and `createStore` infers it — no cast required. The inferred type flows into `dispatch`, so dispatching an unknown `type` or a mismatched `payload` is a compile error:

```tsx
type CounterAction = { type: 'INCREMENT'; payload: number } | { type: 'RESET' };

const { Provider, useStore } = createStore({
  initialState: { count: 0 },
  reducer: (state, action: CounterAction) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + action.payload };
      case 'RESET':
        return { count: 0 };
      default:
        return state;
    }
  },
  actions: {
    increment: ({ dispatch }, amount: number) => {
      dispatch({ type: 'INCREMENT', payload: amount }); // ✅ checked against CounterAction
      // dispatch({ type: 'NOPE' });                     // ✗ compile error
    },
  },
});
```

If you leave `action` untyped, it falls back to the loose `ActionPayload` (`{ type: string; payload?: unknown }`) — the same behaviour as before.

### Wrap your app

```tsx
<Provider>
  <App />
</Provider>
```

You can override initial state per-provider:

```tsx
<Provider initialState={{ count: 10 }}>
  <App />
</Provider>
```

### Consume in components

```tsx
function Counter() {
  const { state, actions, getters } = useStore();

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Doubled: {getters.doubled}</p>
      <button onClick={() => actions.increment(1)}>+1</button>
    </div>
  );
}
```

## Composing stores

Each `createStore` call produces an independent store (its own Context + Provider). To combine several — the equivalent of [Pinia's composing stores](https://pinia.vuejs.org/cookbook/composing-stores.html) — read them together at the consumption layer rather than referencing one store from inside another.

Read multiple stores in the same component:

```tsx
const { Provider: CartProvider, useStore: useCart } = createStore({
  /* cart store */
});
const { Provider: UserProvider, useStore: useUser } = createStore({
  /* user store */
});

function Checkout() {
  const cart = useCart();
  const user = useUser();

  // derive across both stores right here
  const total = cart.getters.subtotal * (user.state.isPremium ? 0.9 : 1);

  return <p>Total: {total}</p>;
}
```

For reusable cross-store logic, extract a custom hook — this is the direct analog of a "composed store":

```tsx
function useCheckout() {
  const cart = useCart();
  const user = useUser();

  return {
    total: cart.getters.subtotal * (user.state.isPremium ? 0.9 : 1),
    canCheckout: cart.state.items.length > 0 && user.state.loggedIn,
  };
}
```

> **Why not reference another store from inside a getter or action?** Getters and actions run outside React's render cycle, so they can't call another store's `useStore()` hook (Rules of Hooks). Composing in a component or custom hook keeps cross-store logic where hooks are valid — and keeps each store's Provider scoping intact for testing and SSR isolation.

## API

### `createStore(config)`

Returns `{ Provider, useStore }`.

**Config:**

| Field          | Type                           | Description                                                                                                                                          |
| -------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialState` | `S`                            | Initial state object                                                                                                                                 |
| `reducer`      | `(state: S, action: Act) => S` | Standard reducer. `Act` is inferred from the `action` annotation (defaults to `ActionPayload`); see [Type your actions](#type-your-actions-optional) |
| `actions`      | `Record<string, Action<S>>`    | Action functions receiving `{ state, dispatch }` and an optional payload                                                                             |
| `getters`      | `Record<string, Getter<S>>`    | Derived values from state, can reference other getters                                                                                               |

### Getters

Getters are lazily evaluated via Proxy. When a getter accesses another getter, the value is computed and cached on first access within the render cycle. Declaration order doesn't matter.

### Actions

Actions receive `{ state, dispatch }` and an optional payload. They can be async. Note that `state` is captured at call time — in async actions, use `dispatch` after `await` rather than reading from `state`.

## Requirements

- React >= 18.0.0

## License

MIT

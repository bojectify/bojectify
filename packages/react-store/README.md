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

## API

### `createStore(config)`

Returns `{ Provider, useStore }`.

**Config:**

| Field          | Type                                     | Description                                                              |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| `initialState` | `S`                                      | Initial state object                                                     |
| `reducer`      | `(state: S, action: ActionPayload) => S` | Standard reducer function                                                |
| `actions`      | `Record<string, Action<S>>`              | Action functions receiving `{ state, dispatch }` and an optional payload |
| `getters`      | `Record<string, Getter<S>>`              | Derived values from state, can reference other getters                   |

### Getters

Getters are lazily evaluated via Proxy. When a getter accesses another getter, the value is computed and cached on first access within the render cycle. Declaration order doesn't matter.

### Actions

Actions receive `{ state, dispatch }` and an optional payload. They can be async. Note that `state` is captured at call time — in async actions, use `dispatch` after `await` rather than reading from `state`.

## Requirements

- React >= 18.0.0

## License

MIT

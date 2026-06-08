# @bojectify/react-store-async

[![CI](https://github.com/bojectify/bojectify/actions/workflows/ci.yml/badge.svg)](https://github.com/bojectify/bojectify/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bojectify/react-store-async)](https://www.npmjs.com/package/@bojectify/react-store-async)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@bojectify/react-store-async)](https://bundlephobia.com/package/@bojectify/react-store-async)
[![License](https://img.shields.io/npm/l/@bojectify/react-store-async)](https://github.com/bojectify/bojectify/blob/main/LICENSE)

Async fetch helpers for [@bojectify/react-store](https://www.npmjs.com/package/@bojectify/react-store). Provides the REQUEST / SUCCESS / ERROR pattern for data fetching with minimal boilerplate.

## Install

```bash
npm install @bojectify/react-store @bojectify/react-store-async react
```

## Usage

```tsx
import { createStore } from '@bojectify/react-store';
import { createFetchAction, asyncReducer } from '@bojectify/react-store-async';

const fetchUser = createFetchAction('FETCH_USER');

const { Provider, useStore } = createStore({
  initialState: {
    user: { data: null, loading: false, error: null },
  },
  reducer: (state, action) => {
    return asyncReducer(state, action, {
      ...fetchUser.reducers('user'),
    });
  },
  actions: {
    fetchUser: async ({ dispatch }, userId: string) => {
      await fetchUser.run(dispatch, {
        url: `/api/users/${userId}`,
        mutator: ({ response }) => response.data,
      });
    },
  },
  getters: {
    isLoading: (state) => state.user.loading,
    userName: (state) => state.user.data?.name ?? '',
  },
});
```

### In a component

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { actions, getters } = useStore();

  useEffect(() => {
    actions.fetchUser(userId);
  }, [userId]);

  if (getters.isLoading) return <p>Loading...</p>;

  return <p>{getters.userName}</p>;
}
```

## API

### `createFetchAction(key)`

Creates a fetch action helper. Returns `{ types, reducers, run }`.

- **`types`** — `{ REQUEST, SUCCESS, FAILURE }` action type strings (e.g. `FETCH_USER_REQUEST`)
- **`reducers(stateKey)`** — returns reducer cases that manage `AsyncState` at the given key
- **`run(dispatch, options)`** — dispatches REQUEST, calls `fetch`, dispatches SUCCESS or FAILURE

**Run options:**

| Option    | Type                  | Description                              |
| --------- | --------------------- | ---------------------------------------- |
| `url`     | `string`              | Fetch URL                                |
| `params`  | `RequestInit`         | Optional fetch options                   |
| `mutator` | `({ response }) => T` | Optional transform for the response data |

### `asyncReducer(state, action, cases)`

Matches an action type against a cases object and applies the matching reducer. Returns state unchanged if no case matches.

```tsx
asyncReducer(state, action, {
  ...fetchUser.reducers('user'),
  ...fetchPosts.reducers('posts'),
});
```

### `AsyncState<T>`

```ts
type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};
```

## Requirements

- React >= 18.0.0
- @bojectify/react-store >= 0.0.1

## License

MIT

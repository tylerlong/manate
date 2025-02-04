## shouldRecompute

### **Signature**

```typescript
shouldRecompute: ((writeLog: WriteLog, readLog: ReadLog) => boolean);
```

### **Description**

The `shouldRecompute` function determines whether a previously evaluated,
side-effect-free function would produce a different result if re-executed. It
achieves this by analyzing the relationship between **write events**
(`writeLog`) and **read events** (`readLog`).

This is useful for dependency tracking, caching, or optimization scenarios where
unnecessary recomputation should be avoided unless a meaningful change has
occurred.

## runInAction

### Signature

```typescript
runInAction<T>(f: () => T): [T, WriteLog];
```

### Description

The `runInAction` function ensures that any side-effects, such as triggering
recomputations or updates, occur at most once after the provided function (`f`)
completes execution. This allows batching of state updates and prevents
redundant computations during intermediate steps.

### Parameters

1. **`f`** (`() => T`):
   - A function to execute within the action. It may perform state updates or
     other side effects.

### Returns

- **`[T, WriteLog]`**:
  - The result of the executed function (`f`).
  - A `WriteLog` containing all state changes made during the execution.

### Example Usage

```typescript
import { manage, runInAction } from "manate";

const state = manage({ prop: 1 });

const [result, writeLog] = runInAction(() => {
  state.prop = 42; // State is updated
  return "Done";
});

console.log(result); // Outputs: "Done"
console.log(writeLog); // Outputs: WriteLog with recorded changes
```

## action

### Signature

```typescript
action<T extends (...args: any[]) => any>(fn: T): T;
```

### Description

The `action` function is a higher-order function that wraps a given function
(`fn`) to ensure that all its side effects, such as state changes, are batched
and deferred until the function completes execution. It utilizes `runInAction`
internally to ensure that any recomputations or updates triggered by the wrapped
function occur at most once, after the function has finished running.

This is particularly useful for managing state in reactive systems where
multiple updates need to be grouped together efficiently.

### Parameters

1. **`fn`** (`T`):
   - The function to be wrapped.
   - Can accept any arguments and return any value.

### Returns

- **`T`**:
  - The wrapped version of the input function (`fn`).
  - It behaves identically to the original function but ensures that its side
    effects are batched.

### Example Usage

```typescript
import { action, manage } from "manate";

const store = manage({ prop: 1 });

const f = () => {
  store.prop = 2;
  store.prop = 3;
};

const f2 = action(f);
f2();
```

The difference between `f()` and `f2()` is: `f2()` will batch the two changes to
`store.prop` so it will cause at most 1 re-computation.

### Notes

- The wrapped function retains the same signature and behavior as the original
  function but ensures efficient batching of side effects.
- It works seamlessly with decorators, allowing methods to be annotated with
  `@action`.

## ignore

### **Signature**

```typescript
ignore<T>(f: () => T): T;
```

### **Description**

The `ignore` function ensures that any code executed within the provided
function (`f`) will not trigger recomputations, regardless of the state changes
it performs.

This is useful in scenarios where temporary or intermediate state updates should
not cause any dependent functions to re-evaluate.

### **Parameters**

1. **`f`** (`() => T`):
   - A function to execute with recomputation temporarily disabled.
   - It may perform state updates or other side effects.

### **Returns**

- **`T`**:
  - The result of the executed function (`f`).

### **Example Usage**

```typescript
import { ignore, manage } from "manate";

const state = manage({ prop: 1 });

ignore(() => {
  state.prop = 42; // State is updated, but no recomputation is triggered
  state.prop = 43; // Another update, still no recomputation
});

console.log(state.prop); // Outputs: 43
```

In this example, even though `state.prop` is updated twice within `ignore`, no
recomputation occurs during the execution of the function.

### **Notes**

- Code executed within `ignore` will not trigger recomputation until the
  function completes.
- If `ignore` is nested, recomputation will remain suppressed until all nested
  calls have completed.
- Use `ignore` sparingly to avoid suppressing recomputation for essential
  updates.

## TBD

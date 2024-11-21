## Development Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
- `run` and `autoRun` only support sync methods. for async methods, make sure that the async part is irrelevant because it won't be monitored.

## No complex logic for `isTrigger`

Most events will be triggered by `set-get` and `delete-get` pairs.
In real apps, we will have `get` events for all parent paths. So we don't need to check parent paths for events triggering at all.

`set-keys` is just a complementary to `set-get`. No need to check parent paths since `set-get` will be tiggered anyway.
`delete-keys` is just a complementary to `delete-get`. No need to check parent paths since `delete-get` will be tiggered anyway.

Same applies to `set-has` and `delete-has`.

## React async

As I tested, if a react component has several children components. The react component will render first, then the children components will render.
Which means, the render function will finish before children render functions start.
Which means, component will not get those "get" events triggered by children components.
Which means, change in children components will not trigger the parent component to re-render.

This is very unexpected. But it may not be a bad thing at all. Since we don't want to re-render the parent component if the change in children components doesn't affect the parent component.

## Best Practices

Avoid using non-managed React props. Because it may cause lots of re-renders.

For example:

```tsx
<Monster monster={monster} position={[0, 0, 0]} />
```

Above will re-render every time its parent re-renders. Because `[0,0,0]` is a new array every time.

Instead, we could make `position` a property of `monster`.

## Todo

- support computed values
  - Long ago I supported this feature in the SubX project.
  - make all getters computed
- use chatGPT to refactor code, piece by piece.
- import everything from 'manate' except react related.
  - means everything should be exported from index.ts
  - should restructure the whole project, probably

## Version 2 Notes

### readEmitter

Batching is always applied because we know when to start and stop listening for events. The listener starts before an action begins and ends after the action completes, allowing us to identify which properties the action reads. This information is necessary to determine which property changes, emitted by writeEmitter, should trigger reactivity in the action.

### writeEmitter

Batching is not applied by default because immediate reaction to changes is usually desired. Additionally, we can't always predict when to stop listening—it depends on the events and the isTrigger condition. Typically, listening only stops when isTrigger becomes true. However, there are cases, such as transactions, where batching is necessary to group changes.

### Computed properties

Real-time updates aren't required because they only need to be updated when read. Continuously updating a computed property wastes resources, especially if the property is rarely read. For instance, if data changes frequently but the computed property is read only once, maintaining its value beyond the first read is unnecessary.

When batching events for a computed property, the batching duration is clearly defined: it lasts until the next read. But batching and merging the events cost resource too. And it also keeps a listener on forever (until you know that the computed property won't be read again).

Or, you could keep a boolean flag `dirty`. If it is false, you will subscribe to writeEmitter to check if it goes dirty. After it becomes dirty, no more subscritption is needed, because you will need to re-compute anyway. But this still cost resources if it won't become dirty for long time. And it has an diadvantage: after it becomes dirty, it may "purity" itself (by resetting the changed prop's value). In such case, there is no need to re-compute

# smart-swipe-cell Web Component

Zero-dependency Web Component port of `packages/swipe-cell`.

## Attributes and properties

| HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- |
| `async-close` | `asyncClose` | boolean | `false` |
| `disabled` | `disabled` | boolean | `false` |
| `left-width` | `leftWidth` | number | `0` |
| `name` | `name` | string | `''` |
| `right-width` | `rightWidth` | number | `0` |

## Methods

| Method | Description |
| --- | --- |
| `open('left' \| 'right')` | Opens the selected action area. |
| `close()` | Closes the action area. |

## Events

| Event | `detail` |
| --- | --- |
| `click` | `'left'`, `'right'`, or `'cell'` |
| `open` | `{ position, name }` |
| `tab-close` | The previously open position. |
| `close` | `{ position, instance, name }` when `async-close` is enabled. |

All events are bubbling and composed `CustomEvent` instances.

## Slots

| Slot | Description |
| --- | --- |
| default | Cell content. |
| `left` | Left action content. |
| `right` | Right action content. |

## CSS parts

| Part | Description |
| --- | --- |
| `root` | Clipping container. |
| `track` | Translated content track. |
| `left` | Left action wrapper. |
| `right` | Right action wrapper. |

## Browser adaptation

Touch handling uses Pointer Events with `touch-action: pan-y`. Horizontal drags match the miniapp component's 30% threshold, while vertical page scrolling remains available.

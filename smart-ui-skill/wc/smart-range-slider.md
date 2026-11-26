# smart-range-slider Web Component

`smart-range-slider` is a zero-dependency Web Components port of `packages/slider`.

## Attributes and Properties

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `range` | `range` | `range` | boolean | `true` |
| `disabled` | `disabled` | `disabled` | boolean | `false` |
| `useButtonSlot` | `use-button-slot` | `useButtonSlot` | boolean | `false` |
| `activeColor` | `active-color` | `activeColor` | string | `#3678e3` |
| `inActiveColor` | `in-active-color` | `inActiveColor` | string | - |
| `inactiveColor` | `inactive-color` | `inactiveColor` | string | `#ebedf0` |
| `max` | `max` | `max` | number | `100` |
| `min` | `min` | `min` | number | `0` |
| `step` | `step` | `step` | number | `1` |
| `value` | `value` | `value` | number or array | `[min, max]` in range mode |
| `vertical` | `vertical` | `vertical` | boolean | `false` |
| `barHeight` | `bar-height` | `barHeight` | string or number | `4px` |

## Events

| Event | Detail |
| --- | --- |
| `change` | Final value. In range mode this is `[minValue, maxValue]`, matching miniapp `event.detail`. |
| `drag-start` | `{}` |
| `drag` | `{ value }` |
| `drag-end` | `{}` |

## Slots

| Slot | Description |
| --- | --- |
| `left-button` | Left thumb content in range mode |
| `right-button` | Right thumb content in range mode |
| `button` | Thumb content in single-value mode |

## CSS Parts

| Part | Description |
| --- | --- |
| `root` | Track wrapper |
| `bar` | Active range bar |
| `left-button` | Left thumb wrapper |
| `right-button` | Right thumb wrapper |
| `button` | Single thumb wrapper |

## Miniapp Differences

- Browser interaction uses Pointer Events instead of miniapp touch events.
- Miniapp vibration calls at min/max boundaries are browser no-ops.
- Boolean attributes with default `true`, such as `range`, can be disabled with `range="false"`.

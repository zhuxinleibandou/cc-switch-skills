# smart-rate Web Component

`smart-rate` is a zero-dependency Web Components port of `packages/rate`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `allowHalf` | `allow-half` | `allowHalf` | - | - |
| `color` | `color` | `color` | - | - |
| `count` | `count` | `count` | - | - |
| `disabled` | `disabled` | `disabled` | - | - |
| `disabledColor` | `disabled-color` | `disabledColor` | - | - |
| `gutter` | `gutter` | `gutter` | - | - |
| `icon` | `icon` | `icon` | - | - |
| `name` | `name` | `name` | - | - |
| `readonly` | `readonly` | `readonly` | - | - |
| `size` | `size` | `size` | - | - |
| `touchable` | `touchable` | `touchable` | - | - |
| `value` | `value` | `value` | - | - |
| `voidColor` | `void-color` | `voidColor` | - | - |
| `voidIcon` | `void-icon` | `voidIcon` | - | - |

## Events

| Event | Description |
| --- | --- |
| `change` | Browser CustomEvent |

## Slots

| Slot | Description |
| --- | --- |
| default | Component content |
| named slots | Preserved where the miniapp component exposes them |

## CSS Parts

| Part | Description |
| --- | --- |
| root | Root element where available |

## Miniapp Differences

- Browser events are dispatched as `CustomEvent` with `bubbles: true` and `composed: true`.
- Miniapp-only platform capabilities are retained as API-compatible attributes where practical and otherwise degrade to browser no-ops.
- Earlier all-lowercase attribute aliases may be accepted for compatibility, but README kebab-case names are the primary API.

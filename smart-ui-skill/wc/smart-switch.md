# smart-switch Web Component

`smart-switch` is a zero-dependency Web Components port of `packages/switch`.
Load dependency components first when using slotted/dependent behavior: `smart-loading.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `activeColor` | `active-color` | `activeColor` | - | - |
| `activeValue` | `active-value` | `activeValue` | - | - |
| `checked` | `checked` | `checked` | - | - |
| `disabled` | `disabled` | `disabled` | - | - |
| `inactiveColor` | `inactive-color` | `inactiveColor` | - | - |
| `inactiveValue` | `inactive-value` | `inactiveValue` | - | - |
| `loading` | `loading` | `loading` | - | - |
| `name` | `name` | `name` | - | - |
| `size` | `size` | `size` | - | - |
| `stopClickPropagation` | `stop-click-propagation` | `stopClickPropagation` | - | - |
| `activeText` | `active-text` | `activeText` | - | - |
| `inactiveText` | `inactive-text` | `inactiveText` | - | - |

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

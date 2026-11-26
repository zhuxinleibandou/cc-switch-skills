# smart-checkbox Web Component

`smart-checkbox` is a zero-dependency Web Components port of `packages/checkbox`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `value` | `value` | `value` | - | - |
| `name` | `name` | `name` | - | - |
| `disabled` | `disabled` | `disabled` | - | - |
| `checkedColor` | `checked-color` | `checkedColor` | - | - |
| `labelPosition` | `label-position` | `labelPosition` | - | - |
| `labelDisabled` | `label-disabled` | `labelDisabled` | - | - |
| `shape` | `shape` | `shape` | - | - |
| `iconSize` | `icon-size` | `iconSize` | - | - |

## Events

| Event | Description |
| --- | --- |
| `click` | Browser CustomEvent |
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

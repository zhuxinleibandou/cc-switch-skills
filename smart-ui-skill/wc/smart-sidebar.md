# smart-sidebar Web Component

`smart-sidebar` is a zero-dependency Web Components port of `packages/sidebar`.
## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `title` | `title` | `title` | - | - |
| `value` | `value` | `value` | - | - |
| `disabled` | `disabled` | `disabled` | - | - |
| `active` | `active` | `active` | - | - |
| `type` | `type` | `type` | - | - |
| `show` | `show` | `show` | - | - |
| `customStyle` | `custom-style` | `customStyle` | - | - |

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

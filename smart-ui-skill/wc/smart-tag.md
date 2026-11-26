# smart-tag Web Component

`smart-tag` is a zero-dependency Web Components port of `packages/tag`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `closeIconAriaLabel` | `close-icon-aria-label` | `closeIconAriaLabel` | - | - |
| `closeable` | `closeable` | `closeable` | - | - |
| `color` | `color` | `color` | - | - |
| `mark` | `mark` | `mark` | - | - |
| `plain` | `plain` | `plain` | - | - |
| `round` | `round` | `round` | - | - |
| `size` | `size` | `size` | - | - |
| `textColor` | `text-color` | `textColor` | - | - |
| `type` | `type` | `type` | - | - |

## Events

| Event | Description |
| --- | --- |
| `close` | Browser CustomEvent |

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

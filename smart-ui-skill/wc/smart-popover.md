# smart-popover Web Component

`smart-popover` is a zero-dependency Web Components port of `packages/popover`.
Load dependency components first when using slotted/dependent behavior: `smart-overlay.js`, `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `customStyle` | `custom-style` | `customStyle` | - | - |
| `overlayStyle` | `overlay-style` | `overlayStyle` | - | - |
| `duration` | `duration` | `duration` | - | - |
| `placement` | `placement` | `placement` | - | - |
| `show` | `show` | `show` | - | - |
| `trigger` | `trigger` | `trigger` | - | - |

## Events

| Event | Description |
| --- | --- |
| `close` | Browser CustomEvent |
| `show-change` | Browser CustomEvent |

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

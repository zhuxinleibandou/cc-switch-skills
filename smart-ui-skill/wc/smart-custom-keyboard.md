# smart-custom-keyboard Web Component

`smart-custom-keyboard` is a zero-dependency Web Components port of `packages/custom-keyboard`.
Load dependency components first when using slotted/dependent behavior: `smart-popup.js`, `smart-image.js`, `smart-button.js`, `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `confirmColor` | `confirm-color` | `confirmColor` | - | - |
| `confirmText` | `confirm-text` | `confirmText` | - | - |
| `confirmTextStyle` | `confirm-text-style` | `confirmTextStyle` | - | - |
| `digitalBase` | `digital-base` | `digitalBase` | - | - |
| `inputContainerStyle` | `input-container-style` | `inputContainerStyle` | - | - |
| `ismartHideZero` | `ismart-hide-zero` | `ismartHideZero` | - | - |
| `placeholder` | `placeholder` | `placeholder` | - | - |
| `value` | `value` | `value` | - | - |
| `valueTextStyle` | `value-text-style` | `valueTextStyle` | - | - |

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

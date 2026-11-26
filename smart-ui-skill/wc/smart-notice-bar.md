# smart-notice-bar Web Component

`smart-notice-bar` is a zero-dependency Web Components port of `packages/notice-bar`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `text` | `text` | `text` | - | - |
| `btnText` | `btn-text` | `btnText` | - | - |
| `btnTextColor` | `btn-text-color` | `btnTextColor` | - | - |
| `type` | `type` | `type` | - | - |
| `background` | `background` | `background` | - | - |
| `closeIconAriaLabel` | `close-icon-aria-label` | `closeIconAriaLabel` | - | - |
| `color` | `color` | `color` | - | - |
| `delay` | `delay` | `delay` | - | - |
| `leftIcon` | `left-icon` | `leftIcon` | - | - |
| `leftIconColor` | `left-icon-color` | `leftIconColor` | - | - |
| `rightIconColor` | `right-icon-color` | `rightIconColor` | - | - |
| `leftIconStyle` | `left-icon-style` | `leftIconStyle` | - | - |
| `rightIconStyle` | `right-icon-style` | `rightIconStyle` | - | - |
| `mode` | `mode` | `mode` | - | - |
| `openType` | `open-type` | `openType` | - | - |
| `url` | `url` | `url` | - | - |
| `scrollable` | `scrollable` | `scrollable` | - | - |
| `speed` | `speed` | `speed` | - | - |
| `wrapable` | `wrapable` | `wrapable` | - | - |
| `customStyle` | `custom-style` | `customStyle` | - | - |
| `customHoverClass` | `custom-hover-class` | `customHoverClass` | - | - |

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

# smart-nav-bar Web Component

`smart-nav-bar` is a zero-dependency Web Components port of `packages/nav-bar`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `border` | `border` | `border` | - | - |
| `customStyle` | `custom-style` | `customStyle` | - | - |
| `fixed` | `fixed` | `fixed` | - | - |
| `leftArrow` | `left-arrow` | `leftArrow` | - | - |
| `leftArrowAriaLabel` | `left-arrow-aria-label` | `leftArrowAriaLabel` | - | - |
| `leftText` | `left-text` | `leftText` | - | - |
| `leftTextType` | `left-text-type` | `leftTextType` | - | - |
| `leftIcon` | `left-icon` | `leftIcon` | - | - |
| `leftIconAriaLabel` | `left-icon-aria-label` | `leftIconAriaLabel` | - | - |
| `leftIconSize` | `left-icon-size` | `leftIconSize` | - | - |
| `round` | `round` | `round` | - | - |
| `placeholder` | `placeholder` | `placeholder` | - | - |
| `rightText` | `right-text` | `rightText` | - | - |
| `safeAreaInsetTop` | `safe-area-inset-top` | `safeAreaInsetTop` | - | - |
| `title` | `title` | `title` | - | - |
| `zIndex` | `z-index` | `zIndex` | - | - |
| `rightTextColor` | `right-text-color` | `rightTextColor` | - | - |
| `rightIcon` | `right-icon` | `rightIcon` | - | - |
| `rightIconAriaLabel` | `right-icon-aria-label` | `rightIconAriaLabel` | - | - |
| `rightIconColor` | `right-icon-color` | `rightIconColor` | - | - |
| `rightIconSize` | `right-icon-size` | `rightIconSize` | - | - |
| `leftIconColor` | `left-icon-color` | `leftIconColor` | - | - |
| `background` | `background` | `background` | - | - |
| `sideWidth` | `side-width` | `sideWidth` | - | - |

## Events

| Event | Description |
| --- | --- |
| `click-left` | Browser CustomEvent |
| `click-right` | Browser CustomEvent |
| `click-title` | Browser CustomEvent |
| `click-left-icon` | Browser CustomEvent |
| `click-left-text` | Browser CustomEvent |
| `click-right-icon` | Browser CustomEvent |
| `click-right-text` | Browser CustomEvent |

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

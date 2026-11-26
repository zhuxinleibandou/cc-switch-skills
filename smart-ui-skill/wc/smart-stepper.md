# smart-stepper Web Component

`smart-stepper` is a zero-dependency Web Components port of `packages/stepper`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `alwaysEmbed` | `always-embed` | `alwaysEmbed` | - | - |
| `asyncChange` | `async-change` | `asyncChange` | - | - |
| `buttonSize` | `button-size` | `buttonSize` | - | - |
| `decimalLength` | `decimal-length` | `decimalLength` | - | - |
| `disableInput` | `disable-input` | `disableInput` | - | - |
| `disableMinus` | `disable-minus` | `disableMinus` | - | - |
| `disablePlus` | `disable-plus` | `disablePlus` | - | - |
| `disabled` | `disabled` | `disabled` | - | - |
| `inputWidth` | `input-width` | `inputWidth` | - | - |
| `integer` | `integer` | `integer` | - | - |
| `longPress` | `long-press` | `longPress` | - | - |
| `max` | `max` | `max` | - | - |
| `min` | `min` | `min` | - | - |
| `minusAriaLabel` | `minus-aria-label` | `minusAriaLabel` | - | - |
| `name` | `name` | `name` | - | - |
| `plusAriaLabel` | `plus-aria-label` | `plusAriaLabel` | - | - |
| `showMinus` | `show-minus` | `showMinus` | - | - |
| `showPlus` | `show-plus` | `showPlus` | - | - |
| `step` | `step` | `step` | - | - |
| `theme` | `theme` | `theme` | - | - |
| `value` | `value` | `value` | - | - |

## Events

| Event | Description |
| --- | --- |
| `blur` | Browser CustomEvent |
| `change` | Browser CustomEvent |
| `focus` | Browser CustomEvent |
| `minus` | Browser CustomEvent |
| `overlimit` | Browser CustomEvent |
| `plus` | Browser CustomEvent |

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

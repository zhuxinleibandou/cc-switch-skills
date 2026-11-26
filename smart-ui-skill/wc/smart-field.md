# smart-field Web Component

`smart-field` is a zero-dependency Web Components port of `packages/field`.
Load dependency components first when using slotted/dependent behavior: `smart-cell.js`, `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `adjustPosition` | `adjust-position` | `adjustPosition` | - | - |
| `alwaysEmbed` | `always-embed` | `alwaysEmbed` | - | - |
| `arrowDirection` | `arrow-direction` | `arrowDirection` | - | - |
| `autoFocus` | `auto-focus` | `autoFocus` | - | - |
| `autosize` | `autosize` | `autosize` | - | - |
| `border` | `border` | `border` | - | - |
| `center` | `center` | `center` | - | - |
| `clearIconAriaLabel` | `clear-icon-aria-label` | `clearIconAriaLabel` | - | - |
| `clearTrigger` | `clear-trigger` | `clearTrigger` | - | - |
| `clearable` | `clearable` | `clearable` | - | - |
| `clickable` | `clickable` | `clickable` | - | - |
| `confirmHold` | `confirm-hold` | `confirmHold` | - | - |
| `confirmType` | `confirm-type` | `confirmType` | - | - |
| `cursor` | `cursor` | `cursor` | - | - |
| `cursorSpacing` | `cursor-spacing` | `cursorSpacing` | - | - |
| `customStyle` | `custom-style` | `customStyle` | - | - |
| `disableDefaultPadding` | `disable-default-padding` | `disableDefaultPadding` | - | - |
| `disabled` | `disabled` | `disabled` | - | - |
| `error` | `error` | `error` | - | - |
| `errorMessage` | `error-message` | `errorMessage` | - | - |
| `errorMessageAlign` | `error-message-align` | `errorMessageAlign` | - | - |
| `fixed` | `fixed` | `fixed` | - | - |
| `focus` | `focus` | `focus` | - | - |
| `holdKeyboard` | `hold-keyboard` | `holdKeyboard` | - | - |
| `inputAlign` | `input-align` | `inputAlign` | - | - |
| `isLink` | `is-link` | `isLink` | - | - |
| `label` | `label` | `label` | - | - |
| `leftIcon` | `left-icon` | `leftIcon` | - | - |
| `maxlength` | `maxlength` | `maxlength` | - | - |
| `name` | `name` | `name` | - | - |
| `numberFormat` | `number-format` | `numberFormat` | - | - |
| `locale` | `locale` | `locale` | - | - |
| `password` | `password` | `password` | - | - |
| `placeholder` | `placeholder` | `placeholder` | - | - |
| `placeholderStyle` | `placeholder-style` | `placeholderStyle` | - | - |
| `readonly` | `readonly` | `readonly` | - | - |
| `required` | `required` | `required` | - | - |
| `rightIcon` | `right-icon` | `rightIcon` | - | - |
| `rightIconButtonAriaLabel` | `right-icon-button-aria-label` | `rightIconButtonAriaLabel` | - | - |
| `selectionEnd` | `selection-end` | `selectionEnd` | - | - |
| `selectionStart` | `selection-start` | `selectionStart` | - | - |
| `showConfirmBar` | `show-confirm-bar` | `showConfirmBar` | - | - |
| `showWordLimit` | `show-word-limit` | `showWordLimit` | - | - |
| `size` | `size` | `size` | - | - |
| `titleWidth` | `title-width` | `titleWidth` | - | - |
| `type` | `type` | `type` | - | - |
| `value` | `value` | `value` | - | - |
| `interError` | `inter-error` | `interError` | - | - |
| `subLabel` | `sub-label` | `subLabel` | - | - |
| `cardMode` | `card-mode` | `cardMode` | - | - |
| `hiddenLabel` | `hidden-label` | `hiddenLabel` | - | - |

## Events

| Event | Description |
| --- | --- |
| `blur` | Browser CustomEvent |
| `change` | Browser CustomEvent |
| `clear` | Browser CustomEvent |
| `click-icon` | Browser CustomEvent |
| `click-input` | Browser CustomEvent |
| `confirm` | Browser CustomEvent |
| `focus` | Browser CustomEvent |
| `input` | Browser CustomEvent |
| `keyboardheightchange` | Browser CustomEvent |
| `linechange` | Browser CustomEvent |
| `nicknamereview` | Browser CustomEvent |

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

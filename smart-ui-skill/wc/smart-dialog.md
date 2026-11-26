# smart-dialog Web Component

`smart-dialog` is a zero-dependency Web Components port of `packages/dialog`.
Load dependency components first when using slotted/dependent behavior: `smart-popup.js`, `smart-button.js`, `smart-icon.js`, `smart-goods-action.js`, `smart-goods-action-button.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `confirmButtonId` | `confirm-button-id` | `confirmButtonId` | - | - |
| `icon` | `icon` | `icon` | - | - |
| `iconColor` | `icon-color` | `iconColor` | - | - |
| `iconSize` | `icon-size` | `iconSize` | - | - |
| `maxlength` | `maxlength` | `maxlength` | - | - |
| `message` | `message` | `message` | - | - |
| `messageAlign` | `message-align` | `messageAlign` | - | - |
| `password` | `password` | `password` | - | - |
| `placeholder` | `placeholder` | `placeholder` | - | - |
| `show` | `show` | `show` | - | - |
| `theme` | `theme` | `theme` | - | - |
| `title` | `title` | `title` | - | - |
| `value` | `value` | `value` | - | - |
| `width` | `width` | `width` | - | - |
| `zIndex` | `z-index` | `zIndex` | - | - |
| `customStyle` | `custom-style` | `customStyle` | - | - |
| `showConfirmButton` | `show-confirm-button` | `showConfirmButton` | - | - |
| `cancelButtonColor` | `cancel-button-color` | `cancelButtonColor` | - | - |
| `cancelButtonText` | `cancel-button-text` | `cancelButtonText` | - | - |
| `closeOnClickOverlay` | `close-on-click-overlay` | `closeOnClickOverlay` | - | - |
| `confirmButtonColor` | `confirm-button-color` | `confirmButtonColor` | - | - |
| `confirmButtonText` | `confirm-button-text` | `confirmButtonText` | - | - |
| `overlay` | `overlay` | `overlay` | - | - |
| `overlayStyle` | `overlay-style` | `overlayStyle` | - | - |
| `showCancelButton` | `show-cancel-button` | `showCancelButton` | - | - |
| `useCancelButtonSlot` | `use-cancel-button-slot` | `useCancelButtonSlot` | - | - |
| `useConfirmButtonSlot` | `use-confirm-button-slot` | `useConfirmButtonSlot` | - | - |
| `useSlot` | `use-slot` | `useSlot` | - | - |
| `useTitleSlot` | `use-title-slot` | `useTitleSlot` | - | - |
| `beforeClose` | `before-close` | `beforeClose` | - | - |
| `transition` | `transition` | `transition` | - | - |
| `autoClose` | `autoClose` | `autoClose` | - | - |
| `emptyDisabled` | `emptyDisabled` | `emptyDisabled` | - | - |
| `fullCoverView` | `full-cover-view` | `fullCoverView` | - | - |

## Events

| Event | Description |
| --- | --- |
| `cancel` | Browser CustomEvent |
| `close` | Browser CustomEvent |
| `confirm` | Browser CustomEvent |

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

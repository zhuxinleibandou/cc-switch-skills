# smart-picker Web Component

`smart-picker` is a zero-dependency Web Components port of `packages/picker`.
Load dependency components first when using slotted/dependent behavior: `smart-picker-column.js`, `smart-loading.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `activeIndex` | `active-index` | `activeIndex` | - | - |
| `cancelButtonText` | `cancel-button-text` | `cancelButtonText` | - | - |
| `columns` | `columns` | `columns` | - | - |
| `confirmButtonText` | `confirm-button-text` | `confirmButtonText` | - | - |
| `defaultIndex` | `default-index` | `defaultIndex` | - | - |
| `itemHeight` | `item-height` | `itemHeight` | - | - |
| `loading` | `loading` | `loading` | - | - |
| `showToolbar` | `show-toolbar` | `showToolbar` | - | - |
| `title` | `title` | `title` | - | - |
| `toolbarPosition` | `toolbar-position` | `toolbarPosition` | - | - |
| `unit` | `unit` | `unit` | - | - |
| `valueKey` | `value-key` | `valueKey` | - | - |
| `visibleItemCount` | `visible-item-count` | `visibleItemCount` | - | - |
| `activeStyle` | `active-style` | `activeStyle` | - | - |
| `changeAnimation` | `change-animation` | `changeAnimation` | - | - |
| `animationTime` | `animation-time` | `animationTime` | - | - |
| `loop` | `loop` | `loop` | - | - |
| `fontStyle` | `font-style` | `fontStyle` | - | - |
| `fullHeight` | `full-height` | `fullHeight` | - | - |

## Events

| Event | Description |
| --- | --- |
| `cancel` | Browser CustomEvent |
| `change` | Browser CustomEvent |
| `confirm` | Browser CustomEvent |
| `animation-start` | Browser CustomEvent |
| `animation-end` | Browser CustomEvent |

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

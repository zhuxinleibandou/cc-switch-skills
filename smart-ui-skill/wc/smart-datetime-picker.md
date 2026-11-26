# smart-datetime-picker Web Component

`smart-datetime-picker` is a zero-dependency Web Components port of `packages/datetime-picker`.
Load dependency components first when using slotted/dependent behavior: `smart-picker.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `cancelButtonText` | `cancel-button-text` | `cancelButtonText` | - | - |
| `confirmButtonText` | `confirm-button-text` | `confirmButtonText` | - | - |
| `filter` | `filter` | `filter` | - | - |
| `itemHeight` | `item-height` | `itemHeight` | - | - |
| `loading` | `loading` | `loading` | - | - |
| `locale` | `locale` | `locale` | - | - |
| `maxDate` | `max-date` | `maxDate` | - | - |
| `maxHour` | `max-hour` | `maxHour` | - | - |
| `maxMinute` | `max-minute` | `maxMinute` | - | - |
| `minDate` | `min-date` | `minDate` | - | - |
| `minHour` | `min-hour` | `minHour` | - | - |
| `minMinute` | `min-minute` | `minMinute` | - | - |
| `showToolbar` | `show-toolbar` | `showToolbar` | - | - |
| `title` | `title` | `title` | - | - |
| `type` | `type` | `type` | - | - |
| `value` | `value` | `value` | - | - |
| `visibleItemCount` | `visible-item-count` | `visibleItemCount` | - | - |
| `formatterMap` | `formatter-map` | `formatterMap` | - | - |
| `changeAnimation` | `change-animation` | `changeAnimation` | - | - |
| `is-12HourClock` | `is-12-hour-clock` | `is-12HourClock` | - | - |
| `amText` | `am-text` | `amText` | - | - |
| `pmText` | `pm-text` | `pmText` | - | - |
| `columnsOrder` | `columns-order` | `columnsOrder` | - | - |
| `animationTime` | `animation-time` | `animationTime` | - | - |
| `columnStyles` | `columnStyles` | `columnStyles` | - | - |
| `fontStyles` | `font-styles` | `fontStyles` | - | - |
| `activeStyle` | `active-style` | `activeStyle` | - | - |

## Events

| Event | Description |
| --- | --- |
| `cancel` | Browser CustomEvent |
| `change` | Browser CustomEvent |
| `confirm` | Browser CustomEvent |
| `input` | Browser CustomEvent |
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

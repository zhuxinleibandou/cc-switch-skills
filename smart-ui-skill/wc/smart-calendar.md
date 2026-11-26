# smart-calendar Web Component

`smart-calendar` is a zero-dependency Web Components port of `packages/calendar`.
Load dependency components first when using slotted/dependent behavior: `smart-calendar-header.js`, `smart-calendar-month.js`, `smart-calendar-month-list.js`, `smart-calendar-year-list.js`, `smart-button.js`, `smart-popup.js`, `smart-toast.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `color` | `color` | `color` | - | - |
| `confirmText` | `confirm-text` | `confirmText` | - | - |
| `dayClassMap` | `day-class-map` | `dayClassMap` | - | - |
| `defaultDate` | `default-date` | `defaultDate` | - | - |
| `firstDayOfSelectWeek` | `first-day-of-select-week` | `firstDayOfSelectWeek` | - | - |
| `firstDayOfWeek` | `first-day-of-week` | `firstDayOfWeek` | - | - |
| `headerIconColor` | `header-icon-color` | `headerIconColor` | - | - |
| `locale` | `locale` | `locale` | - | - |
| `maxDate` | `max-date` | `maxDate` | - | - |
| `minDate` | `min-date` | `minDate` | - | - |
| `poppable` | `poppable` | `poppable` | - | - |
| `readonly` | `readonly` | `readonly` | - | - |
| `rowHeight` | `row-height` | `rowHeight` | - | - |
| `showConfirm` | `show-confirm` | `showConfirm` | - | - |
| `showSubtitle` | `show-subtitle` | `showSubtitle` | - | - |
| `showTitle` | `show-title` | `showTitle` | - | - |
| `title` | `title` | `title` | - | - |
| `type` | `type` | `type` | - | - |

## Events

| Event | Description |
| --- | --- |
| `close` | Browser CustomEvent |
| `closed` | Browser CustomEvent |
| `confirm` | Browser CustomEvent |
| `open` | Browser CustomEvent |
| `opened` | Browser CustomEvent |
| `over-range` | Browser CustomEvent |
| `select` | Browser CustomEvent |
| `unselect` | Browser CustomEvent |

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

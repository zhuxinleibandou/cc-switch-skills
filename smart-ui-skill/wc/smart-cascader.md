# smart-cascader Web Component

`smart-cascader` is a zero-dependency Web Components port of `packages/cascader`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`, `smart-tab.js`, `smart-tabs.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `activeColor` | `active-color` | `activeColor` | - | - |
| `closeIcon` | `close-icon` | `closeIcon` | - | - |
| `closeIconAriaLabel` | `close-icon-aria-label` | `closeIconAriaLabel` | - | - |
| `closeable` | `closeable` | `closeable` | - | - |
| `ellipsis` | `ellipsis` | `ellipsis` | - | - |
| `options` | `options` | `options` | - | - |
| `placeholder` | `placeholder` | `placeholder` | - | - |
| `showHeader` | `show-header` | `showHeader` | - | - |
| `swipeThreshold` | `swipe-threshold` | `swipeThreshold` | - | - |
| `swipeable` | `swipeable` | `swipeable` | - | - |
| `title` | `title` | `title` | - | - |
| `useTitleSlot` | `use-title-slot` | `useTitleSlot` | - | - |
| `value` | `value` | `value` | - | - |

## Events

| Event | Description |
| --- | --- |
| `change` | Browser CustomEvent |
| `click-tab` | Browser CustomEvent |
| `close` | Browser CustomEvent |
| `finish` | Browser CustomEvent |

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

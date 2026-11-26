# smart-tree-select Web Component

`smart-tree-select` is a zero-dependency Web Components port of `packages/tree-select`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`, `smart-sidebar.js`, `smart-sidebar-item.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `activeId` | `active-id` | `activeId` | - | - |
| `height` | `height` | `height` | - | - |
| `items` | `items` | `items` | - | - |
| `mainActiveIndex` | `main-active-index` | `mainActiveIndex` | - | - |
| `max` | `max` | `max` | - | - |
| `selectedIcon` | `selected-icon` | `selectedIcon` | - | - |

## Events

| Event | Description |
| --- | --- |
| `click-item` | Browser CustomEvent |
| `click-nav` | Browser CustomEvent |

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

# smart-skeleton Web Component

`smart-skeleton` is a zero-dependency Web Components port of `packages/skeleton`.
## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `animate` | `animate` | `animate` | - | - |
| `avatar` | `avatar` | `avatar` | - | - |
| `avatarShape` | `avatar-shape` | `avatarShape` | - | - |
| `avatarSize` | `avatar-size` | `avatarSize` | - | - |
| `loading` | `loading` | `loading` | - | - |
| `row` | `row` | `row` | - | - |
| `rowWidth` | `row-width` | `rowWidth` | - | - |
| `title` | `title` | `title` | - | - |
| `titleWidth` | `title-width` | `titleWidth` | - | - |

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

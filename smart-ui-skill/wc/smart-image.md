# smart-image Web Component

`smart-image` is a zero-dependency Web Components port of `packages/image`.
Load dependency components first when using slotted/dependent behavior: `smart-icon.js`, `smart-loading.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `alt` | `alt` | `alt` | - | - |
| `fit` | `fit` | `fit` | - | - |
| `height` | `height` | `height` | - | - |
| `lazyLoad` | `lazy-load` | `lazyLoad` | - | - |
| `radius` | `radius` | `radius` | - | - |
| `round` | `round` | `round` | - | - |
| `showError` | `show-error` | `showError` | - | - |
| `showLoading` | `show-loading` | `showLoading` | - | - |
| `showMenuByLongpress` | `show-menu-by-longpress` | `showMenuByLongpress` | - | - |
| `src` | `src` | `src` | - | - |
| `useErrorSlot` | `use-error-slot` | `useErrorSlot` | - | - |
| `useLoadingSlot` | `use-loading-slot` | `useLoadingSlot` | - | - |
| `webp` | `webp` | `webp` | - | - |
| `width` | `width` | `width` | - | - |
| `tintColor` | `tint-color` | `tintColor` | - | - |

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

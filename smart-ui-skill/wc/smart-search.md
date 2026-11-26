# smart-search Web Component

`smart-search` is a zero-dependency Web Components port of `packages/search`.
Load dependency components first when using slotted/dependent behavior: `smart-field.js`, `smart-icon.js`.

## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `actionText` | `action-text` | `actionText` | - | - |
| `background` | `background` | `background` | - | - |
| `clearIcon` | `clear-icon` | `clearIcon` | - | - |
| `clearTrigger` | `clear-trigger` | `clearTrigger` | - | - |
| `clearable` | `clearable` | `clearable` | - | - |
| `cursorSpacing` | `cursor-spacing` | `cursorSpacing` | - | - |
| `disabled` | `disabled` | `disabled` | - | - |
| `error` | `error` | `error` | - | - |
| `focus` | `focus` | `focus` | - | - |
| `inputAlign` | `input-align` | `inputAlign` | - | - |
| `label` | `label` | `label` | - | - |
| `leftIcon` | `left-icon` | `leftIcon` | - | - |
| `maxlength` | `maxlength` | `maxlength` | - | - |
| `name` | `name` | `name` | - | - |
| `placeholder` | `placeholder` | `placeholder` | - | - |
| `placeholderStyle` | `placeholder-style` | `placeholderStyle` | - | - |
| `readonly` | `readonly` | `readonly` | - | - |
| `rightIcon` | `right-icon` | `rightIcon` | - | - |
| `shape` | `shape` | `shape` | - | - |
| `showAction` | `show-action` | `showAction` | - | - |
| `useActionSlot` | `use-action-slot` | `useActionSlot` | - | - |
| `useLeftIconSlot` | `use-left-icon-slot` | `useLeftIconSlot` | - | - |
| `useRightIconSlot` | `use-right-icon-slot` | `useRightIconSlot` | - | - |
| `value` | `value` | `value` | - | - |
| `searchText` | `search-text` | `searchText` | - | - |

## Events

| Event | Description |
| --- | --- |
| `blur` | Browser CustomEvent |
| `cancel` | Browser CustomEvent |
| `change` | Browser CustomEvent |
| `clear` | Browser CustomEvent |
| `click-input` | Browser CustomEvent |
| `focus` | Browser CustomEvent |
| `search` | Browser CustomEvent |

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

# smart-action-sheet Web Component

`smart-action-sheet` is a zero-dependency Web Components port of `packages/action-sheet`.

Load its dependency components first:

```html
<script src="./smart-icon.js"></script>
<script src="./smart-loading.js"></script>
<script src="./smart-popup.js"></script>
<script src="./smart-action-sheet.js"></script>
```

## Attributes and Properties

| React prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `show` | `show` | `show` | boolean | `false` |
| `title` | `title` | `title` | string | `''` |
| `cancelText` | `cancel-text` | `cancelText` | string | `''` |
| `confirmText` | `confirm-text` | `confirmText` | string | `''` |
| `description` | `description` | `description` | string | `''` |
| `activeColor` | `active-color` | `activeColor` | string | `var(--app-M1, #3678e3)` |
| `nativeDisabled` | `native-disabled` | `nativeDisabled` | boolean | `false` |
| `useTitleSlot` | `use-title-slot` | `useTitleSlot` | boolean | `false` |
| `round` | `round` | `round` | boolean | `true` |
| `zIndex` | `z-index` | `zIndex` | number | `100` |
| `actions` | `actions` | `actions` | array / JSON string | `[]` |
| `overlay` | `overlay` | `overlay` | boolean | `true` |
| `closeOnClickOverlay` | `close-on-click-overlay` | `closeOnClickOverlay` | boolean | `true` |
| `closeOnClickAction` | `close-on-click-action` | `closeOnClickAction` | boolean | `true` |
| `safeAreaInsetBottom` | `safe-area-inset-bottom` | `safeAreaInsetBottom` | boolean | `true` |
| `safeAreaInsetBottomMin` | `safe-area-inset-bottom-min` | `safeAreaInsetBottomMin` | number | `16` |
| `rootPortal` | `root-portal` | `rootPortal` | boolean | `false` |
| `fullCoverView` | `full-cover-view` | `fullCoverView` | boolean | `false` |

For default-true booleans, use `round="false"`, `overlay="false"`, `close-on-click-action="false"`, `close-on-click-overlay="false"`, or `safe-area-inset-bottom="false"` to disable.

Complex prop rule: `actions` remains a single JSON attribute. Do not split it into per-action attributes.

## Actions

Each `actions` item supports:

| Key | Type | Description |
| --- | --- | --- |
| `className` | string | Extra class on the item button |
| `color` | string | Item text color |
| `checked` | boolean | Shows the selected check icon |
| `disabled` | boolean | Disables selection |
| `loading` | boolean | Shows loading state and disables selection |
| `name` | string | Main label |
| `subname` | string | Secondary label |
| `openType` | string | Kept for API parity; browser platform actions are not available |

## Events

| Event | Detail |
| --- | --- |
| `select` | Selected action object |
| `cancel` | none |
| `confirm` | none |
| `close` | none |
| `click-overlay` | none |
| `before-enter` | none |
| `enter` | none |
| `after-enter` | none |
| `before-leave` | none |
| `leave` | none |
| `after-leave` | none |
| `getuserinfo` | Browser fallback result when selecting `openType: "getUserInfo"` |

## Slots

| Slot | Description |
| --- | --- |
| default | Custom panel content |
| `title` | Custom title content, used when `useTitleSlot` is true and `title` is empty |

## CSS Parts

| Part | Description |
| --- | --- |
| `popup` | Inner `smart-popup` |
| `root` | ActionSheet panel root |
| `header` | Header area |
| `description` | Description area |
| `list` | Action list |
| `item` | Action item button |
| `subname` | Action subname |
| `checked-icon` | Checked icon |
| `footer-wrap` | Footer wrapper |
| `gap` | Gap before footer |
| `footer` | Footer button row |
| `cancel` | Cancel button |
| `confirm` | Confirm button |

## Ray Differences

- HTML attributes follow the miniapp README names (`cancelText` -> `cancel-text`); legacy lowercased aliases such as `canceltext` remain accepted.
- The component dispatches browser `CustomEvent`s with the Ray event names.
- `rootPortal`, `fullCoverView`, and `nativeDisabled` are retained for API parity but browser platform behavior differs from the miniapp runtime.
- `openType="getUserInfo"` cannot call `wx.getUserProfile`; the Web Component emits a fallback `getuserinfo` event instead.
- CSS variables are preserved where practical; external style classes are represented by CSS Shadow Parts.

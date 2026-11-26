# smart-bottom-sheet Web Component

`smart-bottom-sheet` is a zero-dependency Web Components port of `packages/bottom-sheet`. Load `smart-icon.js` and `smart-popup.js` before this file.

## Attributes and Properties

| React prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `show` | `show` | `show` | boolean | `false` |
| `title` | `title` | `title` | string | `''` |
| `iconColor` | `icon-color` | `iconColor` | string | `rgba(0, 0, 0, 0.5)` |
| `nativeDisabled` | `native-disabled` | `nativeDisabled` | boolean | `false` |
| `instanceId` | `instance-id` | `instanceId` | string | generated in Ray; unused on Web |
| `maxHeight` | `max-height` | `maxHeight` | string \| number | `null` |
| `iconSize` | `icon-size` | `iconSize` | string \| number | `24` |
| `showClose` | `show-close` | `showClose` | boolean | `true` |
| `closeIconAriaLabel` | `close-icon-aria-label` | `closeIconAriaLabel` | string | `''` |
| `contentHeight` | `content-height` | `contentHeight` | string \| number | `null` |
| `round` | `round` | `round` | boolean | `true` |
| `zIndex` | `z-index` | `zIndex` | number | `100` |
| `draggable` | `draggable` | `draggable` | boolean | `false` |
| `overlay` | `overlay` | `overlay` | boolean | `true` |
| `closeOnClickOverlay` | `close-on-click-overlay` | `closeOnClickOverlay` | boolean | `true` |
| `rootPortal` | `root-portal` | `rootPortal` | boolean | `false` |
| `lockScroll` | `lock-scroll` | `lockScroll` | boolean | `true` |
| `minDragHeight` | `min-drag-height` | `minDragHeight` | number | `0` |
| `maxDragHeight` | `max-drag-height` | `maxDragHeight` | number | `0` |
| `lockMaxDrag` | `lock-max-drag` | `lockMaxDrag` | boolean | `false` |
| `midDragHeight` | `mid-drag-height` | `midDragHeight` | number | `0` |
| `closeDragHeight` | `close-drag-height` | `closeDragHeight` | number | `0` |
| `defaultDragPosition` | `default-drag-position` | `defaultDragPosition` | `middle` \| `min` \| `max` | `middle` |
| `fullCoverView` | `full-cover-view` | `fullCoverView` | boolean | `false` |

For default-true booleans, use `show-close="false"`, `round="false"`, `overlay="false"`, `close-on-click-overlay="false"`, or `lock-scroll="false"` to disable. Earlier lowercased aliases remain supported for compatibility.

## Events

| Event | Detail |
| --- | --- |
| `close` | none |
| `click-overlay` | none |
| `before-enter` | none |
| `enter` | none |
| `after-enter` | none |
| `before-leave` | none |
| `leave` | none |
| `after-leave` | none |
| `drag-position` | `'max'`, `'mid'`, or `'min'` |

## Slots

| Slot | Description |
| --- | --- |
| default | Sheet content |
| `title` | Custom title content |

## CSS Parts

| Part | Description |
| --- | --- |
| `popup` | Inner `smart-popup` |
| `root` | Sheet root |
| `dragger` | Drag handle touch area |
| `dragger-node` | Drag handle bar |
| `header` | Header |
| `close-icon` | Close icon |
| `content` | Content area |

## Ray Differences

- Dragging uses Pointer Events instead of WXS touch handlers.
- `instanceId`, `rootPortal`, `fullCoverView`, and `nativeDisabled` are retained for API parity; browser platform behavior differs from miniapp runtime.
- Drag snap fallback values follow the source WXS implementation: max `0.8 * windowHeight`, middle `0.5 * windowHeight`, min `0.1 * windowHeight`.

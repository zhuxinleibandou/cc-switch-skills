# smart-popup Web Component

`smart-popup` is a zero-dependency Web Components port of `packages/popup`.

## Attributes and Properties

| React prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `show` | `show` | `show` | boolean | `false` |
| `duration` | `duration` | `duration` | number \| object JSON | `300` |
| `round` | `round` | `round` | boolean | `false` |
| `closeable` | `closeable` | `closeable` | boolean | `false` |
| `customStyle` | `custom-style` | `customStyle` | string | `''` |
| `overlayStyle` | `overlay-style` | `overlayStyle` | string | `''` |
| `transition` | `transition` | `transition` | string | `''` |
| `zIndex` | `z-index` | `zIndex` | number | `100` |
| `overlay` | `overlay` | `overlay` | boolean | `true` |
| `closeIcon` | `close-icon` | `closeIcon` | string | X mark SVG path |
| `closeIconAriaLabel` | `close-icon-aria-label` | `closeIconAriaLabel` | string | `''` |
| `closeIconPosition` | `close-icon-position` | `closeIconPosition` | string | `top-right` |
| `closeOnClickOverlay` | `close-on-click-overlay` | `closeOnClickOverlay` | boolean | `true` |
| `position` | `position` | `position` | string | `center` |
| `safeAreaInsetBottom` | `safe-area-inset-bottom` | `safeAreaInsetBottom` | boolean | `false` |
| `safeAreaInsetBottomMin` | `safe-area-inset-bottom-min` | `safeAreaInsetBottomMin` | number | `0` |
| `safeAreaInsetTop` | `safe-area-inset-top` | `safeAreaInsetTop` | boolean | `false` |
| `safeAreaTabBar` | `safe-area-tab-bar` | `safeAreaTabBar` | boolean | `false` |
| `lockScroll` | `lock-scroll` | `lockScroll` | boolean | `true` |
| `rootPortal` | `root-portal` | `rootPortal` | boolean | `false` |
| `fullCoverView` | `full-cover-view` | `fullCoverView` | boolean | `false` |
| `nativeDisabled` | `native-disabled` | `nativeDisabled` | boolean | `false` |

For default-true booleans such as `overlay`, `closeOnClickOverlay`, and `lockScroll`, use `overlay="false"` to disable.

## Events

| Event | Detail |
| --- | --- |
| `before-enter` | none |
| `enter` | none |
| `after-enter` | none |
| `before-leave` | none |
| `leave` | none |
| `after-leave` | none |
| `click-overlay` | none |
| `close` | none |

## Slots

| Slot | Description |
| --- | --- |
| default | Popup content |

## CSS Parts

| Part | Description |
| --- | --- |
| `host` | Fixed host layer |
| `overlay` | Overlay layer |
| `popup` | Popup content layer |
| `close-icon` | Close icon |

## Ray Differences

- `rootPortal`, `fullCoverView`, and `nativeDisabled` are retained as API no-ops or styling hooks because those miniapp platform features do not exist in browsers.
- `safeAreaInsetBottom` uses the numeric `safeAreaInsetBottomMin` value. Native miniapp safe-area probing is not available.
- Transition events are dispatched as browser `CustomEvent`s with the same event names as the Ray component.

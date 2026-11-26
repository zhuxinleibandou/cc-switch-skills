# smart-slider Web Component

`smart-slider` is a zero-dependency Web Components port of `node_modules/@ray-js/components-ty-slider`.
## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `barStyle` | `bar-style` | `barStyle` | object/string | - |
| `className` | `class-name` | `className` | - | - |
| `defaultValue` | `default-value` | `defaultValue` | number | `0` |
| `disabled` | `disabled` | `disabled` | boolean | `false` |
| `enableTouch` | `enable-touch` | `enableTouch` | boolean | `true` |
| `hideThumbButton` | `hide-thumb-button` | `hideThumbButton` | boolean | `false` |
| `isShowTicks` | `is-show-ticks` | `isShowTicks` | boolean | `false` |
| `isVertical` | `is-vertical` | `isVertical` | boolean | `false` |
| `max` | `max` | `max` | number | `100` |
| `maxTrackColor` | `max-track-color` | `maxTrackColor` | string | `rgba(0,0,0,.1)` |
| `maxTrackHeight` | `max-track-height` | `maxTrackHeight` | string/number | `4px` |
| `maxTrackRadius` | `max-track-radius` | `maxTrackRadius` | string/number | `4px` |
| `maxTrackTickColor` | `max-track-tick-color` | `maxTrackTickColor` | string | `#158CFB` |
| `maxTrackWidth` | `max-track-width` | `maxTrackWidth` | string/number | `100%` |
| `min` | `min` | `min` | number | `0` |
| `minTrackColor` | `min-track-color` | `minTrackColor` | string | `#158CFB` |
| `minTrackHeight` | `min-track-height` | `minTrackHeight` | string/number | `4px` |
| `minTrackRadius` | `min-track-radius` | `minTrackRadius` | string/number | `inherit` |
| `minTrackTickColor` | `min-track-tick-color` | `minTrackTickColor` | string | `#fff` |
| `minTrackWidth` | `min-track-width` | `minTrackWidth` | string/number | `28px` |
| `parcel` | `parcel` | `parcel` | boolean | `false` |
| `parcelMargin` | `parcel-margin` | `parcelMargin` | number | `0` |
| `step` | `step` | `step` | number | `1` |
| `thumbBorderStyle` | `thumb-border-style` | `thumbBorderStyle` | string | `0px solid #ffffff` |
| `thumbBoxShadowStyle` | `thumb-box-shadow-style` | `thumbBoxShadowStyle` | string | ty-slider default |
| `thumbColor` | `thumb-color` | `thumbColor` | string | `#fff` |
| `thumbHeight` | `thumb-height` | `thumbHeight` | string/number | `28px` |
| `thumbRadius` | `thumb-radius` | `thumbRadius` | string/number | `28px` |
| `thumbStyle` | `thumb-style` | `thumbStyle` | object/string | - |
| `thumbWidth` | `thumb-width` | `thumbWidth` | string/number | `28px` |
| `trackStyle` | `track-style` | `trackStyle` | object/string | - |
| `value` | `value` | `value` | number | `defaultValue` |

## Events

| Event | Description |
| --- | --- |
| `before-change` | Drag/click start value, equivalent to `onBeforeChange` |
| `change` | Current value while dragging or touch-jumping, equivalent to `onChange` |
| `after-change` | Final value on pointer up, equivalent to `onAfterChange` |
| `start` | Inner SJS-compatible detail `{ value, end, min, max }` |
| `end` | Inner SJS-compatible detail `{ value, end, min, max }` |

## Slots

| Slot | Description |
| --- | --- |
| `bar` | Bar content |
| `track` | Track content |
| `thumb` | Thumb content |
| `button` | Compatibility alias for thumb content |

## CSS Parts

| Part | Description |
| --- | --- |
| `root` | Wrapper |
| `track` | Max track |
| `bar` | Active min track |
| `thumb-wrap` | Thumb wrapper |
| `thumb` | Thumb renderer |

## Miniapp Differences

- Browser events are dispatched as `CustomEvent` with `bubbles: true` and `composed: true`.
- The browser port uses Pointer Events instead of SJS touch handlers.
- `trackBackgroundColorHueEventName`, vibration, and Ray eventChannel behavior are no-ops in the browser port.

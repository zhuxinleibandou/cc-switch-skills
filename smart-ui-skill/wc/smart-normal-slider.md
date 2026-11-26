# smart-normal-slider Web Component

`smart-normal-slider` is a zero-dependency Web Components port of `packages/normal-slider`.
## Attributes and Properties

HTML attributes follow the README prop names. JS properties use camelCase.

| README prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `activeStepStyle` | `active-step-style` | `activeStepStyle` | - | - |
| `barStyle` | `bar-style` | `barStyle` | - | - |
| `className` | `class-name` | `className` | - | - |
| `direction` | `direction` | `direction` | - | - |
| `disable` | `disable` | `disable` | - | - |
| `enableTouch` | `enable-touch` | `enableTouch` | - | - |
| `enableTouchBar` | `enable-touch-bar` | `enableTouchBar` | - | - |
| `hidden` | `hidden` | `hidden` | - | - |
| `hideBarOnFirstRender` | `hide-bar-on-first-render` | `hideBarOnFirstRender` | - | - |
| `hideThumb` | `hide-thumb` | `hideThumb` | - | - |
| `hideThumbButton` | `hide-thumb-button` | `hideThumbButton` | - | - |
| `hotAreaStyle` | `hot-area-style` | `hotAreaStyle` | - | - |
| `instanceId` | `instance-id` | `instanceId` | - | - |
| `max` | `max` | `max` | - | - |
| `min` | `min` | `min` | - | - |
| `parcel` | `parcel` | `parcel` | - | - |
| `parcelMargin` | `parcel-margin` | `parcelMargin` | - | - |
| `parcelThumbHeight` | `parcel-thumb-height` | `parcelThumbHeight` | - | - |
| `parcelThumbWidth` | `parcel-thumb-width` | `parcelThumbWidth` | - | - |
| `reverse` | `reverse` | `reverse` | - | - |
| `showSteps` | `show-steps` | `showSteps` | - | - |
| `showText` | `show-text` | `showText` | - | - |
| `step` | `step` | `step` | - | - |
| `stepStyle` | `step-style` | `stepStyle` | - | - |
| `textStyle` | `text-style` | `textStyle` | - | - |
| `textTemplate` | `text-template` | `textTemplate` | - | - |
| `thumbHeight` | `thumb-height` | `thumbHeight` | - | - |
| `thumbStyle` | `thumb-style` | `thumbStyle` | - | - |
| `thumbStyleCalc` | `thumb-style-calc` | `thumbStyleCalc` | - | - |
| `thumbStyleRenderFormatter` | `thumb-style-render-formatter` | `thumbStyleRenderFormatter` | - | - |
| `thumbStyleRenderValueReverse` | `thumb-style-render-value-reverse` | `thumbStyleRenderValueReverse` | - | - |
| `thumbStyleRenderValueScale` | `thumb-style-render-value-scale` | `thumbStyleRenderValueScale` | - | - |
| `thumbStyleRenderValueStart` | `thumb-style-render-value-start` | `thumbStyleRenderValueStart` | - | - |
| `thumbWidth` | `thumb-width` | `thumbWidth` | - | - |
| `thumbWrapStyle` | `thumb-wrap-style` | `thumbWrapStyle` | - | - |
| `trackStyle` | `track-style` | `trackStyle` | - | - |
| `value` | `value` | `value` | - | - |
| `disabled` | `disabled` | `disabled` | - | - |
| `activeColor` | `active-color` | `activeColor` | - | - |
| `inactiveColor` | `inactive-color` | `inactiveColor` | - | - |

## Events

| Event | Description |
| --- | --- |
| `change` | Browser CustomEvent |
| `end` | Browser CustomEvent |
| `start` | Browser CustomEvent |

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

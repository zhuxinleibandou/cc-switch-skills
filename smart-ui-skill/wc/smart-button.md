# smart-button Web Component

`smart-button` is a zero-dependency Web Components port of `packages/button`. Load `smart-icon.js` and `smart-loading.js` before this file when using icon or loading states.

## Attributes and Properties

| React prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `formType` | `form-type` | `formType` | string | `''` |
| `icon` | `icon` | `icon` | string | `''` |
| `rightIcon` | `right-icon` | `rightIcon` | string | `''` |
| `classPrefix` | `class-prefix` | `classPrefix` | string | `smart-icon` |
| `plain` | `plain` | `plain` | boolean | `false` |
| `block` | `block` | `block` | boolean | `false` |
| `round` | `round` | `round` | boolean | `false` |
| `square` | `square` | `square` | boolean | `false` |
| `loading` | `loading` | `loading` | boolean | `false` |
| `hairline` | `hairline` | `hairline` | boolean | `false` |
| `disabled` | `disabled` | `disabled` | boolean | `false` |
| `loadingText` | `loading-text` | `loadingText` | string | `''` |
| `customStyle` | `custom-style` | `customStyle` | string | `''` |
| `textStyle` | `text-style` | `textStyle` | string | `''` |
| `loadingType` | `loading-type` | `loadingType` | string | `circular` |
| `type` | `type` | `type` | string | `default` |
| `dataset` | `dataset` | `dataset` | object / JSON string | `null` |
| `size` | `size` | `size` | string | `normal` |
| `loadingSize` | `loading-size` | `loadingSize` | string | `20px` |
| `color` | `color` | `color` | string | `''` |
| `buttonId` | `button-id` | `buttonId` | string | `''` |
| `openType` | `open-type` | `openType` | string | `''` |
| `getUserProfileDesc` | `get-user-profile-desc` | `getUserProfileDesc` | string | `''` |
| `lang` | `lang` | `lang` | string | `en` |
| `ariaLabel` | `aria-label` | `ariaLabel` | string | `''` |

## Events

| Event | Detail |
| --- | --- |
| `click` | `{ originalEvent, dataset }`; not emitted when `disabled` or `loading` |
| `getuserinfo` | Browser fallback result for `openType: "getUserInfo"` |

## Slots

| Slot | Description |
| --- | --- |
| default | Button text/content |

## CSS Parts

| Part | Description |
| --- | --- |
| `button` | Native button |
| `content` | Inner content wrapper |
| `text` | Text wrapper |

## Ray Differences

- Miniapp open capabilities are not available in browsers. `openType="getUserInfo"` emits a fallback `getuserinfo` event.
- HTML attributes match the README prop names, for example `loadingText` -> `loading-text`. The earlier lowercased aliases remain supported for compatibility.

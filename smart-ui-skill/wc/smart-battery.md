# smart-battery Web Component

`smart-battery` is a zero-dependency Web Components port of `packages/battery`.

## Attributes and Properties

| React prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `type` | `type` | `type` | `vertical` \| `horizontal` | `vertical` |
| `size` | `size` | `size` | number | `24` |
| `value` | `value` | `value` | number | `70` |
| `highColor` | `high-color` | `highColor` | string | CSS variable fallback |
| `middleColor` | `middle-color` | `middleColor` | string | `#ffcb00` |
| `lowColor` | `low-color` | `lowColor` | string | `#ee652e` |
| `chargingColor` | `charging-color` | `chargingColor` | string | `#2fc755` |
| `inCharging` | `in-charging` | `inCharging` | boolean | `false` |
| `backgroundColor` | `background-color` | `backgroundColor` | string | CSS variable fallback |
| `color` | `color` | `color` | string | auto by value |
| `showText` | `show-text` | `showText` | boolean | `false` |
| `onCalcColor` | - | `onCalcColor` | function | `null` |

`value` is clamped to `0-100` for the fill percentage. Displayed text keeps the raw `value`, matching the Ray component.

## CSS Parts

| Part | Description |
| --- | --- |
| `root` | Outer wrapper |
| `container` | Fixed-size container |
| `battery` | Scaled battery body plus terminal |
| `body` | Battery body |
| `bar` | Filled battery value |
| `charging-icon` | Lightning icon |
| `zero` | Zero-power slash |
| `dot` | Battery terminal |
| `text` | Percentage text |

## Ray Differences

- The charging icon is rendered as an internal data SVG background.
- Browser CSS uses `env(safe-area-inset-*)` only where applicable; no miniapp runtime APIs are required.

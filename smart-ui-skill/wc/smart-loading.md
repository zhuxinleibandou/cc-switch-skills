# smart-loading Web Component

`smart-loading` is a zero-dependency Web Components port of `packages/loading`.

## Attributes and Properties

| React prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `color` | `color` | `color` | string | `var(--loading-spinner-color, #1989FA)` |
| `vertical` | `vertical` | `vertical` | boolean | `false` |
| `type` | `type` | `type` | string | `circular` |
| `size` | `size` | `size` | string \| number | `30` |
| `textSize` | `text-size` | `textSize` | string \| number | CSS variable fallback |
| `iconColor` | `icon-color` | `iconColor` | string | `color` |

## Slots

| Slot | Description |
| --- | --- |
| default | Loading text |

## CSS Parts

| Part | Description |
| --- | --- |
| `root` | Root loading wrapper |
| `spinner` | Rotating icon |
| `text` | Text wrapper |

## Ray Differences

- The Web version draws the spinner inline with SVG/CSS instead of generating miniapp image data URLs.
- Numeric `size` and `textSize` values are normalized to `px`.

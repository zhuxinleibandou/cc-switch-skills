# smart-icon Web Component

`smart-icon` is a zero-dependency Web Components port of `packages/icon`.

## Attributes and Properties

| React prop | HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- | --- |
| `dot` | `dot` | `dot` | boolean | `false` |
| `info` | `info` | `info` | string \| number | `null` |
| `size` | `size` | `size` | string \| number | `inherit` |
| `color` | `color` | `color` | string | `inherit` |
| `customStyle` | `custom-style` | `customStyle` | string | `''` |
| `classPrefix` | `class-prefix` | `classPrefix` | string | `smart-icon` |
| `name` | `name` | `name` | string | `''` |
| `ariaLabel` | `aria-label` | `ariaLabel` | string | `''` |
| `ariaRole` | `aria-role` | `ariaRole` | string | `''` |

Boolean attributes follow HTML rules: present means `true`, absent means `false`.

## Events

| Event | Detail |
| --- | --- |
| `click` | Original click event |

## CSS Parts

| Part | Description |
| --- | --- |
| `root` | Icon wrapper |
| `svg` | SVG or SVG path renderer |
| `image` | Image renderer |
| `font` | Custom font renderer |
| `info` | Badge node |

## Ray Differences

- The Web version accepts SVG markup, SVG path data, image URLs, and data image URLs directly.
- `customStyle` is applied as inline CSS on the internal root.
- Miniapp `smart-info` is inlined as a small badge implementation.

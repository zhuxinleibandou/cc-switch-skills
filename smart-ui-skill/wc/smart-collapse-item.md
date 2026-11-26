# smart-collapse-item Web Component

Child component for `smart-collapse`.

## Attributes

| Attribute | Type | Default |
| --- | --- | --- |
| `border` | boolean | `true` |
| `clickable` | boolean | `false` |
| `disabled` | boolean | `false` |
| `icon` | string | `''` |
| `is-link` | boolean | `true` |
| `label` | string | `''` |
| `name` | string or number | item index |
| `size` | `large` or empty | `''` |
| `title` | string | `''` |
| `value` | string | `''` |

## Slots

The default slot is panel content. Named slots are `title`, `icon`, `value`, and `right-icon`.

## CSS parts

`root`, `title`, `wrapper`, and `content` are exposed. Source CSS variables such as `--collapse-item-transition-duration`, `--collapse-item-content-padding`, and disabled/content colors are preserved.

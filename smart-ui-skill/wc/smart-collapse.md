# smart-collapse Web Component

Zero-dependency Web Component port of `packages/collapse`.

## Attributes and properties

| HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- |
| `accordion` | `accordion` | boolean | `false` |
| `border` | `border` | boolean | `true` |
| `value` | `value` | array, string, or number | `[]` / `''` |

Array values use JSON in markup:

```html
<smart-collapse value='["first"]'>...</smart-collapse>
```

## Events

| Event | `detail` |
| --- | --- |
| `open` | Opened item name. |
| `close` | Closed item name. |
| `change` | Next active name or names. |
| `input` | Next active name or names. |

The Web Component reflects the next value immediately and also emits the source-compatible events, so controlled and standalone usage both work.

## Slots and CSS parts

The default slot accepts `smart-collapse-item` children. The root is exposed as `part="root"`.

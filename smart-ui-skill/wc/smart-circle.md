# smart-circle Web Component

Zero-dependency Canvas port of `packages/circle` and its `index.rjs` renderer.

## Attributes and properties

| HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- |
| `angle-offset` | `angleOffset` | number | `-1` |
| `custom-style` | - | string | `''` |
| `fill-color` | `fillColor` | string | `#007AFF` |
| `fill-color-stops` | `fillColorStops` | JSON object | - |
| `mask-color` | `maskColor` | string | `transparent` |
| `mode` | `mode` | `basic \| angle \| angle2` | `basic` |
| `percent` | `percent` | number | `0` |
| `round` | `round` | boolean | `true` |
| `size` | `size` | string or number | `100px` |
| `track-color` | `trackColor` | string | `#d3d3d3` |
| `track-width` | `trackWidth` | number | `10` |

`fill-color-stops` accepts the same percentage-keyed object as the miniapp component:

```html
<smart-circle fill-color-stops='{"0%":"#2361DE","50%":"#23DEB5"}'></smart-circle>
```

## Slots and CSS parts

The default slot is centered over the canvas. The exposed parts are `root`, `canvas`, and `content`.

## Browser adaptation

The miniapp RJS canvas algorithm is retained, including the default 1-degree `angle` offset, 36-degree `angle2` offset, horizontal gradient stops, line caps, and percent clamping. The canvas backing store uses `window.devicePixelRatio` for sharp rendering.

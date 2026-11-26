# smart-divider Web Component

Zero-dependency Web Component port of `packages/divider`.

## Attributes and properties

| HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- |
| `border-color` | `borderColor` | CSS color | theme value |
| `content-position` | `contentPosition` | `left \| center \| right` | `''` |
| `custom-style` | `customStyle` | string | `''` |
| `dashed` | `dashed` | boolean | `false` |
| `font-size` | `fontSize` | CSS size | theme value |
| `hairline` | `hairline` | boolean | `false` |
| `text-color` | `textColor` | CSS color | theme value |

The default slot supplies divider content.

## CSS variables and parts

The source variables `--divider-margin`, `--divider-text-color`, `--divider-font-size`, `--divider-line-height`, `--divider-border-color`, `--divider-content-padding`, `--divider-content-left-width`, and `--divider-content-right-width` are preserved. The root is exposed as `part="root"`.

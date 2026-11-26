# smart-count-down Web Component

Zero-dependency Web Component port of `packages/count-down`.

## Attributes and properties

| HTML attribute | JS property | Type | Default |
| --- | --- | --- | --- |
| `auto-start` | `autoStart` | boolean | `true` |
| `format` | `format` | string | `HH:mm:ss` |
| `millisecond` | `millisecond` | boolean | `false` |
| `time` | `time` | number | `0` |
| `use-slot` | `useSlot` | boolean | `false` |

## Methods

| Method | Description |
| --- | --- |
| `start()` | Starts or resumes the countdown. |
| `pause()` | Pauses at the current remaining time. |
| `reset()` | Restores `time` and follows `auto-start`. |

## Events

| Event | `detail` |
| --- | --- |
| `change` | `{ days, hours, minutes, seconds, milliseconds }`; emitted only with `use-slot`. |
| `finish` | `undefined` when the remaining time reaches zero. |

## Formatting

Supported tokens are `DD`, `HH`, `mm`, `ss`, and `SSS`. Omitted larger units roll into the next available unit exactly as in `packages/count-down/utils.ts`.

The root, formatted text, and slot wrappers are exposed as `root`, `text`, and `slot` CSS parts. Source variables `--count-down-text-color`, `--count-down-font-size`, and `--count-down-line-height` are preserved.

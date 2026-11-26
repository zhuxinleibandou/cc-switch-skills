# smart-toast Web Component

Zero-dependency Web Component port of `packages/toast`. Load `smart-loading.js` before `smart-toast.js`.

## Attributes

| Attribute | Type | Default |
| --- | --- | --- |
| `show` | boolean | `false` |
| `type` | `text \| html \| loading \| success \| fail \| warn` | `text` |
| `message` | string | `''` |
| `duration` | number | `2000` |
| `mask` | boolean | `false` |
| `forbid-click` | boolean | `false` |
| `loading-type` | `circular \| spinner` | `circular` |
| `position` | `top \| middle \| bottom` | `middle` |
| `width` | number or CSS size | automatic |
| `z-index` | number | `1000` |
| `text-color` | CSS color | inherited |
| `icon-color` | CSS color | `white` |

## Element methods

| Method | Description |
| --- | --- |
| `show(optionsOrMessage)` | Shows the toast and starts its timer. |
| `setData(partialOptions)` | Updates a visible toast. |
| `clear()` | Hides the toast and runs `onClose`. |

## ToastInstance helper

Loading `smart-toast.js` exposes `window.ToastInstance`, matching the miniapp helper API:

```js
ToastInstance('Message');
ToastInstance.loading({ message: 'Loading...', forbidClick: true });
ToastInstance.success('Saved');
ToastInstance.fail('Failed');
ToastInstance.warn('Warning');
ToastInstance.clear();
```

`setDefaultOptions(options)` and `resetDefaultOptions()` are also supported.

## Events and slots

- `close` fires after a visible toast is cleared.
- The default slot appends custom content inside the toast.

## CSS parts

`root`, `container`, and `backdrop` are exposed as CSS parts. Toast variables from `packages/toast/README.md`, including `--toast-background-color`, `--toast-border-radius`, and size variables, are preserved.

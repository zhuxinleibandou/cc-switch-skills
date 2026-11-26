# 彩光与白光亮度统一（颜色解析）

在 Matter 面板下，标准 HSV 的 Value（V）来自 bright_value；Hue/Saturation（H/S）来自 hs_color_set。为保证不同设备能力下的解析准确性，解析时需传入设备信息。

示例（示意）：
```ts
// 解析颜色数据（结合设备能力与亮度）
const colourData = matterDpKit.resolveColorData({
  colourData: colour_data_origin, // { hue, saturation, value }
  brightValue: Number(bright_value),
  devInfo: devices.common.getDevInfo(),
});
```

建议：
- 优先使用 useColourData 钩子获取标准 HSV，统一彩光与白光亮度来源，减少 UI 与状态不一致。
- 在 UI 渲染时确保亮度（V）与颜色（H/S）来源一致，避免彩光亮度与白光亮度互相覆盖。
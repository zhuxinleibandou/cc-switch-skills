# 常见坑位与排查

本文汇总 Matter 面板适配过程中的高发问题及解决方案，建议在联调与回归阶段逐项自检。

## 1) 3 路 Matter 不存在白光
- 现象：白光 Tab 展示后无效或产生混乱。
- 原因：3 路 Matter 面板不包含白光能力。
- 自检：
```ts
const isMatterPanel = matterDpKit.utils.checkIsMatterPanel(dpSchema);
const isMatterHasWhite = matterDpKit.utils.checkIsMatterHasWhite(dpSchema);
const whiteTabHidden = isMatterPanel ? !isMatterHasWhite : (!support.isSupportBright() && !support.isSupportTemp());
```
- 处理：在 Matter 场景下用 `checkIsMatterHasWhite` 控制白光 Tab，不要强开。

## 2) 3/4 路区分错误（是否存在 bright_value）
- 现象：情景页/编辑页切换逻辑异常。
- 原因：路数判定规则未遵循 Matter 能力组合。
- 自检要点：
  - 4 路：包含 `hs_color_set + brightness_control + bright_value`
  - 3 路：包含 `hs_color_set + brightness_control`
- 处理：一律通过 `matterDpKit.utils.getMatterRoad(dpSchema)` 获取路数。

## 3) 颜色解析不准确（V 值来源不统一）
- 现象：彩光亮度与白光亮度不一致，或切换彩/白光后亮度跳变。
- 原因：HSV 的 V 未统一来自 `bright_value`，或解析时缺少设备能力信息。
- 修复示例：
```ts
// 推荐使用 useColourData
const colorData = useColourData(); // { hue, saturation, value }

// 或手动解析
const colourData = matterDpKit.resolveColorData({
  colourData: colour_data_origin,
  brightValue: Number(bright_value),
  devInfo: devices.common.getDevInfo(),
});
```

## 4) 色温滑动条精度丢失
- 现象：色温在 UI 上与设备回包存在微小偏差。
- 原因：色温映射存在非线性换算与取整。
- 建议：
```ts
const originTemp = matterDpKit.hooks.useOriginMatterTemp();
```
在 UI 展示使用原始 `color_temp_control` 值，减少显示误差。

## 5) 发布链路回环、卡顿或二次上报
- 现象：调节亮度或颜色时 UI 抖动、状态回退。
- 原因：未启用乐观更新或未忽略关键回包；拦截器顺序错误。
- 修复清单：
```ts
// 1) 启用乐观更新
sendDpOption: {
  immediate: true,
  // 按需忽略 DP 回应，示例包含彩/白光相关 DP
  whiteDpCodes: [
    dpCodes?.countdown,
    dpCodes?.switch_led,
    matterDpKit.dpCodes.switch as any,
    matterDpKit.dpCodes.brightness_control as any,
  ].filter(Boolean),
},

// 2) 发布链路顺序（dp-kit 在前，matter-kit 在后）
request: {
  publishDps: [
    ...dpKit.interceptors.request.publishDps,
    ...matterDpKit.interceptors.request.publishDps,
  ],
},
```

## 6) 拦截器顺序不当导致状态不一致
- 原则：先走标准协议（dp-kit），再由 matter-kit 完成协议转换。
- 自检：确保所有发布链路均保持该顺序（含群组/子页面模块）。

## 7) 调试与日志
- `createMatterKit({ debug: true })` 在联调阶段打开，生产关闭以减少性能影响。
- 配合版本：`@ray-js/panel-sdk >= 1.15.0`。

## 8) 注意事项速览
1. 色温转换可能丢失精度，UI 展示请用 `useOriginMatterTemp()`。
2. 与 dp-kit 协同时务必注意拦截器顺序。
3. schema 转换会新增标准 DP（switch_led/bright_value 等）并保留原始 Matter DP（switch/brightness_control 等）以便路数判断。
4. 生产环境建议关闭 debug，避免日志过多。

---

更多上下文：
- 发布链路与高级配置：`docs/11-interceptor-order.md`
- 白光/路数 UI 决策：`docs/12-ui-white-tab.md`
- 颜色解析：`docs/09-color-parsing.md`
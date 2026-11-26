# Matter 适配工程检查清单

在同一工程需同时兼容标准设备与 Matter 设备时，请逐项完成以下适配任务，确保 UI 与状态一致、交互流畅、组合场景可靠。

## 1. 设备层集成 matter-kit 与拦截器
- 在 `src/devices/index.ts` 中引入 `createMatterKit` 并配置拦截器；拦截器顺序为“dp-kit 在前、matter-kit 在后”。
- 启用乐观更新（`sendDpOption.immediate: true`）与按需忽略回包（`whiteDpCodes`），避免亮度循环与 UI 抖动。
- `SmartSupportAbility` 需接入 `resolveMatterDevInfo`，基于 Matter schema 生成标准 schema（为路数与白光能力判定奠定基础）。

参考：`docs/11-interceptor-order.md`

## 2. 白光 Tab 展示判定
- 使用 `checkIsMatterPanel + checkIsMatterHasWhite` 共同判定是否展示白光 Tab。
- 注意：3 路 Matter 不支持白光 Tab，不要强行开启。

参考：`docs/12-ui-white-tab.md`

## 3. 情景数据集按路数切换
- 使用 `checkIsMatterPanel + getMatterRoad` 获取路数后，切换情景数据集：
  - 5 -> 白光场景 + 彩光场景
  - 4 -> 亮度场景 + 彩光场景
  - 3 -> 彩光场景
  - 2 -> 白光场景
  - 1 -> 亮度场景

参考：`docs/08-ui-road.md`, `docs/12-ui-white-tab.md`

## 4. 彩光亮度等于白光亮度（颜色解析统一）
- 在 Matter 面板下，HSV 的 V 来自 `bright_value`；解析颜色时需传入 `devInfo` 保证能力适配。
- 优先使用 `useColourData` 钩子统一来源，减少 UI 不一致与循环触发。

参考：`docs/09-color-parsing.md`

## 5. 路数获取逻辑在 Matter 下的替换
- 若工程已有 `useLampRoad` 或类似的路数判断逻辑，需在 Matter 设备下改为 `getMatterRoad`；入口统一用 `checkIsMatterPanel` 做分支。

参考：`docs/08-ui-road.md`

## 自检建议
- 发布链路与拦截器顺序是否正确（dp-kit 在前、matter-kit 在后）。
- 白光 Tab 与情景页是否随路数/能力正确切换（3 路不展示白光）。
- 彩光亮度与白光亮度是否一致（解析是否传入了 `bright_value` 与 `devInfo`）。
- 路数判定是否在 Matter 面板下走 `getMatterRoad`。
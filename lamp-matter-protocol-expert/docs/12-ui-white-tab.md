# 白光支持与路数判定（UI 决策依据）

在 Matter 面板场景下，白光支持与路数判定直接影响 UI 的结构与数据集。建议统一通过 `checkIsMatterPanel + getMatterRoad` 做决策，并结合 `checkIsMatterHasWhite` 控制白光 Tab 是否展示。

## 白光 Tab 判定（3 路 Matter 无白光）
```ts
// src/pages/home/supports.ts（示意）
const dpSchema = devices.common.getDpSchema();
const isMatterPanel = matterDpKit.utils.checkIsMatterPanel(dpSchema);
const isSupportWhite = isMatterPanel
  ? matterDpKit.utils.checkIsMatterHasWhite(dpSchema)
  : support.isSupportDp(dpCodes.bright_value);
```

## 情景页数据集切换（按路数映射）
```ts
// src/pages/home/index.tsx（示意）
const dpSchema = devices.common.getDpSchema();
const isMatterPanel = matterDpKit.utils.checkIsMatterPanel(dpSchema);
if (isMatterPanel) {
  const matterRoad = matterDpKit.utils.getMatterRoad(dpSchema);
  // 5 -> 白光场景 + 彩光场景
  // 4 -> 亮度场景 + 彩光场景
  // 3 -> 彩光场景
  // 2 -> 白光场景
  // 1 -> 亮度场景
}
```

## 情景编辑页隐藏白光 Tab（3 路不展示）
```ts
// src/pages/SceneEdit/ColorPanel/index.tsx（示意）
const isMatterPanel = matterDpKit.utils.checkIsMatterPanel(dpSchema);
const isMatterHasWhite = matterDpKit.utils.checkIsMatterHasWhite(dpSchema);
const whiteTabHidden = isMatterPanel
  ? !isMatterHasWhite
  : (!support.isSupportBright() && !support.isSupportTemp());
```

## 统一策略建议
- 始终用 `checkIsMatterPanel` 作为入口，避免非 Matter 设备误判。
- 路数判定统一走 `getMatterRoad`，确保 UI、情景数据、编辑页逻辑一致。
- 3 路 Matter 不支持白光 Tab：不要尝试通过设备能力绕过逻辑强行开启。
- 与 dp-kit 协作时，保持拦截器顺序为“dp-kit 在前、matter-kit 在后”，降低路数映射带来的状态不一致。
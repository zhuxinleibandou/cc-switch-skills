# 白光支持与路数判定（UI 决策依据）

## 白光 Tab 判定（3 路 Matter 无白光）
```ts
// src/pages/home/supports.ts
const dpSchema = devices.common.getDpSchema();
const isMatterPanel = matterDpKit.utils.checkIsMatterPanel(dpSchema);
const isSupportWhite = isMatterPanel
  ? matterDpKit.utils.checkIsMatterHasWhite(dpSchema)
  : support.isSupportDp(dpCodes.bright_value);
```

## 路数（1~5 路）判定逻辑
- 1 路：brightness_control
- 2 路：brightness_control + color_temp_control
- 3 路：hs_color_set + brightness_control
- 4 路：hs_color_set + brightness_control + bright_value
- 5 路：hs_color_set + brightness_control + color_temp_control

## 在 Hook 中使用
```ts
// src/hooks/useLampRoad.ts
const dpSchema = devices.common.getDpSchema();
const isMatterPanel = matterDpKit.utils.checkIsMatterPanel(dpSchema);
if (isMatterPanel) {
  const matterRoad = matterDpKit.utils.getMatterRoad(dpSchema);
  // 根据 matterRoad 决定 UI/场景数据（见下方示例）
}
```

## 情景页与编辑页（3 路 Matter 无白光）
- 情景页数据集切换（示例）：
```ts
// src/pages/home/index.tsx（示意）
const dpSchema = devices.common.getDpSchema();
const isMatterPanel = matterDpKit.utils.checkIsMatterPanel(dpSchema);
if (isMatterPanel) {
  const matterRoad = matterDpKit.utils.getMatterRoad(dpSchema);
  // 5->白光场景+彩光场景，4->亮度场景+彩光场景，3->彩光场景，2->白光场景，1->亮度场景
}
```

- 情景编辑页隐藏白光 Tab：
```ts
// src/pages/SceneEdit/ColorPanel/index.tsx（示意）
const isMatterPanel = matterDpKit.utils.checkIsMatterPanel(dpSchema);
const isMatterHasWhite = matterDpKit.utils.checkIsMatterHasWhite(dpSchema);
const whiteTabHidden = isMatterPanel ? !isMatterHasWhite : (!support.isSupportBright() && !support.isSupportTemp());
```
# 常用示例

本节收集常见场景的代码片段，帮助你快速落地。

## 获取设备路数与白光能力
```tsx
import { useDpSchema, createMatterKit } from '@ray-js/panel-sdk';
const matterKit = createMatterKit();
const dpSchema = useDpSchema();
const road = matterKit.utils.getMatterRoad(dpSchema);
const hasWhite = matterKit.utils.checkIsMatterHasWhite(dpSchema);
```

## 获取原始色温值（避免精度损失）
```tsx
const originTemp = matterKit.hooks.useOriginMatterTemp();
```

## 颜色数据处理（推荐用 useColourData）
```tsx
import { useColourData } from '@ray-js/panel-sdk';
const colorData = useColourData(); // { hue, saturation, value }
```

## 手动解析颜色数据
```tsx
const colorData = matterKit.resolveColorData({
  colourData: { hue, saturation, value: Number(bright) ?? 0 },
  brightValue: Number(bright) ?? 0,
  devInfo,
});
```

## 自定义转换条件
```ts
createMatterKit({
  shouldConvert: params => params.action === 'init',
});
```

## 开启调试模式
```ts
createMatterKit({ debug: true });
```
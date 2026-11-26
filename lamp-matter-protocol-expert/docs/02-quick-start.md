# 快速开始（核心片段）

本节提供最小可用代码片段，帮助你在面板中快速集成 matter-kit，并以“标准 DP”的方式进行开发。

## 生成 matter-kit
```ts
import { SmartDeviceModel, createMatterKit } from '@ray-js/panel-sdk';
import { defaultSchema } from '@/devices/schema';

type SmartDeviceSchema = typeof defaultSchema;

export const matterKit = createMatterKit({
  debug: false,
});

const options = {
  interceptors: matterKit.interceptors,
};

export const devices = {
  common: new SmartDeviceModel<SmartDeviceSchema>(options),
};
```

说明：
- 上述代码生成 matter-kit 并挂载默认拦截器，后续你可以在 SmartDeviceModel 上直接以“标准 DP”进行开发。
- 建议使用 @ray-js/panel-sdk >= 1.15.0；生产环境关闭 debug。

## 使用标准 DP（Matter 映射由拦截器完成）
```tsx
import React from 'react';
import { View } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';

export default function Home() {
  const power = useProps(p => p.switch_led);
  const bright = useProps(p => p.bright_value);
  const temp = useProps(p => p.temp_value);
  const colour = useProps(p => p.colour_data);
  const actions = useActions();

  return (
    <View>
      <View onClick={() => actions.switch_led.toggle()}>开关: {power ? '开' : '关'}</View>
      <View onClick={() => actions.bright_value.set(500)}>亮度: {bright}</View>
      <View onClick={() => actions.temp_value.set(600)}>色温: {temp}</View>
      <View onClick={() => actions.colour_data.set('012502ad02ee')}>颜色: {colour}</View>
    </View>
  );
}
```

要点：
- 代码层面仅读取/下发“标准 DP”（如 switch_led/bright_value/temp_value/colour_data）。
- Matter ↔ 标准 DP 的转换由 matter-kit 拦截器在链路中自动完成，减少业务改动量。
# 与 dp-kit 配合使用（拦截器顺序与高级配置）

- 建议在 publishDps 中先执行 dp-kit、再执行 matter-kit：
```ts
request: {
  publishDps: [
    ...dpKit.interceptors.request.publishDps,
    ...matterDpKit.interceptors.request.publishDps,
  ],
},
```
这样 dp-kit 先处理标准协议，再由 matter-kit 转换为 Matter 协议，避免数据不一致。

## 集成示例（包含乐观更新与能力接入）
```ts
// src/devices/index.ts（示意）
import {
  SmartDeviceModel,
  SmartGroupModel,
  SmartStorageAbility,
  SmartSupportAbility,
} from '@ray-js/panel-sdk';
import { createDpKit } from '@ray-js/panel-sdk';
import { createMatterKit } from '@ray-js/panel-sdk';
import { getLaunchOptionsSync } from '@ray-js/ray';
import dpCodes from '@/constant/dpCodes';
import { protocols } from '@/devices/protocols';

const isGroupDevice = !!getLaunchOptionsSync()?.query?.groupId;

export const matterDpKit = createMatterKit({
  debug: true,
});

export const dpKit = createDpKit({
  protocols,
  // 开启乐观更新，并按需忽略 DP 回应，避免亮度循环与 UI 卡顿
  sendDpOption: {
    immediate: true,
    whiteDpCodes: [
      dpCodes?.countdown,
      dpCodes?.switch_led,
      matterDpKit.dpCodes.switch as any,
      // 必须包含 brightness_control：为保证调节彩光亮度时，白光亮度能同步
      matterDpKit.dpCodes.brightness_control as any,
    ].filter(Boolean),
  },
});

const options = {
  abilities: [
    new SmartSupportAbility({
      // 基于 matter schema 生成标准 schema（路数/白光判断依赖）
      initDevInfo: matterDpKit.resolveMatterDevInfo,
    }),
    new SmartStorageAbility(),
  ],
  interceptors: {
    response: dpKit.interceptors.response,
    request: {
      publishDps: [
        ...dpKit.interceptors.request.publishDps,
        ...matterDpKit.interceptors.request.publishDps,
      ],
    },
    init: matterDpKit.interceptors.init,
  },
};

export const devices = {
  common: isGroupDevice
    ? new SmartGroupModel(options as any)
    : new SmartDeviceModel(options as any),
};
```

## 关键点说明
- 保持 DP 发布顺序一致（dp-kit 在前、matter-kit 在后），避免数据不一致与回环。
- sendDpOption.immediate: true 提供更顺滑的交互体验（本地 UI 先行）。
- sendDpOption.whiteDpCodes: 合理忽略彩光/白光相关的回包，避免彩光亮度与白光亮度循环触发。
- SmartSupportAbility.initDevInfo: 使用 resolveMatterDevInfo 基于 matter schema 生成标准 schema，以支持路数与白光能力判定。
- 生产环境建议关闭多余 debug，根据业务需要决定是否局部关闭乐观更新。
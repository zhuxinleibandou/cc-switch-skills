# 面板 SDK 与 matter-kit 集成指引（003/006 通用）

- 推荐版本：@ray-js/panel-sdk >= 1.15.0
- 拦截器顺序：dp-kit 在前、matter-kit 在后（先标准协议，再转换为 Matter）

## 初始化示例
```ts
// src/devices/index.ts
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
  // 003 建议：开启乐观更新并按需忽略 DP 回应，避免亮度循环与 UI 卡顿
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

> 注：示例中未包含任何本地绝对路径，请按项目结构将上述初始化逻辑放入合适的文件（例如 src/devices/index.ts），并结合自身工程调整。
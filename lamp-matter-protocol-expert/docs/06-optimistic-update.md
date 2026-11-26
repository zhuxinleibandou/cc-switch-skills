# 乐观更新与拦截器顺序

在多协议并存（标准/Matter）场景下，必须启用乐观更新，并严格配置拦截器顺序为 dp-kit 在前、matter-kit 在后。

## 必须开启乐观更新（Optimistic Update）
- 要求：为 dp-kit 启用乐观更新，避免二次上报、回环与界面卡顿。
- 版本要求：@ray-js/panel-sdk >= 1.15.0（及以上稳定版本）。
- 拦截器顺序：确保拦截器顺序为 dp-kit 在前、matter-kit 在后。

示例（简化伪代码，仅示意）：
```ts
import { createDpKit } from '@ray-js/panel-sdk';
import { createMatterKit } from '@ray-js/panel-sdk';

const dpKit = createDpKit({
  // 必须启用乐观更新：
  sendDpOption: {
    immediate: true,
    // 按需忽略白光相关回包，避免彩光/白光亮度循环
    whiteDpCodes: [],
  },
});

const matterKit = createMatterKit({
  // 其他 matter-kit 相关配置...
});

// 发布链路：dp-kit 在先，matter-kit 在后
const interceptors = [dpKit.interceptor, matterKit.interceptor];

// 在业务中，统一通过“标准 DP”作为入口进行发布与状态管理
// 如：power、bright_value、temp_value、colour_data 等
export function setupInterceptors(client) {
  interceptors.forEach(i => client.use(i));
}
```

说明：
- immediate: true 会在本地优先更新 UI 状态，提供更流畅的交互体验；
- whiteDpCodes 可避免设备回包再二次驱动 UI 导致的抖动与回环（结合项目 dpCodes 配置）；
- 保持 DP 发布顺序一致，生产环境请关闭多余 debug，结合业务需要再决定是否局部关闭乐观更新。

## 与 dp-kit 配合使用（拦截器顺序建议）
发布 DP 时的顺序建议如下：
```ts
request: {
  publishDps: [
    ...dpKit.interceptors.request.publishDps,
    ...matterKit.interceptors.request.publishDps,
  ],
},
```
这样 dp-kit 先处理标准协议，再由 matter-kit 转换为 Matter 协议，避免数据不一致。

## 总结建议
- 启用 sendDpOption.immediate 提升交互流畅度；
- 使用 whiteDpCodes 避免彩光亮度与白光亮度的循环触发；
- 发布 DP 时严格保持顺序（dp-kit 在前、matter-kit 在后）。
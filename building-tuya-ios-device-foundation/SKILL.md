---
name: building-tuya-ios-device-foundation
description: 为已接入 Tuya Smart App SDK 的 iOS ObjC 工程落地设备管理基础能力。适用于需要查询设备信息、监听设备状态（DP 更新/在线状态/移除）、执行设备操作（重命名/移除/恢复出厂/Wi-Fi 信号查询/数据导出）或实现设备共享（添加/查询/移除共享、邀请）的场景。
compatibility: iOS 11+, Objective-C, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为已接入 Tuya Smart App SDK 的 iOS ObjC 工程落地设备管理基础能力。涵盖设备信息与监听、设备操作（重命名/移除/恢复出厂）、设备共享三大模块。

核心类：
- **`ThingSmartDevice`**：单设备操作入口，通过 `[ThingSmartDevice deviceWithDeviceId:devId]` 获取。
- **`ThingSmartDeviceModel`**：设备数据模型，包含 devId、name、dps、isOnline、isLocalOnline、productId、iconUrl 等。
- **`ThingSmartDeviceDelegate`**：设备监听 delegate，提供 `dpsUpdate`、`deviceInfoUpdate`、`deviceRemoved` 等回调。
- **`ThingSmartHomeDelegate`**：家庭维度的设备变化回调（注意 SDK 中拼写为 `Deivice`，非笔误）。
- **`ThingSmartHomeDeviceShare`**：设备共享管理入口，最多 20 个用户。

## 适用场景 {#scene}

需要在已完成 SDK 集成、用户已登录、至少有一个家庭的工程中操作单个设备时使用。

**Phase 1 — 设备信息获取**：调用 `getHomeDataWithSuccess:failure:` 后，从 `ThingSmartHomeModel.deviceList` 获取 `ThingSmartDeviceModel` 列表；`[ThingSmartDevice deviceWithDeviceId:devId]` 创建设备操作实例；DP 数据直接从 `ThingSmartDeviceModel.dps`（NSDictionary）读取，无需额外查询。

**Phase 2 — 设备监听**：在 ViewController 或 ViewModel 初始化时设置 `device.delegate = self`；在 `dealloc` 或消失时 `device.delegate = nil`。

**Phase 3 — 设备操作**（按需选择）：

| 操作 | 方法 |
|---|---|
| 修改设备名称 | `updateName:success:failure:` |
| 移除设备 | `remove:failure:` |
| 恢复出厂设置 | `resetFactory:failure:` |
| 查询 Wi-Fi 信号 | `getWifiSignalStrengthWithSuccess:failure:` |
| 低功耗设备唤醒 | `lowPowerDeviceAwakeWithTimeout:handler:` |
| 导出设备信息 | `+exportDeviceDataForPrivacyWithDeviceIDs:success:failure:` |

**Phase 4 — 设备共享**（可选）：填写 `ThingSmartDeviceShareRequestModel` 后调用 `addDeviceShareWithRequestModel:success:failure:`；查询通过 `getShareMemberListWithSpaceId:` / `getReceiveMemberListWithSuccess:` 等；移除通过 `removeReceiveDeviceShareWithDevId:` / `removeDeviceShareWithMemberId:devId:`；邀请通过 `inviteShareWithCountryCode:userAccount:devId:` + `confirmInviteShareWithShareId:`。

详细 API 见 `references/device-management.md` 和 `references/device-sharing.md`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `building-tuya-ios-account-foundation` — 前置：账号体系
- `building-tuya-ios-home-foundation` — 前置：家庭基础能力
- `managing-tuya-ios-current-home` — 前置：当前家庭管理
- `managing-tuya-ios-device-list` — 后续：设备列表展示与交互

## 注意事项 {#tip}

- **`ThingSmartHomeDelegate` 中拼写为 `Deivice`**：`didAddDeivice:` 和 `didRemoveDeivice:` 是 SDK 固定拼写，实现 delegate 时必须照此拼写，否则回调不触发。
- **iOS `dpsUpdate` 参数是 NSDictionary**：与 Android 不同，iOS 回调直接给 NSDictionary，无需解析 JSON 字符串。
- **不要忘记置 nil delegate**：确保在 ViewController `dealloc` 前将 `device.delegate = nil`，避免野指针。
- **`isOnline` 是 BOOL 属性**：直接访问 `deviceModel.isOnline`，不是方法调用。
- **设备移除和恢复出厂不可撤销**：务必在 UI 层添加二次确认弹窗。
- **导出设备信息有频率限制**：单次最多 10 个设备，两次调用间隔至少 1 分钟。
- **共享设备上限 20 人**：超过限制 API 会报错，需提前校验。

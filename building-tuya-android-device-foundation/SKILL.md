---
name: building-tuya-android-device-foundation
description: 为已接入 Tuya Smart App SDK 的 Android Kotlin 工程落地设备管理基础能力。适用于需要查询设备信息、监听设备状态（DP 更新/在线状态/移除）、执行设备操作（重命名/移除/恢复出厂/Wi-Fi 信号查询/数据导出）或实现设备共享（添加/查询/移除共享、邀请、群组共享）的场景。
compatibility: Android, Kotlin, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为已接入 Tuya Smart App SDK 的 Android Kotlin 工程落地设备管理基础能力。涵盖设备信息与监听、设备操作（重命名/移除/恢复出厂）、设备共享三大模块。默认采用 `XML/View + Activity/Fragment + ViewModel` 结构。

核心类：
- **IThingDevice**：单设备操作入口，通过 `ThingHomeSdk.newDeviceInstance(devId)` 获取。
- **DeviceBean**：设备数据模型，包含 devId、name、dps、isOnline、productId、iconUrl、schema 等。
- **IDevListener**：设备监听接口，提供 `onDpUpdate`、`onRemoved`、`onStatusChanged`、`onNetworkStatusChanged`、`onDevInfoUpdate` 五个回调。
- **IThingHomeDeviceShare**：设备共享管理入口，通过 `ThingHomeSdk.getDeviceShareInstance()` 获取，最多 20 个用户。

## 适用场景 {#scene}

需要在已完成 SDK 集成、账号登录、至少有一个家庭的工程中操作单个设备时使用。

**Phase 1 — 设备信息获取**：调用 `getHomeDetail` 后，从 `HomeBean.getDeviceList()` 获取设备列表；`ThingHomeSdk.newDeviceInstance(devId)` 创建操作实例；按需调用 `mDevice.getDp(dpId, callback)` 查询功能点。

**Phase 2 — 设备监听**：在 ViewModel 初始化时调用 `mDevice.registerDevListener(listener)`；在 `ViewModel.onCleared()` 中调用 `mDevice.unRegisterDevListener()` 和 `mDevice.onDestroy()`。

**Phase 3 — 设备操作**（按需选择）：

| 操作 | 方法 |
|---|---|
| 修改设备名称 | `mDevice.renameDevice(name, callback)` |
| 移除设备 | `mDevice.removeDevice(callback)` |
| 恢复出厂设置 | `mDevice.resetFactory(callback)` |
| 查询 Wi-Fi 信号 | `mDevice.requestWifiSignal(listener)` |
| 低功耗设备唤醒 | `ThingOSDevice.getDeviceOperator().lowPowerDeviceAwake(...)` |
| 导出设备信息 | `ThingHomeSdk.getUserInstance().exportUserDeviceListInfo(...)` |

**Phase 4 — 设备共享**（可选）：`addShare` 或 `addShareWithMemberId` 添加共享；`queryUserShareList` / `queryShareReceivedUserList` 查询；`disableDevShare` / `removeReceivedDevShare` 移除；`inviteShare` + `confirmShareInviteShare` 邀请流程；群组共享通过 `queryGroupSharedUserList` / `addShareUserForGroup` / `removeGroupShare` 操作。

详细 API 见 `references/device-management.md` 和 `references/device-sharing.md`。

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成
- `building-tuya-android-account-foundation` — 前置：账号体系
- `building-tuya-android-home-foundation` — 前置：家庭基础能力
- `managing-tuya-android-current-home` — 前置：当前家庭管理
- `managing-tuya-android-device-list` — 后续：设备列表展示与交互

## 注意事项 {#tip}

- **`DeviceBean.getIsOnline()` 返回 `Boolean?`（可空）**：必须使用 `getIsOnline() == true` 进行安全判断，不能当属性访问。
- **不要忘记 `onDestroy()`**：每个 `IThingDevice` 实例用完后必须调用 `onDestroy()` 释放资源，否则内存泄漏。
- **不要在未调用 `getHomeDetail` 的情况下使用 `getDataInstance()`**：缓存为空会导致空指针。
- **不要混淆 `addShare` 和 `addShareWithMemberId`**：前者覆盖，后者追加，选错会清除已有共享。
- **设备移除和恢复出厂不可撤销**：务必在 UI 层添加二次确认弹窗。
- **导出设备信息有频率限制**：单次最多 10 个设备，两次调用间隔至少 1 分钟。
- **共享设备上限 20 人**：超过限制 API 会报错，需提前校验。
- **`onDpUpdate` 的 dpStr 是 JSON 字符串**：需解析为 Map 使用，不要直接展示。

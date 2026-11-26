---
name: managing-tuya-android-device-list
description: 为涂鸦 IoT Android App 开发「设备列表管理」模块。适用于需要在首页/家庭页展示家庭所属设备及共享设备、实现设备列表的增删改查交互（侧滑删除、长按修改名称、在线状态展示），以及监听设备列表实时变化的场景。
compatibility: Android, Kotlin, XML View system, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为涂鸦 IoT App 构建「设备列表管理」模块。设备列表是 IoT App 的核心页面之一，需要展示当前家庭下的所有设备以及其他用户分享过来的设备，并支持常见的列表交互操作。

**模块两大数据来源：**
1. **家庭设备列表** — 通过 `getHomeDetail` 从 `HomeBean.deviceList` 获取
2. **共享设备列表** — 通过 `IThingHomeChangeListener` 的 `onSharedDeviceList` / `onSharedGroupList` 回调获取

## 适用场景 {#scene}

已完成当前家庭管理模块，需要在首页/家庭页展示设备列表时使用。

**Phase 1 — 家庭设备列表**：collect `CurrentHomeManager.currentHomeIdFlow`，家庭切换时重新调用 `getHomeDetail` 拉取完整快照（`HomeBean.deviceList`）；用 `StateFlow<List<DeviceBean>>` 持有数据；注册 `IThingHomeStatusListener`（5 个抽象方法：`onDeviceAdded`、`onDeviceRemoved`、`onGroupAdded`、`onGroupRemoved`、`onMeshAdded`）监听设备变化。

**Phase 2 — 共享设备列表**：推荐通过 `managing-tuya-android-current-home` 的 `HomeChangeEventHandler` 中的 `onSharedDeviceList` 回调获取，通过 `SharedFlow` 或 EventBus 传递到设备列表模块。共享设备的 `DeviceBean.isShare` 为 `true`，操作权限不同。

**Phase 3 — 列表交互操作（按需）**：
- **侧滑删除**：家庭设备用 `mDevice.removeDevice(callback)`（需二次确认）；共享设备用 `removeReceivedDevShare(devId, callback)`
- **长按修改名称**：家庭设备调用 `mDevice.renameDevice(newName, callback)`；共享设备展示信息而非修改选项
- **下拉刷新**：`SwipeRefreshLayout` + 重新调用 `getHomeDetail`
- **设备在线状态实时更新**：仅为可见设备注册 `IDevListener`，通过 RecyclerView 的 `onViewAttachedToWindow` / `onViewDetachedFromWindow` 管理监听生命周期

**Phase 4 — 设备列表排序（可选）**：通过 `ItemTouchHelper` 实现拖拽，拖拽结束后调用 `ThingHomeSdk.newHomeInstance(homeId).sortDevInHome(...)` 提交服务器。

详细 API → 读 `references/api-quick-reference.md`。

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成
- `building-tuya-android-account-foundation` — 前置：账号体系
- `building-tuya-android-home-foundation` — 前置：家庭基础能力
- `managing-tuya-android-current-home` — 前置：当前家庭管理（提供 currentHomeIdFlow）
- `building-tuya-android-device-foundation` — 前置：了解设备管理基础 API
- `integrating-tuya-android-device-control-ui` — 配合：点击设备列表项跳转控制面板

## 注意事项 {#tip}

- **`IThingHomeStatusListener` 有 5 个抽象方法**：遗漏 `onMeshAdded(meshId: String)` 会导致编译报错 "Class is not abstract and does not implement abstract member"。
- **不要在家庭切换时忘记清空旧列表**：切换家庭后应先清空当前列表再加载新数据，避免短暂展示旧家庭的设备。
- **不要对共享设备执行删除/恢复出厂操作**：共享设备只能取消接收共享（`removeReceivedDevShare`），调用 `removeDevice` 会报错。
- **`DeviceBean.getIsOnline()` 返回 `Boolean?`**：必须用 `getIsOnline() == true` 判断，不能直接当 Boolean 使用。
- **不要为所有设备同时注册 `IDevListener`**：设备数量多时会造成资源浪费，考虑只监听可见设备。
- **`getHomeDetail` 返回完整快照**：每次调用都会返回全量数据，不需要自己做增量合并。

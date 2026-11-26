---
name: managing-tuya-android-current-home
description: 为涂鸦 IoT Android App 开发「当前家庭管理」中间层模块。适用于需要维护 App 全局当前家庭概念、开发家庭切换 UI、处理家庭邀请/移除/新增回调、为上层业务模块提供统一当前 homeId 访问入口的场景。
compatibility: Android, Kotlin, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为涂鸦 IoT App 构建一个「当前家庭」中间层管理模块。涂鸦 SDK 的设备控制、场景、自动化等业务都依赖 `homeId`，本模块统一维护这个概念，避免各业务模块各自管理导致状态不一致。

**模块三大职责：**
1. **当前家庭 ID API** — 全局唯一的 homeId 获取/切换入口
2. **家庭切换弹窗** — 展示用户所属家庭列表，支持切换当前家庭
3. **家庭事件监听** — 处理邀请、移除、新增等回调，维护当前家庭的有效性

## 适用场景 {#scene}

已完成 SDK 集成、账号体系和家庭基础能力，用户已登录，需要为设备控制、设备列表等上层业务模块提供统一的 homeId 访问入口时使用。

**核心接口设计建议：**

```kotlin
interface CurrentHomeManager {
    val currentHomeId: Long?
    val currentHomeIdFlow: StateFlow<Long?>
    fun switchHome(homeId: Long)
    suspend fun initialize()
}
```

**Phase 1 — 当前家庭 ID 管理**：`initialize` 时验证持久化的 homeId 是否在用户家庭列表中，无效则回退到默认策略（列表第一个）；`switchHome` 时同步写入持久化存储（key 包含 userId 以支持多账号）；切换后调用 `getHomeDetail` 预热 SDK 缓存；用 `MutableStateFlow` 持有当前 homeId，上层业务 collect 即可感知切换。

初始化流程：`登录成功 → queryHomeList → 检查持久化 homeId → getHomeDetail 预热缓存 → 发射 StateFlow`。

**Phase 2 — 家庭切换弹窗**：弹窗形式（`BottomSheetDialogFragment` 或 `AlertDialog`）与开发者确认；弹窗打开时刷新一次家庭列表；点击某项 → 调用 `CurrentHomeManager.switchHome(homeId)`。

**Phase 3 — 家庭事件监听**：注册 `IThingHomeChangeListener`，各回调处理策略：
- `onHomeInvite` — 弹出邀请确认弹窗，接受时调用 `processInvitation(homeId, true)`
- `onHomeRemoved` — 若是当前家庭则提示用户并切换到其他可用家庭；若无家庭则引导创建
- `onHomeAdded` — 轻量提示，更新家庭列表缓存，通常不自动切换
- `onHomeInfoChanged` — 若是当前家庭，刷新 UI 中的家庭名称
- `onSharedDeviceList` / `onSharedGroupList` — 通过 `SharedFlow` 或 EventBus 转发给设备模块
- `onServerConnectSuccess` — 刷新当前家庭详情，确保离线期间的变更同步

详细 API → 读 `references/api-quick-reference.md`

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成
- `building-tuya-android-account-foundation` — 前置：账号体系
- `building-tuya-android-home-foundation` — 前置：家庭基础能力
- `managing-tuya-android-device-list` — 后续：设备列表需要订阅 currentHomeIdFlow

## 注意事项 {#tip}

- **不要跳过 `getHomeDetail`**：切换家庭后必须调用，否则 `ThingHomeSdk.getDataInstance()` 缓存为空。
- **不要忘记 userId 隔离**：持久化的 homeId 必须按用户隔离，切换账号后需重新初始化。
- **不要在注销时忘记清理**：退出登录时清除持久化的 homeId 和内存状态。
- **不要忽略并发**：`onHomeRemoved` 和用户手动切换可能同时发生，注意线程安全。
- **不要在 `onCleared()` 外注销监听器**：确保在正确的生命周期注销，避免泄漏。

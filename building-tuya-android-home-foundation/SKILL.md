---
name: building-tuya-android-home-foundation
description: 为已接入 Tuya Smart App SDK 的 Android Kotlin 工程落地家庭管理基础能力。适用于需要实现家庭创建/查询/更新/解散、房间新增/删除/改名/排序、成员邀请/移除/角色管理及家庭变更监听的场景。
compatibility: Android, Kotlin, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为已接入 Tuya Smart App SDK 的 Android Kotlin 工程落地最小家庭业务体系。涵盖家庭增删改查、房间管理、成员管理三大模块。默认采用 `XML/View + Activity/Fragment + ViewModel` 结构。

核心类：
- **IThingHomeManager**：全局家庭管理，通过 `ThingHomeSdk.getHomeManagerInstance()` 获取，用于创建家庭、查询家庭列表、监听家庭变化。
- **IThingHome**：单个家庭操作，通过 `ThingHomeSdk.newHomeInstance(homeId)` 获取。
- **IThingRoomManager**：单个房间操作，通过 `ThingHomeSdk.newRoomInstance(roomId)` 获取。
- **IThingMember**：成员操作，通过 `ThingHomeSdk.getMemberInstance()` 获取。
- **HomeBean / RoomBean / MemberBean**：对应数据模型。

## 适用场景 {#scene}

需要在已完成 SDK 集成、用户已登录的工程中接入家庭管理功能时使用。

标准流程：

1. **初始化**：登录成功后立即调用 `queryHomeList`，判断是否有家庭，没有则引导创建。
2. **选定当前家庭**：将 `homeId` 存入 ViewModel，后续操作通过 `ThingHomeSdk.newHomeInstance(homeId)` 执行。
3. **加载家庭详情**：调用 `getHomeDetail` 拉取完整 `HomeBean`（含设备、群组、房间列表）并缓存。
4. **注册监听器**：在 ViewModel `init` 块中注册 `IThingHomeChangeListener` 和 `IThingHomeStatusListener`，在 `onCleared()` 中注销。
5. **房间 / 成员操作**：均为异步回调，统一在 ViewModel 中收口。

子模块参考：
- 家庭信息（创建、查询、修改、解散、天气、监听）→ 读 `references/home-management.md`
- 房间信息（新增、删除、排序、改名、设备分配）→ 读 `references/room-management.md`
- 成员信息（邀请、删除、角色、邀请码）→ 读 `references/member-management.md`

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成
- `building-tuya-android-account-foundation` — 前置：账号体系
- `managing-tuya-android-current-home` — 后续：全局当前家庭 ID 管理与切换
- `building-tuya-android-device-foundation` — 后续：设备管理能力

## 注意事项 {#tip}

- 不要在未调用 `getHomeDetail` 或 `getHomeLocalCache` 的情况下使用 `ThingHomeSdk.getDataInstance()`，缓存为空会导致空指针。
- 不要把 `homeId` 硬编码；通过 `queryHomeList` 动态获取。
- 角色权限有层级：拥有者 > 管理员 > 普通成员 > 自定义成员。添加/删除成员时需校验当前用户角色是否有权限操作目标角色。
- `addMember` 的 `autoAccept=false` 时，受邀者须调用 `processInvitation` 接受邀请才会真正加入家庭。
- 注销家庭（`dismissHome`）会重置所有设备，操作前需二次确认。
- 房间排序使用 `sortRoom`，设备在家庭内的顺序使用 `sortDevInHome`，两者接口不同不要混用。
- **`IThingHomeStatusListener` 有 5 个抽象方法**：实现时不要遗漏 `onMeshAdded(meshId: String)`。完整方法：`onDeviceAdded`、`onDeviceRemoved`、`onGroupAdded`、`onGroupRemoved`、`onMeshAdded`。
- 不要忘记在 `ViewModel.onCleared()` 中注销所有监听器，避免内存泄漏。

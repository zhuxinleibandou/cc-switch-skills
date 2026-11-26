---
name: building-tuya-ios-home-foundation
description: 为已接入 Tuya Smart App SDK 的 iOS ObjC 工程落地家庭管理基础能力。适用于需要实现家庭创建/查询/更新/解散、房间新增/删除/改名/排序、成员邀请/移除/角色管理及家庭变更 delegate 的场景。
compatibility: iOS 11+, Objective-C, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为已接入 Tuya Smart App SDK 的 iOS ObjC 工程落地最小家庭业务体系。涵盖家庭增删改查、房间管理、成员管理三大模块。

核心类：
- **`ThingSmartHomeManager`**：全局家庭管理，使用 `[ThingSmartHomeManager new]` 实例化，用于创建家庭、查询家庭列表、监听家庭变化。
- **`ThingSmartHome`**：单个家庭操作，通过 `[ThingSmartHome homeWithHomeId:homeId]` 获取。
- **`ThingSmartRoom`**：单个房间操作，通过 `[ThingSmartRoom roomWithRoomId:roomId homeId:homeId]` 获取。
- **`ThingSmartHomeMember`** / **`ThingSmartHomeInvitation`**：成员与邀请码操作类。
- **`ThingSmartHomeModel`** / **`ThingSmartRoomModel`** / **`ThingSmartHomeMemberModel`**：对应数据模型。

## 适用场景 {#scene}

需要在已完成 SDK 集成、用户已登录的工程中接入家庭管理功能时使用。

标准流程：

1. **初始化**：登录成功后立即调用 `getHomeListWithSuccess:failure:`，判断是否有家庭，没有则引导创建。
2. **选定当前家庭**：将 `homeId` 存入 ViewController 或全局状态，后续操作通过 `[ThingSmartHome homeWithHomeId:homeId]` 执行。
3. **加载家庭详情**：调用 `getHomeDataWithSuccess:failure:` 拉取完整 `ThingSmartHomeModel`（含设备、群组、房间列表）。
4. **注册监听器**：设置 `ThingSmartHomeManagerDelegate` 和 `ThingSmartHomeDelegate`，在 ViewController 销毁时置 nil。
5. **房间 / 成员操作**：均为异步回调，统一在 ViewController 或 ViewModel 中收口。

子模块参考：
- 家庭信息（创建、查询、修改、解散、天气、监听）→ 读 `references/home-management.md`
- 房间信息（新增、删除、排序、改名、设备分配）→ 读 `references/room-management.md`
- 成员信息（邀请、删除、角色、邀请码）→ 读 `references/member-management.md`

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `building-tuya-ios-account-foundation` — 前置：账号体系
- `managing-tuya-ios-current-home` — 后续：全局当前家庭 ID 管理与切换
- `building-tuya-ios-device-foundation` — 后续：设备管理能力

## 注意事项 {#tip}

- 不要在未调用 `getHomeDataWithSuccess:` 或 `waitLoadCacheComplete:` 的情况下使用本地缓存数据，缓存为空会导致异常。
- 不要把 `homeId` 硬编码；通过 `getHomeListWithSuccess:` 动态获取。
- `addHomeMemberWithAddMemeberRequestModel:` 中 `autoAccept=NO` 时，受邀者须调用 `joinFamilyWithAccept:success:failure:` 接受邀请才会真正加入家庭。
- 解散家庭（`dismissHomeWithSuccess:`）会重置所有设备，操作前需二次确认。
- 不要忘记在 ViewController `dealloc` 或消失时将 delegate 置 nil，避免野指针。
- 房间排序使用 `sortRoomList:success:failure:`，设备在家庭内的顺序使用 `sortDeviceOrGroupWithOrderList:success:failure:`，两者接口不同不要混用。

---
name: managing-tuya-ios-current-home
description: 为涂鸦 IoT iOS App 开发「当前家庭管理」中间层模块。适用于需要维护 App 全局当前家庭概念、开发家庭切换 UI、处理家庭邀请/移除/新增回调、为上层业务模块提供统一当前 homeId 访问入口的场景。
compatibility: iOS 11+, Objective-C, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为涂鸦 IoT iOS App 构建一个「当前家庭」中间层管理模块。涂鸦 SDK 的设备控制、场景、自动化等业务都依赖 `homeId`，本模块统一维护这个概念，避免各业务模块各自管理导致状态不一致。

**模块三大职责：**
1. **当前家庭 ID API** — 全局唯一的 homeId 获取/切换入口
2. **家庭切换弹窗** — 展示用户所属家庭列表，支持切换当前家庭
3. **家庭事件监听** — 处理邀请、移除、新增等回调，维护当前家庭的有效性

## 适用场景 {#scene}

已完成 SDK 集成、账号体系和家庭基础能力，用户已登录，需要为设备控制、设备列表等上层业务模块提供统一的 homeId 访问入口时使用。

**核心接口设计建议（ObjC）：**

```objc
@interface CurrentHomeManager : NSObject
+ (instancetype)sharedInstance;
@property (nonatomic, assign, readonly) long long currentHomeId;
- (void)switchHomeWithHomeId:(long long)homeId;
- (void)initializeWithCompletion:(void(^)(long long homeId))completion;
@end
```

**Phase 1 — 当前家庭 ID 管理**：`initializeWithCompletion:` 时验证 `NSUserDefaults` 中的 homeId 是否在用户家庭列表中，无效则回退到 `homes[0]`；`switchHomeWithHomeId:` 时同步写入 `NSUserDefaults`（key 包含 userId 以支持多账号）；切换后调用 `getHomeDataWithSuccess:failure:` 预热 SDK 缓存；通过 `NSNotificationCenter` 广播 `CurrentHomeDidChangeNotification`。

初始化流程：`登录成功 → initializeWithCompletion: → getHomeListWithSuccess: → getHomeDataWithSuccess: 预热缓存 → 发送通知`。

**Phase 2 — 家庭切换弹窗**：弹窗形式（`UIAlertController` ActionSheet 或自定义底部弹出）与开发者确认；弹窗打开时调用 `getHomeListWithSuccess:` 获取最新列表；点击某项 → 调用 `switchHomeWithHomeId:`。

**Phase 3 — 家庭事件监听**：在 `CurrentHomeManager` 中持有 `homeManager` 实例并设置 delegate，登录后初始化时注册。`ThingSmartHomeManagerDelegate` 各回调处理策略：
- 收到家庭邀请 — 弹出确认弹窗，接受时调用 `joinFamilyWithAccept:YES`，切换当前家庭到受邀家庭
- `homeManager:didRemoveHome:` — 若是当前家庭则提示并切换到其他可用家庭；若无家庭则引导创建
- `homeManager:didAddHome:` — 轻量提示，更新家庭列表缓存，通常不自动切换
- 家庭信息变更 — 调用 `getHomeDataWithSuccess:` 刷新缓存，通过 `NSNotificationCenter` 通知 UI
- `homeDidUpdateSharedInfo:` — 通过 `NSNotificationCenter` 转发给设备业务模块（建议定义 `SharedDeviceListDidChangeNotification`）
- `serviceConnectedSuccess` — 刷新当前家庭详情，确保离线期间的变更同步

详细 API → 读 `references/api-quick-reference.md`

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `building-tuya-ios-account-foundation` — 前置：账号体系
- `building-tuya-ios-home-foundation` — 前置：家庭基础能力
- `managing-tuya-ios-device-list` — 后续：设备列表需要监听 CurrentHomeDidChangeNotification

## 注意事项 {#tip}

- **不要跳过 `getHomeDataWithSuccess:`**：切换家庭后必须调用，否则 SDK 内部缓存为空，设备列表等数据不可用。
- **不要忘记 userId 隔离**：`NSUserDefaults` 中的 homeId 必须按用户隔离，切换账号后需重新初始化。
- **不要在退出登录时遗漏清理**：退出登录时清除 `NSUserDefaults` 中的 homeId 和内存状态，`homeManager.delegate = nil`。
- **不要强引用 delegate**：`ThingSmartHomeManager` 的 `delegate` 是 `weak`，确保持有 `homeManager` 实例的对象生命周期足够长。
- **`initializeWithCompletion:` 必须在登录后、进入主界面前调用**：在 completion 回调中再展示主界面（Tab Bar），确保首页进入时 `currentHomeId` 已有效。

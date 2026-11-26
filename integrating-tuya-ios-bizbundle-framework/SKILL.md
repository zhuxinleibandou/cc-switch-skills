---
name: integrating-tuya-ios-bizbundle-framework
description: 在 iOS 应用中首次搭建涂鸦 BizBundle 通用框架层。适用于需要配置 ThingSmartBizCore 和 ThingModuleServices pod、thing_custom_config.json、在 AppDelegate/SceneDelegate 中注册服务/路由，以及登录后调用 updateConfig 生命周期回调的场景，必须在集成任何具体 BizBundle 之前完成。
compatibility: iOS 11+, Objective-C, Tuya BizBundle 5.x
---

## 概述 {#description}

涂鸦 UI 业务包（BizBundle）的通用框架层初始化。所有具体 BizBundle（设备控制、家庭管理等）的**共同前置条件**，必须先完成本 skill 再集成任何具体业务包。

## 适用场景 {#scene}

已完成 `integrating-tuya-ios-sdk`（ThingSmartHomeKit 可用，AppDelegate 已完成 SDK 基础初始化），需要接入任意 BizBundle 之前执行。

**步骤：**

1. **Podfile 添加 BizBundle 基础依赖**：加入 `ThingSmartBizCore` 和 `ThingModuleServices`；具体业务包按需单独引入；执行 `pod update`。详见 `references/framework-setup.md`。

2. **创建 `thing_custom_config.json`**：在工程根目录（与 Podfile 同级）创建配置文件，填写 `appId`、`thingAppKey`、`appScheme`、`hotspotPrefixs`、`needBle` 及主题色。详见 `references/framework-setup.md`。

3. **SceneDelegate 中初始化 BizBundle（Scene 架构必须）**：在 `scene:willConnectToSession:options:` 里，**先完成 `[self.window makeKeyAndVisible]`**，再依次调用：
   - `[ThingSmartBusinessExtensionConfig setupConfig]`
   - `[[ThingSmartBizCore sharedInstance] registerRouteWithHandler:]`
   
   不可在 AppDelegate 或 makeKeyAndVisible 之前调用，否则触发死锁崩溃。详见 `references/framework-setup.md`。

4. **登录后调用 `updateConfig`**：用户登录成功后必须调用 `[[ThingSmartBizCore sharedInstance] updateConfig]`，漏调会导致业务包内部功能异常。详见 `references/framework-setup.md`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `integrating-tuya-ios-theme` — 建议同步完成：主题色配置
- `integrating-tuya-ios-device-control-ui` — 后续：设备控制面板
- `integrating-tuya-ios-device-activator-ui` — 后续：设备配网 UI
- `integrating-tuya-ios-device-detail-ui` — 后续：设备详情 UI
- `integrating-tuya-ios-home-bizbundle` — 后续：家庭管理 UI

## 注意事项 {#tip}

- **BizBundle 初始化必须在 `makeKeyAndVisible` 之后**：`setupConfig` 和 `registerRouteWithHandler:` 会启动后台线程并持有内部锁；若在 `makeKeyAndVisible` 之前调用，主线程会尝试获取同一把锁，造成死锁，表现为 `EXC_BAD_ACCESS` 崩溃。
- **`thing_custom_config.json` 不能缺失**：业务包启动时会读取该文件，缺失会直接崩溃或功能不可用。
- **`updateConfig` 必须在登录后调用**：只调用 SDK 初始化不够，业务包有独立的配置缓存，需要登录完成后主动刷新。
- **`ThingSmartBizCore` 不替代 `ThingSmartSDK` 初始化**：两者并列，BizBundle 框架层建立在已初始化的 SDK 之上。
- **具体业务包需单独引入**：`ThingSmartBizCore` + `ThingModuleServices` 只是框架基座，每个具体功能业务包需要单独添加 pod 依赖。

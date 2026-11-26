---
name: integrating-tuya-ios-home-bizbundle
description: 在 iOS 应用中跳转涂鸦家庭管理 UI 业务包页面。适用于需要通过 ThingFamilyProtocol 调用 gotoFamilyManagement、通过 updateCurrentFamilyId 更新当前家庭 ID、处理家庭邀请回调的场景，需先完成 integrating-tuya-ios-bizbundle-framework。
compatibility: iOS 11+, Objective-C, Tuya BizBundle 5.x
---

## 概述 {#description}

涂鸦家庭管理 UI 业务包提供开箱即用的家庭管理、房间管理、成员管理页面，通过 `ThingFamilyProtocol` 一行调用即可跳转，**不支持自定义修改内部实现**。

## 适用场景 {#scene}

已完成 BizBundle 框架层初始化，需要为 App 添加家庭管理入口时使用。

**前置条件：**
1. 已完成 `integrating-tuya-ios-sdk`
2. 已完成 `integrating-tuya-ios-bizbundle-framework`（`ThingSmartBizCore` 已初始化、`updateConfig` 已在登录后调用）
3. `thing_custom_config.json` 中已加入 `"is_support_home_manager": true`

**跳转流程：**
1. 通过 `ThingSmartBizCore` 获取 `ThingFamilyProtocol` 服务实例
2. 查询家庭列表，调用 `updateCurrentFamilyId:` 设置当前家庭
3. 调用 `gotoFamilyManagement` 跳转（即使无家庭也跳转，业务包内部会引导创建）
4. 按需通过 `ThingSmartHomeManagerDelegate` 处理家庭邀请

完整接口示例（含 ObjC 版本）见 `references/family-bizbundle.md`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `integrating-tuya-ios-bizbundle-framework` — 前置：BizBundle 框架初始化
- `managing-tuya-ios-current-home` — 提供 updateCurrentFamilyId 所需的 homeId
- `building-tuya-ios-home-foundation` — 如需自定义家庭管理 UI，改用底层 SDK

## 注意事项 {#tip}

- **返回后导航栏变黑**：BizBundle 内部通过 `UIAppearance` 全局修改了 `UINavigationBar` 样式，pop/dismiss 返回宿主页后样式不会自动恢复。修复方式：在宿主 ViewController 的 `viewWillAppear:` 里显式重置 `standardAppearance` 和 `scrollEdgeAppearance`，详见 `references/family-bizbundle.md`。
- **`updateCurrentFamilyId:` 未调用**：跳转前必须设置 homeId，homeId 为 0 时业务包内部功能异常，是最常见漏项。
- **`thing_custom_config.json` 未加 `is_support_home_manager`**：缺少该配置会导致家庭管理业务包功能不可用。
- **不要在业务包内部寻求自定义 UI 的方法**，业务包不支持修改内部实现；有自定义需求须基于 Home SDK 自行开发。
- **`gotoFamilyManagement` 前未调用 `updateConfig`**：用户登录后若未调用 `updateConfig`，业务包内部缓存的 familyId 可能为旧值。

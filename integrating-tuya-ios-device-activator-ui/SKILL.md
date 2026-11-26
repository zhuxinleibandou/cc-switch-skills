---
name: integrating-tuya-ios-device-activator-ui
description: 在已接入 Tuya Smart App SDK 的 iOS ObjC 应用中集成设备配网 UI 业务包。适用于需要通过 ThingActivatorProtocol 添加设备配对/入网入口、注册 ThingSmartHomeDataProtocol 提供当前家庭上下文、支持 Wi-Fi/BLE/Zigbee/Matter/扫码配网及处理配网完成回调的场景。
compatibility: iOS 11+, Objective-C, Tuya BizBundle 5.x
---

## 概述 {#description}

在已接入 Tuya Smart App SDK 的 iOS ObjC 工程中，集成设备配网 UI 业务包，提供自动发现配网、手动配网（Wi-Fi/蓝牙/Zigbee/Matter）、扫码配网等功能，用户通过统一入口即可完成各类设备的网络配置。

前置条件：已完成 `integrating-tuya-ios-sdk` 和 `integrating-tuya-ios-bizbundle-framework`（`ThingSmartBizCore` 已初始化、`updateConfig` 已在登录后调用）。

## 适用场景 {#scene}

已完成 BizBundle 框架层初始化，用户已登录且有至少一个家庭，需要为 App 添加设备配网入口时使用。

**步骤：**

1. **添加 Podfile 依赖**：加入 `ThingSmartActivatorBizBundle`（必选），按需加入蓝牙/Matter 扩展。详见 `references/device-activator-ui.md`。

2. **配置 Info.plist 权限**：配网需要定位、相机权限；蓝牙配网需蓝牙权限；Matter 配网需额外 Bonjour 配置。详见 `references/device-activator-ui.md`。

3. **更新 `thing_custom_config.json`**：在 `config` 节点中加入 `needBle`、`needQRCode`、`is_matter_support`、`activator_auto_serach_capacity` 等字段。详见 `references/device-activator-ui.md`。

4. **注册 `ThingSmartHomeDataProtocol` 服务（必须）**：实现 `getCurrentHome` 返回当前 `ThingSmartHome` 实例，**必须在打开配网页面之前注册**。详见 `references/device-activator-ui.md`。

5. **设置配网完成回调**：通过 `ThingActivatorProtocol` 调用 `activatorCompletion:customJump:completionBlock:` 注册完成回调，在回调中处理新增设备列表、跳转设备控制面板等逻辑。

6. **调用配网入口**：调用 `[impl gotoCategoryViewController]` 打开配网页面；扫码配网入口调用 `[impl gotoQRCodeViewControllerWithUserInfo:]`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `integrating-tuya-ios-bizbundle-framework` — 前置：BizBundle 框架初始化
- `integrating-tuya-ios-device-control-ui` — 配网完成后跳转设备控制面板
- `managing-tuya-ios-current-home` — 提供 ThingSmartHomeDataProtocol 所需的当前家庭

## 注意事项 {#tip}

- **`ThingSmartHomeDataProtocol` 未注册**：配网依赖当前家庭上下文，未注册或 `getCurrentHome` 返回 `nil` 时，配网页面无法正常工作。必须在 `gotoCategoryViewController` 之前完成注册。
- **`homeId` 类型**：`ThingSmartHome homeWithHomeId:` 接收 `long long`，不要传 NSString。
- **Info.plist 权限缺失**：Wi-Fi 配网需定位权限，蓝牙配网需蓝牙权限，缺少任一权限会导致对应配网方式不可用或 crash。
- **`updateConfig` 未调用**：登录后未调用 `[[ThingSmartBizCore sharedInstance] updateConfig]` 会导致配网业务包内部状态异常。
- **蓝牙 pod 版本分支**：SDK 5.8.0 以下和 5.8.0 以上的蓝牙依赖写法不同，必须按工程实际版本选择。
- **`thing_custom_config.json` 字段拼写**：`activator_auto_serach_capacity`（官方文档中有拼写错误：`serach` 而非 `search`），必须与文档保持一致。

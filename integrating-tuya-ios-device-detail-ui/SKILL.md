---
name: integrating-tuya-ios-device-detail-ui
description: 在已接入 Tuya Smart App SDK 的 iOS ObjC 应用中集成设备详情 UI 业务包。适用于需要添加设备设置/详情页（包含设备信息编辑、网络检测、OTA 固件升级、群组管理）及通过 ThingDeviceDetailProtocol 扩展自定义菜单项的场景。
compatibility: iOS 11+, Objective-C, Tuya BizBundle 5.x
---

## 概述 {#description}

在已接入 Tuya Smart App SDK 的 iOS ObjC 工程中，集成设备详情 UI 业务包，实现设备管理的"更多"页面——作为设备面板与各项基础管理功能之间的 hub。

设备详情页核心能力：
- **设备信息**：编辑名称/图标/房间、查看设备 ID/信号等
- **网络检测**：检测设备当前网络状态
- **可选子功能**：固件 OTA 升级、群组管理等
- **自定义扩展**：通过 block 回调动态插入自定义菜单项

前置条件：已完成 `integrating-tuya-ios-sdk`、`integrating-tuya-ios-bizbundle-framework` 和 `integrating-tuya-ios-device-control-ui`。

## 适用场景 {#scene}

已完成设备控制面板集成，需要从面板跳转到设备详情/设置页时使用。

**步骤：**

1. **添加 Podfile 依赖**：加入 `ThingSmartDeviceDetailBizBundle`（必选），按需加入蓝牙可选依赖。详见 `references/device-detail-ui.md`。

2. **配置 Info.plist 权限**：需要相册、相机权限；使用群组/移除设备功能需蓝牙权限。详见 `references/device-detail-ui.md`。

3. **创建 `deviceDetailConfig.json`（必须）**：在 App 主 Bundle 中（即 `FlyIoTDemo/` 目录下）创建 `deviceDetailConfig.json`，定义原生设备详情页的分组和菜单项。**缺少此文件时业务包无法构建详情页，面板右上角按钮点击无任何响应**。详见 `references/device-detail-ui.md`。

4. **注册 `ThingSmartHomeDataProtocol` 服务（必须）**：设备详情业务包通过此协议获取当前家庭，**必须在打开设备详情页之前注册**。若已在 `integrating-tuya-ios-device-activator-ui` 中注册过，此步骤无需重复。注意这里用的是 `ThingSmartHomeDataProtocol`，**不是** `ThingFamilyProtocol`。详见 `references/device-detail-ui.md`。

5. **调用设备详情页接口**：通过 `ThingDeviceDetailProtocol` 调用 `gotoDeviceDetailDetailViewControllerWithDevice:group:` 打开设备详情页；网络检测页入口：`gotoDeviceDetailNetworkViewControllerWithDeviceId:`。详见 `references/device-detail-ui.md`。

6. **自定义菜单项扩展（可选）**：通过 `insertDevMenuItem:customType:` 插入同步菜单项；`insertDevMenuItemAsync:customType:` 插入异步菜单项；`clickMenuItem:` 注册点击事件处理。自定义 customType 必须以 `c_` 开头。详见 `references/device-detail-ui.md`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `integrating-tuya-ios-bizbundle-framework` — 前置：BizBundle 框架初始化
- `integrating-tuya-ios-device-control-ui` — 前置：设备控制面板（详情页从面板跳转）
- `integrating-tuya-ios-home-bizbundle` — 可配合使用家庭管理 UI

## 注意事项 {#tip}

- **`deviceDetailConfig.json` 缺失是最常见的陷阱**：此文件缺失时，`ThingSmartDeviceDetailBizBundle` 无法构建详情页 VC，面板右上角按钮点击后**完全无响应，不报错**。必须在 App Bundle（`FlyIoTDemo/` 目录下）创建此文件。
- **`ThingSmartHomeDataProtocol` vs `ThingFamilyProtocol`**：设备详情业务包用的是 `ThingSmartHomeDataProtocol`，设备控制面板用的是 `ThingFamilyProtocol`，两者不同，不可混用。
- **`updateConfig` 未调用**：登录后未调用 `[[ThingSmartBizCore sharedInstance] updateConfig]` 会导致业务包内部状态异常。
- **自定义 customType 不以 `c_` 开头**：业务包会将不以 `c_` 开头的 type 识别为内置类型，导致查找失败。
- **`clearInsertItem` 未调用导致重复项**：在 ViewController 每次 `viewWillAppear` 或重新注册菜单项前，先调用 `clearInsertItem` 清除旧项，否则多次进入页面会重复插入相同菜单项。
- **`insertDevMenuItemAsync:` 回调线程**：异步菜单项的 `complete` 回调必须在主线程调用，否则 UI 更新会崩溃。

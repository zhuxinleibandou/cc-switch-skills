---
name: integrating-tuya-ios-device-control-ui
description: 在已接入 Tuya Smart App SDK 的 iOS ObjC 应用中集成设备控制 UI 业务包。适用于需要通过 ThingPanelProtocol 跳转设备/群组控制面板、注册 ThingFamilyProtocol 提供当前家庭上下文、配置可选面板相关协议（摄像头、OTA、设备详情、声音）及处理面板导航回调的场景。
compatibility: iOS 11+, Objective-C, Tuya BizBundle 5.x
---

## 概述 {#description}

在已接入 Tuya Smart App SDK 的 iOS ObjC 工程中，集成设备控制 UI 业务包，实现一键跳转设备/群组控制面板，无需自行开发面板 UI。

前置条件：已完成 `integrating-tuya-ios-sdk` 和 `integrating-tuya-ios-bizbundle-framework`（`ThingSmartBizCore` 已初始化、`updateConfig` 已在登录后调用）。

## 适用场景 {#scene}

已完成 BizBundle 框架层初始化，用户已登录且有至少一个家庭，需要为 App 设备列表中的设备添加面板跳转能力时使用。

**步骤：**

1. **添加 Podfile 依赖**：加入 `ThingSmartPanelBizBundle`（必选）。详见 `references/device-control-ui.md`。

2. **配置 Info.plist 权限**：面板可能需要相机、麦克风、相册、定位、蓝牙等权限。详见 `references/device-control-ui.md`。

3. **注册 `ThingFamilyProtocol` 服务（必须）**：实现 `getCurrentHome` 返回当前 `ThingSmartHome` 实例，**必须在打开面板之前注册**。若已在 `integrating-tuya-ios-home-bizbundle` 中注册过，此步骤无需重复。详见 `references/device-control-ui.md`。

4. **调用面板接口**：通过 `ThingPanelProtocol` 调用 `getPanelViewControllerWithDeviceModel:initialProps:contextProps:completionHandler:` 获取面板控制器并跳转；群组面板使用 `getPanelViewControllerWithGroupModel:...`。详见 `references/device-control-ui.md`。

5. **注册可选协议（按需）**：若面板需要跳转设备详情页、OTA 升级页、群组管理页或摄像头面板，按需实现并注册对应协议。详见 `references/device-control-ui.md`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `integrating-tuya-ios-bizbundle-framework` — 前置：BizBundle 框架初始化
- `managing-tuya-ios-current-home` — 提供 ThingFamilyProtocol 所需的当前家庭
- `integrating-tuya-ios-device-detail-ui` — 后续：设备详情/设置页

## 注意事项 {#tip}

- **`ThingFamilyProtocol` 未注册**：面板内部依赖此协议获取当前家庭 ID，未注册时面板无法正确加载。必须在调用 `getPanelViewControllerWithDeviceModel:` 之前完成注册。
- **`updateConfig` 未调用**：登录后必须调用 `[[ThingSmartBizCore sharedInstance] updateConfig]`，否则业务包内部状态异常，面板加载失败。
- **`homeId` 类型错误**：`ThingSmartHome homeWithHomeId:` 接收 `long long`，不要传 NSString。
- **`completionHandler` 中的 `vc` 可能为 nil**：当设备不支持当前面板或面板加载失败时，`error` 不为 nil 且 `vc` 为 nil，必须做判断再 `pushViewController`，否则 crash。
- **`ThingFamilyProtocol` 与家庭 UI 业务包共用同一注册**：若已集成 `integrating-tuya-ios-home-bizbundle` 并注册过，此处无需重复注册，否则后注册的实例会覆盖前一个。

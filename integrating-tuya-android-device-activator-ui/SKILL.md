---
name: integrating-tuya-android-device-activator-ui
description: 在已接入 Tuya Smart App SDK 的 Android Kotlin 应用中集成设备配网 UI 业务包。适用于需要添加设备配对/入网入口、支持 Wi-Fi EZ/AP/BLE/Zigbee/Matter 配网、扫码配网及自动发现搜索的场景。
compatibility: Android, Kotlin, Tuya BizBundle 5.x
---

## 概述 {#description}

在已接入 Tuya Smart App SDK 的 Android Kotlin 工程中，集成设备配网 UI 业务包，提供自动发现配网、手动配网（Wi-Fi/蓝牙/Zigbee/Matter）、扫码配网等功能，用户通过统一入口即可完成各类设备的网络配置。

前置条件：已完成 `integrating-tuya-android-sdk` 和 `integrating-tuya-android-bizbundle-framework`（BizBundleInitializer 已初始化、主题已配置、家庭服务已注册）。

## 适用场景 {#scene}

已完成 BizBundle 框架层初始化，用户已登录且有至少一个家庭，需要为 App 添加设备配网入口时使用。

**步骤：**

1. **添加 Gradle 依赖**（Kotlin DSL）：在 `app/build.gradle.kts` 的 dependencies 块中加入 `thingsmart-bizbundle-device_activator`（必选）和 `thingsmart-bizbundle-qrcode_mlkit`（强烈建议）。版本由已有的 `thingsmart-BizBundlesBom` 统一管理，无需手动指定。

2. **配置混淆规则**（如尚未配置）：检查 `app/proguard-rules.pro` 是否已包含 FastJSON、RxJava、Fresco、ThingClips 的 keep 规则。完整规则见 `references/device-activator-ui.md`。

3. **（可选）自定义配网行为**：热点 SSID 前缀通过 `res/values/strings.xml` 的 `ap_mode_ssid` 配置；蓝牙/扫码开关通过 `res/values/bools.xml` 配置；自动发现搜索通过 `assets/activator_auto_search_capacity.json` 配置。详见 `references/device-activator-ui.md`。

4. **注册配网监听器**：在首页或 Application 中注册 `ThingDeviceActivatorManager.addListener`，处理配网成功、房间更新、跳转面板等回调。

5. **调用配网入口**：使用 `ThingDeviceActivatorManager.startDeviceActiveAction(activity)` 打开配网页面；使用 `ScanManager.INSTANCE.openScan(activity)` 打开扫码配网。

详细配置见 `references/device-activator-ui.md`。

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成
- `integrating-tuya-android-bizbundle-framework` — 前置：BizBundle 框架初始化
- `integrating-tuya-android-device-control-ui` — 配网完成后跳转设备控制面板
- `managing-tuya-android-current-home` — 配网依赖当前家庭上下文

## 注意事项 {#tip}

- **Kotlin 调用方式**：`ThingDeviceActivatorManager` 在 Kotlin 中应直接调用，不要使用 `.INSTANCE`，否则编译报错 `Unresolved reference 'INSTANCE'`。
- **家庭服务未注册**：`BizBundleFamilyServiceImpl` 未注册或 `shiftCurrentFamily` 未调用时，配网页面可能无法正常工作。
- **权限未申请**：Wi-Fi 配网需要定位权限（`ACCESS_FINE_LOCATION`），蓝牙配网需要蓝牙权限（`BLUETOOTH_SCAN`、`BLUETOOTH_CONNECT`），未申请会导致配网失败。
- **混淆漏配**：Release 包中配网功能异常时，先检查 proguard 规则是否完整。
- **BOM 版本不匹配**：`device_activator` 和 `qrcode_mlkit` 的版本必须由同一 BOM 管理，不要手动指定版本号。

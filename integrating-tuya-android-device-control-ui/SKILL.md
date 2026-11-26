---
name: integrating-tuya-android-device-control-ui
description: 在已接入 Tuya Smart App SDK 的 Android Kotlin 应用中集成设备控制 UI 业务包（RN 面板方案）。适用于需要一键跳转设备/群组控制面板、配置 Gradle Kotlin DSL 依赖和混淆规则、处理 SoLoader 初始化及面板启动失败排查的场景。
compatibility: Android, Kotlin, Tuya BizBundle 5.x
---

## 概述 {#description}

在已接入 Tuya Smart App SDK 的 Android Kotlin 工程中，集成设备控制 UI 业务包（RN 面板方案），实现一键跳转设备/群组控制面板，无需自行开发面板 UI。

前置条件：已完成 `integrating-tuya-android-sdk` 和 `integrating-tuya-android-bizbundle-framework`（BizBundleInitializer 已初始化、主题已配置）。

## 适用场景 {#scene}

已完成 BizBundle 框架层初始化，需要为 App 设备列表中的设备添加面板跳转能力时使用。

**步骤：**

1. **添加 Gradle 依赖**：在 `app/build.gradle.kts` 中加入必选依赖 + 按需加入可选依赖。`thingsmart-bizbundle-basekit` 需要 `exclude group: "com.thingclips.smart", module: "thingplugin-annotation"`。参考 `references/device-control-ui.md`。

2. **配置 packaging 冲突处理**：除 `libc++_shared.so` 外，还需 `pickFirst` 多个 so 文件（`libv8android.so`、`libbytehook.so` 等）。完整列表见 `references/device-control-ui.md`。

3. **配置混淆规则**：将 RN、高德/谷歌地图、ThingClips 的 keep 规则追加到 `app/proguard-rules.pro`。完整规则见 `references/device-control-ui.md`。

4. **实现 BizBundleFamilyServiceImpl（必须）**：继承 `AbsBizBundleFamilyService`，实现 `getCurrentHomeId()` 和 `shiftCurrentFamily()`。打开面板前必须先调用 `shiftCurrentFamily(homeId, homeName)` 绑定当前家庭。

5. **调用面板接口**：使用 `AbsPanelCallerService` 跳转设备面板或群组面板。面板服务获取方式：
   ```kotlin
   import com.thingclips.smart.api.MicroContext
   import com.thingclips.smart.panelcaller.api.AbsPanelCallerService
   val panelService = MicroContext.getServiceManager()
       .findServiceByInterface(AbsPanelCallerService::class.java.name)
           as? AbsPanelCallerService
   panelService?.goPanelWithCheckAndTip(activity, devId)
   ```
   跳群组面板时需先判断 `isAdmin`。详见 `references/device-control-ui.md`。

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成
- `integrating-tuya-android-bizbundle-framework` — 前置：BizBundle 框架初始化
- `managing-tuya-android-current-home` — 提供 shiftCurrentFamily 所需的 homeId
- `integrating-tuya-android-device-detail-ui` — 后续：设备详情/设置页

## 注意事项 {#tip}

- **`shiftCurrentFamily` 未调用**：打开面板前必须先通过家庭服务绑定当前家庭 ID，是最常见的漏项。
- **`packaging pickFirst` 不完整**：只加了 `libc++_shared.so` 还不够，`libv8android.so`、`libbytehook.so` 等也需要 `pickFirst`，遗漏会导致 build 失败。
- **`thingsmart-bizbundle-basekit` 未 exclude annotation**：漏掉 `exclude group: "com.thingclips.smart", module: "thingplugin-annotation"` 可能导致编译冲突。
- **RN 版本冲突**：工程中已有 RN 且版本 > 0.59.10 时无法集成。
- **`AppConfig` 缺少 BLE 支持声明**：`is_need_ble_support = true` 缺失时，BLE 设备面板会报 `code=1003, app not support BLE device`。`AppConfig` 至少应包含 `is_darkMode_support`、`is_need_ble_support`、`is_need_blemesh_support`、`is_scan_support`。
- **`thingsmart-ipcsdk` 是必需依赖**：RN 面板初始化时无条件加载 `TRCTRSPMediaManagerPackage`，即使设备不是 IPC，未引入 `thingsmart-ipcsdk` 也会因 `NoClassDefFoundError` 崩溃。
- **SDK 与 BOM 版本不匹配**：`thingsmart` SDK 版本必须与 `thingsmart-BizBundlesBom` 主版本一致，版本不一致会导致运行时 `NoSuchMethodError` 崩溃。
- **Mini Program 面板（`SMART_MINIPG`）需要额外依赖**：点击此类设备时，`goPanelWithCheckAndTip` 会静默取消并在 logcat 打印 `ClassNotFoundException: MiniAppRouter`。需引入以下两项（`thingsmart-bizbundle-miniapp` 由 BOM 管理版本，`miniapp_smart` 必须显式写版本）：
  ```kotlin
  implementation("com.thingclips.smart:thingsmart-bizbundle-miniapp")  // 传递 miniapp_shell + ThingMiniAppCore
  implementation("com.gzl.smart.gzlminiapp:miniapp_smart:3.34.0")     // MiniAppRouter 所在包
  ```
  同时，必须在 `Application.onCreate()` 的 **最前面**（`BizBundleInitializer.init()` 之前）加入：
  ```kotlin
  SoLoader.init(this, false)
  ```
  否则 `miniapp_smart` 的启动 Pipeline 初始化时会因找不到 `GZLMiniAppSDK` 或 `MiniAppVersion` 而崩溃。详见 `references/device-control-ui.md#miniapp-sdk-集成`。

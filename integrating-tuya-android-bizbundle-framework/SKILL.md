---
name: integrating-tuya-android-bizbundle-framework
description: 在 Android 应用中首次搭建涂鸦 BizBundle 通用框架层。适用于需要配置 BizBundleInitializer、Base_BizBundle_Theme 主题资源、BizBundleFamilyServiceImpl 注册及 onLogin/onLogout 生命周期回调的场景，必须在集成任何具体 BizBundle（设备控制 UI、家庭管理等）之前完成。
compatibility: Android, Kotlin, Tuya BizBundle 5.x
---

## 概述 {#description}

涂鸦 UI 业务包（BizBundle）的通用框架层初始化。所有具体 BizBundle（设备控制、家庭管理等）的**共同前置条件**，必须先完成本 skill 再集成任何具体业务包。

## 适用场景 {#scene}

已完成 `integrating-tuya-android-sdk` 和 `integrating-tuya-android-theme`，需要接入任意 BizBundle 之前执行。

**步骤顺序（不可乱）：**

1. **确认 Gradle 依赖已就绪**：`thingsmart-bizbundle-basekit`、`thingsmart-bizbundle-bizkit`、`thingsmart-bizbundle-family` 已在 `app/build.gradle.kts` 中引入，BOM 版本与 SDK 版本一致。详见 `references/framework-setup.md`。

2. **Application 初始化**：用 `BizBundleInitializer.init()` 替代手动调用 `ThingHomeSdk.init()`；紧接着注册 `BizBundleInitializer.registerService(AbsBizBundleFamilyService::class.java, BizBundleFamilyServiceImpl())`。详见 `references/framework-setup.md`。

3. **实现 `BizBundleFamilyServiceImpl`**：继承 `AbsBizBundleFamilyService`，实现 `getCurrentHomeId()` 和 `shiftCurrentFamily()`。详见 `references/framework-setup.md`。

4. **主题配置（必须）**：确认已完成 `integrating-tuya-android-theme` skill；新增 `Base_BizBundle_Theme`（parent 为基于 `Theme.AppCompat.DayNight.NoActionBar` 的 AppTheme）；新建 `res/drawable/bg_text_bts.xml`；`AndroidManifest.xml` 的 `<application>` 使用 `Base_BizBundle_Theme`，`tools:replace` 加上 `android:theme`。详见 `references/framework-setup.md`。

5. **登录/退出生命周期回调**：登录成功后调用 `BizBundleInitializer.onLogin()`；退出登录后调用 `BizBundleInitializer.onLogout(context)`。推荐在主页 Activity 的 `onCreate` 中调用 `onLogin()`。

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成
- `integrating-tuya-android-theme` — 前置：主题色插件配置
- `integrating-tuya-android-device-control-ui` — 后续：设备控制面板
- `integrating-tuya-android-device-activator-ui` — 后续：设备配网 UI
- `integrating-tuya-android-device-detail-ui` — 后续：设备详情 UI
- `integrating-tuya-android-home-bizbundle` — 后续：家庭管理 UI

## 注意事项 {#tip}

- **`BizBundleInitializer` 初始化顺序不能乱**：`init()` → `registerService(FamilyService)` 是固定顺序，颠倒会导致业务包内部无法获取 homeId。
- **主题不配会导致业务包 UI 崩溃**：不要跳过主题配置，设备控制面板依赖 `Base_BizBundle_Theme`。
- **`FamilyService.getCurrentHomeId()` 必须返回真实 homeId**：返回 0 会导致业务包内部功能异常。
- **`onLogin()` 漏调**：业务包内部有登录状态缓存，漏调会导致部分功能不可用。
- **`thing_theme_color_*` 颜色找不到**：这些颜色由 `thingOpenTheme` Gradle 插件生成，必须先完成 `integrating-tuya-android-theme` skill。暂不配置插件时可在 `compat_colors.xml` 中手动声明硬编码兜底值，但 UI 主题色会失效。
- **`lint.abortOnError` 未关闭**：BizBundle 内部资源缺少多语言兜底值，`aapt2` 会产生大量 warn 并导致构建失败。必须在 `app/build.gradle.kts` 的 `android {}` 块中加 `lint { abortOnError = false }`。

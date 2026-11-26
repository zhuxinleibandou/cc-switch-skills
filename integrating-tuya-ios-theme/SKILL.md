---
name: integrating-tuya-ios-theme
description: 在使用涂鸦 BizBundle 的 iOS 应用中配置主题色体系。适用于需要搭建 ThingSmartThemeManagerBizBundle pod、通过 thing_custom_config.json（colors/blackColors）自定义品牌色、通过 ThingThemeManagerProtocol 编程配置主题，以及通过 changeThemeStyle 切换深色模式的场景，需在 integrating-tuya-ios-bizbundle-framework 之前或同步完成。
compatibility: iOS 11+, Objective-C, Tuya BizBundle 5.x
---

## 概述 {#description}

涂鸦 iOS BizBundle 主题色体系通过 `thing_custom_config.json` 中的 `colors`（浅色）和 `blackColors`（深色）两段 JSON 配置驱动，也可在代码中通过 `ThingThemeManagerProtocol` 动态覆盖。

不配置主题的后果：BizBundle 内部页面颜色使用 SDK 默认值，应用无法与 BizBundle 页面保持视觉一致。

## 适用场景 {#scene}

已完成 `integrating-tuya-ios-sdk` 和 `integrating-tuya-ios-bizbundle-framework`，需要为 BizBundle 配置品牌色时使用。

**步骤：**

1. **Podfile 添加主题业务包依赖**：加入 `ThingSmartThemeManagerBizBundle`；执行 `pod update`。

2. **在 `thing_custom_config.json` 中配置主题色**：`colors` 节点配置浅色主题；`blackColors` 节点配置深色主题（可选，不填则深色模式下复用浅色值）。推荐只修改 `themeColor`，其余使用默认值。详见 `references/theme-config.md`。

3. **（可选）代码中动态覆盖主题色**：通过 `ThingSmartBizCore` 获取 `ThingThemeManagerProtocol` 服务，在 App 启动完成后、业务包打开之前调用。详见 `references/theme-config.md`。

4. **（可选）配置深色模式切换**：通过 `changeThemeStyle:` 切换浅色/深色/跟随系统；监听主题变更通知刷新界面。详见 `references/theme-config.md`。

完整 JSON 字段说明、颜色变量表、ObjC 代码配置示例、主题切换 API 见 `references/theme-config.md`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `integrating-tuya-ios-bizbundle-framework` — 前置/同步：BizBundle 框架初始化（本 skill 建议同步完成）
- `integrating-tuya-ios-device-control-ui` — 后续：设备控制面板依赖正确的主题配置

## 注意事项 {#tip}

- **JSON 字段名与 Android 略有差异**：iOS 用 `tipsColor`（Android 是 `tipColor`），`tabBarSelectedColor`（Android 是 `tabBarSelectColor`），填错不报错但不生效。
- **深色模式用 `blackColors` 不是 `darkColors`**：字段名是 `blackColors`，写成 `darkColors` 静默忽略。
- **代码动态配置必须在业务包打开之前调用**：`configNormalModuleWithThemeColor:...` 一旦业务包已加载则无法生效。
- **`ThingSmartThemeManagerBizBundle` 缺失时 `ThingThemeManagerProtocol` 服务为 nil**：通过 `serviceOfProtocol:` 获取到的 impl 会为 nil，调用会静默失败。
- **不能在 AppDelegate 的 `didFinishLaunchingWithOptions:` 中调用 `configNormalModuleWithThemeColor:`**：iOS 13+ Scene-based 架构中，此时 `UIWindow` 尚未创建，会导致 `EXC_BAD_ACCESS`。必须在 SceneDelegate 的 `makeKeyAndVisible` **之后**调用。

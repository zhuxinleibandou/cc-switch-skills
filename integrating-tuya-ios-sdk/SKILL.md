---
name: integrating-tuya-ios-sdk
description: 将涂鸦 Smart App SDK 集成到新建 iOS 应用中。适用于需要配置 CocoaPods Podfile、ThingSmartCryption 安全 SDK、AppDelegate 初始化、BundleId/AppKey/AppSecret 配置及排查 SING_VALIDATE_FALED 错误的场景。
compatibility: Xcode 12+, iOS 11+, CocoaPods, Objective-C or Swift
---

## 概述 {#description}

按 Tuya 官方 Smart App SDK 集成页推进 iOS 新工程接入。核心注意点：iOS SDK 有专属安全 SDK（`ThingSmartCryption`），需从涂鸦开发者平台构建并下载，与 Podfile 同级存放，通过本地路径引用。

## 适用场景 {#scene}

新建 iOS 工程需要接入涂鸦 SDK 时使用，或现有工程出现鉴权失败需要排查时使用。

**集成步骤：**

1. **确认工程形态**：检查 `Podfile`、`Info.plist`、`AppDelegate`，确认 BundleId 与涂鸦平台登记的包名一致。确认 Xcode 版本 ≥ 12.0，目标最低部署版本 ≥ iOS 11.0。

2. **从涂鸦平台构建并下载安全 SDK**：登录涂鸦开发者平台，选择 5.x.x 版本构建并下载。解压 `ios_core_sdk.tar.gz`，得到 `Build/` 目录和 `ThingSmartCryption.podspec`。将两者复制到工程根目录（即 Podfile 同级），Podfile 中使用 `path => './'` 引用。

3. **落地接入**：
   - 在 Podfile 顶部加入 Tuya Pod Specs source
   - 添加 `ThingSmartCryption`（本地路径）、`ThingSmartHomeKit`、`ThingSmartBusinessExtensionKit` 依赖（后两者必须同时声明）
   - 在 Podfile 中加 `use_frameworks!`
   - 执行 `pod install` 或 `pod update`
   - 在 `AppDelegate` 的 `application:didFinishLaunchingWithOptions:` 中初始化 SDK
   - 只在 DEBUG 模式开启 `debugMode`

4. **最小验证**：先跑 Build 确认无编译错误；再核对涂鸦平台的 BundleId、AppKey、AppSecret 是否与工程一致。

需要可复制的 Podfile 片段、ObjC/Swift 初始化代码、错误排查要点时，读取 `references/tuya-smart-app-sdk-ios-integration.md`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-bizbundle-framework` — 后续：BizBundle 框架层初始化
- `integrating-tuya-ios-theme` — 后续：主题色配置
- `building-tuya-ios-account-foundation` — 后续：账号体系
- `building-tuya-ios-home-foundation` — 后续：家庭管理基础能力

## 注意事项 {#tip}

- **`ThingSmartCryption` 是 App 专属安全 SDK**：`Build/` 目录是 App 专属的，不同应用不能共用；切换 AppKey 后必须重新构建下载。将 `Build/` 和 `ThingSmartCryption.podspec` 复制到 Podfile 同级，Podfile 中写 `path => './'`，不要使用子目录路径。
- **`use_frameworks!` 必须加**：否则 CocoaPods 不会把 static xcframework 内层 slice 路径写入 `FRAMEWORK_SEARCH_PATHS`，导致 `#import <ThingSmartHomeKit/ThingSmartKit.h>` 报 `file not found`。
- **`ThingSmartHomeKit` 和 `ThingSmartBusinessExtensionKit` 必须同时声明**：两者不互相包含，Podfile 中必须同时写入。
- **`post_install` 中需动态 glob 所有 xcframework slice 路径**：只写 ThingSmartHomeKit 和 ThingSmartBusinessExtensionKit 两个路径不够，`ThingSmartKit.h` 传递导入多个子 framework，必须覆盖全部 xcframework slice。详见 `references/tuya-smart-app-sdk-ios-integration.md`。
- **Apple Silicon Mac 上需统一 `EXCLUDED_ARCHS`**：需要在 `post_install` 中为所有 pod targets 统一设 `EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64`，避免架构冲突。
- BundleId、AppKey、AppSecret 三者任意一个与涂鸦平台不匹配，均会导致 `SING_VALIDATE_FALED`。

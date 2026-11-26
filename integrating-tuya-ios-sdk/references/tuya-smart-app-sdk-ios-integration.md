# Tuya Smart App SDK iOS 集成参考

## Source

- 官方文档: <https://developer.tuya.com/cn/docs/app-development/integrate-sdk.md?id=Ka5d52ewngdoi>
- Objective-C Demo: <https://github.com/tuya/tuya-home-ios-sdk-sample-objc>
- Swift Demo（推荐，objc 版已停止维护）: <https://github.com/tuya/tuya-home-ios-sdk-sample-swift>
- 整理于 2026-04-16，官方文档当前版本为 5.x。

## 关键前提

- 最低部署版本：iOS 11.0（官方 Podfile 示例），Demo 工程要求 iOS 12+，建议新工程直接用 iOS 13+
- Xcode 版本：≥ 12.0
- CocoaPods：需更新至最新版本
- **`ThingSmartCryption` 是 App 专属安全 SDK，从平台构建下载，必须与 Podfile 同级，通过本地路径引用**

## 文件结构

从涂鸦平台下载并解压 `ios_core_sdk.tar.gz` 后，需将 `Build/` 和 `ThingSmartCryption.podspec` 复制到工程根目录（Podfile 同级）：

```text
YourProject/
├── Podfile
├── ThingSmartCryption.podspec   ← 从解压目录复制到这里
├── Build/                       ← 从解压目录复制到这里（App 专属安全 SDK）
│   └── ...
├── YourApp.xcodeproj
└── YourApp/
    ├── AppDelegate.m / AppDelegate.swift
    └── ...
```

> `ios_core_sdk.tar.gz` 可保留在独立子目录（如 `iOS_SDK/`）管理，但 `Build/` 和 `ThingSmartCryption.podspec` 必须复制到与 Podfile 同级的根目录。

## Podfile 配置

```ruby
source 'https://github.com/tuya/tuya-pod-specs.git'
source 'https://cdn.cocoapods.org/'
platform :ios, '13.0'
use_frameworks!

target 'YourApp' do
    # ThingSmartCryption 必须本地路径引用，./ 指向工程根目录（podspec 所在位置）
    pod 'ThingSmartCryption', :path => './'

    # ThingSmartBusinessExtensionKit 不包含 ThingSmartHomeKit，两者必须同时声明
    pod 'ThingSmartHomeKit'
    pod 'ThingSmartBusinessExtensionKit'
end

post_install do |installer|
    # ThingSmartHomeKit / ThingSmartBusinessExtensionKit 及其所有传递依赖均为 static xcframework。
    # CocoaPods 不为静态 xcframework 生成 [CP] Copy XCFrameworks phase，
    # XCFrameworkIntermediates 目录在编译前始终为空，导致 #import <ThingSmartHomeKit/ThingSmartKit.h>
    # 报 file not found 或 Could not build module。
    # 修复：动态发现 Pods 目录下所有 xcframework 的 ios-* slice 内层路径，写入主工程
    # project.pbxproj 的 FRAMEWORK_SEARCH_PATHS（比改 xcconfig 更可靠，project.pbxproj 优先级更高）。
    # 注意：只写直接声明的两个 Kit 不够——ThingSmartKit.h 会传递 #import 多个子 framework，
    # 必须用动态 glob 覆盖所有 xcframework slice，否则报 Could not build module。
    sandbox_root = installer.sandbox.root.to_s
    project_root = File.dirname(sandbox_root)

    # Pods/ 下所有 xcframework 的 ios-* slice 内层路径
    pods_paths = Dir.glob("#{sandbox_root}/**/*.xcframework/ios-*/").select { |d|
        File.directory?(d)
    }.map { |d|
        relative = d.chomp('/').sub("#{sandbox_root}/", '')
        "\"$(PODS_ROOT)/#{relative}\""
    }

    # 项目根目录 Build/ 下的 xcframework（如 ThingSmartCryption 本地安全 SDK）
    # 该目录不在 Pods/ 内，必须单独 glob 并以 $(SRCROOT) 构造路径
    build_paths = Dir.glob("#{project_root}/Build/**/*.xcframework/ios-*/").select { |d|
        File.directory?(d)
    }.map { |d|
        relative = d.chomp('/').sub("#{project_root}/", '')
        "\"$(SRCROOT)/#{relative}\""
    }

    inner_paths = (pods_paths + build_paths).uniq

    main_project = installer.aggregate_targets.first.user_project
    main_project.targets.select { |t| t.name == 'YourApp' }.each do |target|
        target.build_configurations.each do |config|
            paths = Array(config.build_settings['FRAMEWORK_SEARCH_PATHS'] || ['$(inherited)'])
            paths.unshift('$(inherited)') unless paths.include?('$(inherited)')
            inner_paths.each { |p| paths << p unless paths.include?(p) }
            config.build_settings['FRAMEWORK_SEARCH_PATHS'] = paths
            # Tuya 静态 xcframework 的头文件会传递 #import 源码 pod（如 YYModel）的头文件。
            # Clang 模块预编译时 YYModel.framework 尚未构建，导致 Could not build module。
            # 禁用模块系统，改为传统 textual #import，依赖 FRAMEWORK_SEARCH_PATHS 按序查找。
            config.build_settings['CLANG_ENABLE_MODULES'] = 'NO'
            # use_frameworks! 下 <YYModel/YYModel.h> 依赖 ${PODS_CONFIGURATION_BUILD_DIR}/YYModel/
            # YYModel.framework（只在 YYModel 编译完成后才存在）。
            # 直接把源码目录加入 HEADER_SEARCH_PATHS：Pods/YYModel/YYModel/YYModel.h
            # 即可无需 YYModel 先完成编译就能解析该 textual include。
            header_paths = Array(config.build_settings['HEADER_SEARCH_PATHS'] || ['$(inherited)'])
            header_paths.unshift('$(inherited)') unless header_paths.include?('$(inherited)')
            header_paths << '"$(PODS_ROOT)/YYModel"' unless header_paths.include?('"$(PODS_ROOT)/YYModel"')
            config.build_settings['HEADER_SEARCH_PATHS'] = header_paths
        end
    end
    main_project.save

    installer.pods_project.targets.each do |target|
        target.build_configurations.each do |config|
            config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
            config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
            # 统一设为 arm64（与主工程 xcconfig 的 = arm64 一致），使 pod source targets
            # （libwebp、YYModel 等）也以 x86_64 Simulator 编译，否则报：
            # · ld: framework 'YYModel' not found（source pod 编 arm64，主工程编 x86_64）
            # · Undefined symbols for architecture x86_64: _WebPConfigInitInternal（libwebp 编 arm64）
        end
    end
end
```

如果项目包含 Widget 或 Siri 扩展 target：

```ruby
target 'YourExtensionTarget' do
    pod 'ThingSmartCryption', :path => './'
    pod 'ThingSmartHomeKit'
    
    # Widget 需要关闭 APPLICATION_EXTENSION_API_ONLY
end

post_install do |installer|
    installer.pods_project.targets.each do |target|
        target.build_configurations.each do |config|
            config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'NO'
        end
    end
end
```

## 头文件导入

两个 Kit 均为 **static xcframework** 二进制 pod。CocoaPods 不为静态 xcframework 生成 `[CP] Copy XCFrameworks` phase，`XCFrameworkIntermediates` 目录在编译前始终为空，编译器找不到 `.framework`，导致 `#import <ThingSmartHomeKit/ThingSmartKit.h>` 报 `file not found`。必须在 Podfile `post_install` 中通过 Xcodeproj 把各架构 slice 的内层路径写入主工程 `project.pbxproj` 的 `FRAMEWORK_SEARCH_PATHS`（见 Podfile 示例）。

### Objective-C 工程

在 `AppDelegate.m`（或 `PrefixHeader.pch`）中：

```objc
#import <ThingSmartHomeKit/ThingSmartKit.h>
#import <ThingSmartBusinessExtensionKit/ThingSmartBusinessExtensionKit.h>
```

### Swift 工程

在 `xxx_Bridging-Header.h` 桥接头文件中：

```objc
#import <ThingSmartHomeKit/ThingSmartKit.h>
#import <ThingSmartBusinessExtensionKit/ThingSmartBusinessExtensionKit.h>
```

> `ThingSmartBusinessExtensionKit` 不包含 `ThingSmartHomeKit` 的头文件，两者必须同时导入。

## AppDelegate 初始化

### Objective-C

```objc
#import "AppDelegate.h"
#import <ThingSmartHomeKit/ThingSmartKit.h>
#import <ThingSmartBusinessExtensionKit/ThingSmartBusinessExtensionKit.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    
    // 初始化 SDK（AppKey 和 AppSecret 从涂鸦平台获取）
    [[ThingSmartSDK sharedInstance] startWithAppKey:APP_KEY secretKey:APP_SECRET_KEY];
    
    // 若集成了 ThingSmartBusinessExtensionKit，需额外调用
    [ThingSmartBusinessExtensionConfig setupConfig];
    
    // Debug 模式（仅开发期开启）
#ifdef DEBUG
    [[ThingSmartSDK sharedInstance] setDebugMode:YES];
#endif
    
    return YES;
}

@end
```

### Swift

```swift
import UIKit
// 在 Bridging-Header.h 中已同时导入 ThingSmartKit 和 ThingSmartBusinessExtensionKit，这里直接使用

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        
        // 初始化 SDK
        ThingSmartSDK.sharedInstance()?.start(withAppKey: APP_KEY, secretKey: APP_SECRET_KEY)
        
        // 若集成了 ThingSmartBusinessExtensionKit
        ThingSmartBusinessExtensionConfig.setupConfig()
        
        // Debug 模式
        #if DEBUG
        ThingSmartSDK.sharedInstance()?.debugMode = true
        #endif
        
        return true
    }
}
```

## AppKey 配置方式

推荐用独立头文件存放密钥（不提交到版本控制）：

**AppKey.h**

```objc
// 从涂鸦开发者平台 SDK 详情页 -> 获取密钥 中获取
#define APP_KEY        @"<#your_app_key#>"
#define APP_SECRET_KEY @"<#your_secret_key#>"
```

在 `.gitignore` 中排除：

```gitignore
AppKey.h
```

或者使用 Xcode User-Defined Build Settings + xcconfig 方式，避免密钥进入版本控制。

## Widget / AppGroups 配置

AppGroups 需要付费开发者账号，初始化前设置：

```objc
// 在 startWithAppKey: 之前设置
[ThingSmartSDK sharedInstance].appGroupId = @"group.your.app.group.name";
[[ThingSmartSDK sharedInstance] startWithAppKey:APP_KEY secretKey:APP_SECRET_KEY];
```

## 涂鸦平台核对项

即使本地配置全对，平台侧配置不匹配也会失败。最常见核对项：

- iOS BundleId 必须与工程 Bundle Identifier 一致
- 使用的 AppKey / AppSecret 必须来自同一个 SDK 应用
- 从平台构建的 `ThingSmartCryption` 必须对应当前 AppKey 的应用

## 常见错误排查

### SING_VALIDATE_FALED

```json
{
  "success": false,
  "errorCode": "SING_VALIDATE_FALED",
  "errorMsg": "Permission Verification Failed"
}
```

排查顺序：
1. 确认 BundleId 与涂鸦平台登记的 iOS 包名完全一致
2. 确认 AppKey 和 AppSecret 填写正确，无多余空格
3. 确认 `ThingSmartCryption` 的 `Build/` 目录是当前 AppKey 对应的构建产物（不是旧版或他人的）
4. 购买正式版后，需重新在平台构建 SDK 并替换 `Build/` 和 `ThingSmartCryption.podspec`

### CocoaPods 相关

- `pod install` 后没有 `ThingSmartCryption`：确认 `ThingSmartCryption.podspec` 和 `Build/` 已复制到工程根目录（Podfile 同级），且 Podfile 中使用 `path => './'`（不是子目录路径）
- source 拉不到：检查 `source 'https://github.com/tuya/tuya-pod-specs.git'` 是否在 Podfile 顶部
- `pod update` vs `pod install`：首次集成用 `pod install`；更新依赖版本用 `pod update`

### Undefined symbols for architecture x86_64

```
Undefined symbols for architecture x86_64:
  "_WebPConfigInitInternal", referenced from:
      _ThingCGImageCreateEncodedWebPData in ThingEncryptImage[...](ThingEncryptImageCoder.o)
```

原因：Tuya 预编译库（`ThingEncryptImage` 等）的 x86_64 Simulator 切片缺少 WebP 符号。Apple Silicon Mac 上 Simulator 原生是 arm64，无需构建 x86_64 切片。

修复：在 `post_install` 中加入：

```ruby
config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'x86_64'
```

## 不再适用的旧方案

以下内容来自旧版文档，当前（5.x SDK）**不要使用**：

- `t_s.bmp` 安全图片文件
- `TUYA_SMART_APPKEY` / `TUYA_SMART_SECRET` 配置方式（旧命名）
- 5.x 以下版本的迁移需要先参考[迁移指南](https://developer.tuya.com/cn/docs/app-development/migration_guide?id=Kci3zqm3wlcut)

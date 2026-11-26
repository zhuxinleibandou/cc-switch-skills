# BizBundle Framework Setup

## Source

- <https://developer.tuya.com/cn/docs/app-development/framework?id=Ka8j2895qdvtj>

## Read This When

- 首次集成任何涂鸦 UI 业务包
- 配置 Podfile BizBundle 基础依赖
- 创建 `thing_custom_config.json` 配置文件
- 在 AppDelegate 注册 route/service 处理器
- 登录后调用 `updateConfig`

---

## 1. Podfile 配置

在已有 `ThingSmartHomeKit` 和 `ThingSmartCryption` 的基础上，追加 BizBundle 基础依赖：

```ruby
source 'https://github.com/tuya/tuya-pod-specs.git'
source 'https://cdn.cocoapods.org/'

platform :ios, '11.0'

target 'your_target_name' do
    # 基础 SDK（已有）
    pod 'ThingSmartCryption', :path => './'
    pod 'ThingSmartHomeKit'

    # BizBundle 框架基座（必选）
    pod 'ThingSmartBizCore'
    pod 'ThingModuleServices'

    # 具体业务包按需引入，例如：
    # pod 'ThingSmartDeviceControlBizBundle'
    # pod 'ThingSmartFamilyBizBundle'
    # pod 'ThingSmartActivatorBizBundle'
end
```

修改 Podfile 后执行：

```bash
pod update
```

---

## 2. thing_custom_config.json

在工程根目录（与 `Podfile` 同级）创建 `thing_custom_config.json`：

```json
{
    "config": {
        "appId": 123,
        "thingAppKey": "xxxxxxxxxxxx",
        "appScheme": "ThingSmart",
        "hotspotPrefixs": ["SmartLife"],
        "needBle": true
    },
    "colors": {
        "themeColor": "#FF5A28"
    }
}
```

字段说明：

| 字段 | 说明 |
|---|---|
| `appId` | 涂鸦平台应用 ID（整数） |
| `thingAppKey` | 涂鸦平台 AppKey |
| `appScheme` | 应用 URL Scheme，与 Info.plist 中配置一致 |
| `hotspotPrefixs` | 配网热点前缀，按平台实际值填写 |
| `needBle` | 是否需要蓝牙配网能力 |
| `themeColor` | 业务包主题色（十六进制） |

---

## 3. SceneDelegate 初始化（Scene 架构）

> **重要**：`setupConfig` 和 `registerRouteWithHandler:` 必须在 `makeKeyAndVisible` **之后**调用。
> 两者会启动 `ThingModuleTaskManager` 后台线程并持有内部锁；若提前调用，
> `makeKeyAndVisible` 触发 `UIWindowDidBecomeKeyNotification` 时主线程会死锁，
> 崩溃表现为 `EXC_BAD_ACCESS` 在 `[self.window makeKeyAndVisible]` 处。

```objc
#import "SceneDelegate.h"
#import <ThingSmartBizCore/ThingSmartBizCore.h>
#import <ThingSmartBusinessExtensionKit/ThingSmartBusinessExtensionKit.h>

@implementation SceneDelegate

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session
      options:(UISceneConnectionOptions *)connectionOptions {

    if (![scene isKindOfClass:[UIWindowScene class]]) return;
    UIWindowScene *ws = (UIWindowScene *)scene;

    // 1. 先完成 window 创建与展示
    self.window = [[UIWindow alloc] initWithWindowScene:ws];
    self.window.rootViewController = [[YourRootViewController alloc] init];
    [self.window makeKeyAndVisible];  // ← 必须在此行之后才能初始化 BizBundle

    // 2. BizBundle 框架初始化（顺序不可颠倒）
    [ThingSmartBusinessExtensionConfig setupConfig];
    [[ThingSmartBizCore sharedInstance] registerRouteWithHandler:^BOOL(NSString *url, NSDictionary *raw) {
        // 处理业务包内部未实现的路由跳转，return NO 表示不拦截
        return NO;
    }];
}

@end
```

AppDelegate 中**不应**包含任何 BizBundle 初始化代码，只保留 SDK 初始化：

```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [[ThingSmartSDK sharedInstance] startWithAppKey:@"your_app_key"
                                          secretKey:@"your_secret_key"];
    return YES;
}
```

---

## 4. 登录后调用 updateConfig

用户登录成功后，必须主动调用 `updateConfig`，否则业务包内部缓存数据不完整，功能会异常：

```objc
// 在登录成功回调中调用
[[ThingSmartBizCore sharedInstance] updateConfig];
```

推荐位置：登录 ViewModel 或 ViewController 的登录成功回调里，与跳转主页的逻辑并列执行。

---

## 5. Service 注册 API（按需使用）

`ThingSmartBizCore` 提供服务注册与获取接口，具体业务包集成时按各自文档调用：

```objc
// 注册服务（单例形式）
[[ThingSmartBizCore sharedInstance] registerService:@protocol(YourServiceProtocol)
                                       withInstance:yourInstance];

// 注册服务（类形式，每次调用时实例化）
[[ThingSmartBizCore sharedInstance] registerService:@protocol(YourServiceProtocol)
                                          withClass:[YourServiceClass class]];

// 获取已注册的服务
id<YourServiceProtocol> service = [[ThingSmartBizCore sharedInstance]
                                   serviceOfProtocol:@protocol(YourServiceProtocol)];
```

---

## 6. 语言切换（可选）

```objc
// 切换业务包语言
[[ThingSmartBizCore sharedInstance] languageSwitchTo:ThingSmartBizLanguageKeyZh];

// 获取推荐语言列表
NSDictionary *recommended = [[ThingSmartBizCore sharedInstance] recommendedLanguages];

// 获取当前语言
ThingSmartBizLanguageKey currentLang = [[ThingSmartBizCore sharedInstance] currentLanguageKey];
```

切换语言后需重新设置 deviceToken：

```objc
[ThingSmartSDK sharedInstance].deviceToken = deviceToken;
```

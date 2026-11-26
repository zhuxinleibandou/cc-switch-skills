# Tuya iOS Theme Configuration

## Source

- <https://developer.tuya.com/cn/docs/app-development/iosThemeBizbundle?id=Kapvruj6q7d5v>

## Read This When

- 配置 `thing_custom_config.json` 主题色字段
- 代码动态覆盖主题颜色
- 配置深色模式支持
- 需要在应用代码中获取当前主题颜色
- 监听主题变更通知

---

## 1. Podfile 配置

在已有 BizBundle 基础依赖的基础上，追加主题业务包：

```ruby
pod 'ThingSmartThemeManagerBizBundle'
```

执行 `pod update` 后生效。

---

## 2. thing_custom_config.json 主题色配置

`colors` 对应浅色主题，`blackColors` 对应深色主题，两者字段相同：

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
        "themeColor": "#FF5A28",
        "backgroundColor": "#F8F8F8",
        "warningColor": "#FF4444",
        "tipsColor": "#00CC99",
        "guideColor": "#1989FA",
        "navigationBarColor": "#FFFFFF",
        "tabBarSelectedColor": "#FF5A28",
        "alertMaskAlpha": 0.4
    },
    "blackColors": {
        "themeColor": "#FF5A28",
        "backgroundColor": "#000000",
        "warningColor": "#FF4444",
        "tipsColor": "#2DDA86",
        "guideColor": "#1989FA",
        "navigationBarColor": "#1A1A1A",
        "tabBarSelectedColor": "#FF5A28",
        "alertMaskAlpha": 0.7
    }
}
```

### 颜色字段说明

| 字段名 | 含义 | 浅色默认值 | 深色默认值 |
|---|---|---|---|
| `themeColor` | 品牌主色，唯一推荐自定义 | `#FF5A28` | `#FF5A28` |
| `backgroundColor` | 页面背景色 | `#F8F8F8` | `#000000` |
| `warningColor` | 警告色 | `#FF4444` | `#FF4444` |
| `tipsColor` | 提示色（注意：iOS 是 `tipsColor`，非 `tipColor`） | `#00CC99` | `#2DDA86` |
| `guideColor` | 引导色 | `#1989FA` | `#1989FA` |
| `navigationBarColor` | 导航栏背景色 | `#FFFFFF` | `#1A1A1A` |
| `tabBarSelectedColor` | Tab 栏选中色（注意：iOS 是 `tabBarSelectedColor`） | `#FF5A28` | `#FF5A28` |
| `alertMaskAlpha` | 弹窗蒙层透明度（0.0 ~ 1.0） | `0.4` | `0.7` |

---

## 3. 代码动态配置主题（ObjC）

在 App 启动完成后、业务包打开之前调用，可覆盖 JSON 配置：

```objc
id<ThingThemeManagerProtocol> impl =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingThemeManagerProtocol)];

// 配置浅色主题
[impl configNormalModuleWithThemeColor:[UIColor thing_colorWithHexString:@"FF5A28"]
                       backgroundColor:[UIColor thing_colorWithHexString:@"F8F8F8"]
                          warningColor:[UIColor thing_colorWithHexString:@"FF4444"]
                             tipsColor:[UIColor thing_colorWithHexString:@"00CC99"]
                            guideColor:[UIColor thing_colorWithHexString:@"1989FA"]
                     navigationBarColor:[UIColor thing_colorWithHexString:@"FFFFFF"]
                    tabBarSelectedColor:[UIColor thing_colorWithHexString:@"FF5A28"]
                       alertMaskAlpha:@(0.4)];
```

> `impl` 为 nil 时调用会静默失败。确认已引入 `ThingSmartThemeManagerBizBundle` pod。

---

## 4. 深色模式切换（ObjC）

```objc
id<ThingThemeManagerProtocol> impl =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingThemeManagerProtocol)];

// 跟随系统（UIUserInterfaceStyleUnspecified）
[impl changeThemeStyle:UIUserInterfaceStyleUnspecified];

// 强制浅色
[impl changeThemeStyle:UIUserInterfaceStyleLight];

// 强制深色
[impl changeThemeStyle:UIUserInterfaceStyleDark];

// 查询当前样式
UIUserInterfaceStyle current = [impl currentThemeStyle];

// 判断是否深色模式
BOOL isDark = [impl isDarkMode];
```

---

## 5. 监听主题变更（ObjC）

界面需要根据主题重绘时，在 ViewController 或 View 中注册：

```objc
[self.view thingTheme_registerChangeAction:^{
    // 主题发生变化，执行界面重绘
    [self updateUIForCurrentTheme];
} withKey:@"myUniqueKey"];
```

> `withKey` 用于标识监听方，同一 key 多次注册会覆盖上一次的回调。

---

## 6. 颜色 Token 体系

`ThingThemeManagerProtocol` 提供的语义颜色，可在应用自定义页面中获取以保持与 BizBundle 页面视觉一致：

**主色系**

| Token | 含义 |
|---|---|
| `themeColor` | 品牌主色 |
| `warningColor` | 警告色 |
| `tipsColor` | 提示色 |
| `guideColor` | 引导色 |
| `tabBarSelectedColor` | Tab 选中色 |

**背景色系**

| Token | 含义 |
|---|---|
| `backgroundColor` | 页面背景色 |
| `navigationBarColor` | 导航栏背景色 |
| `bottomTabBarBgColor` | 底部 Tab 栏背景色 |
| `cardBgColor` | 卡片背景色 |
| `alertBgColor` | 弹窗背景色 |
| `listCellBgColor` | 列表 Cell 背景色 |

**文字色系**

| Token | 含义 |
|---|---|
| `headLineColor` | 标题/主文字色 |
| `subheadColor` | 副标题文字色 |
| `auxiLiaryColor` | 辅助文字色 |
| `disableColor` | 禁用状态文字色 |
| `themeTextColor` | 主题色背景上的文字色（通常为白） |
| `warningTextColor` | 警告文字色 |
| `navigationBarTextColor` | 导航栏文字色 |

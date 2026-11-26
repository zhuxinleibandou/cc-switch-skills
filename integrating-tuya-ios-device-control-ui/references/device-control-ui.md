# 设备控制 UI 业务包 — 详细参考

## Source

- <https://developer.tuya.com/cn/docs/app-development/devicecontrol?id=Ka8qf8lnahsf8>

---

## 1. Podfile 配置

```ruby
source 'https://github.com/tuya/tuya-pod-specs.git'
source 'https://cdn.cocoapods.org/'

platform :ios, '11.0'

target 'your_target_name' do
    pod 'ThingSmartCryption', :path => './'
    pod 'ThingSmartHomeKit'
    pod 'ThingSmartBizCore'
    pod 'ThingModuleServices'

    # 设备控制 UI 业务包（必选）
    pod 'ThingSmartPanelBizBundle'
end
```

修改 Podfile 后执行 `pod update`。

---

## 2. Info.plist 权限配置

面板功能可能用到多种系统权限，建议提前全部配置：

```xml
<!-- 相册（面板截图/保存图片） -->
<key>NSPhotoLibraryAddUsageDescription</key>
<string>需要访问相册</string>

<!-- 相机（扫码/视频设备） -->
<key>NSCameraUsageDescription</key>
<string>需要使用相机</string>

<!-- 定位（地图类面板） -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>需要获取位置信息</string>

<!-- 麦克风（语音/视频类设备） -->
<key>NSMicrophoneUsageDescription</key>
<string>需要使用麦克风</string>

<!-- 蓝牙（BLE 设备面板） -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>需要使用蓝牙</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>需要使用蓝牙</string>
```

---

## 3. ThingFamilyProtocol 注册（必须）

面板业务包内部通过 `ThingFamilyProtocol` 获取当前家庭，打开面板前必须完成注册。

```objc
// 通常在 AppDelegate 或 CurrentHomeManager 初始化时注册
[[ThingSmartBizCore sharedInstance] registerService:@protocol(ThingFamilyProtocol)
                                       withInstance:self];
```

实现协议方法（self 或任意持有 currentHomeId 的对象）：

```objc
- (ThingSmartHome *)getCurrentHome {
    long long currentHomeId = [CurrentHomeManager sharedInstance].currentHomeId;
    return [ThingSmartHome homeWithHomeId:currentHomeId];
}
```

> **注意**：若已在集成家庭管理 UI 业务包（`ThingSmartFamilyBizBundle`）时注册过 `ThingFamilyProtocol`，此处**无需重复注册**，同一实例可同时服务两个业务包。

---

## 4. ThingPanelProtocol — 面板入口协议

```objc
@protocol ThingPanelProtocol <NSObject>
@optional
// 清除面板缓存
- (void)cleanPanelCache;
// 获取单设备面板控制器
- (void)getPanelViewControllerWithDeviceModel:(ThingSmartDeviceModel *)deviceModel
                                 initialProps:(nullable NSDictionary *)initialProps
                                 contextProps:(nullable NSDictionary *)contextProps
                            completionHandler:(void (^)(UIViewController * _Nullable vc,
                                                        NSError * _Nullable error))completionHandler;
// 获取群组面板控制器
- (void)getPanelViewControllerWithGroupModel:(ThingSmartGroupModel *)groupModel
                                initialProps:(nullable NSDictionary *)initialProps
                                contextProps:(nullable NSDictionary *)contextProps
                           completionHandler:(void (^)(UIViewController * _Nullable vc,
                                                       NSError * _Nullable error))completionHandler;
@end
```

| 参数 | 类型 | 说明 |
|---|---|---|
| `deviceModel` | ThingSmartDeviceModel | 目标设备模型 |
| `groupModel` | ThingSmartGroupModel | 目标群组模型 |
| `initialProps` | NSDictionary | 自定义初始化参数（以 `@"extraInfo"` 为 key） |
| `contextProps` | NSDictionary | 自定义面板上下文（以 `@"extraInfo"` 为 key） |
| `completionHandler` | Block | 面板加载完成回调，vc 为面板控制器，error 为失败原因 |

---

## 5. 打开设备面板

```objc
id<ThingPanelProtocol> panelService =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingPanelProtocol)];

[panelService getPanelViewControllerWithDeviceModel:deviceModel
                                       initialProps:nil
                                       contextProps:nil
                                  completionHandler:^(UIViewController *vc, NSError *error) {
    if (error || !vc) {
        NSLog(@"panel load error: %@", error);
        return;
    }
    [self.navigationController pushViewController:vc animated:YES];
}];
```

---

## 6. 打开群组面板

```objc
id<ThingPanelProtocol> panelService =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingPanelProtocol)];

[panelService getPanelViewControllerWithGroupModel:groupModel
                                      initialProps:nil
                                      contextProps:nil
                                 completionHandler:^(UIViewController *vc, NSError *error) {
    if (error || !vc) {
        NSLog(@"group panel load error: %@", error);
        return;
    }
    [self.navigationController pushViewController:vc animated:YES];
}];
```

---

## 7. 清除面板缓存

```objc
id<ThingPanelProtocol> panelService =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingPanelProtocol)];

if ([panelService respondsToSelector:@selector(cleanPanelCache)]) {
    [panelService cleanPanelCache];
}
```

---

## 8. 可选协议（按需注册）

面板内部可能触发跳转到其他页面的行为，通过注册以下协议实现对应跳转逻辑：

| 协议 | 用途 |
|---|---|
| `ThingDeviceDetailProtocol` | 面板右上角「设备详情」跳转 |
| `ThingSettingsProtocol` | 面板按键音控制 |
| `ThingOTAGeneralProtocol` | 面板触发 OTA 固件升级检测 |
| `ThingGroupHandleProtocol` | Mesh 群组管理页跳转 |
| `ThingRNCameraProtocol` | 摄像头设备 RN 面板 |
| `ThingCameraProtocol` | 摄像头设备原生面板 |

注册方式与 `ThingFamilyProtocol` 一致：

```objc
[[ThingSmartBizCore sharedInstance] registerService:@protocol(ThingDeviceDetailProtocol)
                                       withInstance:deviceDetailHandler];
```

---

## 前置条件核查清单

- [ ] 已完成 `integrating-tuya-ios-sdk`
- [ ] 已完成 `integrating-tuya-ios-bizbundle-framework`（`updateConfig` 已在登录后调用）
- [ ] 用户已登录
- [ ] `currentHomeId` 有效（不为 0）
- [ ] `ThingFamilyProtocol` 已注册且 `getCurrentHome` 返回有效 home
- [ ] Info.plist 已添加所需权限

---

## Pitfalls

- **`completionHandler` 中不检查 error**：`vc` 为 nil 时直接 push 会 crash，必须先判断 `if (error || !vc) return`。
- **`ThingFamilyProtocol` 重复注册**：同一 protocol 多次注册时，后注册的实例会覆盖前一个，避免在多处分散注册同一协议。
- **homeId 传字符串**：`homeWithHomeId:` 接收 `long long`，从 `NSString` 或 `NSNumber` 转换时注意类型。
- **`updateConfig` 未调用**：登录后忘记调用 `[[ThingSmartBizCore sharedInstance] updateConfig]`，面板业务包内部状态异常，加载失败。

# 设备配网 UI 业务包 — 详细参考

## Source

- <https://developer.tuya.com/cn/docs/app-development/deviceconfiguration?id=Ka8qf8lipvifj>

## 功能说明

设备配网 UI 业务包支持以下配网方式：
- Wi-Fi 快连模式（EZ 模式）
- 热点模式（AP 模式）
- IPC 扫码配网
- Zigbee 子设备配网
- 蓝牙配网（BLE）
- 蓝牙 Mesh 配网
- Matter 配网
- 二维码扫码配网
- 自动发现配网

---

## 1. Podfile 配置

### 基础依赖（必选）

```ruby
source 'https://github.com/tuya/tuya-pod-specs.git'
source 'https://cdn.cocoapods.org/'

platform :ios, '11.0'

target 'your_target_name' do
    pod 'ThingSmartCryption', :path => './'
    pod 'ThingSmartHomeKit'
    pod 'ThingSmartBizCore'
    pod 'ThingModuleServices'

    # 配网 UI 业务包（必选）
    pod 'ThingSmartActivatorBizBundle'
end
```

### 蓝牙配网扩展（可选）

**SDK < 5.8.0：**
```ruby
pod 'ThingBLEHomeManager'
pod 'ThingBLEInterfaceImpl'
pod 'ThingBLEMeshInterfaceImpl'
pod 'ThingSmartBLEKit'
pod 'ThingSmartBLEMeshKit'
```

**SDK ≥ 5.8.0：**
```ruby
pod 'ThingSmartBusinessExtensionKitBLEExtra'
```

### Matter 配网扩展（可选）

```ruby
target 'your_target_name' do
    pod 'ThingSmartBusinessExtensionKitMatterExtra'
end

target 'MatterExtension' do
    pod 'ThingSmartMatterExtensionKit'
end
```

修改 Podfile 后执行 `pod update`。

---

## 2. Info.plist 权限配置

```xml
<!-- 定位权限（Wi-Fi 配网必须） -->
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>配网需要获取位置信息</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>配网需要获取位置信息</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>配网需要获取位置信息</string>

<!-- 相机权限（扫码配网必须） -->
<key>NSCameraUsageDescription</key>
<string>扫码配网需要使用相机</string>

<!-- 蓝牙权限（蓝牙配网必须） -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>蓝牙配网需要使用蓝牙</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>蓝牙配网需要使用蓝牙</string>

<!-- Matter 配网（可选） -->
<key>com.apple.developer.matter.allow-setup-payload</key>
<true/>
<key>NSBonjourServices</key>
<array>
    <string>_meshcop._udp</string>
    <string>_matterd._udp</string>
    <string>_matter._tcp</string>
    <string>_matterc._udp</string>
</array>
```

---

## 3. thing_custom_config.json 配置

在已有 `config` 节点中追加配网相关字段：

```json
{
    "config": {
        "appId": 123,
        "thingAppKey": "xxxxxxxxxxxx",
        "appScheme": "ThingSmart",
        "hotspotPrefixs": ["SmartLife"],
        "needBle": true,
        "needQRCode": true,
        "is_matter_support": true,
        "activator_auto_serach_capacity": {
            "searchTypeBle": true,
            "searchTypeEZ": false,
            "searchTypePegasus": true,
            "searchTypeWired": true,
            "searchTypeZigbee": true,
            "searchTypeMatter": true
        }
    },
    "colors": {
        "themeColor": "#FF5A28"
    }
}
```

> **注意**：`activator_auto_serach_capacity` 中 `serach` 是官方文档中的拼写（非 `search`），必须与此保持一致。

### 自动发现字段说明

| 字段 | 说明 |
|---|---|
| `searchTypeBle` | 是否自动搜索 BLE 设备 |
| `searchTypeEZ` | 是否自动搜索 Wi-Fi EZ 模式设备 |
| `searchTypePegasus` | 是否自动搜索闪电配网设备 |
| `searchTypeWired` | 是否自动搜索有线设备 |
| `searchTypeZigbee` | 是否自动搜索 Zigbee 子设备 |
| `searchTypeMatter` | 是否自动搜索 Matter 设备 |

---

## 4. 协议定义

### ThingActivatorProtocol（配网入口协议）

```objc
@protocol ThingActivatorProtocol <NSObject>
@optional
// 打开配网设备类型选择页面
- (void)gotoCategoryViewController;
// 打开扫码配网页面
- (void)gotoQRCodeViewControllerWithUserInfo:(nullable NSDictionary *)userInfo;
// 注册配网完成回调
- (void)activatorCompletion:(ThingActivatorCompletionNode)node
                 customJump:(BOOL)customJump
             completionBlock:(void (^)(NSArray * _Nullable deviceList))callback;
@end
```

### ThingSmartHomeDataProtocol（家庭上下文协议，必须实现）

```objc
@protocol ThingSmartHomeDataProtocol <NSObject>
// 返回当前家庭，配网业务包通过此方法获取 homeId
- (ThingSmartHome *)getCurrentHome;
@end
```

### ThingActivatorExternalExtensionProtocol（可选）

```objc
@protocol ThingActivatorExternalExtensionProtocol <NSObject>
@optional
// 自定义配网页面返回按钮行为
- (BOOL)categoryViewControllerCustomBackAction;
@end
```

---

## 5. 集成步骤（ObjC）

### Step 1：注册家庭上下文服务（必须在打开配网页面之前）

```objc
// 通常在 AppDelegate 或 CurrentHomeManager 初始化时注册
[[ThingSmartBizCore sharedInstance] registerService:@protocol(ThingSmartHomeDataProtocol)
                                       withInstance:self];
```

实现协议方法（self 或任意持有当前 homeId 的对象）：

```objc
- (ThingSmartHome *)getCurrentHome {
    long long currentHomeId = [CurrentHomeManager sharedInstance].currentHomeId;
    return [ThingSmartHome homeWithHomeId:currentHomeId];
}
```

### Step 2：获取配网协议实现并注册完成回调

```objc
id<ThingActivatorProtocol> impl =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingActivatorProtocol)];

[impl activatorCompletion:ThingActivatorCompletionNodeNormal
               customJump:NO
           completionBlock:^(NSArray * _Nullable deviceList) {
    // 配网成功，deviceList 为新增设备列表
    NSLog(@"activator completion, devices: %@", deviceList);
    // 按需跳转设备控制面板
}];
```

### Step 3：打开配网页面

```objc
if ([impl respondsToSelector:@selector(gotoCategoryViewController)]) {
    [impl gotoCategoryViewController];
}
```

### Step 4：（可选）扫码配网入口

```objc
if ([impl respondsToSelector:@selector(gotoQRCodeViewControllerWithUserInfo:)]) {
    [impl gotoQRCodeViewControllerWithUserInfo:nil];
}
```

---

## 6. 前置条件核查清单

- [ ] 已完成 `integrating-tuya-ios-sdk`
- [ ] 已完成 `integrating-tuya-ios-bizbundle-framework`（`updateConfig` 已在登录后调用）
- [ ] 用户已登录
- [ ] `currentHomeId` 有效（不为 0）
- [ ] `ThingSmartHomeDataProtocol` 已注册
- [ ] Info.plist 已添加所需权限
- [ ] `thing_custom_config.json` 已更新

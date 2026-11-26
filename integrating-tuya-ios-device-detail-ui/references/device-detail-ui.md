# 设备详情 UI 业务包 — 详细参考

## Source

- <https://developer.tuya.com/cn/docs/app-development/devicedetail?id=Ka8qf8llmk83u>

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

    # 设备详情 UI 业务包（必选）
    pod 'ThingSmartDeviceDetailBizBundle'

    # 蓝牙支持（可选，群组管理/移除设备等功能需要）
    # pod 'ThingBluetoothInterface'
    # pod 'ThingBLEMeshInterfaceImpl'
end
```

修改 Podfile 后执行 `pod update`。

---

## 2. Info.plist 权限配置

```xml
<!-- 相册（设备图标修改） -->
<key>NSPhotoLibraryUsageDescription</key>
<string>App 需要您的同意，才能访问相册</string>

<!-- 相机（扫码/图片拍摄） -->
<key>NSCameraUsageDescription</key>
<string>App 需要您的同意，才能访问相机</string>

<!-- 蓝牙（群组管理/移除 BLE 设备时需要） -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>应用程序需要蓝牙连接配件</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>需要开启手机蓝牙功能以添加蓝牙设备</string>
```

---

## 3. thing_custom_config.json 配置（可选）

在已有 `config` 节点中追加：

```json
{
    "config": {
        "appScheme": "yourCustomScheme",
        "is_support_home_manager": true,
        "device_detail_mini_program": false
    }
}
```

| 字段 | 说明 |
|---|---|
| `device_detail_mini_program` | `false`（默认）使用原生版设备详情页；`true` 使用小程序版 |
| `is_support_home_manager` | 是否支持家庭管理功能（与家庭 BizBundle 共用） |

---

## 4. deviceDetailConfig.json（必须）

原生版设备详情页（`device_detail_mini_program: false`，默认）依赖此 JSON 文件来定义页面结构。**文件缺失时业务包无法构建详情页，面板右上角按钮点击后完全无响应，不报错。**

### 文件位置

将文件放在 App 的主 Bundle 目录中（Xcode 工程的主 Target 目录，如 `FlyIoTDemo/`）。Xcode 16 使用 PBXFileSystemSynchronizedRootGroup 时，放入目录后自动加入编译目标，**无需手动修改 pbxproj**。

### 文件格式

根节点为 JSON 数组，每个元素是一个 section；每个 section 包含可选的 `margin` 和必选的 `items` 数组：

```json
[
    {
        "items": [
            { "cellType": "header" }
        ]
    },
    {
        "margin": { "top": 16 },
        "items": [
            { "cellType": "device_info" },
            { "cellType": "net_setting" }
        ]
    },
    {
        "margin": { "top": 16 },
        "items": [
            { "cellType": "check_device_network" },
            { "cellType": "check_firmware_update" }
        ]
    },
    {
        "margin": { "top": 16 },
        "items": [
            { "cellType": "help_and_feedback" }
        ]
    },
    {
        "margin": { "top": 16 },
        "items": [
            { "cellType": "footer" }
        ]
    }
]
```

### 内置 cellType 列表

| cellType | 说明 |
|---|---|
| `header` | 设备图标、名称、房间（页面顶部，通常放第一个 section） |
| `device_info` | 设备信息（设备 ID、IP、信号等） |
| `net_setting` | 网络设置 |
| `group_edit_devices` | 群组设备编辑 |
| `scene_and_automation` | 场景与自动化 |
| `off_line_warn` | 离线提醒设置 |
| `bind_multi_control_link` | 多控关联 |
| `group_create` | 创建群组 |
| `help_and_feedback` | 帮助与反馈 |
| `add_icon_to_home_screen` | 添加到主屏幕 |
| `show_infrared_gateway_sub_device` | 显示红外网关子设备 |
| `check_device_network` | 检测设备网络 |
| `check_firmware_update` | 检查固件更新 |
| `footer` | 底部（移除设备按钮，通常放最后一个 section） |

> 自定义菜单项通过 `ThingDeviceDetailProtocol` 的 `insertDevMenuItem:customType:` 动态注入，customType 必须以 `c_` 开头，**不**在此 JSON 文件中声明。

---

## 5. ThingSmartHomeDataProtocol 注册（必须）

设备详情业务包通过 `ThingSmartHomeDataProtocol` 获取当前家庭，**不是** `ThingFamilyProtocol`（控制面板用的是 `ThingFamilyProtocol`，两者不同）。

```objc
// 通常在 AppDelegate 或 CurrentHomeManager 初始化时注册
[[ThingSmartBizCore sharedInstance] registerService:@protocol(ThingSmartHomeDataProtocol)
                                       withInstance:self];
```

实现协议方法：

```objc
- (ThingSmartHome *)getCurrentHome {
    long long currentHomeId = [CurrentHomeManager sharedInstance].currentHomeId;
    return [ThingSmartHome homeWithHomeId:currentHomeId];
}
```

> 若已在集成设备配网 UI 业务包（`integrating-tuya-ios-device-activator-ui`）时注册过 `ThingSmartHomeDataProtocol`，此处**无需重复注册**。

---

## 6. ThingDeviceDetailProtocol — 设备详情入口协议

```objc
@protocol ThingDeviceDetailProtocol <NSObject>
@optional
// 清除所有已注册的自定义菜单项
- (void)clearInsertItem;

// 打开设备详情页（device 不能为 nil；非群组设备 group 传 nil）
- (void)gotoDeviceDetailDetailViewControllerWithDevice:(ThingSmartDeviceModel *)device
                                                 group:(nullable ThingSmartGroupModel *)group;

// 打开网络检测页
- (void)gotoDeviceDetailNetworkViewControllerWithDeviceId:(NSString *)deviceId;

// 插入同步自定义菜单项（customType 必须以 c_ 开头）
- (void)insertDevMenuItem:(id<ThingDeviceDetailCustomMenuModel> _Nullable
                              (^)(NSString *type,
                                  ThingSmartDeviceModel *device,
                                  ThingSmartGroupModel *group))item
               customType:(NSString *)customType;

// 插入异步自定义菜单项（complete 必须在主线程回调）
- (void)insertDevMenuItemAsync:(void (^)(NSString *type,
                                         ThingSmartDeviceModel *device,
                                         ThingSmartGroupModel *group,
                                         InsertDevMenuItemComplete complete))item
                    customType:(NSString *)customType;

// 注册菜单项点击事件
- (void)clickMenuItem:(void (^)(NSString *type,
                                 ThingSmartDeviceModel *device,
                                 ThingSmartGroupModel *group))clickBlock;
@end
```

---

## 7. 打开设备详情页

```objc
id<ThingDeviceDetailProtocol> impl =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingDeviceDetailProtocol)];

ThingSmartDevice *smartDevice = [ThingSmartDevice deviceWithDeviceId:devId];

if ([impl respondsToSelector:@selector(gotoDeviceDetailDetailViewControllerWithDevice:group:)]) {
    [impl gotoDeviceDetailDetailViewControllerWithDevice:smartDevice.deviceModel
                                                   group:nil]; // 非群组传 nil
}
```

**群组设备：**

```objc
ThingSmartGroupModel *groupModel = ...; // 通过 ThingSmartGroup 获取
[impl gotoDeviceDetailDetailViewControllerWithDevice:nil
                                               group:groupModel];
```

---

## 8. 打开网络检测页

```objc
id<ThingDeviceDetailProtocol> impl =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingDeviceDetailProtocol)];

if ([impl respondsToSelector:
        @selector(gotoDeviceDetailNetworkViewControllerWithDeviceId:)]) {
    [impl gotoDeviceDetailNetworkViewControllerWithDeviceId:devId];
}
```

---

## 9. 自定义菜单项扩展

### ThingDeviceDetailCustomMenuModel 协议

自定义菜单项模型需实现此协议：

```objc
@protocol ThingDeviceDetailCustomMenuModel <NSObject>
@property (nonatomic, copy) NSString *title;   // 菜单项标题
@property (nonatomic, copy) NSString *detail;  // 菜单项副标题（可选）
@end

// 示例实现
@interface CustomMenuModel : NSObject <ThingDeviceDetailCustomMenuModel>
@property (nonatomic, copy) NSString *title;
@property (nonatomic, copy) NSString *detail;
@end
```

### 8.1 插入同步菜单项

```objc
id<ThingDeviceDetailProtocol> impl =
    [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingDeviceDetailProtocol)];

// 先清除旧项，避免重复插入
[impl clearInsertItem];

[impl insertDevMenuItem:^id<ThingDeviceDetailCustomMenuModel>(
    NSString *type,
    ThingSmartDeviceModel *device,
    ThingSmartGroupModel *group) {

    if ([type isEqualToString:@"c_custom_item"]) {
        CustomMenuModel *model = [CustomMenuModel new];
        model.title = @"自定义功能";
        model.detail = group ? @"群组" : @"设备";
        return model;
    }
    return nil;
} customType:@"c_custom_item"];
```

### 8.2 插入异步菜单项

```objc
[impl insertDevMenuItemAsync:^(NSString *type,
                                ThingSmartDeviceModel *device,
                                ThingSmartGroupModel *group,
                                InsertDevMenuItemComplete complete) {
    if ([type isEqualToString:@"c_async_item"]) {
        // 模拟异步加载（网络请求等）
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 1 * NSEC_PER_SEC),
                       dispatch_get_main_queue(), ^{
            CustomMenuModel *model = [CustomMenuModel new];
            model.title = @"异步菜单项";
            complete(model); // 必须在主线程调用
        });
    }
} customType:@"c_async_item"];
```

### 8.3 注册点击事件

```objc
[impl clickMenuItem:^(NSString *type,
                       ThingSmartDeviceModel *device,
                       ThingSmartGroupModel *group) {
    if ([type isEqualToString:@"c_custom_item"]) {
        NSLog(@"点击了自定义菜单项，设备: %@", device.devId);
        // 处理点击逻辑
    } else if ([type isEqualToString:@"c_async_item"]) {
        NSLog(@"点击了异步菜单项");
    }
}];
```

---

## 前置条件核查清单

- [ ] 已完成 `integrating-tuya-ios-sdk`
- [ ] 已完成 `integrating-tuya-ios-bizbundle-framework`（`updateConfig` 已在登录后调用）
- [ ] 已完成 `integrating-tuya-ios-device-control-ui`（设备面板可正常打开）
- [ ] 用户已登录
- [ ] `currentHomeId` 有效（不为 0）
- [ ] `ThingSmartHomeDataProtocol` 已注册且 `getCurrentHome` 返回有效 home
- [ ] Info.plist 已添加所需权限

---

## Pitfalls

- **`ThingSmartHomeDataProtocol` vs `ThingFamilyProtocol`**：设备详情页用 `ThingSmartHomeDataProtocol`，设备控制面板用 `ThingFamilyProtocol`，两者不同，注册时不要搞混。
- **`clearInsertItem` 时机**：每次重新注册自定义菜单项前必须先调用 `clearInsertItem`，否则每次进入页面都会重复插入，导致菜单项数量不断增加。
- **`customType` 不以 `c_` 开头**：业务包会将不以 `c_` 开头的 type 视为内置类型，导致查找失败或行为异常。
- **异步回调线程**：`insertDevMenuItemAsync:` 的 `complete` block 必须在主线程调用，在后台线程调用 complete 会导致 UI 更新崩溃。
- **device 与 group 互斥**：`gotoDeviceDetailDetailViewControllerWithDevice:group:` 中，单设备时 group 传 nil，群组时 device 传 nil，不要两个都传非 nil 值。

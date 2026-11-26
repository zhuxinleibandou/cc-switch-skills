# 设备管理 API 参考

## Source

- <https://developer.tuya.com/cn/docs/app-development/device?id=Ka5cgmmjr46cp>
- <https://developer.tuya.com/cn/docs/app-development/iOS_family?id=Kaixeor409hck>（家庭维度设备回调）

## 初始化家庭数据（获取设备列表）

通过家庭详情获取该家庭下的所有设备：

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home getHomeDataWithSuccess:^(ThingSmartHomeModel *homeModel) {
    NSArray<ThingSmartDeviceModel *> *deviceList = homeModel.deviceList;
} failure:^(NSError *error) { }];
```

## 初始化设备操作类

```objc
ThingSmartDevice *device = [ThingSmartDevice deviceWithDeviceId:devId];
device.delegate = self;
```

> 不再使用时将 `device.delegate = nil`，避免野指针。

## ThingSmartDeviceModel 关键属性

| 属性 | 类型 | 说明 |
|---|---|---|
| devId | NSString | 设备唯一标识 |
| name | NSString | 设备名称 |
| iconUrl | NSString | 设备图标 URL |
| productId | NSString | 产品 ID |
| dps | NSDictionary | 当前功能点数据（key=dpId, value=值） |
| dpCodes | NSDictionary | 当前功能点数据（key=dpCode, value=值） |
| isOnline | BOOL | 设备是否在线（云端） |
| isCloudOnline | BOOL | 云端在线状态 |
| isLocalOnline | BOOL | 局域网在线状态 |
| isShare | BOOL | 是否为共享设备 |
| schemaArray | NSArray | 功能点 schema 数组 |
| homeId | long long | 所属家庭 ID |
| roomId | long long | 所属房间 ID |
| nodeId | NSString | ZigBee 节点 ID |
| parentId | NSString | 网关设备 ID |
| uuid | NSString | 设备 UUID |
| activeTime | NSTimeInterval | 激活时间戳 |
| upgrading | BOOL | 是否正在升级 |
| timezoneId | NSString | 时区 |
| supportGroup | BOOL | 是否支持群组 |
| category | NSString | 设备品类 |

---

## 设备 delegate（ThingSmartDeviceDelegate）

```objc
// 功能点数据更新（NSDictionary，key=dpId/dpCode，value=新值）
- (void)device:(ThingSmartDevice *)device dpsUpdate:(NSDictionary *)dps {
    NSLog(@"dps update: %@", dps);
}

// 设备信息更新（含在线状态变化、名称修改等）
- (void)deviceInfoUpdate:(ThingSmartDevice *)device {
    NSLog(@"device info updated");
}

// 设备被移除
- (void)deviceRemoved:(ThingSmartDevice *)device {
    // 退出设备详情页
}

// Wi-Fi 信号强度回调
- (void)device:(ThingSmartDevice *)device signal:(NSString *)signal {
    NSLog(@"wifi signal: %@", signal);
}

// OTA 升级状态变化
- (void)device:(ThingSmartDevice *)device
    otaUpdateStatusChanged:(ThingSmartFirmwareUpgradeStatusModel *)statusModel {
}
```

---

## 家庭维度设备回调（ThingSmartHomeDelegate）

在家庭列表页面监听设备变化时使用（注意 SDK 中方法名拼写为 `Deivice`，非笔误）：

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
home.delegate = self;

// 家庭下添加了新设备
- (void)home:(ThingSmartHome *)home didAddDeivice:(ThingSmartDeviceModel *)device {
    // 刷新设备列表
}

// 家庭下移除了设备
- (void)home:(ThingSmartHome *)home didRemoveDeivice:(NSString *)devId {
    // 刷新设备列表
}

// 设备信息更新（名称/在线状态等）
- (void)home:(ThingSmartHome *)home deviceInfoUpdate:(ThingSmartDeviceModel *)device {
    // 更新对应设备 UI
}

// 设备 DP 数据变化
- (void)home:(ThingSmartHome *)home
     device:(ThingSmartDeviceModel *)device
  dpsUpdate:(NSDictionary *)dps {
    // 更新对应设备 DP 状态
}

// 设备告警信息变化
- (void)home:(ThingSmartHome *)home
     device:(ThingSmartDeviceModel *)device
warningInfoUpdate:(NSDictionary *)warningInfo {
}

// 设备升级状态变化
- (void)home:(ThingSmartHome *)home
     device:(ThingSmartDeviceModel *)device
upgradeStatus:(ThingSmartDeviceUpgradeStatus)upgradeStatus {
}
```

---

## 设备操作

### 修改设备名称

```objc
[device updateName:@"新设备名称" success:^{
    NSLog(@"rename success");
} failure:^(NSError *error) {
    NSLog(@"rename error: %@", error);
}];
```

> 成功后需手动更新本地 `ThingSmartDeviceModel.name`。

### 移除设备

```objc
// ⚠️ 不可撤销，调用前需弹二次确认弹窗
[device remove:^{
    NSLog(@"remove success");
} failure:^(NSError *error) {
    NSLog(@"remove error: %@", error);
}];
```

### 恢复出厂设置

```objc
// ⚠️ 不可撤销，设备将清除所有数据，调用前需弹二次确认弹窗
[device resetFactory:^{
    NSLog(@"reset factory success");
} failure:^(NSError *error) {
    NSLog(@"reset factory error: %@", error);
}];
```

### 查询 Wi-Fi 信号强度

```objc
// 仅 Wi-Fi 设备支持，结果通过 delegate device:signal: 回调
[device getWifiSignalStrengthWithSuccess:^{
    NSLog(@"signal query sent");
} failure:^(NSError *error) {
    NSLog(@"signal query error: %@", error);
}];
```

### 低功耗设备唤醒

```objc
[device lowPowerDeviceAwakeWithTimeout:30 handler:^(ThingSmartLowPowerAwakeRsp rsp) {
    switch (rsp) {
        case ThingSmartLowPowerAwakeRspSuccess:
            NSLog(@"awake success");
            break;
        case ThingSmartLowPowerAwakeRspTimeout:
            NSLog(@"awake timeout");
            break;
        case ThingSmartLowPowerAwakeRspUnsupport:
            NSLog(@"awake unsupported");
            break;
    }
}];
```

### 获取网关子设备列表

```objc
[device getSubDeviceListFromCloudWithSuccess:^(NSArray<ThingSmartDeviceModel *> *subDevices) {
    NSLog(@"sub devices: %@", subDevices);
} failure:^(NSError *error) {
    NSLog(@"get sub devices error: %@", error);
}];
```

### 导出设备隐私数据

```objc
// 类方法，单次最多 10 个设备，两次调用间隔至少 1 分钟
[ThingSmartDevice exportDeviceDataForPrivacyWithDeviceIDs:@[devId1, devId2]
                                                  success:^(NSArray *result) {
    NSLog(@"export success: %@", result);
} failure:^(NSError *error) {
    NSLog(@"export error: %@", error);
}];
```

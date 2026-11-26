# Device List Management — API Quick Reference

## Source

- Device Foundation: `building-tuya-ios-device-foundation/references/device-management.md`
- Current Home: `managing-tuya-ios-current-home/references/api-quick-reference.md`

## Read This When

- 需要查看设备列表模块涉及的 SDK API 签名
- 需要确认 ThingSmartHomeDelegate 回调方法拼写和参数

---

## 核心 API

### 拉取家庭完整快照（含设备列表）

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home getHomeDataWithSuccess:^(ThingSmartHomeModel *homeModel) {
    NSArray<ThingSmartDeviceModel *> *devices = homeModel.deviceList;
    // isShare == NO → myDevices；isShare == YES → sharedDevices
} failure:^(NSError *error) { }];
```

### 移除家庭设备

```objc
ThingSmartDevice *device = [ThingSmartDevice deviceWithDeviceId:devId];
[device remove:^{
    // 成功
} failure:^(NSError *error) { }];
```

### 取消接收共享设备

```objc
ThingSmartHomeDeviceShare *share = [ThingSmartHomeDeviceShare new];
[share removeReceiveDeviceShareWithDevId:devId
                                 success:^{ }
                                 failure:^(NSError *error) { }];
```

### 修改设备名称

```objc
ThingSmartDevice *device = [ThingSmartDevice deviceWithDeviceId:devId];
[device updateName:newName
           success:^{
    // 成功后需手动赋值：device.deviceModel.name = newName
} failure:^(NSError *error) { }];
```

### 提交设备排序

```objc
// orderList: NSArray<NSString *>，按新顺序的 devId 列表
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home sortDeviceOrGroupWithOrderList:orderList
                             success:^{ }
                             failure:^(NSError *error) { }];
```

---

## ThingSmartHomeDelegate（家庭设备列表变化）

```objc
// 设置 delegate 并持有 home 强引用
self.currentHome = [ThingSmartHome homeWithHomeId:homeId];
self.currentHome.delegate = self;

// 新设备加入（注意：SDK 拼写为 Deivice 而非 Device）
- (void)home:(ThingSmartHome *)home didAddDeivice:(ThingSmartDeviceModel *)device { }

// 设备被移除（SDK 拼写同上）
- (void)home:(ThingSmartHome *)home didRemoveDeivice:(NSString *)devId { }

// 设备信息更新（名称、在线状态等）
- (void)home:(ThingSmartHome *)home deviceInfoUpdate:(ThingSmartDeviceModel *)device { }

// 设备 DP 更新
- (void)home:(ThingSmartHome *)home
      device:(ThingSmartDeviceModel *)device
   dpsUpdate:(NSDictionary *)dps { }

// 共享设备/群组列表变更
- (void)homeDidUpdateSharedInfo:(ThingSmartHome *)home { }
```

> `home.delegate = nil` — 切换家庭前注销旧 home 的 delegate，避免收到旧家庭回调。

---

## ThingSmartDeviceModel 关键字段

| 字段 | 类型 | 说明 |
|---|---|---|
| devId | NSString | 设备唯一 ID |
| name | NSString | 设备名称 |
| isOnline | BOOL | 在线状态（直接访问属性，非方法调用） |
| isShare | BOOL | 是否为共享设备（YES 时不能调用 remove:failure:） |
| productId | NSString | 产品 ID |
| iconUrl | NSString | 设备图标 URL |

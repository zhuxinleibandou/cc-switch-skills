# Home Management

## Source

- <https://developer.tuya.com/cn/docs/app-development/iOS_family?id=Kaixeor409hck>

## Read This When

- 需要创建/查询/修改/解散家庭
- 需要查询家庭天气信息
- 需要监听家庭增删改及设备/群组变化
- 需要排序家庭内设备和群组

## ThingSmartHomeModel 数据模型

| 属性 | 类型 | 说明 |
|---|---|---|
| homeId | long long | 家庭 ID |
| name | NSString | 家庭名称 |
| geoName | NSString | 地理位置名称 |
| latitude | double | 纬度 |
| longitude | double | 经度 |

## ThingSmartWeatherSketchModel

| 属性 | 说明 |
|---|---|
| condition | 天气情况（晴/阴/雨等）|
| temp | 温度 |
| iconUrl | 天气图标 URL |
| inIconUrl | 详情图标 URL |

## APIs

### 创建家庭

```objc
ThingSmartHomeManager *manager = [ThingSmartHomeManager new];
[manager addHomeWithName:@"我的家"
                geoName:@"北京市"
                  rooms:@[@"客厅", @"卧室"]
               latitude:39.9
              longitude:116.4
                success:^(long long homeId) {
    NSLog(@"create home success, homeId: %lld", homeId);
} failure:^(NSError *error) {
    NSLog(@"create home error: %@", error);
}];
```

### 查询家庭列表

```objc
ThingSmartHomeManager *manager = [ThingSmartHomeManager new];
[manager getHomeListWithSuccess:^(NSArray<ThingSmartHomeModel *> *homes) {
    for (ThingSmartHomeModel *home in homes) {
        NSLog(@"homeId: %lld, name: %@", home.homeId, home.name);
    }
} failure:^(NSError *error) {
    NSLog(@"get home list error: %@", error);
}];
```

### 查询家庭详细信息（含设备、群组、房间）

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home getHomeDataWithSuccess:^(ThingSmartHomeModel *homeModel) {
    // homeModel 包含完整的设备、群组、房间列表
} failure:^(NSError *error) {
    NSLog(@"get home data error: %@", error);
}];
```

### 等待本地缓存加载完成

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home waitLoadCacheComplete:^(BOOL complete) {
    // complete = YES 时缓存可用
}];
```

### 修改家庭信息

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home updateHomeInfoWithName:@"新家庭名称"
                    geoName:@"上海市"
                   latitude:31.2
                  longitude:121.5
                    success:^{
    NSLog(@"update home success");
} failure:^(NSError *error) {
    NSLog(@"update home error: %@", error);
}];
```

### 解散家庭

```objc
// 注意：此操作会重置家庭下所有设备，操作前须二次确认
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home dismissHomeWithSuccess:^{
    NSLog(@"dismiss home success");
} failure:^(NSError *error) {
    NSLog(@"dismiss home error: %@", error);
}];
```

### 查询家庭天气（简要）

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home getHomeWeatherSketchWithSuccess:^(ThingSmartWeatherSketchModel *model) {
    NSLog(@"weather: %@, temp: %@", model.condition, model.temp);
} failure:^(NSError *error) {
    NSLog(@"get weather error: %@", error);
}];
```

### 查询家庭天气（详细）

```objc
ThingSmartWeatherOptionModel *option = [ThingSmartWeatherOptionModel new];
option.temperatureUnit = 1;  // 1=°C，2=°F
option.windspeedUnit = 2;    // 1=mph，2=m/s，3=kph，4=km/h
option.pressureUnit = 1;     // 1=hPa，2=inHg，3=mmHg，4=mb
option.limit = 10;

ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home getHomeWeatherDetailWithOption:option
                             success:^(NSArray<ThingSmartWeatherModel *> *list) {
    for (ThingSmartWeatherModel *item in list) {
        NSLog(@"%@: %@ %@", item.name, item.value, item.unit);
    }
} failure:^(NSError *error) {
    NSLog(@"get weather detail error: %@", error);
}];
```

### 设置家庭内设备和群组顺序

```objc
// orderList 每个 NSDictionary 包含 bizId（设备或群组ID）和 bizType
NSArray<NSDictionary *> *orderList = @[
    @{@"bizId": deviceId, @"bizType": @(6)},   // 6=设备
    @{@"bizId": groupId,  @"bizType": @(5)},   // 5=群组
];

ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home sortDeviceOrGroupWithOrderList:orderList
                             success:^{
    NSLog(@"sort success");
} failure:^(NSError *error) {
    NSLog(@"sort error: %@", error);
}];
```

## Delegates

### ThingSmartHomeManagerDelegate（全局家庭变化）

```objc
// 设置 delegate
ThingSmartHomeManager *manager = [ThingSmartHomeManager new];
manager.delegate = self;

// 实现 delegate 方法
- (void)homeManager:(ThingSmartHomeManager *)manager didAddHome:(ThingSmartHomeModel *)home {
    // 收到新家庭（多设备同步）
}

- (void)homeManager:(ThingSmartHomeManager *)manager didRemoveHome:(long long)homeId {
    // 家庭被删除
}

- (void)serviceConnectedSuccess {
    // 连接涂鸦云成功
}
```

### ThingSmartHomeDelegate（家庭内变化）

```objc
// 设置 delegate
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
home.delegate = self;

// 家庭信息变更
- (void)homeDidUpdateInfo:(ThingSmartHome *)home { }

// 共享设备列表变更
- (void)homeDidUpdateSharedInfo:(ThingSmartHome *)home { }

// 房间新增/删除
- (void)home:(ThingSmartHome *)home didAddRoom:(ThingSmartRoomModel *)room { }
- (void)home:(ThingSmartHome *)home didRemoveRoom:(long long)roomId { }
- (void)home:(ThingSmartHome *)home roomInfoUpdate:(ThingSmartRoomModel *)room { }

// 设备变更
- (void)home:(ThingSmartHome *)home deviceInfoUpdate:(ThingSmartDeviceModel *)device { }
- (void)home:(ThingSmartHome *)home dpsUpdate:(NSDictionary *)dps { }

// 群组变更
- (void)home:(ThingSmartHome *)home groupInfoUpdate:(ThingSmartGroupModel *)group { }
```

> 在 ViewController `dealloc` 或 `viewDidDisappear:` 中将 `home.delegate = nil` 和 `manager.delegate = nil`，避免野指针。

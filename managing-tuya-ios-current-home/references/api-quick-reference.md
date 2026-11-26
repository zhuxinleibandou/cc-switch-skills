# Current Home Management — API Quick Reference

## Source

- Home Management: `building-tuya-ios-home-foundation/references/home-management.md`
- Member Management: `building-tuya-ios-home-foundation/references/member-management.md`

## Read This When

- 需要查看当前家庭管理模块涉及的 SDK API 签名
- 需要确认 delegate 回调方法和参数

---

## 核心 API

### 查询家庭列表

```objc
ThingSmartHomeManager *manager = [ThingSmartHomeManager new];
[manager getHomeListWithSuccess:^(NSArray<ThingSmartHomeModel *> *homes) {
    // homes[0].homeId — 默认家庭策略
} failure:^(NSError *error) { }];
```

### 查询家庭详情（触发缓存预热）

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home getHomeDataWithSuccess:^(ThingSmartHomeModel *homeModel) {
    // 缓存已就绪，可安全使用 SDK 设备数据
} failure:^(NSError *error) { }];
```

### 等待本地缓存加载完成（离线场景）

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home waitLoadCacheComplete:^(BOOL complete) {
    // complete=YES 时缓存可用
}];
```

### 接受或拒绝家庭邀请

```objc
// accept: YES=接受，NO=拒绝
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home joinFamilyWithAccept:YES
                  success:^(BOOL result) {
    // 接受后切换当前家庭到 homeId
    [[CurrentHomeManager sharedInstance] switchHomeWithHomeId:homeId];
} failure:^(NSError *error) { }];
```

---

## ThingSmartHomeManagerDelegate（全局家庭变化）

```objc
// 设置 delegate（持有 manager 实例）
self.homeManager = [ThingSmartHomeManager new];
self.homeManager.delegate = self;

// 新增家庭（多设备同步）
- (void)homeManager:(ThingSmartHomeManager *)manager
        didAddHome:(ThingSmartHomeModel *)home { }

// 家庭被删除 / 被移出
- (void)homeManager:(ThingSmartHomeManager *)manager
     didRemoveHome:(long long)homeId { }

// 连接涂鸦云成功
- (void)serviceConnectedSuccess { }
```

> 退出登录或模块销毁时：`self.homeManager.delegate = nil;`

---

## ThingSmartHomeDelegate（家庭内变化）

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
home.delegate = self;

// 家庭基础信息变更（名称等）
- (void)homeDidUpdateInfo:(ThingSmartHome *)home { }

// 共享设备/群组列表变更
- (void)homeDidUpdateSharedInfo:(ThingSmartHome *)home { }
```

> 不再需要监听时：`home.delegate = nil;`

---

## ThingSmartHomeModel 关键字段

| 字段 | 类型 | 说明 |
|---|---|---|
| homeId | long long | 家庭 ID |
| name | NSString | 家庭名称 |
| geoName | NSString | 地理位置名称 |
| latitude | double | 纬度 |
| longitude | double | 经度 |

---

## NSUserDefaults 持久化规范

```objc
// 写入（按 userId 隔离）
NSString *key = [NSString stringWithFormat:@"current_home_id_%@", userId];
[[NSUserDefaults standardUserDefaults] setObject:@(homeId) forKey:key];
[[NSUserDefaults standardUserDefaults] synchronize];

// 读取
NSNumber *stored = [[NSUserDefaults standardUserDefaults] objectForKey:key];
long long homeId = stored ? stored.longLongValue : 0;

// 退出登录时清除
[[NSUserDefaults standardUserDefaults] removeObjectForKey:key];
```

---

## NSNotificationCenter 事件规范

```objc
// 定义通知名（建议在 CurrentHomeManager.h 中声明）
extern NSString * const CurrentHomeDidChangeNotification;  // userInfo: @{@"homeId": @(homeId)}
extern NSString * const SharedDeviceListDidChangeNotification;

// 发送
[[NSNotificationCenter defaultCenter]
    postNotificationName:CurrentHomeDidChangeNotification
    object:nil
    userInfo:@{@"homeId": @(homeId)}];

// 监听（业务模块中）
[[NSNotificationCenter defaultCenter]
    addObserver:self
    selector:@selector(onCurrentHomeChanged:)
    name:CurrentHomeDidChangeNotification
    object:nil];

// 移除（dealloc 中）
[[NSNotificationCenter defaultCenter] removeObserver:self];
```

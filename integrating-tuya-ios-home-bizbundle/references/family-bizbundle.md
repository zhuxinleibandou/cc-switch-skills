# Family Management BizBundle

## Source

- <https://developer.tuya.com/cn/docs/app-development/housemanagement?id=Ka8qf8lj9up7k>

## Read This When

- 需要跳转到涂鸦家庭管理 UI 页面
- 需要处理家庭邀请通知（接受/拒绝）

---

## 1. thing_custom_config.json 配置

使用家庭管理业务包前，需在 `thing_custom_config.json` 的 `config` 节点中加入：

```json
{
    "config": {
        "appId": 123,
        "thingAppKey": "xxxxxxxxxxxx",
        "appScheme": "ThingSmart",
        "hotspotPrefixs": ["SmartLife"],
        "needBle": true,
        "is_support_home_manager": true
    }
}
```

---

## 2. Podfile 配置

在已有 BizBundle 基础依赖的基础上，追加家庭管理业务包：

```ruby
pod 'ThingSmartFamilyBizBundle'
```

执行 `pod update` 后生效。

---

## 3. ThingFamilyProtocol 接口

```objc
@protocol ThingFamilyProtocol <NSObject>
@optional
// 跳转到家庭管理页面
- (void)gotoFamilyManagement;
// 设置当前家庭 ID（跳转前必须调用）
- (void)updateCurrentFamilyId:(long long)familyId;
// 获取当前家庭 ID
- (long long)currentFamilyId;
// 清除家庭缓存
- (void)clearCurrentFamily;
@end
```

---

## 4. 进入家庭管理页面（ObjC）

跳转前必须先设置当前家庭 ID，否则业务包内部 homeId 为 0，功能异常。

```objc
- (void)openFamilyManage {
    id<ThingFamilyProtocol> impl =
        [[ThingSmartBizCore sharedInstance] serviceOfProtocol:@protocol(ThingFamilyProtocol)];
    if (!impl) { return; }

    // 1. 查询家庭列表，设置当前家庭后跳转
    [[ThingSmartHomeManager new] getHomeListWithSuccess:^(NSArray<ThingSmartHomeModel *> *homes) {
        ThingSmartHomeModel *home = homes.firstObject;
        if (home) {
            if ([impl respondsToSelector:@selector(updateCurrentFamilyId:)]) {
                [impl updateCurrentFamilyId:home.homeId];
            }
        }
        // 2. 路由跳转（即使无家庭也跳转，业务包内部会引导创建）
        if ([impl respondsToSelector:@selector(gotoFamilyManagement)]) {
            [impl gotoFamilyManagement];
        }
    } failure:^(NSError *error) {
        // 查询失败也跳转，业务包内部有兜底逻辑
        if ([impl respondsToSelector:@selector(gotoFamilyManagement)]) {
            [impl gotoFamilyManagement];
        }
    }];
}
```

---

## 5. 返回后导航栏变黑的修复

BizBundle 内部通过 `UIAppearance` 代理全局修改了 `UINavigationBar` 样式，pop/dismiss 返回宿主页后样式不自动恢复。
在**宿主 ViewController** 的 `viewWillAppear:` 里显式重置：

```objc
- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    UINavigationBarAppearance *ap = [[UINavigationBarAppearance alloc] init];
    [ap configureWithOpaqueBackground];
    self.navigationController.navigationBar.standardAppearance   = ap;
    self.navigationController.navigationBar.scrollEdgeAppearance = ap;
    // tintColor 控制返回按钮 / barButtonItem 颜色，按品牌色设置
    self.navigationController.navigationBar.tintColor = [UIColor colorWithRed:22.0/255.0
                                                                        green:119.0/255.0
                                                                         blue:255.0/255.0
                                                                        alpha:1.0];
}
```

> **为什么必须在 `viewWillAppear:` 而非 `viewDidAppear:`**：
> BizBundle 也在其页面的 `viewWillAppear:` 里设置自己的 appearance，
> 如果宿主在 `viewDidAppear:` 重置，会有一帧黑色闪烁。

```objc
typedef NS_ENUM(NSUInteger, ThingHomeStatus) {
    ThingHomeStatusPending = 1,  // 待接受邀请
    ThingHomeStatusAccept,        // 已接受邀请
    ThingHomeStatusReject         // 已拒绝邀请
};
```

---

## 6. 处理家庭邀请（ObjC）

家庭邀请通过 MQTT 推送，业务包不处理邀请逻辑，需在应用首页或合适时机自行处理。

### 注册监听

```objc
// 推荐在主页 ViewController 或全局位置注册
self.homeManager = [ThingSmartHomeManager new];
self.homeManager.delegate = self;
```

### 实现 delegate

```objc
// 收到家庭邀请时触发
- (void)homeManager:(ThingSmartHomeManager *)manager
    didReceiveSharedDeviceList:(NSArray<ThingSmartDeviceModel *> *)sharedDeviceList {
    // 按需展示邀请弹窗
}
```

### 接受或拒绝邀请

```objc
- (void)handleInviteWithHomeId:(long long)homeId accept:(BOOL)accept {
    ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
    [home joinFamilyWithAccept:accept success:^(BOOL result) {
        if (accept) {
            // 接受后刷新家庭列表
        }
    } failure:^(NSError *error) {
        NSLog(@"handle invite error: %@", error);
    }];
}
```

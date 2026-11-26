# Account Center

## Source

- <https://developer.tuya.com/cn/docs/app-development/iOS-user-infoupdate?id=Kaixuudvdx84h>
- 绑定邮箱的重复能力也出现在手机号文档中

## Read This When

- 需要展示当前用户信息
- 需要同步用户信息
- 需要改昵称、时区或温度单位
- 需要退出登录或注销账号
- 需要处理 Session 失效
- 需要在个人中心做手机号/邮箱换绑

## Current User

个人中心通常会直接读取当前用户：

```objc
[ThingSmartUser sharedInstance].user
```

绑定邮箱时会用到：

```objc
[ThingSmartUser sharedInstance].user.sId
```

## APIs

### Sync user info

```objc
[[ThingSmartUser sharedInstance] updateUserInfo:^{
    // 刷新成功
} failure:^(NSError *error) {
}];
```

用于个人中心打开时刷新最新用户资料。

### Update nickname

```objc
[[ThingSmartUser sharedInstance] updateNickname:nickName success:^{
    NSLog(@"updateNickname success");
} failure:^(NSError *error) {
    NSLog(@"updateNickname failure: %@", error);
}];
```

### Update temperature unit

```objc
[[ThingSmartUser sharedInstance] updateTempUnitWithTempUnit:tempUnit success:^{
} failure:^(NSError *error) {
}];
```

- `tempUnit`: `1` 为摄氏度，`2` 为华氏度

### Update timezone

```objc
[[ThingSmartUser sharedInstance] updateTimeZoneWithTimeZoneId:@"Asia/Shanghai"
    success:^{
} failure:^(NSError *error) {
}];
```

### Change bound account (phone or email)

```objc
[[ThingSmartUser sharedInstance] changBindAccount:account
    countryCode:countryCode code:verifyCode success:^{
} failure:^(NSError *error) {
}];
```

换绑验证码发送仍使用 `sendVerifyCodeWithUserName:...`。

### Logout normal account

```objc
[[ThingSmartUser sharedInstance] loginOut:^{
    NSLog(@"logOut success");
} failure:^(NSError *error) {
    NSLog(@"logOut failure: %@", error);
}];
```

### Delete anonymous account

```objc
[[ThingSmartUser sharedInstance] deleteAnonymousAccountWithSuccess:^{
} failure:^(NSError *error) {
}];
```

匿名账号退出即删除账户，见 `anonymous-auth.md`。

### Cancel account

```objc
[[ThingSmartUser sharedInstance] cancelAccount:^{
    // 注销成功
} failure:^(NSError *error) {
}];
```

文档说明：

- 注销后一周后才永久删除
- 如果期间重新登录，则注销请求取消

### Session expired handler

在 `AppDelegate` 注册通知监听：

```objc
[[NSNotificationCenter defaultCenter] addObserver:self
    selector:@selector(userSessionInvalid)
    name:ThingSmartUserNotificationUserSessionInvalid
    object:nil];

- (void)userSessionInvalid {
    if (self.isRedirectingToLogin) return;
    self.isRedirectingToLogin = YES;
    // 清空现有流程，跳回认证入口
}
```

用布尔属性防止通知多次触发重复跳转。

## Recommended Personal Center Scope

最小个人中心建议只放这些能力：

- 展示当前账号标识
- `updateUserInfo:` 刷新资料
- `updateNickname:success:failure:`
- 普通退出 / 匿名账号删除
- 注销账号
- 匿名转正入口

把复杂设置留到后续版本。

## Pitfalls

- 不要把普通退出和匿名账号删除混为一谈
- 不要只在某个页面监听 Session 失效通知；建议放 `AppDelegate`
- 通知可能多次触发，必须用布尔属性或时间窗口防重复跳转
- 不要遗漏 `sId`；邮箱绑定操作需要

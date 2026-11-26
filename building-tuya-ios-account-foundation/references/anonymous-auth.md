# Anonymous Auth

## Source

- <https://developer.tuya.com/cn/docs/app-development/iOS-user-anonymous?id=Kaixuk5acav5d>

## Read This When

- 需要匿名免注册登录
- 需要把匿名账号转成正式手机号或邮箱账号

## APIs

### Register and login as anonymous

```objc
[[ThingSmartUser sharedInstance] registerAnonymousWithCountryCode:countryCode
    userName:userName success:^{
} failure:^(NSError *error) {
}];
```

- `countryCode`: 国家码，例如 `@"86"`
- `userName`: 匿名昵称，文档建议可用设备名称

### Delete anonymous account

```objc
[[ThingSmartUser sharedInstance] deleteAnonymousAccountWithSuccess:^{
} failure:^(NSError *error) {
}];
```

### Bind contact info to anonymous account (convert to normal)

```objc
[[ThingSmartUser sharedInstance] usernameBindingWithCountryCode:countryCode
    userName:username code:code password:password success:^{
} failure:^(NSError *error) {
}];
```

- `userName`: 要绑定的手机号或邮箱
- `code`: 验证码（从手机/邮箱流程获取）
- `password`: 新账号密码

## Recommended Conversion Path

匿名转正通常分两步：

1. 先按手机号或邮箱流程发送验证码
2. 再调用 `usernameBindingWithCountryCode:...` 完成绑定

因此：

- 走手机号转正时，同时读取 `mobile-auth.md`
- 走邮箱转正时，同时读取 `email-auth.md`

## Minimal UI Mapping

- `AuthEntryViewController`
  - 提供"匿名体验"按钮
- `ProfileViewController`
  - 如果当前是匿名用户，显示"绑定手机号/邮箱"的转正入口

## Pitfalls

- 不要把匿名登录当作普通登录；它更像"先注册一个匿名账户再进入应用"
- 不要遗漏转正时的验证码获取步骤；`usernameBindingWithCountryCode:...` 只负责最终绑定
- 删除匿名账号应使用 `deleteAnonymousAccountWithSuccess:...` 而非普通退出，见 `account-center.md`

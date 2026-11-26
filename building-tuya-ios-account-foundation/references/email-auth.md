# Email Auth

## Source

- <https://developer.tuya.com/cn/docs/app-development/iOS-user-email?id=Kaixsaichl2dk>

## Read This When

- 需要邮箱注册
- 需要邮箱密码登录
- 需要邮箱验证码登录
- 需要邮箱重置密码
- 需要给邮箱账号绑定手机号

## Common Parameters

- `countryCode`: 国家码，例如 `@"86"`
- `region`: 用户注册地区，文档说明默认传 `nil` 或 `@""`
- `userName` / `email`: 邮箱地址
- `code`: 验证码

## Verification Types

- `1`: 邮箱注册验证码
- `2`: 邮箱登录验证码
- `3`: 邮箱重置密码验证码

## APIs

### Send verify code

```objc
[[ThingSmartUser sharedInstance] sendVerifyCodeWithUserName:email
    region:region countryCode:countryCode type:type success:^{
} failure:^(NSError *error) {
}];
```

### Check verify code

```objc
[[ThingSmartUser sharedInstance] checkCodeWithUserName:email
    region:region countryCode:countryCode code:code type:type success:^{
} failure:^(NSError *error) {
}];
```

### Register with email

```objc
[[ThingSmartUser sharedInstance] registerByEmail:countryCode
    email:email password:password code:code success:^{
} failure:^(NSError *error) {
}];
```

最小顺序：

1. 发送验证码，`type = 1`
2. 可选地先 `checkCodeWithUserName:...`
3. 调用 `registerByEmail:...`

### Login with email password

```objc
[[ThingSmartUser sharedInstance] loginByEmail:countryCode
    email:email password:password success:^{
} failure:^(NSError *error) {
}];
```

### Login with email code

```objc
[[ThingSmartUser sharedInstance] loginWithEmail:email
    countryCode:countryCode code:code success:^{
} failure:^(NSError *error) {
}];
```

最小顺序：

1. 发送验证码，`type = 2`
2. 可选地先 `checkCodeWithUserName:...`
3. 调用 `loginWithEmail:...`

### Reset email password

```objc
[[ThingSmartUser sharedInstance] resetPasswordByEmail:countryCode
    email:email newPassword:newPassword code:code success:^{
} failure:^(NSError *error) {
}];
```

最小顺序：

1. 发送验证码，`type = 3`
2. 调用 `resetPasswordByEmail:...`

### Bind mobile for an email account

```objc
[[ThingSmartUser sharedInstance] mobileBinding:countryCode
    phoneNumber:phoneNumber code:code success:^{
} failure:^(NSError *error) {
}];
```

## Minimal UI Mapping

- `EmailAuthViewController`
  - 获取验证码
  - 邮箱注册
  - 密码登录
  - 验证码登录
  - 重置密码
- `BindMobileViewController` 或个人中心内二级页
  - 绑定手机号

## Pitfalls

- `countryCode` 不是可忽略参数；账号注册到一个国家或地区后，数据无法迁移
- 修改密码后可能导致其他已登录端 Session 失效
- 邮箱注册和邮箱登录共用 `sendVerifyCodeWithUserName:...`，不要误建两套接口包装

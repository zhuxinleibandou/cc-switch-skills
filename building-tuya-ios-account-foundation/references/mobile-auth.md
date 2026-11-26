# Mobile Auth

## Source

- <https://developer.tuya.com/cn/docs/app-development/iOS-user-phonelogin?id=Kaixrrhmyknwt>

## Read This When

- 需要手机号注册
- 需要手机号密码登录
- 需要手机号验证码登录
- 需要手机号重置密码
- 需要给手机号账号绑定邮箱

## Common Parameters

- `countryCode`: 国家区号，例如 `@"86"`
- `region`: 用户注册地区，文档说明默认传 `nil` 或 `@""`
- `phoneNumber` / `userName`: 手机号
- `code`: 验证码

## Verification Types

- `1`: 手机号注册验证码
- `2`: 手机号登录验证码
- `3`: 手机号重置密码验证码

## APIs

### Query SMS whitelist area

```objc
[[ThingSmartUser sharedInstance] getWhiteListWhoCanSendMobileCodeSuccess:^(NSArray *regions) {
    // 处理可用地区列表
} failure:^(NSError *error) {
    // 处理错误
}];
```

手机号验证码服务有地区限制，强依赖短信注册前先查可用地区。

### Send verify code

```objc
[[ThingSmartUser sharedInstance] sendVerifyCodeWithUserName:phoneNumber
    region:region countryCode:countryCode type:type success:^{
} failure:^(NSError *error) {
}];
```

### Check verify code

```objc
[[ThingSmartUser sharedInstance] checkCodeWithUserName:phoneNumber
    region:region countryCode:countryCode code:code type:type success:^{
} failure:^(NSError *error) {
}];
```

### Register with phone

```objc
[[ThingSmartUser sharedInstance] registerByPhone:countryCode
    phoneNumber:phoneNumber password:password code:code success:^{
} failure:^(NSError *error) {
}];
```

最小顺序：

1. 发送验证码，`type = 1`
2. 可选地先 `checkCodeWithUserName:...`
3. 调用 `registerByPhone:...`

### Login with phone password

```objc
[[ThingSmartUser sharedInstance] loginByPhone:countryCode
    phoneNumber:phoneNumber password:password success:^{
} failure:^(NSError *error) {
}];
```

### Login with phone code

```objc
[[ThingSmartUser sharedInstance] loginWithMobile:phoneNumber
    countryCode:countryCode code:code success:^{
} failure:^(NSError *error) {
}];
```

最小顺序：

1. 发送验证码，`type = 2`
2. 可选地先 `checkCodeWithUserName:...`
3. 调用 `loginWithMobile:...`

### Reset phone password

```objc
[[ThingSmartUser sharedInstance] resetPasswordByPhone:countryCode
    phoneNumber:phoneNumber newPassword:newPassword code:code success:^{
} failure:^(NSError *error) {
}];
```

最小顺序：

1. 发送验证码，`type = 3`
2. 调用 `resetPasswordByPhone:...`

### Bind email for a phone account

```objc
[[ThingSmartUser sharedInstance] sendBindingVerificationCodeWithEmail:email
    countryCode:countryCode success:^{
} failure:^(NSError *error) {
}];

[[ThingSmartUser sharedInstance] bindEmail:email withCountryCode:countryCode
    code:code sId:sId success:^{
} failure:^(NSError *error) {
}];
```

`sId` 来自：

```objc
[ThingSmartUser sharedInstance].user.sId
```

## Minimal UI Mapping

- `PhoneAuthViewController`
  - 获取验证码
  - 手机号注册
  - 密码登录
  - 验证码登录
  - 重置密码
- `BindEmailViewController` 或个人中心内二级页
  - 绑定邮箱

## Pitfalls

- 手机号验证码能力依赖短信服务开通，不是所有地区都可直接用
- `region` 按文档默认传 `nil` 或空字符串，不要自己臆造 region 值
- 重置密码后可能触发其他设备 Session 失效，需配合通知监听

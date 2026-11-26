# Tourist Auth

## Source

- <https://developer.tuya.com/cn/docs/app-development/usertourist.md?id=Ka6a99lylyces>

## Read This When

- 需要游客免注册登录
- 需要把游客账号转成正式手机号或邮箱账号

## APIs

### Register and login as tourist

```java
ThingHomeSdk.getUserInstance()
    .touristRegisterAndLogin(String countryCode, String nickName, IRegisterCallback callback);
```

- `countryCode`: 国家码，例如 `86`
- `nickName`: 游客昵称，文档建议可用设备名称

### Convert tourist account to a normal account

```java
ThingHomeSdk.getUserInstance()
    .touristBindWithUserName(String countryCode, String userName, String verifyCode, String password, IBooleanCallback callback);
```

## Recommended Conversion Path

游客转正通常分两步：

1. 先按手机号或邮箱流程发送验证码
2. 再调用 `touristBindWithUserName(...)` 设置正式账号和密码

因此：

- 走手机号转正时，同时读取 `mobile-auth.md`
- 走邮箱转正时，同时读取 `email-auth.md`

## Minimal UI Mapping

- `AuthEntryActivity` / `AuthEntryFragment`
  - 提供“游客体验”按钮
- `ProfileFragment`
  - 如果当前是游客用户，显示“绑定手机号/邮箱，完成正式注册”的入口

## Pitfalls

- 不要把游客登录当作普通登录；它更像“先注册一个匿名账户再进入应用”
- 不要遗漏转正时的验证码获取步骤；`touristBindWithUserName(...)` 只负责最终绑定
- 游客退出应使用 `touristLogOut(...)`，见 `account-center.md`

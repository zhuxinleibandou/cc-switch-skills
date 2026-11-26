# Mobile Auth

## Source

- <https://developer.tuya.com/cn/docs/app-development/usermobile.md?id=Ka69pu4myrrws>

## Read This When

- 需要手机号注册
- 需要手机号密码登录
- 需要手机号验证码登录
- 需要手机号重置密码
- 需要给手机号账号绑定邮箱

## Common Parameters

- `countryCode`: 国家区号，例如 `86`
- `region`: 文档说明默认传 `""`
- `userName`: 手机号
- `code`: 验证码

## Verification Types

- `1`: 手机号注册验证码
- `2`: 手机号登录验证码
- `3`: 手机号重置密码验证码
- `8`: 注销手机号账号时校验验证码

## APIs

### Query SMS whitelist area

```java
ThingHomeSdk.getUserInstance()
    .getWhiteListWhoCanSendMobileCodeSuccess(IWhiteListCallback callback);
```

手机号验证码服务有地区限制。需要强依赖短信注册前，先查可用地区。

### Send verify code

```java
ThingHomeSdk.getUserInstance()
    .sendVerifyCodeWithUserName(String userName, String region, String countryCode, int type, IResultCallback callback);
```

### Check verify code

```java
ThingHomeSdk.getUserInstance()
    .checkCodeWithUserName(String userName, String region, String countryCode, String code, int type, IResultCallback callback);
```

### Register with phone

```java
ThingHomeSdk.getUserInstance()
    .registerAccountWithPhone(String countryCode, String phoneNumber, String passwd, String code, IRegisterCallback callback);
```

最小顺序：

1. 发送验证码，`type = 1`
2. 可选地先 `checkCodeWithUserName(...)`
3. 调用 `registerAccountWithPhone(...)`

### Login with phone password

```java
ThingHomeSdk.getUserInstance()
    .loginWithPhonePassword(String countryCode, String phone, String passwd, ILoginCallback callback);
```

### Login with phone code

```java
ThingHomeSdk.getUserInstance()
    .loginWithPhone(String countryCode, String phone, String code, ILoginCallback callback);
```

最小顺序：

1. 发送验证码，`type = 2`
2. 可选地先 `checkCodeWithUserName(...)`
3. 调用 `loginWithPhone(...)`

### Reset phone password

```java
ThingHomeSdk.getUserInstance()
    .resetPhonePassword(String countryCode, String phone, String code, String newPasswd, IResetPasswordCallback callback);
```

最小顺序：

1. 发送验证码，`type = 3`
2. 调用 `resetPhonePassword(...)`

### Bind email for a phone account

```java
ThingHomeSdk.getUserInstance()
    .sendBindVerifyCodeWithEmail(String countryCode, String email, IResultCallback callback);

ThingHomeSdk.getUserInstance()
    .bindEmail(String countryCode, String email, String code, String sId, IResultCallback callback);
```

这里的 `sId` 来自：

```java
ThingHomeSdk.getUserInstance().getUser().getSid()
```

## Minimal UI Mapping

- `PhoneAuthFragment`
  - 获取验证码
  - 手机号注册
  - 密码登录
  - 验证码登录
  - 重置密码
- `BindEmailFragment` 或个人中心内二级页
  - 绑定邮箱

## Pitfalls

- 手机号验证码能力依赖短信服务开通，不是所有地区都可直接用
- `region` 按文档默认传空字符串，不要自己臆造 region 值
- 重置密码后可能触发其他设备 Session 失效，要配合 `INeedLoginListener`

# Email Auth

## Source

- <https://developer.tuya.com/cn/docs/app-development/useremail.md?id=Ka6a99luv3tr1>

## Read This When

- 需要邮箱注册
- 需要邮箱密码登录
- 需要邮箱验证码登录
- 需要邮箱重置密码
- 需要给邮箱账号绑定手机号

## Common Parameters

- `countryCode`: 国家码，例如 `86`
- `region`: 文档说明默认传 `""`
- `userName`: 邮箱地址
- `code`: 验证码

## Verification Types

- `1`: 邮箱注册验证码
- `2`: 邮箱登录验证码
- `3`: 邮箱重置密码验证码

## APIs

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

### Register with email

```java
ThingHomeSdk.getUserInstance()
    .registerAccountWithEmail(String countryCode, String email, String passwd, String code, IRegisterCallback callback);
```

最小顺序：

1. 发送验证码，`type = 1`
2. 可选地先 `checkCodeWithUserName(...)`
3. 调用 `registerAccountWithEmail(...)`

### Login with email password

```java
ThingHomeSdk.getUserInstance()
    .loginWithEmail(String countryCode, String email, String passwd, ILoginCallback callback);
```

### Login with email code

```java
ThingHomeSdk.getUserInstance()
    .loginWithEmailCode(String countryCode, String email, String code, ILoginCallback callback);
```

最小顺序：

1. 发送验证码，`type = 2`
2. 可选地先 `checkCodeWithUserName(...)`
3. 调用 `loginWithEmailCode(...)`

### Reset email password

```java
ThingHomeSdk.getUserInstance()
    .resetEmailPassword(String countryCode, String email, String emailCode, String passwd, IResetPasswordCallback callback);
```

最小顺序：

1. 发送验证码，`type = 3`
2. 调用 `resetEmailPassword(...)`

### Bind mobile for an email account

```java
ThingHomeSdk.getUserInstance()
    .sendBindVerifyCode(String countryCode, String phoneNumber, IResultCallback callback);

ThingHomeSdk.getUserInstance()
    .bindMobile(String countryCode, String phoneNumber, String code, IResultCallback callback);
```

## Minimal UI Mapping

- `EmailAuthFragment`
  - 获取验证码
  - 邮箱注册
  - 密码登录
  - 验证码登录
  - 重置密码
- `BindMobileFragment` 或个人中心内二级页
  - 绑定手机号

## Pitfalls

- `countryCode` 不是可忽略参数；文档明确提示账号注册到一个国家或地区后，数据无法迁移
- 修改密码后可能导致其他已登录端 Session 失效
- 邮箱注册和邮箱登录都共用 `sendVerifyCodeWithUserName(...)`，不要误建两套接口包装

# Account Center

## Source

- <https://developer.tuya.com/cn/docs/app-development/android-account-information.md?id=Kaixm19qdk5yk>
- 绑定邮箱的重复能力也出现在 `usermobile.md`

## Read This When

- 需要展示当前用户信息
- 需要同步用户信息
- 需要改昵称或时区
- 需要退出登录或注销账号
- 需要处理 Session 失效
- 需要在个人中心做邮箱/手机号换绑

## Current User

个人中心通常会直接读取当前用户：

```java
ThingHomeSdk.getUserInstance().getUser()
```

绑定邮箱、换绑账号时会用到：

```java
ThingHomeSdk.getUserInstance().getUser().getSid()
```

## APIs

### Bind email

```java
ThingHomeSdk.getUserInstance()
    .sendBindVerifyCodeWithEmail(String countryCode, String email, IResultCallback callback);

ThingHomeSdk.getUserInstance()
    .bindEmail(String countryCode, String email, String code, String sId, IResultCallback callback);
```

### Change phone or email

```java
ThingHomeSdk.getUserInstance()
    .changeUserName(String countryCode, String code, String sId, String userName, IResultCallback callback);
```

文档示例里，换绑验证码使用：

```java
ThingHomeSdk.getUserInstance()
    .sendVerifyCodeWithUserName(userName, region, countryCode, 7, IResultCallback callback);
```

`type = 7` 可视为换绑账号验证码。

### Update nickname

```java
ThingHomeSdk.getUserInstance()
    .updateNickName(String name, IReNickNameCallback callback);
```

### Update timezone

```java
ThingHomeSdk.getUserInstance()
    .updateTimeZone(String timezoneId, IResultCallback callback);
```

### Sync user info

```java
ThingHomeSdk.getUserInstance()
    .updateUserInfo(IResultCallback callback);
```

用于个人中心打开时刷新最新用户资料。

### Logout normal account

```java
ThingHomeSdk.getUserInstance().logout(ILogoutCallback callback);
```

### Logout tourist account

```java
ThingHomeSdk.getUserInstance().touristLogOut(ILogoutCallback callback);
```

游客退出会立即注销该游客账户。

### Cancel account

```java
ThingHomeSdk.getUserInstance().cancelAccount(IResultCallback callback);
```

文档说明：

- 注销后一周后才永久删除
- 如果期间重新登录，则注销请求取消

### Session expired handler

```java
ThingHomeSdk.setOnNeedLoginListener(INeedLoginListener needLoginListener);
```

回调：

```java
needLoginListener.onNeedLogin(Context context);
```

## Recommended Personal Center Scope

最小个人中心建议只放这些能力：

- 展示当前账号标识
- `updateUserInfo()` 刷新资料
- `updateNickName(...)`
- 普通退出 / 游客退出
- 注销账号
- 游客转正入口

把复杂设置留到后续版本。

## Pitfalls

- 不要把普通退出和游客退出混为一谈
- 不要只在某个页面注册 `INeedLoginListener`；建议放 `Application`
- 不要遗漏 `sid`；邮箱绑定、换绑账号都需要

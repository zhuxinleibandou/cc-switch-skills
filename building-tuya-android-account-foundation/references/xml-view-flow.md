# XML View Flow

## Read This When

- 需要把 Tuya 账户接口落成当前工程更贴合的 `XML/View + Activity/Fragment + ViewModel`
- 需要定义最小账户体系页面结构

## Recommended Minimal Structure

### Application

职责：

- 注册 `ThingHomeSdk.setOnNeedLoginListener(...)`
- Session 失效时清空现有流程并跳回认证入口

### LaunchActivity or SplashActivity

职责：

- 决定跳转到认证入口还是个人中心
- 不承载具体登录逻辑

### AuthEntryActivity

职责：

- 作为认证容器页
- 承载以下 `Fragment` 的切换

推荐子页：

- `AuthMethodFragment`
  - 手机号入口
  - 邮箱入口
  - 游客登录按钮
- `PhoneAuthFragment`
- `EmailAuthFragment`

### ProfileActivity or ProfileFragment

职责：

- 展示当前用户基础信息
- 刷新用户资料
- 更新昵称
- 退出登录
- 注销账号
- 游客转正入口

## 登录后跳转目标

登录成功后，`AuthMethodFragment`、`PhoneAuthFragment`、`EmailAuthFragment` 均需跳转到应用的**主入口 Activity**：

- 如果项目有底部导航（`MainActivity` 内含 Home + Profile 两个 Tab），则登录后跳转到 `MainActivity`
- 如果项目只有个人中心页，则登录后跳转到 `ProfileActivity`

**关键**：认证 Fragment 中的 `navigateToProfile` 事件触发时，应调用与 `SplashActivity` 保持一致的目标——`SplashActivity` 已登录走的是什么 Activity，`Auth` 登录成功也应走相同 Activity。

```kotlin
// SplashActivity 路由到 MainActivity（已登录时）
SplashDestination.PROFILE -> MainActivity.start(this)

// 因此 AuthMethodFragment / PhoneAuthFragment / EmailAuthFragment 登录成功也应跳 MainActivity
if (state.navigateToProfile) {
    viewModel.consumeProfileNavigation()
    MainActivity.start(requireContext())   // ← 与 SplashActivity 保持一致
    requireActivity().finish()
}
```

## ViewModel Boundary

推荐每个认证域一个 `ViewModel`：

- `PhoneAuthViewModel`
- `EmailAuthViewModel`
- `ProfileViewModel`

`ViewModel` 负责：

- 调用 `ThingHomeSdk.getUserInstance()`
- 管理 loading / success / error 状态
- 输出一次性事件，例如跳转个人中心、弹错误消息

`Fragment` 负责：

- 收集输入框内容
- 调用 `ViewModel` action
- 订阅状态并渲染

## Suggested UI Actions

### PhoneAuthFragment

- 发送验证码
- 注册
- 密码登录
- 验证码登录
- 重置密码

### EmailAuthFragment

- 发送验证码
- 注册
- 密码登录
- 验证码登录
- 重置密码

### ProfileFragment

- 刷新用户资料
- 修改昵称
- 退出登录
- 注销账号
- 若当前用户是游客，显示转正入口

## Keep It Minimal

首版不要同时做：

- 一个超大通用认证页
- 多层 Repository 包装
- 复杂导航框架迁移
- Compose 和 XML 双实现

先保证主链路清晰，再逐步演进。

# ObjC View Flow

## Read This When

- 需要把 Tuya 账户接口落成当前工程更贴合的 `UIKit + UIViewController/ViewModel`
- 需要定义最小账户体系页面结构

## Recommended Minimal Structure

### AppDelegate

职责：

- 注册 `ThingSmartUserNotificationUserSessionInvalid` 通知
- Session 失效时清空现有流程并跳回认证入口
- 用布尔属性防止重复跳转

### LaunchViewController or SplashViewController

职责：

- 决定跳转到认证入口还是个人中心
- 不承载具体登录逻辑

### AuthEntryViewController

职责：

- 作为认证入口页
- 提供手机号、邮箱、匿名三种入口按钮

推荐子页（通过 `UINavigationController` push 进入）：

- `PhoneAuthViewController`
- `EmailAuthViewController`

### ProfileViewController

职责：

- 展示当前用户基础信息
- 刷新用户资料
- 更新昵称
- 退出登录
- 注销账号
- 匿名转正入口

## ViewModel Boundary

推荐每个认证域一个 `ViewModel`：

- `PhoneAuthViewModel`
- `EmailAuthViewModel`
- `ProfileViewModel`

`ViewModel` 负责：

- 调用 `[ThingSmartUser sharedInstance]`
- 管理 loading / success / error 状态
- 通过 block 回调向 ViewController 输出一次性事件（跳转、弹错误消息）

`ViewController` 负责：

- 收集输入框内容
- 调用 `ViewModel` action
- 根据回调渲染状态

## Suggested UI Actions

### PhoneAuthViewController

- 发送验证码
- 注册
- 密码登录
- 验证码登录
- 重置密码

### EmailAuthViewController

- 发送验证码
- 注册
- 密码登录
- 验证码登录
- 重置密码

### ProfileViewController

- 刷新用户资料
- 修改昵称
- 退出登录
- 注销账号
- 若当前用户是匿名用户，显示转正入口

## Keep It Minimal

首版不要同时做：

- 一个超大通用认证页
- 多层 Repository 包装
- 复杂路由框架
- SwiftUI 实现

先保证主链路清晰，再逐步演进。

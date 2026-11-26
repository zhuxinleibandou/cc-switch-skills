---
name: building-tuya-ios-account-foundation
description: 为已接入 Tuya Smart App SDK 的 iOS Swift 工程落地账户体系。适用于需要实现手机号或邮箱注册/登录、匿名登录与转正、个人中心、退出/注销、Session 失效处理的项目，默认采用 UIKit + UIViewController/ViewModel 结构。
compatibility: iOS 11+, Objective-C, UIKit, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为已接入 Tuya Smart App SDK 的 iOS Swift 工程落地最小账户体系。默认采用 `UIKit + UIViewController/ViewModel` 结构，核心类为 `ThingSmartUser.sharedInstance()`。涵盖手机号认证、邮箱认证、匿名登录与转正、个人中心、退出/注销及 Session 失效处理。

## 适用场景 {#scene}

需要在已完成 `integrating-tuya-ios-sdk`（ThingSmartHomeKit 可用）的工程中接入账户功能时使用。

最小页面流：

1. 认证入口（未登录跳转）
2. 手机号认证页
3. 邮箱认证页
4. 个人中心页（已登录跳转）
5. `AppDelegate` 级 Session 失效处理

实现顺序建议：手机号或邮箱登录/注册 → 匿名登录 → 匿名转正 → 个人中心 → 退出/注销 → Session 过期跳转。

在 `AppDelegate` 监听 `ThingSmartUserNotificationUserSessionInvalid` 通知，处理会话失效跳转。

只实现当前需求需要的账号子集：
- 手机号：读 `references/mobile-auth.md`
- 邮箱：读 `references/email-auth.md`
- 匿名：读 `references/anonymous-auth.md`
- 个人中心、退出、注销、Session：读 `references/account-center.md`
- UIKit 页面拆分：读 `references/objc-view-flow.md`

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成，ThingSmartHomeKit 初始化
- `building-tuya-ios-home-foundation` — 登录成功后接入家庭管理
- `managing-tuya-ios-current-home` — 维护全局当前家庭 ID

## 注意事项 {#tip}

- 不要把手机号、邮箱、匿名三种入口揉成一个超大页面；保持入口分流后再进入独立 `ViewController`。
- 不要忽略验证码 `type`；注册、登录、重置密码的类型不同。
- 不要忘记 `bindEmail:withCountryCode:code:sId:success:failure:` 需要当前用户 `sId`。
- 不要把普通账号退出和匿名退出混用；匿名应走 `deleteAnonymousAccountWithSuccess:failure:`。
- 不要只在某个页面处理 Session 失效；统一放到 `AppDelegate`，并用布尔标志防止重复跳转。

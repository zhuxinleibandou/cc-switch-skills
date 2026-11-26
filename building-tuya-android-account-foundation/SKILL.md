---
name: building-tuya-android-account-foundation
description: 为已接入 Tuya Smart App SDK 的 Android Kotlin 工程落地账户体系。适用于需要实现手机号或邮箱注册/登录、游客登录与转正、个人中心、退出/注销、Session 失效处理的项目，默认采用 XML/View + Activity/Fragment + ViewModel 结构。
compatibility: Android, Kotlin, XML View system, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为已接入 Tuya Smart App SDK 的 Android Kotlin 工程落地最小账户体系。默认采用更贴合当前项目的 `XML/View + Activity/Fragment + ViewModel` 结构，而不是 Compose。涵盖手机号认证、邮箱认证、游客登录与转正、个人中心、退出/注销及 Session 失效处理。

## 适用场景 {#scene}

需要在已完成 `integrating-tuya-android-sdk`（ThingHomeSdk 可用）的工程中接入账户功能时使用。

最小页面流：

1. 认证入口（未登录跳转）
2. 手机号认证页
3. 邮箱认证页
4. 个人中心页（已登录跳转）
5. `Application` 级 Session 失效处理

实现顺序建议：手机号或邮箱登录/注册 → 游客登录 → 游客转正 → 个人中心 → 退出/注销 → Session 过期跳转。

只实现当前需求需要的账号子集：
- 手机号：读 `references/mobile-auth.md`
- 邮箱：读 `references/email-auth.md`
- 游客：读 `references/tourist-auth.md`
- 个人中心、退出、注销、Session：读 `references/account-center.md`
- XML/View 页面拆分：读 `references/xml-view-flow.md`

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成，ThingHomeSdk 初始化
- `building-tuya-android-home-foundation` — 登录成功后接入家庭管理
- `managing-tuya-android-current-home` — 维护全局当前家庭 ID

## 注意事项 {#tip}

- 不要把手机号、邮箱、游客三种入口揉成一个超大页面；保持入口分流后再进入独立 `Fragment`。
- 不要忽略验证码 `type`；注册、登录、重置密码、注销、换绑账号的类型不同。
- 不要忘记 `bindEmail` / `changeUserName` 需要当前用户 `sid`。
- 不要把普通账号退出和游客退出混用；游客应走 `touristLogOut(...)`。
- 不要只在页面层处理 Session 失效；统一放到 `Application`，注册 `ThingHomeSdk.setOnNeedLoginListener(...)`。

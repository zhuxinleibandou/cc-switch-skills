---
name: integrating-tuya-android-sdk
description: 将涂鸦 Smart App SDK 集成到新建 Android 应用中。适用于需要配置 Gradle Kotlin DSL、settings.gradle.kts、app/build.gradle.kts、AndroidManifest.xml、Application 初始化、security-algorithm.aar，以及排查 SING_VALIDATE_FALED 或 ILLEGAL_CLIENT_ID 错误的场景。
compatibility: Android Studio, Kotlin, Gradle Kotlin DSL, minSdk 21+
---

## 概述 {#description}

按 Tuya 官方 Smart App SDK 集成页推进 Android 新工程接入。优先核对最新官方页面，再把示例从 Groovy DSL 改写成当前工程实际使用的 Kotlin DSL / Version Catalog 结构。

## 适用场景 {#scene}

新建 Android 工程需要接入涂鸦 SDK 时使用，或现有工程出现鉴权失败需要排查时使用。

**集成步骤：**

1. **确认工程形态**：检查 `settings.gradle.kts`、`app/build.gradle.kts`、`AndroidManifest.xml`，确认是否已有 `Application` 子类。若启用了 `RepositoriesMode.FAIL_ON_PROJECT_REPOS`，只在 `settings.gradle.kts` 配仓库。

2. **落地接入**：
   - 在仓库级配置里加入 Tuya Maven 源
   - 在 `app/build.gradle.kts` 加入 `abiFilters`、`packaging` 冲突处理、AAR 目录依赖、`thingsmart` 依赖和模块排除
   - 把下载包里的 `security-algorithm.aar` 放到模块 `libs/` 目录
   - 在 `AndroidManifest.xml` 的 `<application>` 下配置 `THING_SMART_APPKEY` 和 `THING_SMART_SECRET`
   - 在 `Application.onCreate()` 主线程调用 `ThingHomeSdk.init(this)`；只在 debug 构建开启 `ThingHomeSdk.setDebugMode(true)`
   - 在 `app/proguard-rules.pro` 合并官方 keep 规则

3. **上传 SHA256 签名**（必须）：在涂鸦开发者平台 → App 工作台 → SDK开发 → 获取密钥 → 新增SHA256。Debug 签名获取：`keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256`。

4. **最小验证**：先跑 Gradle sync 和 debug 构建；确认 Tuya 平台里的包名与工程 `applicationId` 一致，SHA-256 与当前签名一致。

需要可复制的 KTS 片段、当前官方版本提示、混淆规则和排错要点时，读取 `references/tuya-smart-app-sdk-integration.md`。

## 搭配使用 {#usage}

- `integrating-tuya-android-theme` — 后续：配置 BizBundle 主题色体系（接入 BizBundle 之前必须完成）
- `integrating-tuya-android-bizbundle-framework` — 后续：BizBundle 框架层初始化
- `building-tuya-android-account-foundation` — 后续：账号体系
- `building-tuya-android-home-foundation` — 后续：家庭管理基础能力

## 注意事项 {#tip}

- 不要直接照抄 Groovy DSL 到 `.kts` 文件。
- 不要在启用了 `FAIL_ON_PROJECT_REPOS` 的项目里把 Maven 仓库写进 `app/build.gradle.kts`。
- 不要把旧博客里的 `t_s.bmp`、`TUYA_SMART_*` 或过期坐标当成当前官方方案；当前官方方案使用 `security-algorithm.aar`、`THING_SMART_APPKEY`、`THING_SMART_SECRET` 和 `ThingHomeSdk`。
- **Manifest 合并冲突**：涂鸦 SDK 内部 `AndroidManifest.xml` 声明 `android:theme` 与应用自身 theme 冲突时构建失败，解决方式：在 `<application>` 的 `tools:replace` 中追加 `android:theme`。
- 出现 `SING_VALIDATE_FALED` 先查 AppKey / AppSecret；出现 `ILLEGAL_CLIENT_ID` 先查包名和证书。Debug 和 Release 签名的 SHA256 不同，建议两个都上传。

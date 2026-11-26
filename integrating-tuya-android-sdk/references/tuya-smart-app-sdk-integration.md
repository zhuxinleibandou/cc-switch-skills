# Tuya Smart App SDK Android 集成参考

## Source

- Official doc: <https://developer.tuya.com/cn/docs/app-development/integrated.md?id=Ka69nt96cw0uj>
- English mirror: <https://developer.tuya.com/en/docs/app-development/integrated?id=Ka69nt96cw0uj>
- 我在 2026-03-20 按官方页面搜索结果整理；搜索结果显示该页最近一次更新时间为 2025-07-08。

## What To Reconcile Before Editing

先核对这几个事实，再开始改工程：

- 官方示例主要是 Groovy DSL；当前仓库是 Kotlin DSL。
- 当前仓库在 [settings.gradle.kts](/Users/xiaoqi/Business_Source/FlyIoTDemo/settings.gradle.kts) 启用了 `RepositoriesMode.FAIL_ON_PROJECT_REPOS`，所以仓库必须写在 settings 级别。
- 当前仓库的模块脚本是 [app/build.gradle.kts](/Users/xiaoqi/Business_Source/FlyIoTDemo/app/build.gradle.kts)。
- 当前 Manifest 是 [app/src/main/AndroidManifest.xml](/Users/xiaoqi/Business_Source/FlyIoTDemo/app/src/main/AndroidManifest.xml)。
- 当前工程没有 `Application` 子类，需要新建一个。

## Official Baseline

官方快速集成页当前关键点可以压缩成下面 6 步：

1. 在工程里加入 Tuya Maven 仓库。
2. 在 app 模块加入 `thingsmart` 依赖、AAR 目录依赖、`abiFilters` 和 `libc++_shared.so` 冲突处理。
3. 把下载包里的 `security-algorithm.aar` 放进 `libs/`。
4. 在 `AndroidManifest.xml` 里配置 `THING_SMART_APPKEY` 和 `THING_SMART_SECRET`，并在平台侧登记包名和 SHA-256。
5. 在 `Application` 主线程初始化 `ThingHomeSdk`。
6. 在 release 混淆里合并官方 keep 规则，并在 debug 时按需打开日志。

## Recommended KTS Adaptation

### 1. Repositories

官方示例列出了这些仓库：

- `https://maven-other.tuya.com/repository/maven-releases/`
- `https://maven-other.tuya.com/repository/maven-commercial-releases/`
- `https://jitpack.io`
- `https://maven.aliyun.com/repository/public`
- `https://central.maven.org/maven2/`
- `https://oss.sonatype.org/content/repositories/snapshots/`
- `https://developer.huawei.com/repo/`

官方示例还包含 `jcenter()`。新工程里不要默认补回 `jcenter()`；先用显式仓库，只有确实出现历史依赖解析问题时再评估是否需要它。

对于当前仓库，优先改 [settings.gradle.kts](/Users/xiaoqi/Business_Source/FlyIoTDemo/settings.gradle.kts)：

```kotlin
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
        maven("https://maven-other.tuya.com/repository/maven-releases/")
        maven("https://maven-other.tuya.com/repository/maven-commercial-releases/")
        maven("https://jitpack.io")
        maven("https://maven.aliyun.com/repository/public")
        maven("https://central.maven.org/maven2/")
        maven("https://oss.sonatype.org/content/repositories/snapshots/")
        maven("https://developer.huawei.com/repo/")
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven("https://maven-other.tuya.com/repository/maven-releases/")
        maven("https://maven-other.tuya.com/repository/maven-commercial-releases/")
        maven("https://jitpack.io")
        maven("https://maven.aliyun.com/repository/public")
        maven("https://central.maven.org/maven2/")
        maven("https://oss.sonatype.org/content/repositories/snapshots/")
        maven("https://developer.huawei.com/repo/")
    }
}
```

### 2. App Module Dependencies And Packaging

官方页面给出的依赖基线是：

- `implementation("com.alibaba:fastjson:1.1.67.android")`
- `implementation("com.squareup.okhttp3:okhttp-urlconnection:3.14.9")`
- `implementation("com.thingclips.smart:thingsmart:6.4.1")`

如果官方页之后更新了版本号，以官方页为准。当前仓库可以先直接写字符串坐标，等首次构建通过后再决定要不要抽到 `libs.versions.toml`。

对 [app/build.gradle.kts](/Users/xiaoqi/Business_Source/FlyIoTDemo/app/build.gradle.kts) 的推荐改法：

```kotlin
android {
    defaultConfig {
        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a")
        }

        manifestPlaceholders["THING_SMART_APPKEY"] = providers
            .gradleProperty("THING_SMART_APPKEY")
            .orElse("")
            .get()
        manifestPlaceholders["THING_SMART_SECRET"] = providers
            .gradleProperty("THING_SMART_SECRET")
            .orElse("")
            .get()
    }

    packaging {
        jniLibs {
            pickFirsts += "lib/*/libc++_shared.so"
        }
    }
}

configurations.configureEach {
    exclude(group = "com.thingclips.smart", module = "thingsmart-modularCampAnno")
}

dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.aar"))))
    implementation("com.alibaba:fastjson:1.1.67.android")
    implementation("com.squareup.okhttp3:okhttp-urlconnection:3.14.9")
    implementation("com.thingclips.smart:thingsmart:6.4.1")
}
```

如果团队允许把密钥直接写到 Manifest，也可以不用 `manifestPlaceholders`。但默认更推荐把值放到未提交的本地 Gradle 属性里。

### 3. Security AAR

从 Tuya 平台下载集成资料包后，把 `security-algorithm.aar` 放到模块 `libs/` 目录，例如：

```text
app/libs/security-algorithm.aar
```

保留 `implementation(fileTree(...))`，否则本地 AAR 不会被打进工程。

### 4. AndroidManifest.xml

在 `<application>` 节点下加上 Tuya 的元数据。若使用 `manifestPlaceholders`，写法如下：

```xml
<application
    android:name=".FlyIoTApplication"
    ...>

    <meta-data
        android:name="THING_SMART_APPKEY"
        android:value="${THING_SMART_APPKEY}" />

    <meta-data
        android:name="THING_SMART_SECRET"
        android:value="${THING_SMART_SECRET}" />
</application>
```

如果只是做本地快速联调，也可以先把真实值临时写死。但提交前要恢复成占位符或安全配置来源。

### 5. Application Initialization

官方要求在 `Application` 主线程初始化。对当前仓库，一个合适的落点是：

```kotlin
package com.tuya.flyiotdemo

import android.app.Application
import com.thingclips.smart.home.sdk.ThingHomeSdk

class FlyIoTApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        ThingHomeSdk.init(this)

        if (BuildConfig.DEBUG) {
            ThingHomeSdk.setDebugMode(true)
        }
    }
}
```

如果不想在 Manifest 中放密钥，也可以改为：

```kotlin
ThingHomeSdk.init(this, appKey, appSecret)
```

### 6. ProGuard

把官方 keep 规则合并到 `app/proguard-rules.pro`：

```proguard
-keep class com.alibaba.fastjson.**{*;}
-dontwarn com.alibaba.fastjson.**

-keep class com.thingclips.smart.mqttclient.mqttv3.** { *; }
-dontwarn com.thingclips.smart.mqttclient.mqttv3.**

-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

-keep class okio.** { *; }
-dontwarn okio.**

-keep class com.thingclips.**{*;}
-dontwarn com.thingclips.**

-keep class chip.** { *; }
-dontwarn chip.**

-keep class com.gzl.smart.** { *; }
-dontwarn com.gzl.smart.**
```

### 7. Shutdown And Logs

- 应用退出前，如明确要释放云连接，调用 `ThingHomeSdk.onDestroy()`
- debug 可打开 `ThingHomeSdk.setDebugMode(true)`
- release 建议关闭日志

## Tuya Platform Checks

即使本地配置全对，平台侧配置不匹配也会失败。最常见的核对项：

- Android 包名必须与工程 `applicationId` 一致
- 平台登记的 SHA-256 必须与当前签名一致
- 使用的 AppKey / AppSecret 必须来自同一个 SDK 应用

## Common Failure Mapping

- `ILLEGAL_CLIENT_ID`
  - 先检查 Tuya 平台登记的包名是否与 `applicationId` 一致
  - 再检查证书 SHA-256 是否匹配当前调试签名或发布签名
- `SING_VALIDATE_FALED`
  - 先检查 `THING_SMART_APPKEY` / `THING_SMART_SECRET`
  - 再确认是否把错误项目的密钥配置到了当前包名
- Gradle 解析不到依赖
  - 先检查仓库是不是加在 `settings.gradle.kts`
  - 再确认 Tuya 仓库地址有没有漏配
- `security-algorithm.aar` 相关类找不到
  - 先检查文件是否真的位于 `app/libs/`
  - 再检查 `implementation(fileTree(...))` 是否保留

## Outdated Guidance To Avoid

网络上容易看到一些旧方案。当前官方快速集成页已经表明：

- 用 `ThingHomeSdk` 初始化
- 用 `THING_SMART_APPKEY` / `THING_SMART_SECRET`
- 需要 `security-algorithm.aar`

因此，不要默认沿用旧文章里的以下内容，除非你明确在维护旧版本 SDK：

- `TUYA_SMART_*` 元数据名
- `t_s.bmp` 安全图片流程
- 明显早于当前官方页的旧依赖坐标

# Device Control UI BizBundle — 参考文档

> 基于官方文档 + [tuya-ui-bizbundle-android-demo](https://github.com/tuya/tuya-ui-bizbundle-android-demo) 整理。
> Demo 实际使用版本：`sdk_version=6.11.1`、`biz_bom_version=6.11.0`。

## 目录

1. [Maven 仓库配置](#maven-仓库配置)
2. [Gradle 依赖配置（Kotlin DSL）](#gradle-依赖配置kotlin-dsl)
3. [packaging 冲突处理](#packaging-冲突处理)
4. [Application 初始化（关键）](#application-初始化关键)
5. [BizBundleFamilyServiceImpl 实现](#bizBundleFamilyServiceImpl-实现)
6. [混淆规则](#混淆规则)
7. [React Native 版本兼容性](#react-native-版本兼容性)
8. [MiniApp SDK 集成](#miniapp-sdk-集成)
9. [接口说明与调用示例](#接口说明与调用示例)
10. [AppConfig 功能开关](#appconfig-功能开关)
11. [常见问题](#常见问题)

---

## Maven 仓库配置

在 `settings.gradle.kts` 的 `dependencyResolutionManagement` 中加入涂鸦 Maven 源：

```kotlin
dependencyResolutionManagement {
    repositories {
        maven { url = uri("https://maven-other.tuya.com/repository/maven-commercial-releases/") }
        google()
        mavenCentral()
        maven { url = uri("https://maven.aliyun.com/repository/public") }
        maven { url = uri("https://jitpack.io") }
    }
}
```

---

## Gradle 依赖配置（Kotlin DSL）

### 必选依赖

```kotlin
// app/build.gradle.kts
dependencies {
    // BOM 统一管理版本，必须放在最前
    api(enforcedPlatform("com.thingclips.smart:thingsmart-BizBundlesBom:6.11.0"))
    // 核心 SDK
    api("com.thingclips.smart:thingsmart:6.11.1")
    // 设备控制业务包 RN 容器
    api("com.thingclips.smart:thingsmart-bizbundle-panel")
    // 基础扩展能力（注意 exclude annotation 模块，demo 中有这个处理）
    api("com.thingclips.smart:thingsmart-bizbundle-basekit") {
        exclude(group = "com.thingclips.smart", module = "thingplugin-annotation")
    }
    // 业务扩展能力
    api("com.thingclips.smart:thingsmart-bizbundle-bizkit")
    // 设备控制相关能力
    api("com.thingclips.smart:thingsmart-bizbundle-devicekit")
}
```

### 强烈建议引入

```kotlin
// 家庭服务（打开面板前必须注册并调用，见下方初始化说明）
api("com.thingclips.smart:thingsmart-bizbundle-family")
// 多媒体扩展能力
api("com.thingclips.smart:thingsmart-bizbundle-mediakit")
// 地图扩展能力
api("com.thingclips.smart:thingsmart-bizbundle-mapkit")
```

### 可选依赖

```kotlin
// IPC 摄像头面板（非必要不引入，增加包体积和资源冲突风险）
api("com.thingclips.smart:thingsmart-bizbundle-camera_panel")
// 扫地机面板（有扫地机设备时必须引入）
api("com.thingclips.smart:thingsmart-bizbundle-p2pkit")

// 地图：中国大陆发布选高德，海外选谷歌，二选一
// 高德地图
implementation("com.amap.api:search:7.9.0")
implementation("com.amap.api:3dmap:8.1.0")
api("com.thingclips.smart:thingsmart-react-native-amap:5.5.0")
// 谷歌地图
api("com.thingclips.smart:thingsmart-react-native-googlemap:4.8.2")
api("com.google.android.gms:play-services-maps:18.0.0")

// RN 面板调试（仅 debug 使用，release 移除）
debugImplementation("com.thingclips.android.debugtool:thing_panel_tool:1.0.0")

// GIF 动效（面板 GIF 无动效时加入）
implementation("com.facebook.fresco:animated-drawable:2.6.0")
implementation("com.facebook.fresco:animated-webp:2.6.0")
implementation("com.facebook.fresco:animated-gif:2.6.0")

// 按键音控制（需 SDK v6.2.0+）
api("com.thingclips.smart:thingsmart-bizbundle-setting")
```

### dependency resolutionStrategy（推荐）

```kotlin
// build.gradle.kts (root)
subprojects {
    configurations.all {
        resolutionStrategy {
            force("com.google.code.findbugs:jsr305:1.3.9")
            force("com.squareup.okhttp3:okhttp:5.0.0-alpha.11")
            force("com.squareup.okio:okio-jvm:3.2.0")
            force("org.jetbrains.kotlin:kotlin-stdlib:1.8.20")
        }
        exclude(group = "com.umeng.umsdk", module = "huawei-basetb")
    }
}
```

---

## packaging 冲突处理

Demo 中 `packagingOptions` 比官方文档多很多 `pickFirst`，漏掉会导致 so 冲突报错：

```kotlin
// app/build.gradle.kts
android {
    packaging {
        jniLibs {
            useLegacyPackaging = true
            pickFirsts += listOf(
                "lib/*/libc++_shared.so",
                "lib/*/libgnustl_shared.so",
                "lib/*/libv8android.so",
                "lib/*/libv8wrapper.so",
                "lib/*/libopenh264.so",
                "lib/*/libyuv.so",
                "lib/*/liblog.so",
                "lib/*/libbytehook.so",
                "lib/*/libxdl.so",
                "lib/*/libsqlcipher.so"
            )
        }
        resources {
            excludes += listOf(
                "AndroidManifest.xml",
                "**/module-info.class",
                "META-INF/LICENSE.txt",
                "META-INF/NOTICE",
                "META-INF/LICENSE",
                "META-INF/NOTICE.txt",
                "META-INF/INDEX.LIST"
            )
        }
    }
}
```

---

## Application 初始化（关键）

> ⚠️ Demo 使用 **`BizBundleInitializer.init()`** 一步完成所有初始化，替代了官方文档中分步调用 `ThingHomeSdk.init()` + `ThingWrapper.init()` 的方式，**顺序不能改变**。

```kotlin
class MyApp : Application() {

    override fun onCreate() {
        super.onCreate()

        // 1. 可选：AppConfig 功能开关（配网、蓝牙等）
        PackConfig.addValueDelegate(AppConfig::class.java)

        // 2. 核心初始化（替代手动 ThingHomeSdk.init + ThingWrapper.init）
        BizBundleInitializer.init(this,
            RouteEventListener { errorCode, urlBuilder ->
                // 路由未实现时回调，urlBuilder.target 是目标路由
                Log.e("Router", "not impl: ${urlBuilder.target}")
            },
            ServiceEventListener { serviceName ->
                Log.e("Service", "not impl: $serviceName")
            }
        )

        // 3. 注册家庭服务（必须，否则无法打开面板）
        BizBundleInitializer.registerService(
            AbsBizBundleFamilyService::class.java,
            BizBundleFamilyServiceImpl()
        )

        // 4. 可选：路由拦截器（拦截面板右上角按钮等事件）
        val redirectService = MicroContext.getServiceManager()
            .findServiceByInterface(RedirectService::class.java.name) as? RedirectService
        redirectService?.registerUrlInterceptor { urlBuilder, callback ->
            // 示例：拦截面板右上角点击
            // if (urlBuilder.target == "panelAction" &&
            //     urlBuilder.params.getString("action") == "gotoPanelMore") {
            //     callback.interceptor("interceptor")
            // } else {
            callback.onContinue(urlBuilder)
            // }
        }
    }

    override fun attachBaseContext(base: Context) {
        super.attachBaseContext(base)
        MultiDex.install(this)  // 如启用 multiDex
    }
}
```

---

## BizBundleFamilyServiceImpl 实现

必须自己实现此类并在 `Application` 中注册，业务包内部通过它获取当前家庭 ID：

```kotlin
class BizBundleFamilyServiceImpl : AbsBizBundleFamilyService() {
    private var currentHomeId: Long = 0L

    override fun getCurrentHomeId(): Long = currentHomeId

    override fun shiftCurrentFamily(familyId: Long, curName: String) {
        super.shiftCurrentFamily(familyId, curName)
        currentHomeId = familyId
    }
}
```

在展示设备列表前，需先调用 `shiftCurrentFamily` 设置当前家庭：

```kotlin
val familyService = MicroServiceManager.getInstance()
    .findServiceByInterface(AbsBizBundleFamilyService::class.java.name)
        as? AbsBizBundleFamilyService
familyService?.shiftCurrentFamily(homeBean.homeId, homeBean.name)
```

---

## 混淆规则

追加到 `app/proguard-rules.pro`：

```proguard
# React Native
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class * { @com.facebook.react.uimanager.UIProp <fields>; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }
-dontwarn com.facebook.react.**
-keep class com.facebook.** { *; }
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }
-keep,includedescriptorclasses class com.facebook.v8.** { *; }

# 高德地图
-dontwarn com.amap.**
-keep class com.amap.api.maps.** { *; }
-keep class com.autonavi.** { *; }
-keep class com.amap.api.trace.** { *; }
-keep class com.amap.api.navi.** { *; }
-keep class com.amap.api.location.** { *; }
-keep class com.amap.api.fence.** { *; }
-keep class com.autonavi.aps.amapapi.model.** { *; }
-keep class com.amap.api.maps.model.** { *; }
-keep class com.amap.api.services.** { *; }

# Google Play Services
-keep class com.google.android.gms.common.** {*;}
-keep class com.google.android.gms.ads.identifier.** {*;}
-keepattributes Signature,*Annotation*,EnclosingMethod
-dontwarn com.google.android.gms.**

# MPAndroidChart
-keep class com.github.mikephil.charting.** { *; }
-dontwarn com.github.mikephil.charting.**

# ThingClips
-keep class com.thingclips.**.**{*;}
-dontwarn com.thingclips.**.**

# TTT UniPlugin
-keep class * extends com.thingclips.android.universal.base.ThingBaseUniPlugin { *; }
-keep class com.thingclips.smart.plugin.*.bean.**{ *; }
```

---

## React Native 版本兼容性

业务包内置 React Native **0.59.10**。

| 工程现有 RN 版本 | 处理方式 |
|---|---|
| 未集成 RN | 直接接入，无需处理 |
| ≤ 0.59.10 且 > 0.51 | 移除工程 RN 或对工程 RN 重命名以避免冲突，不保证正常 |
| > 0.59.10 | **无法集成**，版本不兼容 |

---

## MiniApp SDK 集成

部分设备的面板类型为 `SMART_MINIPG`（小程序面板）。不集成时，点击这类设备后 `goPanelWithCheckAndTip` 会静默取消，logcat 出现：

```
ClassNotFoundException: com.gzl.smart.gzlminiapp.router.MiniAppRouter
```

### 依赖配置

```kotlin
// app/build.gradle.kts — dependencies
implementation("com.thingclips.smart:thingsmart-bizbundle-miniapp")  // BOM 管理版本（6.11.0）
                                                                      // 传递声明 miniapp_shell + thingsmart-ThingMiniAppCore
implementation("com.gzl.smart.gzlminiapp:miniapp_smart:3.34.0")     // MiniAppRouter 运行时实现，必须显式引入
```

> **注意**：`thingsmart-bizbundle-miniapp` 由 BOM 管理，不需要写版本号。`miniapp_smart` 不在 BOM 中，必须手动指定版本。不要只加 `_api` 后缀的包（如 `miniapp_smart_api`），那是编译期接口存根，不含运行时实现类。

### SoLoader 初始化（必须）

`miniapp_smart` 引入后，BizBundle 模块系统会在 `BizBundleInitializer.init()` 期间执行 `GZLMiniAppPipeLine` 启动管道，该管道需要 `SoLoader` 已初始化。必须在 `Application.onCreate()` **最前面**加入：

```kotlin
override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)   // 必须在 BizBundleInitializer.init() 之前
    // ...
    BizBundleInitializer.init(...)
}
```

漏掉此行会导致 App 启动时立即崩溃，错误为：

```
NoClassDefFoundError: com.gzl.smart.gzlminiapp.sdk.GZLMiniAppSDK
```
或
```
NoClassDefFoundError: com.thingclips.smart.miniapp.MiniAppVersion
```

### 依赖关系说明

| 包名 | 用途 | 来源 |
|---|---|---|
| `thingsmart-bizbundle-miniapp` | 官方 BizBundle 小程序模块，声明传递依赖 | BOM 管理 |
| `miniapp_shell`（传递） | `GZLMiniAppSDK` 运行时 | `thingsmart-bizbundle-miniapp` 传递 |
| `thingsmart-ThingMiniAppCore`（传递） | `MiniAppVersion` 运行时 | `thingsmart-bizbundle-miniapp` 传递 |
| `miniapp_smart:3.34.0` | `MiniAppRouter` 运行时，面板路由必需 | 必须显式声明 |

### 获取设备列表与家庭详情

```kotlin
// 先获取当前家庭详情，再拿设备列表跳面板
val familyService = MicroServiceManager.getInstance()
    .findServiceByInterface(AbsBizBundleFamilyService::class.java.name)
        as AbsBizBundleFamilyService

ThingHomeSdk.newHomeInstance(familyService.currentHomeId)
    .getHomeDetail(object : IThingHomeResultCallback {
        override fun onSuccess(homeBean: HomeBean) {
            // homeBean.deviceList -> 设备列表
            // homeBean.groupList -> 群组列表
        }
        override fun onError(code: String, msg: String) {}
    })
```

### 打开设备面板

> **注意包名**：`MicroContext` = `com.thingclips.smart.api.MicroContext`，`AbsPanelCallerService` = `com.thingclips.smart.panelcaller.api.AbsPanelCallerService`。

```kotlin
import com.thingclips.smart.api.MicroContext
import com.thingclips.smart.panelcaller.api.AbsPanelCallerService

val panelService = MicroContext.getServiceManager()
    .findServiceByInterface(AbsPanelCallerService::class.java.name)
        as? AbsPanelCallerService

// 无提示（设备不存在时静默返回）
panelService?.goPanel(activity, deviceBean)

// 有提示（设备不存在时弹 Toast）—— demo 中实际使用的方式
panelService?.goPanelWithCheckAndTip(activity, devId)
```

### 打开群组面板

```kotlin
// demo 中判断 isAdmin 的方式
val isAdmin = ThingHomeSdk.getDataInstance()
    .getHomeBean(familyService.currentHomeId)?.isAdmin ?: false

// 无提示
panelService?.goPanel(activity, groupBean, isAdmin)

// 有提示
panelService?.goPanelWithCheckAndTip(activity, groupId, isAdmin)
```

### 关闭面板

```kotlin
ThingSmartSdk.getEventBus().post(PageCloseEventModel())
```

### 清除面板缓存

```kotlin
val clearService = MicroContext.getServiceManager()
    .findServiceByInterface(ClearCacheService::class.java.name)
        as? ClearCacheService
clearService?.clearCache(activity)
```

### 按键音控制（SDK v6.2.0+）

```kotlin
ThingSmartBizBundleSetting.setPanelClickVoiceStatus(true)   // 开启
ThingSmartBizBundleSetting.setPanelClickVoiceStatus(false)  // 关闭
ThingSmartBizBundleSetting.getPanelClickVoiceStatus()       // 查询
```

### 打开 RN 面板调试页

```kotlin
startActivity(Intent(this, ThingRCTPanelDebugActivity::class.java))
```

---

## AppConfig 功能开关

通过 `PackConfig.addValueDelegate(AppConfig::class.java)` 注册后，可控制以下行为：

```kotlin
@Keep
object AppConfig {
    /** 是否支持深色模式 */
    const val is_darkMode_support = true
    /** 华为包支持 */
    const val is_huawei_pkg = false
    /** 热点配网前缀 */
    const val ap_mode_ssid = "SmartLife"
    /** 是否支持蓝牙设备配网 */
    const val is_need_ble_support = true
    /** 是否支持蓝牙 Mesh 配网 */
    const val is_need_blemesh_support = true
    /** 是否支持扫码配网 */
    const val is_scan_support = true
}
```

---

## 常见问题

### 提示"当前版本不支持该设备，请至应用市场升级 App"

检查 `module_app.json` 的 `PIPE_LINE_APPLICATION_SYNC` 数组中是否含有：

```json
"com.thingclips.smart.paneloutside.RNVersionPipeline"
```

### Release 包部分功能无法使用

检查混淆配置是否完整，尤其是 RN 和 ThingClips 的 keep 规则。

### 打开面板报 SoLoader 未初始化

在 `Application.onCreate()` 中添加（修改后需删除旧 App 重新打包安装）：

```kotlin
SoLoader.init(this, false)
```

### GIF 图无动效

加入 fresco animated 依赖：

```kotlin
implementation("com.facebook.fresco:animated-drawable:2.6.0")
implementation("com.facebook.fresco:animated-webp:2.6.0")
implementation("com.facebook.fresco:animated-gif:2.6.0")
```

### 无法打开面板（未实现家庭服务）

必须在 `Application` 中注册 `BizBundleFamilyServiceImpl` 并在打开面板前调用 `shiftCurrentFamily`，详见 [BizBundleFamilyServiceImpl 实现](#bizbundlefamilyserviceimpl-实现)。

### so 冲突 / duplicate class 报错

检查 `packaging` 的 `pickFirsts` 是否包含了所有必要的 so 文件，参考 [packaging 冲突处理](#packaging-冲突处理)。

### 点击设备无反应（MiniApp 面板类型）

logcat 显示 `ClassNotFoundException: MiniAppRouter` 或面板跳转静默取消，说明设备使用 `SMART_MINIPG` 面板类型但缺少 MiniApp 依赖。参考 [MiniApp SDK 集成](#miniapp-sdk-集成)。

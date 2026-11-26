# BizBundle Framework Setup

## Source

- https://developer.tuya.com/cn/docs/app-development/integration.md?id=Ka8qhzk13vkfq
- GitHub Demo: https://github.com/tuya/tuya-ui-bizbundle-android-demo

## Read This When

- 首次集成任何涂鸦 UI 业务包
- 配置 Gradle 依赖、Maven 仓库
- 初始化 BizBundleInitializer
- 实现 BizBundleFamilyServiceImpl
- 配置 Base_BizBundle_Theme 主题结构

---

## 1. Gradle 依赖（Kotlin DSL）

`app/build.gradle.kts`：

```kotlin
android {
    // BizBundle 内部资源缺少多语言兜底值，必须关闭 lint 错误阻断，否则构建失败
    lint {
        abortOnError = false
    }
}

dependencies {
    // BOM 统一版本管理（版本须与 thingsmart SDK 一致）
    implementation(enforcedPlatform("com.thingclips.smart:thingsmart-BizBundlesBom:6.11.0"))

    // 必选
    implementation("com.thingclips.smart:thingsmart-bizbundle-panel")
    implementation("com.thingclips.smart:thingsmart-bizbundle-basekit") {
        exclude(group = "com.thingclips.smart", module = "thingplugin-annotation")
    }
    implementation("com.thingclips.smart:thingsmart-bizbundle-bizkit")
    implementation("com.thingclips.smart:thingsmart-bizbundle-devicekit")
    implementation("com.thingclips.smart:thingsmart-bizbundle-family")

    // 强烈建议
    implementation("com.thingclips.smart:thingsmart-bizbundle-mediakit")
    implementation("com.thingclips.smart:thingsmart-bizbundle-mapkit")
}
```

> BOM 版本须与 `thingsmart` SDK 版本保持完全一致，不能单独升级其中一个。

`configurations.configureEach` 里还需要 exclude：
```kotlin
configurations.configureEach {
    exclude(group = "com.thingclips.smart", module = "thingsmart-modularCampAnno")
}
```

---

## 2. Application 初始化（Kotlin）

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // 1. BizBundle 统一初始化，替代 ThingHomeSdk.init()，顺序不能变
        BizBundleInitializer.init(
            this,
            RouteEventListener { _, urlBuilder ->
                Log.e("BizBundle", "route not impl: ${urlBuilder.target}")
            },
            ServiceEventListener { serviceName ->
                Log.e("BizBundle", "service not impl: $serviceName")
            }
        )

        // 2. 注册家庭服务，必须紧跟 init() 之后
        BizBundleInitializer.registerService(
            AbsBizBundleFamilyService::class.java,
            BizBundleFamilyServiceImpl()
        )
    }
}
```

---

## 3. BizBundleFamilyServiceImpl（Kotlin）

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

---

## 4. 登录/退出回调

```kotlin
// 用户登录成功后（推荐在主页 Activity.onCreate 中调用）
BizBundleInitializer.onLogin()

// 用户退出登录后
BizBundleInitializer.onLogout(context)
```

---

## 5. 主题配置

主题色体系由 `thingOpenTheme` Gradle 插件统一管理。完整配置见 `integrating-tuya-android-theme` skill 及其 `references/theme-config.md`。

**本 skill 仅说明 `Base_BizBundle_Theme` 结构配置（主题色颜色本身由插件生成）。**

### 5a. AndroidManifest.xml

```xml
<application
    android:theme="@style/Base_BizBundle_Theme"
    tools:replace="android:allowBackup,android:supportsRtl,android:theme">
```

### 5b. res/values/themes.xml

`Base_BizBundle_Theme` 的 parent 须基于 `Theme.AppCompat.DayNight.NoActionBar`：

```xml
<!-- BizBundle 要求的基础 AppTheme -->
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar" />

<!-- BizBundle 主题，绑定所有颜色 attr -->
<style name="Base_BizBundle_Theme" parent="AppTheme">
    <item name="status_font_color">@color/status_font_color</item>
    <item name="status_bg_color">@color/status_bg_color</item>
    <item name="navbar_font_color">@color/navbar_font_color</item>
    <item name="navbar_bg_color">@color/navbar_bg_color</item>
    <item name="app_bg_color">@color/app_bg_color</item>
    <item name="fragment_bg_color">@color/app_bg_color</item>
    <item name="list_primary_color">@color/list_primary_color</item>
    <item name="list_sub_color">@color/list_sub_color</item>
    <item name="list_secondary_color">@color/list_secondary_color</item>
    <item name="list_line_color">@color/list_line_color</item>
    <item name="list_bg_color">@color/list_bg_color</item>
    <item name="primary_button_font_color">@color/primary_button_font_color</item>
    <item name="primary_button_bg_color">@color/primary_button_bg_color</item>
    <item name="secondary_button_font_color">@color/secondary_button_font_color</item>
    <item name="secondary_button_bg_color">@color/secondary_button_bg_color</item>
    <item name="notice_font_color">@color/notice_font_color</item>
    <item name="notice_bg_color">@color/notice_bg_color</item>
    <item name="bg_normal_text_bt">@drawable/bg_text_bts</item>
    <item name="app_name">@string/app_name</item>
    <item name="is_splash_used">false</item>
</style>

<!-- 应用自身主题继承 Base_BizBundle_Theme，在此叠加自定义样式 -->
<style name="Theme.MyApp" parent="Base_BizBundle_Theme">
    <item name="colorPrimary">...</item>
</style>
```

> `tools:replace="android:theme"` 必须加，否则涂鸦 SDK 内部的 `android:theme` 声明会与应用冲突导致 Manifest 合并失败。

### 5c. res/values/compat_colors.xml

`compat_colors.xml` 声明 BizBundle 所需的语义颜色，值来源分两类：

- **品牌色 `m1/m1_2`、背景色 `b1/b2`**：由 `thingOpenTheme` 插件生成，直接引用 `@color/thing_theme_color_m1` 等
- **文字/分割线系（`n1/n3/n4/n7`）**：插件 2.0.x 版本**不生成**这些独立 token，必须用硬编码值或自定义颜色名替代

> **版本陷阱**：插件旧文档示例里出现的 `@color/thing_theme_color_n1` 等在插件 2.0.x 中根本不会被生成，直接引用会导致 `color not found` 构建错误。

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 文字/分割线色：插件 2.0.x 不生成 n* 独立 token，直接硬编码 -->
    <color name="ty_n1">#FF000000</color>  <!-- 主文字 -->
    <color name="ty_n3">#FF595959</color>  <!-- 次级文字 -->
    <color name="ty_n4">#FF999999</color>  <!-- 辅助文字 -->
    <color name="ty_n7">#FFE5E5E5</color>  <!-- 分割线 -->

    <!-- 语义颜色 → 插件 token 或硬编码值 -->
    <color name="status_font_color">@color/ty_n1</color>
    <color name="status_bg_color">@color/thing_theme_color_b2</color>
    <color name="navbar_font_color">@color/ty_n1</color>
    <color name="navbar_bg_color">#303030</color>
    <color name="app_bg_color">@color/thing_theme_color_b1</color>
    <color name="list_primary_color">@color/ty_n1</color>
    <color name="list_sub_color">@color/ty_n3</color>
    <color name="list_secondary_color">@color/ty_n4</color>
    <color name="list_line_color">@color/ty_n7</color>
    <color name="list_bg_color">@color/thing_theme_color_b2</color>
    <color name="primary_button_font_color">@color/thing_theme_color_b2</color>
    <color name="primary_button_bg_color">@color/thing_theme_color_m1</color>
    <color name="primary_button_select_color">@color/thing_theme_color_m1_2</color>
    <color name="secondary_button_font_color">@color/ty_n1</color>
    <color name="secondary_button_bg_color">@color/thing_theme_color_b2</color>
    <color name="notice_font_color">@color/ty_n1</color>
    <color name="notice_bg_color">#FFF8D8</color>
    <color name="status_bg_color_75">@color/thing_theme_color_b2</color>
    <color name="status_bg_color_90">@color/thing_theme_color_b2</color>
</resources>
```

### 5d. res/drawable/bg_text_bts.xml（必选）

```xml
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_focused="true">
        <shape android:shape="rectangle">
            <corners android:radius="@dimen/thing_mg_2" />
            <solid android:color="@color/primary_button_select_color" />
        </shape>
    </item>
    <item android:state_selected="true">
        <shape android:shape="rectangle">
            <corners android:radius="@dimen/thing_mg_2" />
            <solid android:color="@color/primary_button_select_color" />
        </shape>
    </item>
    <item android:state_pressed="true">
        <shape android:shape="rectangle">
            <corners android:radius="@dimen/thing_mg_2" />
            <solid android:color="@color/primary_button_select_color" />
        </shape>
    </item>
    <item android:state_enabled="true">
        <shape android:shape="rectangle">
            <corners android:radius="@dimen/thing_mg_2" />
            <solid android:color="@color/primary_button_bg_color" />
        </shape>
    </item>
    <item android:state_enabled="false">
        <shape>
            <corners android:radius="@dimen/thing_mg_2" />
            <solid android:color="@color/gray_99" />
        </shape>
    </item>
</selector>
```

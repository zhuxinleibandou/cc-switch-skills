# 设备配网 UI 业务包 — 详细参考

> 来源：https://developer.tuya.com/cn/docs/app-development/deviceconfiguration.md?id=Ka8qhzk488zyd

## 功能说明

设备配网 UI 业务包支持以下配网方式：
- Wi-Fi 快连模式（EZ 模式）
- 热点模式（AP 模式）
- IPC 扫码配网
- Zigbee 子设备配网
- 蓝牙配网（BLE）
- 蓝牙 Mesh 配网
- Matter 配网
- 扫码配网

提供自动发现配网功能，简化用户配网流程。

## Gradle 依赖

```kotlin
// 配网 UI 业务包（必选）
implementation("com.thingclips.smart:thingsmart-bizbundle-device_activator")
// 扫码配网（强烈建议，支持 MLKit 扫码）
implementation("com.thingclips.smart:thingsmart-bizbundle-qrcode_mlkit")
```

> 以上坐标由 BOM `thingsmart-BizBundlesBom` 统一管理版本，无需手动指定版本号。

## 混淆规则（追加到 proguard-rules.pro）

```proguard
# FastJSON
-keep class com.alibaba.fastjson.**{*;}
-dontwarn com.alibaba.fastjson.**

# RxJava
-dontwarn rx.**
-keep class rx.** {*;}
-keep class io.reactivex.**{*;}
-dontwarn io.reactivex.**
-keep class rx.android.**{*;}

# Fresco
-keep class com.facebook.drawee.backends.pipeline.Fresco
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {@com.facebook.common.internal.DoNotStrip *;}

# ThingClips
-keep class com.thingclips.**{*;}
-dontwarn com.thingclips.**
```

## XML 资源配置

在 `app/src/main/res/values/` 中可自定义以下配置：

```xml
<!-- 热点模式 SSID 前缀，默认 SmartLife -->
<string name="ap_mode_ssid">SmartLife</string>

<!-- 蓝牙配网支持 -->
<bool name="is_need_ble_support">true</bool>
<!-- 蓝牙 Mesh 配网支持 -->
<bool name="is_need_blemesh_support">true</bool>
<!-- 扫码配网支持 -->
<bool name="is_scan_support">true</bool>
<!-- EZ 快连模式（设为 false 则不展示 EZ 入口） -->
<bool name="is_config_activator_ez">false</bool>
```

## 自动发现搜索配置

在 `app/src/main/assets/activator_auto_search_capacity.json` 中配置：

```json
{
  "searchTypeZigbee": false,
  "searchTypeEZ": true,
  "searchTypePegasus": false,
  "searchTypeBle": false,
  "searchTypeWired": false,
  "searchTypeMatter": false
}
```

各字段说明：
- `searchTypeZigbee` — 是否自动搜索 Zigbee 网关下的子设备
- `searchTypeEZ` — 是否自动搜索 Wi-Fi EZ 模式设备
- `searchTypePegasus` — 是否自动搜索闪电配网设备
- `searchTypeBle` — 是否自动搜索 BLE 设备
- `searchTypeWired` — 是否自动搜索有线设备
- `searchTypeMatter` — 是否自动搜索 Matter 设备

## API 接口

### 初始化监听器

在 Application 或首页初始化时注册配网回调：

```kotlin
ThingDeviceActivatorManager.INSTANCE.addListener(object : IThingDeviceActiveListener {
    override fun onDevicesAdd(devIds: List<String>) {
        // 配网成功，返回新增设备 ID 列表
    }

    override fun onRoomDataUpdate() {
        // 房间数据更新
    }

    override fun onOpenDevicePanel(devId: String) {
        // 配网完成后跳转设备控制面板
    }
})
```

### 打开配网页面

```kotlin
// 打开配网入口（Activity context）
ThingDeviceActivatorManager.INSTANCE.startDeviceActiveAction(activity)
```

### 打开扫一扫

```kotlin
// 打开扫码配网（Activity context）
ScanManager.INSTANCE.openScan(activity)
```

## 前置条件

1. 已完成 Tuya Smart App SDK 基础集成（`integrating-tuya-android-sdk`）
2. 已完成 BizBundle 框架接入（`integrating-tuya-android-bizbundle-framework`）
3. 已注册家庭服务（`BizBundleFamilyServiceImpl`），配网需要当前家庭上下文
4. 用户已登录且已有至少一个家庭

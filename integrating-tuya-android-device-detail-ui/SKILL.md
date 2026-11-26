---
name: integrating-tuya-android-device-detail-ui
description: 在已接入 Tuya Smart App SDK 的 Android Kotlin 应用中集成设备详情 UI 业务包。适用于需要添加设备详情/设置页（包含设备信息编辑、FAQ、OTA 固件升级、群组管理、多控关联、场景与自动化、三方语音控制）及通过 deviceDetail.json 扩展自定义 Cell 的场景。
compatibility: Android, Kotlin, Tuya BizBundle 5.x
---

## 概述 {#description}

在已接入 Tuya Smart App SDK 的 Android Kotlin 工程中，集成设备详情 UI 业务包（panelmore），实现设备管理的"更多"页面——作为连接设备面板与各项基础管理功能的 hub。

设备详情页核心能力：
- **设备信息**：编辑名称/图标/房间、查看设备 ID/信号等
- **可选子功能**：常见问题与反馈、固件 OTA 升级、群组管理、多控关联、一键执行与自动化、三方语音控制
- **自定义扩展**：通过 JSON 配置 + 自定义 Cell 类灵活扩展功能项

前置条件：已完成 `integrating-tuya-android-sdk`、`integrating-tuya-android-bizbundle-framework` 和 `integrating-tuya-android-device-control-ui`。

## 适用场景 {#scene}

已完成设备控制面板集成，需要从面板右上角或设备列表长按进入设备详情/设置页时使用。

**步骤：**

1. **添加 Gradle 依赖**：在 `app/build.gradle.kts` 中加入必选依赖 `thingsmart-bizbundle-panelmore`、`thingsmart-bizbundle-family`，排除 `thingsmart-modularCampAnno`，按需加入可选子功能依赖（feedback / ota / groupmanager / control / scene）。详见 `references/device-detail-ui.md`。

2. **放置 assets 配置文件**：在 `app/src/main/assets/` 下创建三个 JSON 配置文件：
   - `deviceDetail.json` — 控制设备详情页的分区布局和功能项
   - `deviceEditConfigList.json` — 控制设备编辑页面的配置项
   - `thingarchercell_config.json` — 将 cellType 映射到具体 Cell 实现类
   先从 `references/device-detail-ui.md` 复制完整默认配置，再按需裁剪。

3. **配置三方语音控制（可选）**：若需要 Alexa/Google 功能，在 `res/values/compat-colors.xml` 中配置 `appId`（需通过涂鸦工单申请）。

4. **调用设备详情页接口**：通过 `UrlBuilder` + `UrlRouter` 跳转，传入 `extra_panel_dev_id`、`extra_panel_name`、`extra_panel_group_id`（非群组设备传 `0L`）。路由名称为 `panelMore`。详见 `references/device-detail-ui.md`。

5. **可选：自定义扩展 Cell**：自定义 cellType 必须以 `c_` 开头；实现 `IArcherCell` 接口或继承 `AbsBaseArcherCell`；在 `deviceDetail.json` 和 `thingarchercell_config.json` 中注册。详见 `references/device-detail-ui.md`。

## 搭配使用 {#usage}

- `integrating-tuya-android-sdk` — 前置：SDK 集成
- `integrating-tuya-android-bizbundle-framework` — 前置：BizBundle 框架初始化
- `integrating-tuya-android-device-control-ui` — 前置：设备控制面板（详情页从面板跳转）
- `integrating-tuya-android-home-bizbundle` — 可配合使用家庭管理 UI

## 注意事项 {#tip}

- **`thingsmart-bizbundle-panelmore` 是最容易遗漏的必选依赖**：未引入时 SDK 反射加载 `DeviceDetailModuleApp` 失败，点击"去设备详情"完全无响应，日志报 `ClassNotFoundException: DeviceDetailModuleApp`。
- **`archerGroup` 必须包含 `clazz` 字段**：`thingarchercell_config.json` 中 `archerGroup` 每个条目必须包含 `clazz` 字段，缺少时 Activity 启动立即崩溃，报 `NullPointerException: archerGroupInfoBean.clazz must not be null`。请直接从 `references/device-detail-ui.md` 复制完整配置。
- **配置文件缺失**：三个 JSON 配置文件必须全部放到 `app/src/main/assets/` 下，缺少任何一个都会导致设备详情页崩溃或白屏。
- **cellType 与依赖不匹配**：保留了某 cellType 但未引入对应可选依赖，会导致该功能项空白或点击崩溃。
- **`UrlBuilder` 的 route 名称是 `panelMore`**：不是 `deviceDetail` 也不是 `panel_more`，写错路由名不会报错但页面不会打开。
- **群组 ID 传值错误**：非群组设备必须传 `0L` 而不是 `null`，否则 Bundle 取值时会抛 NPE。
- **SDK 与 BOM 版本不匹配**：`thingsmart` SDK 版本必须与 `thingsmart-BizBundlesBom` 主版本一致，版本不一致会导致运行时 `NoSuchMethodError`。

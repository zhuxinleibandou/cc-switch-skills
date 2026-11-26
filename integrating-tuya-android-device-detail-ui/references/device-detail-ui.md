# 设备详情 UI 业务包 — 集成参考

> 来源：[涂鸦开发者文档](https://developer.tuya.com/cn/docs/app-development/devicedetails.md?id=Ka8tzzkq5fqbo) + [tuya-ui-bizbundle-android-demo](https://github.com/tuya/tuya-ui-bizbundle-android-demo/tree/master/devicedetail)

---

## 1. Gradle 依赖

### 必选依赖

```kotlin
// app/build.gradle.kts
dependencies {
    // BOM 统一版本
    api(enforcedPlatform("com.thingclips.smart:thingsmart-BizBundlesBom:${biz_bom_version}"))

    // 设备详情核心（panelmore = 设备详情 + 设备编辑）
    api("com.thingclips.smart:thingsmart-bizbundle-panelmore")

    // 家庭管理（设备详情依赖家庭上下文）
    api("com.thingclips.smart:thingsmart-bizbundle-family")

    // SDK 主包
    api("com.thingclips.smart:thingsmart:${sdk_version}")
}
```

### 可选子功能依赖

根据 `deviceDetail.json` 中启用的 cellType 按需引入：

| 子功能 | 依赖坐标 | 对应 cellType |
|--------|----------|---------------|
| 常见问题与反馈 | `thingsmart-bizbundle-feedback` | `help_and_feedback` |
| 设备固件 OTA | `thingsmart-bizbundle-ota` | `check_firmware_update` |
| 群组管理 | `thingsmart-bizbundle-groupmanager` | `group_create` / `group_edit_devices` |
| 多控关联 | `thingsmart-bizbundle-control` | `bind_multi_control_link` |
| 一键执行与自动化 | `thingsmart-bizbundle-scene` | `scene_and_automation` |

```kotlin
// 可选依赖示例（按需取消注释）
// api("com.thingclips.smart:thingsmart-bizbundle-feedback")
// implementation("com.thingclips.smart:thingsmart-bizbundle-ota")
// implementation("com.thingclips.smart:thingsmart-bizbundle-groupmanager")
// implementation("com.thingclips.smart:thingsmart-bizbundle-control")
// api("com.thingclips.smart:thingsmart-bizbundle-scene")
```

### 排除冲突模块

```kotlin
configurations.all {
    exclude(group = "com.thingclips.smart", module = "thingsmart-modularCampAnno")
}
```

---

## 2. 配置文件

需在 `app/src/main/assets/` 目录下放置以下三个配置文件：

### 2.1 deviceDetail.json

控制设备详情页的**分区布局和功能项排列**。`cellType` 的顺序决定展示顺序，移除某个 `cellType` 则移除对应功能。

```json
[
  {
    "name": "headerSection",
    "items": [
      { "cellType": "header" },
      { "cellType": "device_info" },
      { "cellType": "net_setting" },
      { "cellType": "group_edit_devices" },
      { "cellType": "iot_card_recharge" },
      { "cellType": "scene_and_automation" },
      { "cellType": "device_evaluation" }
    ]
  },
  {
    "name": "recommendProductSection",
    "header": { "cellType": "recommend_product_empty" },
    "items": [{ "cellType": "recommend_products" }],
    "margin": { "top": 16 }
  },
  {
    "name": "thirdPartyControlSection",
    "header": { "cellType": "section_third-party_control" },
    "items": [{ "cellType": "third-party_control" }]
  },
  {
    "name": "offLineWarnSection",
    "header": { "cellType": "section_off_line_warn" },
    "items": [{ "cellType": "off_line_warn" }]
  },
  {
    "name": "otherSection",
    "header": { "cellType": "section_other" },
    "items": [
      { "cellType": "bind_multi_control_link" },
      { "cellType": "group_create" },
      { "cellType": "help_and_feedback" },
      { "cellType": "add_icon_to_home_screen" },
      { "cellType": "show_infrared_gateway_sub_device" },
      { "cellType": "check_device_network" },
      { "cellType": "check_firmware_update" },
      { "cellType": "matter_bridge_service" },
      { "cellType": "matter_service" },
      { "cellType": "product_instruction" }
    ]
  },
  {
    "name": "footerSection",
    "header": { "cellType": "device_detail_empty" },
    "items": [{ "cellType": "footer" }],
    "margin": { "top": 16 }
  }
]
```

#### cellType 功能映射

| cellType | 功能说明 | 所需子功能依赖 |
|----------|----------|---------------|
| `header` | 设备头部区域（图标、名称） | 无 |
| `device_info` | 设备信息（ID、IP、信号等） | 无 |
| `net_setting` | 网络设置 | 无 |
| `group_edit_devices` | 群组编辑设备列表 | `thingsmart-bizbundle-groupmanager` |
| `iot_card_recharge` | IoT 卡充值 | 无 |
| `scene_and_automation` | 一键执行与自动化 | `thingsmart-bizbundle-scene` |
| `device_evaluation` | 设备评价 | 无 |
| `recommend_products` | 推荐产品 | 无 |
| `third-party_control` | 三方语音控制（Alexa/Google） | 无（需额外配置 appId） |
| `off_line_warn` | 离线提醒 | 无 |
| `bind_multi_control_link` | 多控关联 | `thingsmart-bizbundle-control` |
| `group_create` | 创建群组 | `thingsmart-bizbundle-groupmanager` |
| `help_and_feedback` | 常见问题与反馈 | `thingsmart-bizbundle-feedback` |
| `add_icon_to_home_screen` | 添加到桌面快捷方式 | 无 |
| `show_infrared_gateway_sub_device` | 红外网关子设备显示 | 无 |
| `check_device_network` | 检测设备网络 | 无 |
| `check_firmware_update` | 固件升级检测 | `thingsmart-bizbundle-ota` |
| `matter_bridge_service` | Matter Bridge 服务 | 无 |
| `matter_service` | Matter 服务 | 无 |
| `product_instruction` | 产品说明 | 无 |
| `footer` | 底部区域（移除设备/恢复出厂） | 无 |

### 2.2 deviceEditConfigList.json

控制设备编辑页面的配置项：

```json
{
  "deviceEdit": [
    {
      "name": "deviceEdit",
      "items": [
        { "cellType": "dev_icon" },
        { "cellType": "set_icon" },
        { "cellType": "set_name" },
        { "cellType": "set_position" }
      ]
    }
  ]
}
```

### 2.3 thingarchercell_config.json

将 `cellType` 映射到具体的 Cell 实现类。此文件用于注册所有内置和自定义的 Cell。

**注意：`archerGroup` 中每个条目必须包含 `clazz` 字段**（对应 Group 容器类），缺失会导致 `NullPointerException: archerGroupInfoBean.clazz must not be null` 崩溃。`type` 字段在 archerGroup 中无效，不需要填写。

以下为从 `thingsmart-device-detail` AAR 内置的 `device-detail_archercell_info.json` 提取的完整配置（直接复制使用即可）：

```json
{
  "archerGroup": [
    { "name": "headerSection", "clazz": "com.thingclips.smart.device_detail.group.HeaderGroup" },
    { "name": "offLineWarnSection", "clazz": "com.thingclips.smart.device_detail.group.OffLineWarnSectionGroup" },
    { "name": "recommendProductSection", "clazz": "com.thingclips.smart.device_detail.group.RecommendProductSectionGroup" },
    { "name": "thirdPartyControlSection", "clazz": "com.thingclips.smart.device_detail.group.ThirdPartyControlSectionGroup" }
  ],
  "archerCell": [
    { "name": "accessory_manage", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.AccessoriesManagerArcherCell" },
    { "name": "add_icon_to_home_screen", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.AddIconToHomeScreenArcherCell" },
    { "name": "check_device_network", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.CheckDeviceNetworkArcherCell" },
    { "name": "connect_cloud_activation", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.ConnectCloudActivationArcherCell" },
    { "name": "device_evaluation", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.DeviceEvaluationArcherCell" },
    { "name": "device_from", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.DeviceFromArcherCell" },
    { "name": "device_info", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.DeviceInfoArcherCell" },
    { "name": "remote_reboot", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.DeviceRestartCell" },
    { "name": "device_detail_empty", "type": 2, "clazz": "com.thingclips.smart.device_detail.cell.EmptyArcherCell" },
    { "name": "footer", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.FooterArcherCell" },
    { "name": "group_create", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.GroupCreateArcherCell" },
    { "name": "group_edit_devices", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.GroupEditDeviceArcherCell" },
    { "name": "header", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.HeaderArcherCell" },
    { "name": "help_and_feedback", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.HelpAndFeedbackArcherCell" },
    { "name": "iot_card_recharge", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.IOTCardRechargeArcherCell" },
    { "name": "show_infrared_gateway_sub_device", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.InfraredSubDeviceArcherCell" },
    { "name": "link_device", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.LinkDeviceArcherCell" },
    { "name": "location_manage", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.LocationManageArcherCell" },
    { "name": "matter_bridge_service", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.MatterBridgeServiceCell" },
    { "name": "matter_service", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.MatterServiceCell" },
    { "name": "bind_multi_control_link", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.MultiControlArcherCell" },
    { "name": "net_setting", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.NetSettingArcherCell" },
    { "name": "off_line_warn", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.OffLineWarnArcherCell" },
    { "name": "section_off_line_warn", "type": 2, "clazz": "com.thingclips.smart.device_detail.cell.OffLineWarnHeaderCell" },
    { "name": "check_firmware_update", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.OtaCheckArcherCell" },
    { "name": "product_instruction", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.ProductInstructionArcherCell" },
    { "name": "recommend_products", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.RecommendProductArcherCell" },
    { "name": "recommend_product_empty", "type": 2, "clazz": "com.thingclips.smart.device_detail.cell.RecommendProductEmptyArcherCell" },
    { "name": "scene_and_automation", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.SceneAutomationArcherCell" },
    { "name": "section_other", "type": 2, "clazz": "com.thingclips.smart.device_detail.cell.SectionOtherCell" },
    { "name": "panel_share_group_or_device", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.SharedArcherCell" },
    { "name": "sub_device_migrate", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.SubDeviceMigrateArcherCell" },
    { "name": "sync_control", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.SyncControlArcherCell" },
    { "name": "third-party_control", "type": 1, "clazz": "com.thingclips.smart.device_detail.cell.ThirdPartControlArcherCell" },
    { "name": "section_third-party_control", "type": 2, "clazz": "com.thingclips.smart.device_detail.cell.ThirdPartControlHeaderCell" },
    { "name": "dev_icon", "type": 1, "clazz": "com.thingclips.device.base.info.cell.DeviceIconCell" },
    { "name": "set_icon", "type": 1, "clazz": "com.thingclips.device.base.info.cell.DevEditIconCell" },
    { "name": "set_name", "type": 1, "clazz": "com.thingclips.device.base.info.cell.DevEditNameCell" },
    { "name": "set_position", "type": 1, "clazz": "com.thingclips.device.base.info.cell.DevEditPositionCell" }
  ]
}
```

> archerGroup 中只有 4 个内置 section 需要注册（`headerSection`、`offLineWarnSection`、`recommendProductSection`、`thirdPartyControlSection`）。`otherSection` 和 `footerSection` 不在 archerGroup 中，它们靠 archerCell 里的 `section_other`（type=2）和 `device_detail_empty`（type=2）header cell 渲染。

以下列出关键 archerCell 条目：

| name | type | clazz |
|------|------|-------|
| header | 1 | `com.thingclips.smart.device_detail.cell.HeaderArcherCell` |
| device_info | 1 | `com.thingclips.smart.device_detail.cell.DeviceInfoArcherCell` |
| net_setting | 1 | `com.thingclips.smart.device_detail.cell.NetSettingArcherCell` |
| group_edit_devices | 1 | `com.thingclips.smart.device_detail.cell.GroupEditDeviceArcherCell` |
| iot_card_recharge | 1 | `com.thingclips.smart.device_detail.cell.IOTCardRechargeArcherCell` |
| scene_and_automation | 1 | `com.thingclips.smart.device_detail.cell.SceneAutomationArcherCell` |
| device_evaluation | 1 | `com.thingclips.smart.device_detail.cell.DeviceEvaluationArcherCell` |
| recommend_products | 1 | `com.thingclips.smart.device_detail.cell.RecommendProductArcherCell` |
| recommend_product_empty | 2 | `com.thingclips.smart.device_detail.cell.RecommendProductEmptyArcherCell` |
| third-party_control | 1 | `com.thingclips.smart.device_detail.cell.ThirdPartControlArcherCell` |
| section_third-party_control | 2 | `com.thingclips.smart.device_detail.cell.ThirdPartControlHeaderCell` |
| off_line_warn | 1 | `com.thingclips.smart.device_detail.cell.OffLineWarnArcherCell` |
| section_off_line_warn | 2 | `com.thingclips.smart.device_detail.cell.OffLineWarnHeaderCell` |
| bind_multi_control_link | 1 | `com.thingclips.smart.device_detail.cell.MultiControlArcherCell` |
| group_create | 1 | `com.thingclips.smart.device_detail.cell.GroupCreateArcherCell` |
| help_and_feedback | 1 | `com.thingclips.smart.device_detail.cell.HelpAndFeedbackArcherCell` |
| add_icon_to_home_screen | 1 | `com.thingclips.smart.device_detail.cell.AddIconToHomeScreenArcherCell` |
| show_infrared_gateway_sub_device | 1 | `com.thingclips.smart.device_detail.cell.InfraredSubDeviceArcherCell` |
| check_device_network | 1 | `com.thingclips.smart.device_detail.cell.CheckDeviceNetworkArcherCell` |
| check_firmware_update | 1 | `com.thingclips.smart.device_detail.cell.OtaCheckArcherCell` |
| matter_bridge_service | 1 | `com.thingclips.smart.device_detail.cell.MatterBridgeServiceCell` |
| matter_service | 1 | `com.thingclips.smart.device_detail.cell.MatterServiceCell` |
| product_instruction | 1 | `com.thingclips.smart.device_detail.cell.ProductInstructionArcherCell` |
| footer | 1 | `com.thingclips.smart.device_detail.cell.FooterArcherCell` |
| section_other | 2 | `com.thingclips.smart.device_detail.cell.SectionOtherCell` |
| device_detail_empty | 2 | `com.thingclips.smart.device_detail.cell.EmptyArcherCell` |
| sync_control | 1 | `com.thingclips.smart.device_detail.cell.SyncControlArcherCell` |
| link_device | 1 | `com.thingclips.smart.device_detail.cell.LinkDeviceArcherCell` |
| accessory_manage | 1 | `com.thingclips.smart.device_detail.cell.AccessoriesManagerArcherCell` |
| connect_cloud_activation | 1 | `com.thingclips.smart.device_detail.cell.ConnectCloudActivationArcherCell` |
| location_manage | 1 | `com.thingclips.smart.device_detail.cell.LocationManageArcherCell` |
| sub_device_migrate | 1 | `com.thingclips.smart.device_detail.cell.SubDeviceMigrateArcherCell` |
| panel_share_group_or_device | 1 | `com.thingclips.smart.device_detail.cell.SharedArcherCell` |
| device_from | 1 | `com.thingclips.smart.device_detail.cell.DeviceFromArcherCell` |
| dev_icon | 1 | `com.thingclips.device.base.info.cell.DeviceIconCell` |
| set_icon | 1 | `com.thingclips.device.base.info.cell.DevEditIconCell` |
| set_name | 1 | `com.thingclips.device.base.info.cell.DevEditNameCell` |
| set_position | 1 | `com.thingclips.device.base.info.cell.DevEditPositionCell` |

> type=1 表示普通 item cell，type=2 表示 section header cell。

---

## 3. 打开设备详情页

通过 `UrlBuilder` + `UrlRouter` 跳转：

```kotlin
import com.thingclips.smart.utils.UrlBuilder
import com.thingclips.smart.api.router.UrlRouter

val urlBuilder = UrlBuilder(context, "panelMore")
val bundle = Bundle().apply {
    putString("extra_panel_dev_id", deviceId)
    putString("extra_panel_name", deviceName)
    putLong("extra_panel_group_id", groupId)  // 非群组设备传 0L
}
urlBuilder.putExtras(bundle)
UrlRouter.execute(urlBuilder)
```

**参数说明：**
- `extra_panel_dev_id` — 设备 ID（必填）
- `extra_panel_name` — 设备名称（用于标题显示）
- `extra_panel_group_id` — 群组 ID（非群组设备传 `0L`）

---

## 4. 三方语音控制配置

在 `res/values/compat-colors.xml` 中配置 appId（需通过涂鸦工单申请）：

```xml
<resources>
    <integer name="appId">你的appId</integer>
</resources>
```

> 不配置时三方语音控制功能不会显示，不影响其他功能。

---

## 5. 自定义 Cell 扩展

### 5.1 命名规则

自定义 cell 的 `type` 值**必须以 `c_` 开头**，例如 `c_my_custom_cell`。

### 5.2 实现方式

**方式一：实现 `IArcherCell` 接口**（推荐，`show()` 自动调用）

```kotlin
class CMyCustomCell : IArcherCell {
    override fun onCreate(context: Context?) {
        // 初始化
    }

    override suspend fun show(): Boolean {
        // 返回 true 表示显示此 cell
        return true
    }

    override fun onCreateView(parent: ViewGroup): View? {
        // 创建视图
        return LayoutInflater.from(parent.context)
            .inflate(R.layout.my_custom_cell, parent, false)
    }

    override fun onBindView(view: View): ITYBaseData? {
        // 绑定数据和事件
        return null
    }
}
```

**方式二：继承 `AbsBaseArcherCell`**（需手动触发更新）

```kotlin
class CMyCustomCell : AbsBaseArcherCell() {
    override fun onCreate(context: Context?) {
        super.onCreate(context)
    }

    override suspend fun show(): Boolean {
        return true
    }

    override fun onCreateView(parent: ViewGroup): View? {
        return LayoutInflater.from(parent.context)
            .inflate(R.layout.my_custom_cell, parent, false)
    }

    override fun onBindView(view: View): ITYBaseData? {
        // 注意：继承 AbsBaseArcherCell 时需手动调用更新
        getContainerControl().updateCell(this)
        return null
    }
}
```

### 5.3 注册自定义 Cell

1. 在 `deviceDetail.json` 的对应 section 中添加 cellType：
   ```json
   { "cellType": "c_my_custom_cell" }
   ```

2. 在 `thingarchercell_config.json` 的 `archerCell` 数组中注册：
   ```json
   {
     "name": "c_my_custom_cell",
     "type": 1,
     "clazz": "com.your.package.CMyCustomCell"
   }
   ```

---

## 6. 红外子设备显示管理

```kotlin
import com.thingclips.smart.api.MicroServiceManager

val service = MicroServiceManager.getInstance()
    .findServiceByInterface(
        IPluginInfraredSubDevDisplayService::class.java.name
    ) as? IPluginInfraredSubDevDisplayService

// 查询红外子设备是否显示
val isShown = service?.getInfraredSubDevDisplaySettings(homeId, devId)

// 监听显示设置变更
service?.registerInfraredSubDevDisplaySettingsListener(
    object : OnInfraredSubDevDisplaySettingsListener {
        override fun onDisplaySettingsChanged(homeId: Long, gwId: String, shown: Boolean) {}
        override fun onDisplaySettingsRemoved(homeId: Long, gwId: String) {}
    }
)
```

---

## 7. 子功能接口参考

### 7.1 常见问题与反馈（feedback）

```kotlin
// 跳转帮助中心（需先查询业务域）
ThingHomeSdk.getUserInstance().queryAllBizDomains(object : IQurryDomainCallback {
    override fun onSuccess(domain: String) {
        UrlRouter.execute(UrlRouter.makeBuilder(activity, "helpCenter"))
    }
    override fun onError(code: String, error: String) {}
})

// 设备解绑工单（强绑定设备重置失败时使用）
val feedbackService = MicroContext.getServiceManager()
    .findServiceByInterface(FeedbackService::class.java.name) as? FeedbackService
feedbackService?.ApplyToUnbindDevice(context, devId, uuid, devName)
```

### 7.2 设备固件 OTA

```kotlin
val otaService = MicroContext.getServiceManager()
    .findServiceByInterface(AbsOtaCallerService::class.java.name) as? AbsOtaCallerService

// 判断设备是否支持 OTA
if (otaService?.isSupportUpgrade(devId) == true) {
    // 跳转固件升级页面
    otaService.goFirmwareUpgrade(context, devId)
}

// 自定义强制升级退出行为
otaService?.setOtaBehaviorListener(object : IOtaBehaviorListener {
    override fun onBackPressedWhenForceUpgrading(activity: Activity) {
        activity.finish()
    }
})
```

### 7.3 群组管理

```kotlin
import com.thingclips.smart.group.ThingGroupManager

// 创建群组
val createState = ThingGroupManager.getInstance().createGroup(activity, devId)
// 返回 GroupState: SUPPORT / NOT_SUPPORT / NONE

// 编辑群组
val editState = ThingGroupManager.getInstance().editGroup(activity, groupId)
// 返回 GroupState: SUPPORT / NONE
```

### 7.4 多控关联

```kotlin
val controlService = MicroServiceManager.getInstance()
    .findServiceByInterface(IPluginControlService::class.java.name) as? IPluginControlService

// 判断设备是否支持多控
val isSupported = controlService?.isDeviceSupportMultiControl(devId)

// 进入多控管理页面
controlService?.gotoMultiControl(activity, devId)
```

### 7.5 一键执行与自动化

需额外资源配置：

```xml
<!-- res/values/values.xml -->
<bool name="is_scene_support">true</bool>
```

```kotlin
// 查询场景服务
val sceneService = MicroContext.findServiceByInterface(
    IThingSceneBusinessService::class.java.name
) as? IThingSceneBusinessService

// 新增手动场景
sceneService?.addSceneBean(...)

// 新增自动化场景
sceneService?.addBizSceneBean(...)

// 编辑场景
sceneService?.editSceneBean(...)

// 登录后启用多终端同步
SceneHomePipeLine().run()
```

> 一键执行与自动化功能还需引入 `thingsmart-bizbundle-miniapp` 和 `thingsmart-bizbundle-basekit`（6.7.0+ 版本），并配置 Hilt 依赖（2.43.2+）。

---

## 8. 小程序版本（可选）

若需使用小程序版本的设备详情：

```xml
<!-- res/values/values.xml -->
<bool name="device_detail_mini_program">true</bool>
```

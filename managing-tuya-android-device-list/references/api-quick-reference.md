# Device List Management — API Quick Reference

## Source

- Device Foundation: `building-tuya-android-device-foundation/references/device-management.md`
- Current Home: `managing-tuya-android-current-home/references/api-quick-reference.md`

## Read This When

- 需要查看设备列表模块涉及的 SDK API 签名
- 需要确认家庭状态监听器的回调方法和参数

---

## 核心 API

### 拉取家庭完整快照（含设备列表）

```kotlin
ThingHomeSdk.newHomeInstance(homeId).getHomeDetail(
    object : IThingHomeResultCallback {
        override fun onSuccess(bean: HomeBean) {
            val devices: List<DeviceBean> = bean.deviceList
        }
        override fun onError(errorCode: String, errorMsg: String) {}
    }
)
```

### 移除家庭设备

```kotlin
ThingHomeSdk.newDeviceInstance(devId).removeDevice(
    object : IResultCallback {
        override fun onSuccess() {}
        override fun onError(code: String, error: String) {}
    }
)
```

### 取消接收共享设备

```kotlin
ThingHomeSdk.getDeviceShareInstance().removeReceivedDevShare(
    devId,
    object : IResultCallback {
        override fun onSuccess() {}
        override fun onError(code: String, error: String) {}
    }
)
```

### 修改设备名称

```kotlin
ThingHomeSdk.newDeviceInstance(devId).renameDevice(
    newName,
    object : IResultCallback {
        override fun onSuccess() {}
        override fun onError(code: String, error: String) {}
    }
)
```

### 提交设备排序

```kotlin
// orderList: List<DeviceAndGroupInHomeBean>，按新顺序排列
ThingHomeSdk.newHomeInstance(homeId).sortDevInHome(
    orderList,
    object : IResultCallback {
        override fun onSuccess() {}
        override fun onError(code: String, error: String) {}
    }
)
```

---

## IThingHomeStatusListener（家庭设备列表变化）

注册 / 注销：

```kotlin
ThingHomeSdk.newHomeInstance(homeId).registerHomeStatusListener(listener)
ThingHomeSdk.newHomeInstance(homeId).unRegisterHomeStatusListener(listener)
```

回调方法（**5 个抽象方法，缺一不可**）：

| 方法 | 参数 | 触发场景 |
|---|---|---|
| `onDeviceAdded(devId: String)` | devId | 新设备加入家庭 |
| `onDeviceRemoved(devId: String)` | devId | 设备从家庭移除 |
| `onGroupAdded(groupId: Long)` | groupId | 新群组加入家庭 |
| `onGroupRemoved(groupId: Long)` | groupId | 群组从家庭移除 |
| `onMeshAdded(meshId: String)` | meshId | Mesh 设备加入家庭 |

> **注意**：`onMeshAdded` 是第 5 个抽象方法，遗漏会导致编译报错。

---

## DeviceBean 关键字段

| 字段 | 类型 | 说明 |
|---|---|---|
| devId | String | 设备唯一 ID |
| name | String | 设备名称 |
| isOnline | Boolean? | 在线状态（可空，判断须用 `getIsOnline() == true`） |
| isShare | Boolean | 是否为共享设备 |
| productId | String | 产品 ID |
| iconUrl | String | 设备图标 URL |

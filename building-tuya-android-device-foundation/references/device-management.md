# 设备管理 API 参考

> 来源：[涂鸦设备管理文档](https://developer.tuya.com/cn/docs/app-development/devicemanage.md?id=Ka6ki8r2rfiuu)

## 初始化家庭数据（获取设备列表）

通过家庭详情获取该家庭下的所有设备：

```java
ThingHomeSdk.newHomeInstance(homeId).getHomeDetail(new IThingHomeResultCallback() {
    @Override
    public void onSuccess(HomeBean homeBean) {
        List<DeviceBean> deviceList = homeBean.getDeviceList();
    }
    @Override
    public void onError(String errorCode, String errorMsg) { }
});
```

## 初始化设备控制类

```java
IThingDevice mDevice = ThingHomeSdk.newDeviceInstance(String devId);
```

> 每个 devId 应创建独立的 IThingDevice 实例。用完必须调用 `mDevice.onDestroy()` 释放资源。

## DeviceBean 关键属性

| 属性 | 类型 | 说明 |
|---|---|---|
| devId | String | 设备唯一标识 |
| name | String | 设备名称 |
| iconUrl | String | 设备图标 URL |
| productId | String | 产品 ID |
| dps | Map<String, Object> | 当前功能点数据 |
| getIsOnline() | boolean | 设备是否在线（云端） |
| isLocalOnline | boolean | 设备是否局域网在线 |
| schema | String | 功能点 schema（JSON） |
| schemaMap | Map | 功能点 schema 映射 |
| mac | String | MAC 地址 |
| ip | String | IP 地址 |
| timezoneId | String | 时区 |
| pv | String | 协议版本 |
| bv | String | 基线版本 |
| time | long | 激活时间戳 |
| isShare | boolean | 是否为共享设备 |
| virtual | boolean | 是否为虚拟设备 |
| supportGroup | boolean | 是否支持群组 |
| isZigBeeWifi | boolean | 是否为 ZigBee 网关 |
| hasZigBee | boolean | 是否有 ZigBee 能力 |
| nodeId | String | ZigBee 节点 ID |
| meshId | String | Mesh ID |
| lon / lat | String | 经纬度 |

## 设备监听

### 注册监听

```java
mDevice.registerDevListener(new IDevListener() {
    /**
     * 功能点数据更新
     * @param devId 设备 ID
     * @param dpStr 变化的功能点 JSON 字符串，如 {"1": true, "2": 25}
     */
    @Override
    public void onDpUpdate(String devId, String dpStr) { }

    /**
     * 设备被移除
     * @param devId 设备 ID
     */
    @Override
    public void onRemoved(String devId) { }

    /**
     * 设备上下线状态变化
     * @param devId 设备 ID
     * @param online true=在线, false=离线
     */
    @Override
    public void onStatusChanged(String devId, boolean online) { }

    /**
     * 网络状态变化
     * @param devId 设备 ID
     * @param status 网络状态
     */
    @Override
    public void onNetworkStatusChanged(String devId, boolean status) { }

    /**
     * 设备信息更新（如名称修改）
     * @param devId 设备 ID
     */
    @Override
    public void onDevInfoUpdate(String devId) { }
});
```

### 取消监听

```java
mDevice.unRegisterDevListener();
```

## 设备操作

### 查询单个 DP 数据

```java
mDevice.getDp(String dpId, new IResultCallback() {
    @Override
    public void onError(String code, String error) { }
    @Override
    public void onSuccess() { }
});
```

### 修改设备名称

```java
mDevice.renameDevice(String name, new IResultCallback() {
    @Override
    public void onError(String code, String error) { }
    @Override
    public void onSuccess() { }
});
```

> 成功后需手动更新本地 DeviceBean 缓存中的 name 字段。

### 移除设备

```java
mDevice.removeDevice(new IResultCallback() {
    @Override
    public void onError(String code, String error) { }
    @Override
    public void onSuccess() { }
});
```

> ⚠️ 不可撤销操作。设备会解除与当前家庭的绑定关系。

### 恢复出厂设置

```java
mDevice.resetFactory(new IResultCallback() {
    @Override
    public void onError(String code, String error) { }
    @Override
    public void onSuccess() { }
});
```

> ⚠️ 不可撤销操作。设备将清除所有数据并恢复出厂状态。

### 查询 Wi-Fi 信号强度

```java
mDevice.requestWifiSignal(new WifiSignalListener() {
    @Override
    public void onSignalValueFind(String signal) { }
    @Override
    public void onError(String errorCode, String errorMsg) { }
});
```

> 仅 Wi-Fi 设备支持此功能。

### 低功耗设备唤醒

```java
ThingOSDevice.getDeviceOperator().lowPowerDeviceAwake(
    String devId, 
    long timeout,  // 超时时间（毫秒）
    new IThingResultCallback<LowPowerAwakeRsp>() {
        @Override
        public void onSuccess(LowPowerAwakeRsp result) { }
        @Override
        public void onError(String errorCode, String errorMsg) { }
    }
);
```

### 回收设备资源

```java
mDevice.onDestroy();
```

> 在 ViewModel.onCleared() 或 Activity.onDestroy() 中必须调用，避免内存泄漏。

## 导出设备信息

```java
ThingHomeSdk.getUserInstance().exportUserDeviceListInfo(
    List<String> devList,  // 设备 ID 列表
    new IUserDeviceInfoCallback() {
        @Override
        public void onSuccess(String info) { }
        @Override
        public void onError(String errorCode, String errorMsg) { }
    }
);
```

**限制条件：**
- 单次导出设备数量不超过 10 个
- 每次导出之间间隔至少 1 分钟

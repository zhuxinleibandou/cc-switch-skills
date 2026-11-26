# Home Management

## Source

- https://developer.tuya.com/cn/docs/app-development/homemanage.md?id=Ka6kjkgere4ae
- https://developer.tuya.com/cn/docs/app-development/familyrelations.md?id=Ka6ki8h2c2yo5

## Read This When

- 需要创建/查询/修改/解散家庭
- 需要查询家庭天气信息
- 需要监听家庭增删改及设备/群组变化
- 需要排序家庭内设备和群组

## HomeBean 数据模型

| 属性 | 类型 | 说明 |
|---|---|---|
| homeId | Long | 家庭 ID |
| name | String | 家庭名称 |
| geoName | String | 家庭地理位置名称 |
| lon | Double | 经度 |
| lat | Double | 纬度 |
| admin | Boolean | 是否为管理员 |
| homeStatus | Integer | 邀请状态：1=等待接受，2=接受，3=拒绝 |
| role | Integer | 成员权限：-1=自定义，0=普通成员，1=管理员，2=拥有者，-999=无效 |
| rooms | List\<RoomBean\> | 所有房间列表 |
| deviceList | List\<DeviceBean\> | 所有设备列表 |
| groupList | List\<GroupBean\> | 所有群组 |
| sharedDeviceList | List\<DeviceBean\> | 收到的共享设备 |
| sharedGroupList | List\<GroupBean\> | 收到的共享群组 |

## APIs

### 创建家庭

```java
ThingHomeSdk.getHomeManagerInstance().createHome(
    String name,          // 家庭名称，最多 25 字符
    double lon,           // 经度，不设置位置传 0
    double lat,           // 纬度，不设置位置传 0
    String geoName,       // 地理位置名称
    List<String> rooms,   // 初始房间名称列表
    new IThingHomeResultCallback() {
        @Override
        public void onSuccess(HomeBean bean) { }
        @Override
        public void onError(String errorCode, String errorMsg) { }
    }
);
```

### 查询家庭列表

```java
ThingHomeSdk.getHomeManagerInstance().queryHomeList(new IThingGetHomeListCallback() {
    @Override
    public void onSuccess(List<HomeBean> homeBeans) { }
    @Override
    public void onError(String errorCode, String error) { }
});
```

### 查询家庭详细信息（含设备、群组、房间）

```java
// 重要：调用此方法后 ThingHomeSdk.getDataInstance() 才有缓存数据
ThingHomeSdk.newHomeInstance(homeId).getHomeDetail(new IThingHomeResultCallback() {
    @Override
    public void onSuccess(HomeBean bean) { }
    @Override
    public void onError(String errorCode, String errorMsg) { }
});
```

### 查询家庭离线缓存

```java
ThingHomeSdk.newHomeInstance(homeId).getHomeLocalCache(new IThingHomeResultCallback() {
    @Override
    public void onSuccess(HomeBean bean) { }
    @Override
    public void onError(String errorCode, String errorMsg) { }
});
```

### 修改家庭信息

```java
// 新版接口（推荐）：支持同时修改房间列表
ThingHomeSdk.newHomeInstance(homeId).updateHome(
    String name,
    double lon,
    double lat,
    String geoName,
    List<String> rooms,
    new IResultCallback() {
        @Override
        public void onSuccess() { }
        @Override
        public void onError(String code, String error) { }
    }
);

// 旧版接口：不含 rooms 参数
ThingHomeSdk.newHomeInstance(homeId).updateHome(name, lon, lat, geoName, callback);
```

### 解散家庭

```java
// 注意：此操作会重置家庭下所有设备，操作前须二次确认
ThingHomeSdk.newHomeInstance(homeId).dismissHome(new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 查询家庭天气（简要）

```java
ThingHomeSdk.newHomeInstance(homeId).getHomeWeatherSketch(lon, lat, new IIGetHomeWetherSketchCallBack() {
    @Override
    public void onSuccess(WeatherBean result) {
        // result.condition  天气情况（晴/阴/雨等）
        // result.temp       温度
        // result.iconUrl    天气图标
        // result.inIconUrl  详情图标
    }
    @Override
    public void onFailure(String errorCode, String errorMsg) { }
});
```

### 查询家庭天气（详细）

```java
Map<String, Object> units = new HashMap<>();
units.put("tempUnit", 1);       // 1=°C，2=°F
units.put("pressureUnit", 1);   // 1=hPa，2=inHg，3=mmHg，4=mb
units.put("windspeedUnit", 2);  // 1=mph，2=m/s，3=kph，4=km/h

ThingHomeSdk.newHomeInstance(homeId).getHomeWeatherDetail(10, units, new IGetHomeWetherCallBack() {
    @Override
    public void onSuccess(ArrayList<DashBoardBean> result) { }
    @Override
    public void onFailure(String errorCode, String errorMsg) { }
});
```

### 设置家庭内设备和群组顺序

```java
List<DeviceAndGroupInHomeBean> list = new ArrayList<>();
// 添加群组
for (GroupBean bean : groupList) {
    DeviceAndGroupInHomeBean item = new DeviceAndGroupInHomeBean();
    item.setBizId(bean.getDevId());
    item.setBizType(BizParentTypeEnum.GROUP.getType());
    list.add(item);
}
// 添加设备
for (DeviceBean bean : deviceList) {
    DeviceAndGroupInHomeBean item = new DeviceAndGroupInHomeBean();
    item.setBizId(bean.getDevId());
    item.setBizType(BizParentTypeEnum.DEVICE.getType());
    list.add(item);
}
ThingHomeSdk.newHomeInstance(homeId).sortDevInHome(homeId, list, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});

// 排序后，根据 displayOrder 字段重新排列本地列表
Collections.sort(allDeviceBeans, (o1, o2) -> o1.getHomeDisplayOrder() - o2.getHomeDisplayOrder());
```

`BizParentTypeEnum` 枚举：LOCATION、MESH、ROOM、GROUP、DEVICE

## Listeners

### IThingHomeChangeListener（全局家庭变化）

```java
IThingHomeChangeListener listener = new IThingHomeChangeListener() {
    @Override
    public void onHomeAdded(long homeId) { }         // 家庭新增（多设备同步）
    @Override
    public void onHomeInvite(long homeId, String homeName) { }  // 收到家庭邀请
    @Override
    public void onHomeRemoved(long homeId) { }       // 家庭删除（多设备同步）
    @Override
    public void onHomeInfoChanged(long homeId) { }   // 家庭信息变更
    @Override
    public void onSharedDeviceList(List<DeviceBean> sharedDeviceList) { }  // 共享设备列表变更
    @Override
    public void onSharedGroupList(List<GroupBean> sharedGroupList) { }
    @Override
    public void onServerConnectSuccess() { }         // 连接涂鸦云成功
};

// 注册
ThingHomeSdk.getHomeManagerInstance().registerThingHomeChangeListener(listener);
// 注销（在 ViewModel.onCleared() 中调用）
ThingHomeSdk.getHomeManagerInstance().unRegisterThingHomeChangeListener(listener);
```

### IThingHomeStatusListener（家庭内设备/群组变化）

```java
IThingHomeStatusListener statusListener = new IThingHomeStatusListener() {
    @Override
    public void onDeviceAdded(String devId) { }
    @Override
    public void onDeviceRemoved(String devId) { }
    @Override
    public void onGroupAdded(long groupId) { }
    @Override
    public void onGroupRemoved(long groupId) { }
    @Override
    public void onMeshAdded(String meshId) { }
};

// 注册
ThingHomeSdk.newHomeInstance(homeId).registerHomeStatusListener(statusListener);
// 注销（在 ViewModel.onCleared() 中调用）
ThingHomeSdk.newHomeInstance(homeId).unRegisterHomeStatusListener(statusListener);
```

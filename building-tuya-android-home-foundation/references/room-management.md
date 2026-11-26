# Room Management

## Source

- https://developer.tuya.com/cn/docs/app-development/room-information-management.md?id=Kaiy7xla9is7e

## Read This When

- 需要新增/删除/重命名房间
- 需要对房间进行排序
- 需要将设备或群组分配到/移出房间
- 需要批量修改房间与设备/群组的关系
- 需要自定义房间背景图

## RoomBean 数据模型

| 字段 | 类型 | 说明 |
|---|---|---|
| roomId | long | 房间 ID |
| name | String | 房间名称 |
| iconUrl | String | 房间背景图 URL（SDK 3.19+） |

## APIs

### 新增房间

```java
ThingHomeSdk.newHomeInstance(homeId).addRoom("房间名称", new IThingRoomResultCallback() {
    @Override
    public void onSuccess(RoomBean bean) { }
    @Override
    public void onError(String errorCode, String errorMsg) { }
});
```

### 删除房间

```java
ThingHomeSdk.newHomeInstance(homeId).removeRoom(roomId, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 房间排序

```java
// idList 为按期望顺序排列的 roomId 列表
ThingHomeSdk.newHomeInstance(homeId).sortRoom(idList, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 修改房间名称

```java
ThingHomeSdk.newRoomInstance(roomId).updateRoom("新房间名称", new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 自定义房间背景图（SDK 3.19+）

```java
// 查询当前背景图
RoomBean roomBean = homeBean.rooms.get(index);
String currentIconUrl = roomBean.iconUrl;

// 更新背景图
ThingHomeSdk.newRoomInstance(roomId).updateIcon(file, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 根据设备查询所在房间

```java
// 需要先调用 getHomeDetail() 使缓存生效
RoomBean roomBean = ThingHomeSdk.getDataInstance().getDeviceRoomBean("设备ID");
```

### 添加设备到房间

```java
ThingHomeSdk.newRoomInstance(roomId).addDevice(devId, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 从房间移除设备

```java
ThingHomeSdk.newRoomInstance(roomId).removeDevice(devId, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 添加群组到房间

```java
ThingHomeSdk.newRoomInstance(roomId).addGroup(groupId, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 从房间移除群组

```java
ThingHomeSdk.newRoomInstance(roomId).removeGroup(groupId, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 批量修改房间与设备/群组关系（同时支持房间内排序）

推荐调用顺序：
1. 构建 `DeviceAndGroupInRoomBean` 集合（包含期望在此房间的所有设备和群组）
2. 调用 `getHomeDetail` 获取完整 `HomeBean`
3. 根据 `DeviceBean.displayOrder` 对本地列表排序

```java
List<DeviceAndGroupInRoomBean> list = new ArrayList<>();

// 添加设备
DeviceAndGroupInRoomBean deviceItem = new DeviceAndGroupInRoomBean();
deviceItem.setId(devId);
deviceItem.setType(6);  // 6=设备
list.add(deviceItem);

// 添加群组
DeviceAndGroupInRoomBean groupItem = new DeviceAndGroupInRoomBean();
groupItem.setId(String.valueOf(groupId));
groupItem.setType(5);   // 5=群组
list.add(groupItem);

ThingHomeSdk.newRoomInstance(roomId).moveDevGroupListFromRoom(list, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

`DeviceAndGroupInRoomBean` 字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String | 设备或群组 ID |
| type | int | 6=设备，5=群组 |

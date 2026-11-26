# Room Management

## Source

- <https://developer.tuya.com/cn/docs/app-development/iOS-room?id=Kaixll0l9ue4t>

## Read This When

- 需要新增/删除/重命名房间
- 需要对房间进行排序
- 需要将设备或群组分配到/移出房间
- 需要批量修改房间与设备/群组的关系
- 需要自定义房间背景图

## ThingSmartRoomModel 数据模型

| 字段 | 类型 | 说明 |
|---|---|---|
| roomId | long long | 房间 ID |
| name | NSString | 房间名称 |
| iconUrl | NSString | 房间背景图 URL |
| displayOrder | NSInteger | 排序字段，批量操作后据此重排本地列表 |

## 实例获取

```objc
// 家庭级别操作（新增/删除/排序房间）通过 ThingSmartHome 实例
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];

// 房间级别操作（改名/设备分配等）通过 ThingSmartRoom 实例
ThingSmartRoom *room = [ThingSmartRoom roomWithRoomId:roomId homeId:homeId];
```

## APIs

### 新增房间

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home addHomeRoomWithName:@"书房"
                 success:^{
    NSLog(@"add room success");
} failure:^(NSError *error) {
    NSLog(@"add room error: %@", error);
}];
```

### 删除房间

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home removeHomeRoomWithRoomId:roomId
                       success:^{
    NSLog(@"remove room success");
} failure:^(NSError *error) {
    NSLog(@"remove room error: %@", error);
}];
```

### 房间排序

```objc
// roomList 为按期望顺序排列的 ThingSmartRoomModel 数组
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home sortRoomList:roomList
           success:^{
    NSLog(@"sort room success");
} failure:^(NSError *error) {
    NSLog(@"sort room error: %@", error);
}];
```

### 修改房间名称

```objc
ThingSmartRoom *room = [ThingSmartRoom roomWithRoomId:roomId homeId:homeId];
[room updateRoomName:@"新房间名称"
             success:^{
    NSLog(@"update room name success");
} failure:^(NSError *error) {
    NSLog(@"update room name error: %@", error);
}];
```

### 自定义房间背景图

```objc
ThingSmartRoom *room = [ThingSmartRoom roomWithRoomId:roomId homeId:homeId];
[room updateIcon:image
         success:^{
    NSLog(@"update icon success");
} failure:^(NSError *error) {
    NSLog(@"update icon error: %@", error);
}];
```

### 添加设备到房间

```objc
ThingSmartRoom *room = [ThingSmartRoom roomWithRoomId:roomId homeId:homeId];
[room addDeviceWithDeviceId:deviceId
                   success:^{
    NSLog(@"add device success");
} failure:^(NSError *error) {
    NSLog(@"add device error: %@", error);
}];
```

### 从房间移除设备

```objc
ThingSmartRoom *room = [ThingSmartRoom roomWithRoomId:roomId homeId:homeId];
[room removeDeviceWithDeviceId:deviceId
                       success:^{
    NSLog(@"remove device success");
} failure:^(NSError *error) {
    NSLog(@"remove device error: %@", error);
}];
```

### 添加群组到房间

```objc
ThingSmartRoom *room = [ThingSmartRoom roomWithRoomId:roomId homeId:homeId];
[room addGroupWithGroupId:groupId
                 success:^{
    NSLog(@"add group success");
} failure:^(NSError *error) {
    NSLog(@"add group error: %@", error);
}];
```

### 从房间移除群组

```objc
ThingSmartRoom *room = [ThingSmartRoom roomWithRoomId:roomId homeId:homeId];
[room removeGroupWithGroupId:groupId
                     success:^{
    NSLog(@"remove group success");
} failure:^(NSError *error) {
    NSLog(@"remove group error: %@", error);
}];
```

### 批量修改房间与设备/群组关系

```objc
// deviceGroupList 包含此房间内所有设备和群组的 ID（NSString 数组）
NSArray<NSString *> *deviceGroupList = @[deviceId1, deviceId2, groupId1];

ThingSmartRoom *room = [ThingSmartRoom roomWithRoomId:roomId homeId:homeId];
[room saveBatchRoomRelationWithDeviceGroupList:deviceGroupList
                                       success:^{
    NSLog(@"batch save success");
} failure:^(NSError *error) {
    NSLog(@"batch save error: %@", error);
}];

// 操作成功后，根据 ThingSmartRoomModel.displayOrder 重新排列本地列表
```

## Pitfalls

- `sortRoomList:` 和 `sortDeviceOrGroupWithOrderList:` 是两个独立接口，前者排序房间，后者排序家庭内设备/群组，不要混用。
- `saveBatchRoomRelationWithDeviceGroupList:` 传入的是该房间**最终希望包含**的全量 ID，不是增量。

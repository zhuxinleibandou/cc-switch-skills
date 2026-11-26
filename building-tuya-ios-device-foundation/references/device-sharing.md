# 设备共享 API 参考

## Source

- <https://developer.tuya.com/cn/docs/app-development/share?id=Ka5cgmmpzv1hg>

## 概述

设备共享允许用户将自己家庭中的设备分享给其他涂鸦账号用户使用。每个设备最多可共享给 20 个用户。

**核心类：** `ThingSmartHomeDeviceShare`

```objc
ThingSmartHomeDeviceShare *shareManager = [ThingSmartHomeDeviceShare new];
```

---

## ThingSmartDeviceShareRequestModel

添加共享时的请求模型：

| 字段 | 类型 | 说明 |
|---|---|---|
| homeID | long long | 家庭 ID |
| countryCode | NSString | 国家码，如 `@"86"` |
| userAccount | NSString | 对方账号（手机号或邮箱） |
| devIds | NSArray\<NSString \*\> | 要共享的设备 ID 列表 |

---

## 添加共享

```objc
ThingSmartDeviceShareRequestModel *requestModel = [ThingSmartDeviceShareRequestModel new];
requestModel.homeID = homeId;
requestModel.countryCode = @"86";
requestModel.userAccount = @"user@example.com";
requestModel.devIds = @[devId1, devId2];

ThingSmartHomeDeviceShare *shareManager = [ThingSmartHomeDeviceShare new];
[shareManager addDeviceShareWithRequestModel:requestModel
                                     success:^(ThingSmartShareMemberModel *model) {
    NSLog(@"add share success, memberId: %lld", model.memberId);
} failure:^(NSError *error) {
    NSLog(@"add share error: %@", error);
}];
```

---

## 查询共享

### 查询主动分享给了哪些用户

```objc
[shareManager getShareMemberListWithSpaceId:homeId
                                    success:^(NSArray<ThingSmartShareMemberModel *> *list) {
    for (ThingSmartShareMemberModel *member in list) {
        NSLog(@"memberId: %lld, name: %@", member.memberId, member.nickName);
    }
} failure:^(NSError *error) { }];
```

### 查询收到的共享（收件箱）

```objc
[shareManager getReceiveMemberListWithSuccess:^(NSArray<ThingSmartShareMemberModel *> *list) {
    // 所有向当前用户共享设备的用户列表
} failure:^(NSError *error) { }];
```

### 查询某设备共享给了哪些用户

```objc
[shareManager getDeviceShareMemberListWithDevId:devId
                                        success:^(NSArray<ThingSmartShareMemberModel *> *list) {
} failure:^(NSError *error) { }];
```

### 查询某设备的共享来源

```objc
[shareManager getShareInfoWithDevId:devId
                            success:^(ThingSmartShareMemberModel *model) {
    NSLog(@"shared from: %@", model.nickName);
} failure:^(NSError *error) { }];
```

### 查询某共享成员的详情

```objc
[shareManager getShareMemberDetailWithMemberId:memberId
                                       success:^(ThingSmartShareMemberDetailModel *detail) {
} failure:^(NSError *error) { }];
```

---

## 移除共享

### 接收方移除收到的设备共享

```objc
[shareManager removeReceiveDeviceShareWithDevId:devId
                                        success:^{
    NSLog(@"remove received share success");
} failure:^(NSError *error) { }];
```

### 分享方移除对某用户的指定设备共享

```objc
[shareManager removeDeviceShareWithMemberId:memberId
                                      devId:devId
                                    success:^{
    NSLog(@"remove share success");
} failure:^(NSError *error) { }];
```

### 分享方移除某用户的全部共享

```objc
[shareManager removeShareMemberWithMemberId:memberId
                                    success:^{
} failure:^(NSError *error) { }];
```

### 接收方移除某用户分享给自己的全部共享

```objc
[shareManager removeReceiveShareMemberWithMemberId:memberId
                                           success:^{
} failure:^(NSError *error) { }];
```

---

## 备注名管理

### 修改主动共享用户的备注名

```objc
[shareManager renameShareMemberNameWithMemberId:memberId
                                           name:@"新备注名"
                                        success:^{
} failure:^(NSError *error) { }];
```

### 修改收到共享用户的备注名

```objc
[shareManager renameReceiveShareMemberNameWithMemberId:memberId
                                                  name:@"新备注名"
                                               success:^{
} failure:^(NSError *error) { }];
```

---

## 邀请机制

### 发送共享邀请

```objc
[shareManager inviteShareWithCountryCode:@"86"
                             userAccount:@"user@example.com"
                                   devId:devId
                                 success:^(NSInteger shareId) {
    NSLog(@"invite sent, shareId: %ld", (long)shareId);
} failure:^(NSError *error) { }];
```

### 接受共享邀请

```objc
[shareManager confirmInviteShareWithShareId:shareId
                                    success:^{
    NSLog(@"invite confirmed");
} failure:^(NSError *error) { }];
```

---

## Pitfalls

- **共享上限 20 人**：每个设备最多共享给 20 个用户，超出限制 API 报错，需提前校验。
- **`addDeviceShareWithRequestModel:` 的覆盖行为**：向同一用户重复添加共享时，行为取决于 API 实现，建议先查询再操作。
- **接收方和分享方操作不同**：移除共享时区分发起方（`removeDeviceShareWithMemberId:devId:`）和接收方（`removeReceiveDeviceShareWithDevId:`），不要混用。

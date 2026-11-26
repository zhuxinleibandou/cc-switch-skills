# Member Management

## Source

- <https://developer.tuya.com/cn/docs/app-development/iOS-family-member?id=Kaixlyjh6uer8>

## Read This When

- 需要邀请/删除家庭成员
- 需要查询家庭成员列表
- 需要修改成员角色或昵称
- 需要通过邀请码加入家庭
- 需要处理邀请接受/拒绝流程
- 需要查询或撤销邀请记录

## 权限层级（ThingHomeRoleType）

| 角色 | 说明 | 可操作范围 |
|---|---|---|
| Owner（拥有者） | role 最高 | 可添加/删除管理员及以下 |
| Admin（管理员） | | 可添加/删除普通成员及以下 |
| Member（普通成员）| | 无管理权限 |

## ThingSmartHomeMemberModel 数据模型

| 字段 | 类型 | 说明 |
|---|---|---|
| memberId | long long | 成员 ID |
| name | NSString | 成员昵称 |
| role | ThingHomeRoleType | 成员角色 |
| headPic | NSString | 头像 URL |
| account | NSString | 账号 |

## ThingSmartHomeAddMemberRequestModel 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| name | NSString | 为受邀者设置的昵称 |
| account | NSString | 受邀账号（手机号或邮箱） |
| countryCode | NSString | 账号对应的国家/地区码 |
| role | ThingHomeRoleType | 成员角色 |
| headPic | NSString | 头像（nil 时使用受邀者个人头像） |
| autoAccept | BOOL | YES=自动接受；NO=需受邀者确认 |

## APIs

### 添加家庭成员

```objc
ThingSmartHomeAddMemberRequestModel *requestModel = [ThingSmartHomeAddMemberRequestModel new];
requestModel.name = @"昵称";
requestModel.account = @"user@example.com";
requestModel.countryCode = @"86";
requestModel.role = ThingHomeRoleTypeMember;  // 普通成员
requestModel.autoAccept = NO;  // 需受邀者确认

ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home addHomeMemberWithAddMemeberRequestModel:requestModel
                                      success:^(NSDictionary *result) {
    NSLog(@"add member success");
} failure:^(NSError *error) {
    NSLog(@"add member error: %@", error);
}];
```

### 删除家庭成员（或离开家庭）

```objc
// memberId 传自身时：
//   - 普通成员/管理员：离开家庭（家庭不解散，设备不重置）
//   - 拥有者：等同解散家庭（所有设备被重置），操作前须二次确认
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home removeHomeMemberWithMemberId:memberId
                           success:^{
    NSLog(@"remove member success");
} failure:^(NSError *error) {
    NSLog(@"remove member error: %@", error);
}];
```

### 查询家庭成员列表

```objc
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home getHomeMemberListWithSuccess:^(NSArray<ThingSmartHomeMemberModel *> *memberList) {
    for (ThingSmartHomeMemberModel *member in memberList) {
        NSLog(@"memberId: %lld, name: %@, role: %ld",
              member.memberId, member.name, (long)member.role);
    }
} failure:^(NSError *error) {
    NSLog(@"get member list error: %@", error);
}];
```

### 更新成员信息

```objc
ThingSmartHomeMemberRequestModel *memberRequestModel = [ThingSmartHomeMemberRequestModel new];
memberRequestModel.memberId = memberId;
memberRequestModel.name = @"新昵称";
memberRequestModel.role = ThingHomeRoleTypeAdmin;  // 升级为管理员

ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home updateHomeMemberInfoWithMemberRequestModel:memberRequestModel
                                         success:^{
    NSLog(@"update member success");
} failure:^(NSError *error) {
    NSLog(@"update member error: %@", error);
}];
```

### 创建邀请码

```objc
ThingSmartHomeInvitationCreateRequestModel *createModel =
    [ThingSmartHomeInvitationCreateRequestModel new];
createModel.homeID = homeId;
createModel.needMsgContent = YES;  // 是否需要邀请消息内容

ThingSmartHomeInvitation *invitation = [ThingSmartHomeInvitation new];
[invitation createInvitationWithCreateRequestModel:createModel
                                           success:^(ThingSmartHomeInvitationResultModel *result) {
    NSLog(@"invitation code: %@", result.invitationCode);
} failure:^(NSError *error) {
    NSLog(@"create invitation error: %@", error);
}];
```

### 通过邀请码加入家庭

```objc
ThingSmartHomeManager *manager = [ThingSmartHomeManager new];
[manager joinHomeWithInvitationCode:@"邀请码"
                            success:^{
    NSLog(@"join home success");
} failure:^(NSError *error) {
    NSLog(@"join home error: %@", error);
}];
```

### 接受或拒绝邀请

```objc
// 仅当 addHomeMember 时 autoAccept=NO 才需要调用此方法
ThingSmartHome *home = [ThingSmartHome homeWithHomeId:homeId];
[home joinFamilyWithAccept:YES  // YES=接受，NO=拒绝
                  success:^(BOOL result) {
    NSLog(@"join family success");
} failure:^(NSError *error) {
    NSLog(@"join family error: %@", error);
}];
```

### 撤销邀请

```objc
ThingSmartHomeInvitation *invitation = [ThingSmartHomeInvitation new];
[invitation cancelInvitationWithInvitationID:@(invitationID)
                                     success:^(BOOL result) {
    NSLog(@"cancel invitation success");
} failure:^(NSError *error) {
    NSLog(@"cancel invitation error: %@", error);
}];
```

### 查询邀请记录列表

```objc
ThingSmartHomeInvitation *invitation = [ThingSmartHomeInvitation new];
[invitation fetchInvitationRecordListWithHomeID:homeId
                                        success:^(NSArray<ThingSmartHomeInvitationRecordModel *> *list) {
    for (ThingSmartHomeInvitationRecordModel *record in list) {
        NSLog(@"invitationCode: %@", record.invitationCode);
    }
} failure:^(NSError *error) {
    NSLog(@"fetch invitation list error: %@", error);
}];
```

## Pitfalls

- `autoAccept=NO` 发出的邀请，受邀者必须通过 `joinFamilyWithAccept:success:failure:` 确认，否则不会真正加入家庭。
- 拥有者调用 `removeHomeMemberWithMemberId:` 传自身 memberId 等同解散家庭，所有设备会被重置，操作前须二次确认。
- 角色权限有层级，添加/删除成员时需校验当前用户角色是否有权限操作目标角色。

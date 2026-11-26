# Member Management

## Source

- https://developer.tuya.com/cn/docs/app-development/member-information-management.md?id=Kaiy91tma26nh

## Read This When

- 需要邀请/删除家庭成员
- 需要查询家庭成员列表
- 需要修改成员角色或昵称
- 需要通过邀请码加入家庭
- 需要处理邀请接受/拒绝流程
- 需要查询或撤销邀请记录

## 权限层级

| role 值 | 角色 | 可操作范围 |
|---|---|---|
| 2 | 拥有者 | 可添加/删除管理员及以下 |
| 1 | 管理员 | 可添加/删除普通成员及以下 |
| 0 | 普通成员 | 无管理权限 |
| -1 | 自定义成员 | 无管理权限 |
| -999 | 无效成员 | — |

## MemberWrapperBean 数据模型

| 字段 | 类型 | 说明 |
|---|---|---|
| homeId | long | 家庭 ID |
| nickName | String | 为受邀者设置的昵称 |
| admin | boolean | 是否为管理员 |
| headPic | String | 头像（nil 时使用受邀者个人头像） |
| account | String | 受邀账号 |
| countryCode | String | 账号对应的国家/地区码 |
| role | int | 成员角色（见上表） |
| autoAccept | boolean | true=自动接受；false=需受邀者调用 processInvitation 确认 |

## MemberBean 数据模型

| 字段 | 类型 | 说明 |
|---|---|---|
| homeId | long | 家庭 ID |
| memberId | long | 成员 ID |
| nickName | String | 成员昵称 |
| admin | boolean | 是否为管理员 |
| headPic | String | 头像 |
| account | String | 账号 |
| role | int | 成员角色 |
| memberStatus | int | 邀请状态：1=待接受，2=已接受，3=已拒绝，4=无效 |

## APIs

### 添加家庭成员

```java
MemberWrapperBean memberWrapperBean = new MemberWrapperBean();
memberWrapperBean.setHomeId(homeId);
memberWrapperBean.setAccount("user@example.com");
memberWrapperBean.setCountryCode("86");
memberWrapperBean.setNickName("昵称");
memberWrapperBean.setRole(0);           // 普通成员
memberWrapperBean.setAutoAccept(false); // 需受邀者确认

ThingHomeSdk.getMemberInstance().addMember(memberWrapperBean, new IThingDataCallback<MemberBean>() {
    @Override
    public void onSuccess(MemberBean result) { }
    @Override
    public void onError(String errorCode, String errorMessage) { }
});
```

### 删除家庭成员（或离开家庭）

```java
// memberId 传自身时：
//   - 普通成员/管理员：离开家庭（家庭不解散，设备不重置）
//   - 拥有者：等同解散家庭（所有设备被重置），操作前须二次确认
ThingHomeSdk.getMemberInstance().removeMember(memberId, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 查询家庭成员列表

```java
ThingHomeSdk.getMemberInstance().queryMemberList(homeId, new IThingGetMemberListCallback() {
    @Override
    public void onSuccess(List<MemberBean> memberBeans) { }
    @Override
    public void onError(String errorCode, String error) { }
});
```

### 更新成员信息（推荐）

```java
// 使用 MemberWrapperBean 更新，支持修改昵称、角色等
ThingHomeSdk.getMemberInstance().updateMember(memberWrapperBean, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 更新成员信息（旧版，不推荐）

```java
ThingHomeSdk.getMemberInstance().updateMember(memberId, name, admin, callback);
```

### 获取邀请码

```java
ThingHomeSdk.getMemberInstance().getInvitationMessage(homeId, new IThingDataCallback<InviteMessageBean>() {
    @Override
    public void onSuccess(InviteMessageBean result) { }
    @Override
    public void onError(String errorCode, String errorMessage) { }
});
```

### 通过邀请码加入家庭

```java
ThingHomeSdk.getHomeManagerInstance().joinHomeByInviteCode("邀请码", new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 接受或拒绝邀请

```java
// 仅当 addMember 时 autoAccept=false 才需要调用此方法
ThingHomeSdk.getMemberInstance().processInvitation(homeId, true /* true=接受 / false=拒绝 */, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 撤销邀请

```java
ThingHomeSdk.getMemberInstance().cancelMemberInvitationCode(invitationId, new IResultCallback() {
    @Override
    public void onSuccess() { }
    @Override
    public void onError(String code, String error) { }
});
```

### 查询邀请记录列表

```java
ThingHomeSdk.getMemberInstance().getInvitationList(homeId, new IThingDataCallback() {
    @Override
    public void onSuccess(List<InvitedMemberBean> memberBeans) { }
    @Override
    public void onError(String errorCode, String error) { }
});
```

`InviteListResponseBean` 字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| invitationId | long | 邀请 ID |
| invitationCode | String | 邀请码 |
| validTime | long | 邀请有效期 |
| gid | long | 家庭 ID |
| name | String | 受邀者昵称 |
| admin | boolean | 是否为管理员 |
| role | int | 成员角色 |
| dealStatus | int | 1=待接受，2=已接受，3=已拒绝，4=无效 |

### 修改被邀请者信息

```java
ThingHomeSdk.getMemberInstance().updateInvitedMember(
    invitationId,
    "受邀者昵称",
    0,  // memberRole：成员角色
    new IResultCallback() {
        @Override
        public void onSuccess() { }
        @Override
        public void onError(String code, String error) { }
    }
);
```

# 设备共享 API 参考

> 来源：[涂鸦设备共享文档](https://developer.tuya.com/cn/docs/app-development/shareddevice.md?id=Ka6ki8l6pju4i)

## 概述

设备共享允许用户将自己家庭中的设备分享给其他涂鸦账号用户使用。每个设备最多可共享给 20 个用户。

**核心接口：**

```java
IThingHomeDeviceShare shareInstance = ThingHomeSdk.getDeviceShareInstance();
```

## 添加共享

### addShare — 按账号共享（覆盖模式）

```java
/**
 * @param homeId       家庭 ID
 * @param countryCode  国家码（如 "86"）
 * @param userAccount  对方账号（手机号/邮箱）
 * @param bean         ShareIdBean，包含要共享的设备 ID 列表
 * @param autoSharing  是否自动共享（true=无需对方确认）
 * @param callback     回调
 */
void addShare(long homeId, String countryCode, String userAccount,
    ShareIdBean bean, boolean autoSharing,
    IThingResultCallback<SharedUserInfoBean> callback);
```

> ⚠️ 此方法会**覆盖**该用户之前的所有共享设备。如需追加，使用 `addShareWithMemberId`。

### addShareWithMemberId — 按成员 ID 共享（追加模式）

```java
/**
 * @param memberId  共享成员 ID
 * @param devIds    要追加共享的设备 ID 列表
 * @param callback  回调
 */
void addShareWithMemberId(long memberId, List<String> devIds,
    IResultCallback callback);
```

### addShareWithHomeId — 按家庭 ID 和账号共享

```java
/**
 * @param homeId       家庭 ID
 * @param countryCode  国家码
 * @param userAccount  对方账号
 * @param devIds       设备 ID 列表
 * @param callback     回调
 */
void addShareWithHomeId(long homeId, String countryCode, String userAccount,
    List<String> devIds,
    IThingResultCallback<SharedUserInfoBean> callback);
```

## 查询共享

### queryUserShareList — 查询主动分享的用户列表

```java
/**
 * 查询指定家庭下主动分享给了哪些用户
 * @param homeId   家庭 ID
 * @param callback 回调，返回 SharedUserInfoBean 列表
 */
void queryUserShareList(long homeId,
    IThingResultCallback<List<SharedUserInfoBean>> callback);
```

### queryShareReceivedUserList — 查询收到分享的用户列表

```java
/**
 * 查询其他用户分享给当前用户的所有分享来源
 * @param callback 回调
 */
void queryShareReceivedUserList(
    IThingResultCallback<List<SharedUserInfoBean>> callback);
```

### queryDevShareUserList — 查询某设备分享给了哪些用户

```java
/**
 * @param devId    设备 ID
 * @param callback 回调
 */
void queryDevShareUserList(String devId,
    IThingResultCallback<List<SharedUserInfoBean>> callback);
```

### queryShareDevFromInfo — 查询设备的共享来源

```java
/**
 * @param devId    设备 ID
 * @param callback 回调
 */
void queryShareDevFromInfo(String devId,
    IThingResultCallback<SharedUserInfoBean> callback);
```

## 移除共享

### removeReceivedDevShare — 接收方移除收到的设备共享

```java
/**
 * @param devId    设备 ID
 * @param callback 回调
 */
void removeReceivedDevShare(String devId, IResultCallback callback);
```

### disableDevShare — 分享方移除对某用户的设备共享

```java
/**
 * @param devId     设备 ID
 * @param memberId  被分享用户的 memberId
 * @param callback  回调
 */
void disableDevShare(String devId, long memberId, IResultCallback callback);
```

## 备注名管理

### renameShareNickname — 修改共享用户备注名

```java
/**
 * @param memberId  共享成员 ID
 * @param name      新备注名
 * @param callback  回调
 */
void renameShareNickname(long memberId, String name, IResultCallback callback);
```

## 邀请机制

### inviteShare — 发送共享邀请

```java
/**
 * @param devId        设备 ID
 * @param userAccount  对方账号
 * @param countryCode  国家码
 * @param callback     回调，返回邀请 shareId
 */
void inviteShare(String devId, String userAccount, String countryCode,
    IThingResultCallback<Integer> callback);
```

### confirmShareInviteShare — 接受共享邀请

```java
/**
 * @param shareId   邀请 ID（inviteShare 返回）
 * @param callback  回调
 */
void confirmShareInviteShare(int shareId, IResultCallback callback);
```

## 群组共享

### queryGroupSharedUserList — 查询群组共享用户列表

```java
/**
 * @param groupId  群组 ID
 * @param callback 回调
 */
void queryGroupSharedUserList(long groupId,
    IThingResultCallback<List<SharedUserInfoBean>> callback);
```

### addShareUserForGroup — 添加群组共享

```java
/**
 * @param homeId       家庭 ID
 * @param countryCode  国家码
 * @param userAccount  对方账号
 * @param groupId      群组 ID
 * @param callback     回调
 */
void addShareUserForGroup(long homeId, String countryCode, String userAccount,
    long groupId, IResultCallback callback);
```

### removeGroupShare — 移除群组共享

```java
/**
 * @param groupId   群组 ID
 * @param memberId  被分享用户的 memberId
 * @param callback  回调
 */
void removeGroupShare(long groupId, long memberId, IResultCallback callback);
```

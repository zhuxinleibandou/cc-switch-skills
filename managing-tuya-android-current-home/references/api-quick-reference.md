# Current Home Management — API Quick Reference

## Source

- Home Management: `building-tuya-android-home-foundation/references/home-management.md`
- Member Management: `building-tuya-android-home-foundation/references/member-management.md`

## Read This When

- 需要查看当前家庭管理模块涉及的 SDK API 签名
- 需要确认监听器回调方法和参数

## 核心 API

### 查询家庭列表

```kotlin
ThingHomeSdk.getHomeManagerInstance().queryHomeList(
    object : IThingGetHomeListCallback {
        override fun onSuccess(homeBeans: List<HomeBean>) {}
        override fun onError(errorCode: String, error: String) {}
    }
)
```

### 查询家庭详情（触发缓存）

```kotlin
ThingHomeSdk.newHomeInstance(homeId).getHomeDetail(
    object : IThingHomeResultCallback {
        override fun onSuccess(bean: HomeBean) {}
        override fun onError(errorCode: String, errorMsg: String) {}
    }
)
```

### 处理邀请（接受/拒绝）

```kotlin
// accept: true=接受, false=拒绝
ThingHomeSdk.getMemberInstance().processInvitation(
    homeId, accept,
    object : IResultCallback {
        override fun onSuccess() {}
        override fun onError(code: String, error: String) {}
    }
)
```

## 监听器

### IThingHomeChangeListener（全局家庭变化）

注册/注销：
```kotlin
ThingHomeSdk.getHomeManagerInstance().registerThingHomeChangeListener(listener)
ThingHomeSdk.getHomeManagerInstance().unRegisterThingHomeChangeListener(listener)
```

回调方法：

| 方法 | 参数 | 触发场景 |
|---|---|---|
| `onHomeAdded(homeId: Long)` | homeId | 新增家庭（多设备同步） |
| `onHomeInvite(homeId: Long, homeName: String)` | homeId, homeName | 收到家庭邀请 |
| `onHomeRemoved(homeId: Long)` | homeId | 家庭被删除/被移出 |
| `onHomeInfoChanged(homeId: Long)` | homeId | 家庭信息变更 |
| `onSharedDeviceList(list: List<DeviceBean>)` | 设备列表 | 共享设备列表变更 |
| `onSharedGroupList(list: List<GroupBean>)` | 群组列表 | 共享群组列表变更 |
| `onServerConnectSuccess()` | — | 连接涂鸦云成功 |

### HomeBean 关键字段

| 字段 | 类型 | 说明 |
|---|---|---|
| homeId | Long | 家庭 ID |
| name | String | 家庭名称 |
| admin | Boolean | 是否为管理员 |
| homeStatus | Int | 邀请状态：1=待接受，2=已接受，3=已拒绝 |
| role | Int | 角色：2=拥有者，1=管理员，0=普通成员 |

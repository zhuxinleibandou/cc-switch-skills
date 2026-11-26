---
name: managing-tuya-ios-device-list
description: 为涂鸦 IoT iOS ObjC App 开发「设备列表管理」模块。适用于需要在首页/家庭页展示家庭所属设备及共享设备、实现设备列表的增删改查交互（侧滑删除、长按修改名称、在线状态展示），以及监听设备列表实时变化的场景。
compatibility: iOS 11+, Objective-C, UIKit, Tuya Smart App SDK 5.x
---

## 概述 {#description}

为涂鸦 IoT iOS ObjC App 构建「设备列表管理」模块。设备列表是 IoT App 的核心页面之一，需要展示当前家庭下的所有设备以及其他用户分享过来的设备，并支持常见的列表交互操作。

**模块两大数据来源：**
1. **家庭设备列表** — 通过 `getHomeDataWithSuccess:failure:` 获取，`ThingSmartDeviceModel.isShare == NO`
2. **共享设备列表** — 同样在 `homeModel.deviceList` 中，`ThingSmartDeviceModel.isShare == YES`

## 适用场景 {#scene}

已完成当前家庭管理模块，需要在首页/家庭页展示设备列表时使用。

**Phase 1 — 家庭设备列表**：监听 `CurrentHomeDidChangeNotification`，家庭切换时先清空两个数组再重新调用 `getHomeDataWithSuccess:failure:` 拉取完整快照；从 `homeModel.deviceList` 按 `isShare` 分拣到 `myDevices` 和 `sharedDevices` 两个数组；设置 `home.delegate = self` 并持有 `self.currentHome` 强引用；实现 `ThingSmartHomeDelegate` 回调（`didAddDeivice`、`didRemoveDeivice`、`deviceInfoUpdate:`、`device:dpsUpdate:`、`homeDidUpdateSharedInfo:`）。

**Phase 2 — UITableView 多 Section 展示**：Section 0 展示家庭设备，Section 1 展示共享设备（`sharedDevices.count > 0` 时才显示 section header）；实现 `updateEmptyState` 控制空状态视图显示。

**Phase 3 — 列表交互操作（按需）**：
- **侧滑删除**：使用 `UISwipeActionsConfiguration`（iOS 11+）；家庭设备调用 `[smartDevice remove:failure:]`（需二次确认）；共享设备调用 `removeReceiveDeviceShareWithDevId:success:failure:`
- **长按修改名称**：`UILongPressGestureRecognizer` + `UIAlertController`；家庭设备调用 `updateName:success:failure:`，成功后手动赋值 `device.name = newName`；共享设备展示信息而非修改选项
- **下拉刷新**：`UIRefreshControl` + 重新调用 `getHomeDataWithSuccess:`
- **设备在线状态实时更新**：依赖 `ThingSmartHomeDelegate` 的 `deviceInfoUpdate:` 回调，找到对应 cell 并刷新

**Phase 4 — 设备列表排序（可选）**：通过 `tableView:moveRowAtIndexPath:toIndexPath:` 实现拖拽，拖拽结束后调用 `sortDeviceOrGroupWithOrderList:success:failure:` 提交服务器。详细 API 见 `references/api-quick-reference.md`。

## 搭配使用 {#usage}

- `integrating-tuya-ios-sdk` — 前置：SDK 集成
- `building-tuya-ios-account-foundation` — 前置：账号体系
- `building-tuya-ios-home-foundation` — 前置：家庭基础能力
- `managing-tuya-ios-current-home` — 前置：当前家庭管理（提供 CurrentHomeDidChangeNotification）
- `building-tuya-ios-device-foundation` — 前置：了解设备管理基础 API
- `integrating-tuya-ios-device-control-ui` — 配合：点击设备列表项跳转控制面板

## 注意事项 {#tip}

- **`didAddDeivice` / `didRemoveDeivice` 是 SDK 拼写**：`ThingSmartHomeDelegate` 中这两个方法名是 SDK 固定拼写（`Deivice` 非 `Device`），必须照此拼写，否则回调不触发。
- **家庭切换时清空旧列表**：监听到 `CurrentHomeDidChangeNotification` 后，必须先清空 `self.myDevices` 和 `self.sharedDevices`，再加载新数据，避免短暂展示旧家庭的设备。
- **不要对共享设备执行删除/恢复出厂**：共享设备（`isShare == YES`）只能取消接收共享（`removeReceiveDeviceShareWithDevId:success:failure:`），调用 `remove:failure:` 会报错。
- **`isOnline` 是 BOOL 属性**：直接访问 `device.isOnline`，不是方法调用。
- **`home.delegate` 需持有 home 实例**：`ThingSmartHome` 使用 weak delegate，需在 ViewController 或 ViewModel 中强引用 `self.currentHome`，否则 delegate 回调不触发。
- **家庭切换时注销旧 home 的 delegate**：切换家庭前将旧 home 的 `home.delegate = nil`，再设置新 home 的 delegate，避免收到旧家庭的回调。
- **`updateName:success:failure:` 成功后需手动更新本地 model**：重命名成功后 SDK 不会自动刷新 `ThingSmartDeviceModel.name`，需手动赋值 `device.name = newName` 再刷新 UI。
- **`getHomeDataWithSuccess:` 返回完整快照**：每次调用都会返回全量数据，不需要自己做增量合并。

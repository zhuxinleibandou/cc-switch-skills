# 群组与混合组合限制

- 单设备面板可以同时兼容非 Matter 与 Matter（依靠标准 DP 与转换链路）。
- 群组设备不支持 Matter 与非 Matter 混合组合：
  - 如果群组内包含非 Matter 与 Matter 的设备混合，将无法保证统一的发布链路与状态一致性，建议拆分为两个群组分别管理。
  - 如果群组内全部为 Matter 设备，路数与白光能力的判定请基于 matter schema 进行（参考 getMatterRoad / checkIsMatterHasWhite）。
- 统一建议：在群组场景下，始终通过“标准 DP”作为发布入口，并保持拦截器顺序为 dp-kit 在前、matter-kit 在后，以减少回环与不一致。
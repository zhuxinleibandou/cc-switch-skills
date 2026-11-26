# LampMatterSkills 概览与使用场景

照明 Matter 协议专家（LampMatterSkills）

> 提示：matter-kit 自 @ray-js/panel-sdk@1.15.0 开始加入，当前仅支持照明品类设备。

## 专家知识定位
精通照明类 Matter 设备面板的 DP 功能点映射与拦截器实践，熟悉标准协议与 Matter 协议双向转换及常见场景的工程化落地。

## 知识库覆盖范围 (Knowledge Scope)
- matter-kit 接入与初始化：createMatterKit、默认拦截器使用
- 标准 DP 与 Matter DP 映射：switch/brightness_control/color_temp_control/hs_color_set 的双向转换
- 工具与 Hooks：Matter 路数判断、白光能力检测、色温/亮度转换、HSV 解析等
- 与 dp-kit 协同：拦截器顺序、颜色协议处理、状态即时更新

## AI 如何调用此知识
安装本技能后，AI 将具备以下推理与落地能力：
- 给出符合照明品类的 matter-kit 集成代码模板（含 SmartDeviceModel options/interceptors）
- 根据 matter 设备 dpSchema 自动判断设备路数与白光能力，并生成 UI/逻辑建议
- 解释并输出标准 DP ↔ Matter DP 的上报/下发转换策略与公式
- 指导 matter-kit 与 dp-kit 的协同拦截器顺序与配置，避免状态不一致与精度损失
- 提供颜色数据（HSV）在 Matter 面板下的正确来源组合与解析方案

## 何时使用本技能（When to Use This Skill）
- 面板需要接入 Matter 照明设备，但希望继续以“标准 DP”编码
- 同一工程需同时兼容非 Matter 与 Matter 设备，避免双协议逻辑分叉
- 需要可靠的亮度/色温映射与 HSV 解析，减少展示精度损失
- 需要判断设备路数与白光能力以驱动 UI/场景数据集
- 与 dp-kit 协作，需要明确拦截器顺序与乐观更新配置，避免循环与卡顿
- 在群组或复杂组合场景下，需遵循 Matter 组合限制并给出 UI 提示

建议：使用 @ray-js/panel-sdk >= 1.15.0，生产环境关闭 debug，并按拦截器顺序“dp-kit 在前、matter-kit 在后”配置。

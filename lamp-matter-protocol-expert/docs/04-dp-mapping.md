# DP 功能点映射与转换说明

本节说明标准 DP 与 Matter DP 的映射关系以及转换策略，帮助你在“标准 DP”语义下实现对 Matter 设备的无缝控制。

## 映射总览
- 开关：switch ↔ switch_led
- 亮度：brightness_control (1-254) ↔ bright_value (10-1000)
- 色温：color_temp_control (154-370) ↔ temp_value (0-1000)
- 颜色：hs_color_set(色相+饱和度) + brightness_control ↔ colour_data(HSV)

## 亮度映射
- 采用线性映射，保证区间一致与调节手感统一。
- 方向：
  - Matter → 标准：brightness_control → bright_value
  - 标准 → Matter：bright_value → brightness_control

## 色温映射
- 基于开尔文值做非线性映射，以优化滑动条显示与用户感知。
- 方向：
  - Matter → 标准：color_temp_control → temp_value
  - 标准 → Matter：temp_value → color_temp_control
- 注意：因非线性映射存在精度损失，UI 展示建议使用 hooks.useOriginMatterTemp() 获取原始 color_temp_control 值。

## 颜色（HSV）
- 在 Matter 面板下，标准 HSV 的 V 值来自 bright_value；H/S 来自 hs_color_set。
- 解析时需要结合设备信息（devInfo）与当前亮度，确保不同能力下的准确性。

## 实践建议
- 首选“标准 DP”作为业务层入口；
- 让拦截器负责双向转换，保证 Matter/非 Matter 统一代码路径；
- 对色温 UI 展示采用原始值（useOriginMatterTemp），减少精度问题影响。
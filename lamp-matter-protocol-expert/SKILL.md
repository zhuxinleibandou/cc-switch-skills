---
name: lamp-matter-protocol-expert
description: 面向照明类 Matter 设备的工程实践技能索引，覆盖标准 DP 与 Matter DP 的双向映射、拦截器链路、路数/白光判定、亮度与色温转换、HSV 解析等，帮助面板快速、稳定地兼容 Matter。
---

# Skills: LampMatterSkills 索引

说明：本页为索引导航。详细内容请访问 docs 目录中的分篇文档。建议使用 @ray-js/panel-sdk >= 1.15.0，并按拦截器顺序“dp-kit 在前、matter-kit 在后”配置，生产环境关闭 debug。

文档列表：
- 01 概览（Overview）：skills/LampMatterSkills/docs/01-overview.md
- 02 快速开始（Quick Start）：skills/LampMatterSkills/docs/02-quick-start.md
- 03 API 概览（API Overview）：skills/LampMatterSkills/docs/03-api-overview.md
- 04 标准 DP 与 Matter DP 映射（DP Mapping）：skills/LampMatterSkills/docs/04-dp-mapping.md
- 05 常用示例（Examples）：skills/LampMatterSkills/docs/05-examples.md
- 06 乐观更新指南（Optimistic Update）：skills/LampMatterSkills/docs/06-optimistic-update.md
- 07 SDK 集成指引（SDK Integration）：skills/LampMatterSkills/docs/07-sdk-integration.md
- 08 UI 路数与白光策略（UI Road）：skills/LampMatterSkills/docs/08-ui-road.md
- 09 彩光与白光亮度统一（颜色解析）：skills/LampMatterSkills/docs/09-color-parsing.md
- 10 群组与混合组合限制（Group Limits）：skills/LampMatterSkills/docs/10-group-limits.md
- 11 与 dp-kit 的拦截器顺序与高级配置：skills/LampMatterSkills/docs/11-interceptor-order.md
- 12 白光支持与路数判定（UI 决策）：skills/LampMatterSkills/docs/12-ui-white-tab.md
- 13 Matter 适配工程检查清单：skills/LampMatterSkills/docs/13-adaptation-checklist.md
- 14 常见坑位与排查（Troubleshooting）：skills/LampMatterSkills/docs/14-troubleshooting.md

关键提示：
- 路数判定与白光能力：统一使用 matterDpKit.utils.getMatterRoad 与 checkIsMatterHasWhite；入口用 checkIsMatterPanel。
- 颜色数据解析：在 Matter 面板下 HSV 的 V 来自 bright_value；建议使用 useColourData 或 resolveColorData 并传入 devInfo。
- 乐观更新：开启 sendDpOption.immediate，按需使用 whiteDpCodes 避免彩/白光亮度循环触发。
- 发布链路顺序：request.publishDps 中保持 dp-kit 在前、matter-kit 在后，避免状态不一致与回环。

资源：
- 中文技能描述：skills/LampMatterSkills/SKILL_ZH.md（如存在）
- 英文/索引：skills/LampMatterSkills/SKILL.md（当前文件）

如需具体代码片段与公式，请跳转到对应分篇文档。Final Answer: 已创建 11、12、13、14 文档并将 SKILL.md 改造成索引，完成导航与指引。
---
name: smart-ui-skill
description: 面向 Ray 小程序 smart-ui，基于 meta-first 工作流协助生成与修改页面与组件。在用户提出 UI 搭建、组件改造、表单与反馈交互、导航展示、图片转代码或 smart-ui 排障升级时使用；也覆盖在纯浏览器 / H5 / 非小程序宿主中使用 smart-ui 的 Web Components（wc/ 目录）场景。仅覆盖 smart-ui，实现前须查阅 _meta.json 与组件文档，禁止虚构 props、事件与能力。
---

## 概述 {#description}

本 skill 是 Ray 小程序 **smart-ui** 的专项开发入口，采用 **meta-first** 流程（先索引、再文档、最后输出），不使用任务分区。目标是在有据可查的前提下完成页面与组件的设计、改造与排障，避免对文档未载明的能力进行猜测。

## 适用场景 {#scene}

- 搭建或调整 smart-ui 页面、布局与组件组合。
- 表单、反馈类交互、导航与展示类 UI 的实现或改造。
- 图片转代码、参考稿落地为 smart-ui 结构。
- smart-ui 相关报错、样式或行为不符合预期时的定位与升级。
- 在纯浏览器 / H5 / 预览页等**非小程序宿主**中使用 smart-ui：改用 `wc/` 下的 Web Components，见 [Web Components 用法](#webcomponents)。

当前**仅**处理 smart-ui，不作为通用 Ray API 或设备能力开发总入口。若用户目标超出 smart-ui，应先说明超出当前范围，再给出最小必要的外部建议。

## 搭配使用 {#usage}
- ** requirement-creating-guide-skill **：需求生成指南 skill，配合使用可产出符合小程序面板规范的需求文档。
- ** ray-common-develop-skill **：Ray 小程序开发 skill，配合使用可在更广泛的 Ray 开发场景中提供文档导航与实现约束，提升开发效率和代码质量。

## 工作流程 {#workflow}

1. **先读索引**：读取 `references/smart-ui/_meta.json`，按 `englishName`、`chineseName`、`category` 初筛候选组件。
2. **再读文档**：读取 1～2 个候选组件对应的 `references/smart-ui/*.md`；信息不足时再增量补读 1～2 个相关文档。不允许一次性扫完整个 `references/smart-ui/` 目录，须按需增量读取。
3. **最后输出**：先给结论，再给依据与实现建议；文档未覆盖时须显式说明「未在文档中找到」，禁止静默猜测。

输出时需区分两类信息：**文档确认**（明确来自当前已读文档）与**经验推断**（文档未覆盖、基于上下文的保守假设）。涉及能力说明时，优先引用组件文档中的 props、events、示例与注意事项。

**默认约定**：UI 优先 smart-ui；无法满足时再考虑 Ray 原生组件。页面生成默认放在 `/pages`，组件默认放在 `/components`。若涉及文案，提醒接入 i18n，避免在业务代码中硬编码中文。

## Web Components 用法 {#webcomponents}

除 Ray 小程序外，smart-ui 还提供一套**浏览器可直接运行的 Web Components**，位于本 skill 的 `wc/` 目录。它由 `packages/*` 经 `@tuya-miniapp/mp-compiler` 编译而来，**不是**另写一套实现，组件行为与小程序版一致。当需求是纯浏览器 / H5 / 预览页 / 非小程序宿主中使用 smart-ui 时，走本节；小程序内开发仍走 `references/smart-ui/` 的 meta-first 流程。

### 目录内容

- `wc/wc-dist/`：编译产物合包（运行时 + 组件），示例页依赖它。
- `wc/smart-<name>-example.html`（67 份）：每个组件的可运行示例，是最权威的用法参考。
- `wc/smart-<name>.md`（67 份）：每个组件的属性 / 属性名映射 / 事件 API 表。
- `wc/home.html`：组件总入口导航，按「基础 / 表单 / 反馈 / 展示 / 导航 / 业务」分类列出全部组件。
- `wc/demo-runtime.js`、`wc/smart-common.css`、`wc/icon-demo-data.js`：示例页的事件桥、公共主题样式与 Icon 演示数据。
- `wc/WC_HANDOFF.md`：改造与构建交接文档（背景、构建链、已知边界）。

### 资源加载顺序（不可调整）

每个页面按以下顺序加载后，`<smart-*>` 标签即可用：

```html
<script src="./wc-dist/builtin-components/dist/next.js"></script>
<script src="./wc-dist/runtime/index.js"></script>
<script src="./wc-dist/smart-ui-wc.js"></script>
<script src="./demo-runtime.js"></script>
<link rel="stylesheet" href="./smart-common.css">
```

> 注意：`smart-<name>.md` 开头「Load smart-icon.js …」的措辞是早期独立组件写法，**已过时**。当前默认加载方式是上面的合包；`.md` 的价值在于其**属性 / 事件 API 表**，据此使用即可，不要引用已废弃的独立 `smart-*.js`。
>
> **唯一例外是 Slider**：`smart-slider` 用独立文件 `wc/slider.js`（不走合包），详见下方 [特例：Slider 滑块](#webcomponents)。

### 使用约定

- **标签名**：kebab-case，如 `<smart-button>`、`<smart-nav-bar>`。
- **属性**：kebab-case attribute（如 `left-text`、`is-link`）。布尔与字符串可直接写 attribute。
- **复杂值**（对象 / 数组 / 函数）：attribute 无法承载，必须用 JS property 赋值，如 `el.options = [...]`；property 名为 camelCase。
- **事件**：组件通过 `CustomEvent` 派发，`event.detail` 携带数据。既可用标准 `el.addEventListener('finish', e => e.detail)`，示例页也用 `bind:finish="handler"` 由 `demo-runtime.js` 桥接。
- **样式**：组件默认 `display: block`；公共主题变量与工具类在 `smart-common.css`，编译后工具类带作用域前缀，故公共样式已在该 CSS 中以属性选择器兜底，引入即可。

### 特例：Slider 滑块（`slider.js` 独立实现）

`smart-slider` 有两套互不相同的实现，按标签属性风格区分，**不要混用**：

- **ty-slider（推荐、功能全）**：来自 `@ray-js/components-ty-slider` 的独立 WC，文件是 `wc/slider.js`，使用 **Shadow DOM**，属性为 **kebab-case**（`instance-id`、`track-style`、`bar-style`、`is-show-ticks`、`step-style`、`parcel`、`is-vertical` 等）。它**不走** `wc-dist` 合包，页面只需：

  ```html
  <script src="./slider.js"></script>
  <link rel="stylesheet" href="./smart-common.css">
  ```

  参考 `wc/smart-slider-example.html`（自带内联 demo runtime）与 `wc/smart-slider.md`。因内容在 shadow root，取内部结构须走 `el.shadowRoot`。

- **normal-slider（合包版）**：`wc/smart-normal-slider-example.html`，来自 `packages/normal-slider`，走 `wc-dist` 合包，属性为 **camelCase property**（`trackStyle`、`showSteps`、`hideThumbButton`）。
- **range-slider（双滑块）**：`wc/smart-range-slider-example.html`，来自 `packages/slider`，标签 `smart-range-slider`，走合包。

在纯浏览器场景做「滑块」需求时，**默认用 ty-slider（`slider.js`）**；仅在需要与小程序 `packages/normal-slider` / `packages/slider` 行为完全一致时才用合包版。

### 查阅流程（WC 场景）

1. 从 `wc/home.html` 或组件中文名定位英文名 `smart-<name>`。
2. 读 `wc/smart-<name>.md` 获取属性 / 事件 API（按需增量，勿全量扫）。
3. 读 `wc/smart-<name>-example.html` 获取可运行的组合与事件绑定写法。
4. 输出时同样区分「文档确认」与「经验推断」，禁止虚构 props / 事件。

## 注意事项 {#tip}

- 禁止使用小写 HTML 标签（如 `div`、`span`）。
- 禁止混入 `wx.*`、`my.*` 等非 Ray 业务 API。
- 禁止虚构 smart-ui 的 props、事件或版本能力。
- 禁止在未通过 `_meta.json` 定位前一次性加载大量文档。
- 禁止在业务代码中硬编码中文文案。

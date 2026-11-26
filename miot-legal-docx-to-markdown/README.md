# 米家法律文档 Word 转 Markdown Skill

这是一个用于把米家 / Xiaomi Home 法律类 Word 文档转换成结构化 Markdown 的 Claude Code / Codex 通用 Skill，主要面向：

- 隐私政策；
- 软件许可及服务协议；
- 用户协议；
- 同一产品的多语言法律文档批量转换。

它解决的不是“把 Word 里的文字复制出来”，而是同时保留可映射的文档结构，例如标题层级、目录、目录锚点、列表、加粗、斜体、链接及阿拉伯语等 RTL 文档的编号显示。

## 最重要的原则

**Word 是文案的唯一来源，已有 Markdown 只用于参考格式。**

转换时不得翻译、润色、纠错或根据旧 Markdown 替换 Word 文案。以下内容都以 Word 为准：

- 字母大小写；
- 标点、引号和撇号；
- 产品名、公司名、日期及数字；
- 段落和列表顺序；
- URL 及其查询参数；
- 具有法律意义的加粗和斜体。

如果 URL 后面在 Word 中没有空格，转换器不会为了分隔后文而增加可见空格，而是使用 Markdown 链接的闭合语法建立边界。

## 转换后的格式

### 隐私政策

隐私政策通常转换为：

- 文档标题使用一级标题；
- 概述或目录标题使用三级标题；
- 目录条目链接到正文锚点；
- 正文主章节使用三级标题；
- 子章节使用四级标题；
- Word 项目符号和编号列表转换为 Markdown 列表；
- RTL 文档中的 ASCII 章节编号在需要时使用方向标签稳定显示。

详细规则见 [隐私政策格式规范](references/privacy-policy-format.md)。

### 用户协议

用户协议通常转换为：

- 文档标题使用一级标题；
- 重要提示保留原有加粗；
- 主章节使用三级标题；
- `1.1`、`4.2.3` 等子条款保持普通段落，除非 Word 明确将其设置为标题；
- 不会凭空增加目录和锚点。

详细规则见 [用户协议格式规范](references/user-agreement-format.md)。

## 如何让 AI 使用

在 Claude Code 中，使用斜杠命令：

```text
/miot-legal-docx-to-markdown 将 /绝对路径/隐私和协议 中的 Word 批量转换到新输出目录。保留语言目录，Word 是唯一文案来源，不翻译、不润色，并生成转换报告。
```

技能可以根据自然语言请求自动匹配。Claude Code 使用 Bash 检查或准备 Python 和 Pandoc，无需 Codex 专用的工作区依赖工具。详细环境步骤见 [运行环境](references/python-runtime.md)。

在 Codex 中，转换单个文件时可以继续使用：

```text
使用 $miot-legal-docx-to-markdown 将这个 Word 隐私政策转换为 Markdown。Word 是唯一文案来源，输出到新文件，不要覆盖已有 Markdown。
```

转换多语言目录时，可以这样说：

```text
使用 $miot-legal-docx-to-markdown 批量转换这个目录中的隐私政策和用户协议。保持语言目录结构，Word 是唯一文案来源，不翻译、不润色，并生成转换报告。
```

Skill 会自动区分隐私政策和用户协议。它的规则来自当前整理好的 17 种语言文档，但不设置语言白名单，后续新增语言也可以按 Word 的实际结构转换。

## 输出内容

批量转换通常会生成：

```text
输出目录/
├── 语言一/
│   ├── 隐私政策.md
│   └── 用户协议.md
├── 语言二/
│   ├── 隐私政策.md
│   └── 用户协议.md
└── 转换报告.json
```

转换报告会记录：

- 输入和输出文件路径；
- 文档类型；
- 段落、标题和锚点数量；
- 原文段落摘要值；
- 原文保真校验结果；
- Word 审阅批注等提示信息。

报告分别记录 `text_fidelity_status`（文案）和 `hyperlink_fidelity_status`（链接）。只有两项及整体 `fidelity_status` 都为 `PASS`，并且链接的 `missing`、`mismatched`、`unparsed_fields` 均为空，才能视为完成转换。失败文件也保留已经生成的诊断信息。

## 原文保真校验

转换器会将生成的 Markdown 渲染成可见纯文本，再按原顺序查找 Word 中的每一个非空正文段落。校验只允许折叠用于排版的空白，不会统一大小写、标点、引号、变音符号、数字或 URL。

这项校验能证明 Word 正文没有在转换过程中被改写，但不能证明原文已经通过法务审核、翻译正确或仍是最新版本。完整边界见 [原文保真规则](references/fidelity-rules.md)。

链接校验同时支持普通超链接、简单域和复杂 `HYPERLINK` 域。正文清单直接读取 XML，因此简单域中的显示文字也会进入校验。链接使用 Word 存储的完整目标，保留邮件地址、查询参数、尾部斜杠和外部书签位置；域边界按文字节点处理，避免把链接后的普通文字错误地变为链接。

转换器核对 Pandoc 解析出的实际链接节点、显示文字范围与目标地址，不以 URL 字符串出现次数判定成功。内部书签链接、嵌套域、其他域类型及无法解析的域会明确失败并要求复核。窗口打开方式和鼠标悬停提示不在 Markdown 中重现。

## 不会静默处理的内容

遇到以下可能隐藏正文的 Word 功能时，Skill 会停止并要求人工确认，而不是猜测或丢弃内容：

- 修订模式中的插入或删除；
- 文本框；
- 表格；
- 包含正文的页眉、页脚；
- 脚注、尾注；
- 带文字的绘图、嵌入对象或公式。

Word 审阅批注属于编辑注释，不会作为法律正文写入 Markdown，但会在转换报告中计数并提示。

## Skill 目录

```text
miot-legal-docx-to-markdown/
├── SKILL.md
├── README.md
├── agents/openai.yaml
├── references/
│   ├── fidelity-rules.md
│   ├── privacy-policy-format.md
│   ├── python-runtime.md
│   └── user-agreement-format.md
└── scripts/
    ├── convert_legal_docx.py
    ├── legal_hyperlinks.py
    ├── test_legal_hyperlinks.py
    └── requirements.txt
```

- `SKILL.md`：AI 执行转换时读取的主指令；
- `README.md`：供使用者了解用途和使用方法；
- `references/`：原文保真及两类法律文档的详细格式规范；
- `scripts/convert_legal_docx.py`：执行单文件或多语言批量转换，并生成校验报告。

## 手动运行转换器

通常直接让 Claude Code 或 Codex 使用 Skill 即可。如果需要手动调用脚本，先按 [运行环境](references/python-runtime.md) 选择或创建环境，然后使用明确的解释器和脚本路径：

```bash
"<verified-python>" "<skill-dir>/scripts/convert_legal_docx.py" source-directory \
  --output-root strict-markdown \
  --report strict-markdown/conversion-report.json
```

默认不会覆盖已有输出。只有明确需要替换输出文件时才使用 `--overwrite`。

验证链接修复与拒绝错误链接的回归样例：

```bash
"<verified-python>" "<skill-dir>/scripts/test_legal_hyperlinks.py" -v
```

## 安装或分享

分享时应复制完整的 `miot-legal-docx-to-markdown` 文件夹，不能只复制 `SKILL.md`。Claude Code 使用者可放入个人技能目录：

```text
~/.claude/skills/miot-legal-docx-to-markdown/
```

也可放入项目的 `.claude/skills/miot-legal-docx-to-markdown/`。Codex 使用者可继续放入：

```text
~/.codex/skills/miot-legal-docx-to-markdown/
```

这样脚本、格式规范和 AI 主指令才能一起生效。

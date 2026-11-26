---
name: film-recap-studio
description: 影视解说二创全流程工作流（中文）：选电影/电视剧 → 看片建索引 → 按爆款公式写解说词 → AI 配音 → 自动剪辑出横屏/竖屏成片 → 三种比例封面 → 质检 → 各平台发布文案。公式来自抖音「探手电影」三条爆款（造物狱、午夜规则、水晶湖）拆解。用户说"做影视解说/电影解说/电视剧解说/二创视频/X 剧第 N 集解说"时使用。
---

# film-recap-studio · 影视解说工作流

一条命令行 `bin/frs`（Python 3.12，由 uv 临时拉起，依赖 pillow + edge-tts；默认配音调用本机 VoxCPM2 独立 venv 做声音克隆，转写与逗号校准用 mlx-whisper）把机械活全包了。**Agent 负责的是"脑子活"：选片、看片、讲故事、写稿、审片。**

```
# 实体目录（跨 agent 共享源）。各 agent 自己的技能目录里都是指向它的软链接，任选其一亦可
SKILL=~/.cc-switch/skills/film-recap-studio
FRS=$SKILL/bin/frs
```

**跨 agent 使用**：技能实体只有 `~/.cc-switch/skills/film-recap-studio` 一份，Claude Code（`~/.claude/skills/`）、Codex（`~/.codex/skills/`）、Gemini（`~/.gemini/skills/` 与 `~/.gemini/config/skills/`）都是软链接过去。**改动只在实体目录里做**，所有 agent 立刻同步；不要在某个 agent 的技能目录里复制一份实体（2026-11-25 就是因为 cc-switch 里存着一份 11-23 的旧实体，Gemini 一直读到旧版）。

版权与授权由用户本人处理，流程里不反复提醒；只在交付时附一句"发布前确认授权"。

## 项目目录约定

```
<项目>/                 例：~/影视解说/午夜规则-S01E01/
  source/xxx.mp4         用户提供的原片（一集一个文件；电视剧按集）
  work/                  --work 指向这里
    prep/                索引产物（meta、对白字幕、联系表、镜头切点）
    script.json          解说稿 = 剪辑工程（唯一需要手写的文件）
    tts/ render/         中间缓存，可删
    output/              成片、封面、字幕、质检报告、发布文案
```

## 流程（11 步，带检查点）

### 0. 环境（首次）
`which ffmpeg uv` 存在，且本机 VoxCPM2 环境就位即可（离线可用）：默认路径 `~/Documents/ChatGPT/本地项目工具集/voxcpm2-mcp`（`.venv/bin/python` + `models/VoxCPM2`），可用 `VOXCPM_HOME` 覆盖；降噪模型 `~/.cache/film-recap-narration/zipenhancer-16k`（`VOXCPM_DENOISER`）。旧的 OmniVoice 链路需 `~/AI/OmniVoice/.venv/bin/python`。本机 ffmpeg 没有 drawtext/subtitles 滤镜，所以所有文字都是 Pillow 画成 PNG 再叠加，**不要改成 drawtext**。若切换到 edge-tts 则需联网。

### 1. 选片 → 读 `references/film-selection.md`
- 用户给了片名：按评分表打分，给出"适合/勉强/不适合"+ 推荐的钩子类型 + 分几集。
- 用户只给方向：上网查近期热播/经典片，列 3–5 部候选表格让用户挑（或在全权限下直接选第一名并说明）。
- 原片文件由用户提供（放进 `source/`）。没有文件就停在这一步，说清楚需要什么。


**同时给一条文案风格推荐**（`references/script-styles.md`「选片时就推荐风格」）：按反转强度、主角处境、可分析性、剧情密度、体量连载五条判断，输出「推荐 + 理由 + 备选 + 不建议」一屏，和分集建议一起给用户。
### 2. 建索引
```
$FRS prep source/xxx.mp4 --work work [--lang en|ja|ko|th|zh] [--every 10] [--no-asr]
```
产出：`prep/meta.json`（含黑边检测）、`dialogue.srt`（whisper 对白）、`scenes.json`（镜头切点）、`sheets/sheet_XX.jpg`（每 10 秒一帧的联系表）、`source_index.md`（联系表 + 对应对白，按时间段）。90 分钟电影约 5–10 分钟。

### 3. 看片（必须真看，不许凭剧情简介写稿）
1. 先上网查剧情梗概与结局，建立全局认识。
2. 按顺序读 `source_index.md` 和全部 `sheets/*.jpg`，写一份 `work/beats.md`：时间段 → 发生了什么 → 情绪强度(1–5) → 可用作钩子吗。
3. 对要用的段落用 `peek` 精确定入出点：
   `$FRS peek --work work --start 92:00 --end 93:10 [--every 1]` → 逐秒拼图 + 该段对白 + 镜头切点。
   入点/出点尽量落在镜头切点上；原声段落必须包住完整一句台词。
4. 坑：片头字幕/片尾滚动字幕段别选；whisper 对白里 `[重复]` 是幻听，别当真台词。

### 4. 定故事方案（先给用户看一屏，再写稿）
从三种开头里选一种（详见 `references/hit-formula.md`）：
- **结局前置**（造物狱型）：最适合有反转结局的片；首尾闭环。
- **高潮前置**（午夜规则型）：最强一场戏剪到第 0 秒；规则类/怪谈类首选。
- **IP 前传**（水晶湖型）：观众已知的角色/IP，问"他怎么变成这样"。

输出：第一句话、冷开场讲哪段（时间码）、片名在第几秒、正片骨架（每 30–60 秒的问题）、结尾停在哪、本集时长、是否分集。全权限下直接按推荐继续。

**文案风格另外选一张卡 → 读 `references/script-styles.md`**（A 冷静叙事流 / B 吐槽共情流 / C 深度解读流，默认 A）。开场结构（上面三种）和文案风格是两个独立维度：风格决定人称、句长、吐槽与分析的配比、原声留白量、结尾落点。用户想比风格时，先各出一份**纯文本口播稿**（`口播稿-风格X-名字.md`，不配 clips）让他挑，选定后再落成带 clips 的 `script.json`，`style` 字段记下风格 id。新增风格按该文档「怎么新增一张风格卡」取样，抖音参考视频的抓取与转写方法也在那里。

### 5. 写 script.json → 读 `references/script-schema.md` 与 `references/editing-craft.md`
硬性要求（lint 会查）：
- 第 1 句 ≤20 字，是全片最反常的一件事；冷开场 = 完整小故事 + 反转。
- 片名一句 + 世界观三句，之后立刻回正片。
- 短句：字幕 9–14 字一屏；口语；"就在这时/殊不知/然而/没想到/直到/可"推进。
- 每 30–60 秒抛一个问题；数字具体化。
- 原声留白：每 10 分钟 7–10 段，单段 3–15 秒（尖叫、关键对白、配乐）。
- 解说说什么，clips 就放什么（声画对位）；每句给 1 个黄色高亮关键词。
- 结尾：停在最紧处 + 1–2 个问题 + "我们下期再见"。
- 语速按 ~5.6 字/秒估时；10 分钟成片约 2800–3200 字解说。

可选：写完让 Codex 做第二意见（`codex exec "按 references/hit-formula.md 审这份 script.json 的钩子和节奏，只给修改建议"`），Agent 自己决定采纳。

### 6. 稿件体检
`$FRS lint --work work` → 错误必须清零；警告逐条判断（能改就改）。会估算总时长。

lint 查不出语病和读音，所以**每次改完稿必须手动跑一遍 `references/editing-craft.md`「五、返工成本与一次过清单」的四项校对**（语病通读 → 读音排查 → 镜头自检 → 配完转写复核），全过才渲染。
用户反馈按「一轮一批」处理：全部定位确认 → 统一改稿 → 一次配音 → 一次渲染 → 抽帧核对改动点。
**审片按三道关卡走（审稿关 → 口播关 → 预览关），详见 `references/editing-craft.md`「八」。**
出片后 qc 之外**必须再跑 `$FRS audit --work work`**：成片黑场必须为 0，列出的极短镜头逐个抽帧判定（仅原片闪光/急摇/快切蒙太奇可放行）。prep 后需有 `prep/black.json`（原片黑场表），镜头调整与背景声硬规则见 `references/editing-craft.md`「七」。

### 7. 配音（默认 `voice`，2026-11-25 定版）
```
$FRS voice --work work [--only 17,66] [--ref-audio <wav>] [--sentence-gap 0.70] [--comma-gap 0.25]
```
本机 **VoxCPM2 原速** + 用户已确认音色 `voices/my_voice_voxcpm.wav`，C 组参数（`cfg 2.0 / steps 20 / denoise / seed 42 / normalize off`）。流程是「按句末标点切小句 → 逐句合成 → 小句内部校准逗号停顿 → 按 `sentence_gap` 拼接」，逗号不切所以语调连贯；句号 0.70s、逗号 0.25s。小句级 + 校准级双缓存（缓存名含文本哈希，改稿不会误命中旧结果；改了校准逻辑本身要手工清 `work/tts/sent/fixed/`），改一句只重配一句。句尾修剪用 `-55dB` 保住轻声字尾音，补静音时再按实测余量扣回来——动过这两个参数必须重新统计句号停顿分布。

校准是**非破坏性**的：只在已有静音段里加减采样，绝不整段置零，所以不会吃掉前字尾音或后字起音。逗号处模型完全没停时，脚本**不会硬插静音**（那必然切到字上），只报 `连读`，跑完还会汇总全部连读位置并落盘到 `work/tts/sent/_pause_report.json` —— 这类只能改稿：把该逗号升级成句号，或改成不需要停的写法。但 2–4 字的时间/地点/话题前缀和并列短句后面的连读属于自然语流，不要改。

每个小句会打印 `(逗号位置, 原有静音, 补了多少)`，以及四类标记：`连读`（见上，改稿）、`stray`（非标点处 ≥0.18s 的停顿，说明模型按自己的理解断了句 → **改稿**，常见做法是在它想停的地方补一个逗号）、`!偏差`（两轮修正后仍偏离目标 >0.06s）、`估位`（转写失败后按字数估的位置）。写稿时逗号两侧必须各自语义自足，别写「不相信只是为了钱，…」这类带宾语从句的分句——`$FRS lint` 现在会就此报警。**完整说明和易听错字清单见 `references/editing-craft.md`「六」，必读。**

`$FRS tts --work work` 是旧链路（OmniVoice 克隆，`speed` 可调；或 `--backend edge --voice zh-CN-YunxiNeural --rate +10%` 走微软在线语音），只在 VoxCPM2 不可用或用户指定时才用——OmniVoice 在 1.15× 下实测有破音。

### 8. 剪辑
先 `$FRS render --work work --preview 90`（只出前 90 秒，快速看冷开场），满意后：
```
$FRS render --work work            # 横屏 master_16x9.mp4 + 竖屏 vertical_9x16.mp4 + subtitles.srt + timeline.json
```
- 画面：`fit: auto` 自动处理黑边（≈16:9 铺满；宽银幕保留黑边；4:3 等比例用模糊背景填充）。
- 声音：解说时原声压到 0.12；原声段满音量；可选 `bgm`；整片响度标准化到 -16 LUFS。
- 包装：底部白字黑边字幕（关键词黄色）、左上账号水印、右上提示语（"内含恐怖元素 请谨慎观看"兼做钩子）。
- 硬字幕原片双层字幕规范（默认固化）：原声对话段设 `orig_sub: false`、`orig_box: false`，不叠加任何文案，直接保留原片自带双语字幕；口播解说段设 `mask_bottom: 140`、`y_bottom: 1038`、`box: false`，在底部 140px 字幕带叠加暗化毛玻璃遮罩，完全遮住原片硬字幕并居中渲染口播文案，彻底消除文字重叠。
- 竖屏：顶部大标题 + 集数标签，中间放大的画面（`vertical_crop` 默认 1440，宽银幕片可设 1920）。
- 只重出竖屏：`--only-vertical`；不要竖屏：`--no-vertical`。分段渲染有缓存，改稿后重跑只渲染改动段。

### 9. 封面
`$FRS cover --work work`（读 script.json 的 `cover`；也可 `--frame 93:12 --frame2 95:40 --title "第一行|第二行" --keywords "词1,词2" --tag 第1集`）。
产出 `cover_16x9.jpg`（YouTube/西瓜）、`cover_3x4.jpg`（抖音/视频号/小红书信息流）、`cover_9x16.jpg`（竖屏全屏）。
选帧原则：人物正脸 + 强情绪（惊恐/对峙）或最怪的画面；双帧 = "前 vs 后"/"人 vs 怪"。标题 2 行、每行 ≤10 字、1–2 个高亮词。先 peek 找帧再定。

### 10. 质检
```
$FRS qc --work work                                   # 横屏
$FRS qc --work work --file work/output/vertical_9x16.mp4
```
机器查：规格、响度、长静音、黑场、时间线一致性，出 `qc_<文件名>.md` 和联系表。
然后 **Agent 必须亲自看**：读联系表；对冷开场和结尾抽帧（`ffmpeg -ss T -i master -frames:v 1`）看字幕/画面；逐条过 qc 报告里的人工清单。发现问题 → 改 script.json → 回到第 6 步（缓存让返工很快）。

### 11. 交付 → 读 `references/publish-template.md`
写 `output/publish.md`：每个平台的标题（3 选 1）、简介、话题标签、合集名、封面对应关系、下集预告。
回复用户：成片/封面路径（附件）、时长、钩子方案一句话、需要用户亲自确认的事（完整看一遍、听混音、授权、发布）。**不替用户发布。**

## 电视剧/连载
每集一个项目目录；第 1 集定好 `account / warning / voice / fit / subtitle` 后复制到后续集保持统一。`episode_tag` 递增；每集结尾钩到下一集开头；合集名固定。超过 15 分钟的单集可拆两期，或两集合一出"合集版"（收藏率高、互动低）。

## 常见问题
- 画面和解说对不上：clips 太短会被自动延长最后一段，听起来像"说 A 放 B"——补 clips 或拆句。
- 字幕太长被换屏太快：调 `subtitle.max_chars`（横屏 14，竖屏阅读感更好可 12）。
- 原片是 4:3：`fit: blur`。原片带硬字幕会和解说字幕重叠：设 `"subtitle": {"box": true}` 给字幕加底框盖住，或换素材。
- 某句配音读错多音字：改写同义词，或在文本中用同音字替换。
- VoxCPM2 / OmniVoice 批处理中断：已完成小句已逐条缓存，直接重跑 `$FRS voice --work work`（或 `tts`）会跳过已完成部分继续。
- edge-tts 报错：网络问题，重跑即可（有重试和缓存）。

## 文件
- `references/hit-formula.md` 爆款写稿公式 + 三条样片时间码
- `references/script-styles.md` 口播文案风格卡（A/B/C）+ 新增风格与参考账号取样方法
- `references/film-selection.md` 选片评分表与分集
- `references/script-schema.md` script.json 字段说明 + 完整示例
- `references/publish-template.md` 各平台发布文案模板
- `references/editing-craft.md` 剪辑手感清单：声音淡入淡出、镜头长度、段落过渡（写 script.json 和定镜头窗口前必读）
- 试跑样例：活死人之夜（1968 公版）2 分钟版，结构可参考 `references/script-schema.md` 示例

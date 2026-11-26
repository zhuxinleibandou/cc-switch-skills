# script.json 字段说明

script.json 既是解说稿也是剪辑工程。时间可写秒数（`5515.6`）或 `"mm:ss"` / `"h:mm:ss"`，都指**原片**时间。

## 顶层

| 字段 | 必填 | 说明 |
|---|---|---|
| film | ✓ | 片名（含原名/年份） |
| title | ✓ | 本期标题（竖屏标题与封面的默认值） |
| hook_type | | 结局前置 / 高潮前置 / IP前传 |
| target_minutes | | 目标时长，lint 偏差 >20% 会警告 |
| account | | 左上水印，如 `@xx解说` |
| warning | | 右上提示语，如 `内含恐怖元素 请谨慎观看` |
| fit | | auto（默认）/ fill / letterbox / blur |
| sentence_gap | 0.70 | 句末标点（。！？…）后的停顿秒数，`frs voice` 与 `frs tts` 都读。用户定标 0.6–0.8s |
| comma_gap | 0.25 | 逗号类标点（，、；：）后的停顿秒数。用户定标 0.2–0.3s；`frs tts` 下填 0 表示逗号不切 |
| ref_audio | | 参考音色 wav。`frs voice` 默认 `voices/my_voice_voxcpm.wav`（VoxCPM2 无需参考文本） |
| tts_backend / voice / speed / ref_text | | 仅旧链路 `frs tts` 用：默认 `omnivoice`（`voice: "my_voice"`、`speed: 1.25`，使用 `voices/my_voice_read.wav`）；若 `voice` 写 `zh-CN-*` 或 `tts_backend: "edge"` 则走 edge-tts（配合 `rate` / `pitch`）。VoxCPM2 没有语速参数 |
| subtitle | | `{size:62, max_chars:13, duck:0.12, box:false, orig_box:false, orig_sub:false, mask_bottom:140, y_bottom:1038}`：字号、每屏最多字数、解说时原声音量、解说字幕加底框、原声字幕加底框、是否渲染原声叠加字幕（带硬字幕原片设 `false` 直接保留原片自带双语字幕）、解说段底部暗化毛玻璃遮罩高度（px）、字幕基线 Y 坐标（`1038` 时居中于 140px 遮罩带） |
| vertical_title | | 竖屏顶部标题，数组每项一行（≤10 字） |
| title_keywords | | 竖屏标题中黄色高亮的词 |
| episode_tag | | 红色标签，如 `第1集` |
| vertical_crop | | 竖屏从横屏中间裁多宽（默认 1440，宽银幕可 1920） |
| bgm | | `{file:"/abs/path.mp3", volume:0.08}` 全片垫乐 |
| cover | | `{frame, frame2, title:[两行], keywords:[], tag}` |
| source | | 覆盖 prep 记录的原片路径（一般不用） |
| segments | ✓ | 段落数组，按播放顺序 |

## 段落

**解说段**
```json
{"type":"narration","beat":"cold_open","text":"……","keywords":["一枪爆头"],
 "clips":[[5515.6,5520.8],[5571.6,5573.8]], "pause":0.15, "duck":0.12, "speed":1.25, "voice":"…", "rate":"…"}
```
- 时长由配音决定（0.05 秒前导 + 语音 + pause）；clips 按顺序拼接填满，不够时自动延长最后一段，多了截断。
- 一段 1–3 句、15–60 字最好剪；clips 跟着句子内容走（声画对位）。
- keywords 必须是 text 里出现的词。

**原声段**
```json
{"type":"original","beat":"turn","src":[428.2,434.7],"sub":"他们来抓你了 芭芭拉","volume":1.0}
```
- 原片画面 + 原声满音量；单段 3–15 秒。若原片已自带清晰双语硬字幕，顶层 `subtitle.orig_sub` 设为 `false`，原声段不叠加任何文案，直接保留原片字幕；无硬字幕原片再保持 `orig_sub: true` 并填写 `sub` 中文翻译字幕。

**beat 取值**：cold_open / title / setup / turn / escalate / ending（lint 用来检查结构，timeline.json 和 YouTube 章节也用它）。

## 完整示例（试跑：活死人之夜 1968，2 分钟版，结局前置）

```json
{
  "film": "活死人之夜（Night of the Living Dead, 1968，公版）",
  "title": "熬过一整夜活死人围攻，天亮却被一枪爆头",
  "hook_type": "结局前置", "target_minutes": 2,
  "account": "@测试解说号", "warning": "内含恐怖元素 请谨慎观看",
  "fit": "auto", "voice": "zh-CN-YunxiNeural", "rate": "+10%",
  "subtitle": {"size": 60, "max_chars": 14, "duck": 0.12},
  "vertical_title": ["熬过一整夜活死人围攻", "天亮却被一枪爆头"],
  "title_keywords": ["活死人", "一枪爆头"], "episode_tag": "第1集",
  "cover": {"frame": 5572.5, "frame2": 5584.5, "title": ["熬过一夜活死人围攻", "天亮却被一枪爆头"], "keywords": ["活死人", "一枪爆头"], "tag": "第1集"},
  "segments": [
    {"type": "narration", "beat": "cold_open", "text": "他熬过了一整夜的活死人围攻，却在天亮时被救援队一枪爆头。", "keywords": ["一枪爆头"], "clips": [[5515.6, 5520.8], [5571.6, 5573.8]]},
    {"type": "narration", "beat": "cold_open", "text": "天刚亮，地窖里只剩他一个活人。屋外终于传来了人声和狗叫。", "keywords": ["一个活人"], "clips": [[5525.3, 5532.3], [5548.2, 5555.0]]},
    {"type": "narration", "beat": "cold_open", "text": "他以为救兵到了，悄悄爬上楼，凑到窗边想看个清楚。", "clips": [[5561.0, 5571.5]]},
    {"type": "original", "beat": "cold_open", "src": [5573.9, 5586.4], "sub": "瞄准脑袋 正中眉心……打得好 死透了"},
    {"type": "narration", "beat": "cold_open", "text": "可在这群人眼里，他和屋外那些行尸走肉，没有任何区别。尸体被铁钩拖走，扔进了火堆。", "keywords": ["行尸走肉"], "clips": [[5600.0, 5612.0]]},
    {"type": "narration", "beat": "title", "text": "这就是被誉为现代丧尸片鼻祖的《活死人之夜》。", "keywords": ["活死人之夜"], "clips": [[92.0, 99.0]]},
    {"type": "narration", "beat": "title", "text": "一夜之间，死人纷纷从坟墓里爬了出来。他们不会说话，只会扑向活人撕咬，唯一的弱点，是脑袋。", "keywords": ["脑袋"], "clips": [[564.0, 571.0], [378.6, 382.0]]},
    {"type": "narration", "beat": "setup", "text": "而这一切，要从一次普通的扫墓说起。……", "clips": [[130.0, 137.0], [247.5, 256.0]]},
    {"type": "original", "beat": "setup", "src": [360.8, 367.4], "sub": "他们来抓你了 芭芭拉"},
    {"type": "narration", "beat": "turn", "text": "可就在这时，远处一个摇摇晃晃的男人，真的朝他们走了过来。", "clips": [[382.1, 390.6]]},
    {"type": "narration", "beat": "ending", "text": "她一路逃进一座荒废的农舍，可屋里，正等着她的又是什么？那个被一枪爆头的男人，又是从哪来的？我们下期再见。", "keywords": ["农舍", "一枪爆头"], "clips": [[586.9, 592.8], [608.0, 620.0], [776.0, 782.0]]}
  ]
}
```

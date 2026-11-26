---
name: easyedit
description: Make a movie fan edit with easyedit - the film's best speech with animated word-by-word captions, then a beat-cut montage and a black-and-white title shot. Use when the user says "/easyedit movie", "make an edit of a movie", "fan edit", "movie edit", or wants another easyedit video.
---

# easyedit

easyedit is installed at `/Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit`. Run it with `/Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit/run-python`.
Read `/Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit/AGENTS.md` before your first edit in a session. It has the whole workflow, and it's short.

## Choose the edit before building

When the user gives only a movie name, collect preferences before downloading footage or building an edit. Ask in Chinese, using a compact selectable questionnaire when the host supports it; otherwise show a numbered menu. Group related choices to avoid a long sequence of questions. Offer a recommendation based on the movie and preserve choices already supplied. If the title is ambiguous, clarify the film/year first.

Offer these choices, with custom answers allowed:

- 风格：高燃热血、情绪共鸣、史诗震撼、悬疑压迫；recommend one for this movie.
- 成片总时长（约）：30 秒、45 秒、60 秒、自定义。These are whole-video targets, not montage lengths.
- 剪辑重点：经典台词＋高光镜头（default）、指定人物／主题。Ask for the person/theme only when selected.
- 音乐：按风格推荐（default）、用户指定歌曲或本地文件。
- 字幕：原声语言逐词字幕（default）、中文字幕／中英双语（requires translation and caption adaptation, not a built-in switch）。
- 素材：自动搜索（default）、用户本地素材／指定链接。
- 画幅：16:9 横屏（native default）、9:16 竖屏（requires additional crop/layout adaptation）。
- 输出：先出 30fps 草稿（recommended）、直接出 60fps 成片。

Do not treat silence as a selection. The user may say “按推荐来” to accept recommendations. Once choices are sufficient, briefly recap them and proceed without a second approval. If only a title was given and no preferences have been answered, keep the questions pending.

## Apply the selected preferences

- Style and focus are creative directions for music, palette and shot curation; there is no `--style` CLI flag. Adjust `plan.json` and curate shots to implement them.
- `--montage-length` controls only beat-cut footage. After the quote is selected, account for speech with its lead/tail and the final `--hero-length` shot, then choose the montage length for the requested whole-video duration. Inspect the actual timeline; beat alignment can shift duration. Do not promise exact seconds before checking.
- Map music and source selections to `--music`, `--speech`, and repeated `--montage` flags. `--language` is the spoken language, not a translation switch.
- Use `--draft` for the requested draft or `--fps 60` for final output. Keep chosen source, language and timing flags consistent across build and render.
- Explain the extra adaptation needed if translated/bilingual subtitles or portrait output are selected; do not pass invented flags or silently substitute the native output. Implement and verify that adaptation before claiming it works.

## Make an edit

1. `cd /Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit` and run `/Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit/run-python -m easyedit.doctor`. Fix anything marked XX.
2. Build without rendering: `/Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit/run-python -m easyedit "<Movie>" --no-render`.
3. Check it before you spend ~10 minutes on the render, as described in AGENTS.md:
   - Run `/Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit/run-python -m easyedit.sheet "<Movie>"` and read `qa/report.txt` (text, cheap) - it covers the quote and
     every shot with flags, plus a ready-made draft at `qa/suggest-curate.json`. If `source: heuristic`, the AI
     writer was unavailable, so choose the quote yourself.
   - Look at `qa/candidates.jpg` and `qa/footage.jpg` only when the text leaves doubt. Exclude text cards,
     repeats and badly cropped shots. Pin a sequence that builds, and pick the hero shot in `curate.json`
     (start from the suggested draft).
4. Render: `/Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit/run-python -m easyedit "<Movie>"` (same flags as the build), then `/Users/zhuxinlei/Documents/Codex/2026-11-09/p/easyedit/run-python -m easyedit.sheet "<Movie>" --final`
   and look at the stills.
5. Give the user the path `jobs/<slug>/<slug>.mp4`.

If the easyedit web UI is running (`http://127.0.0.1:4331`), you can also start jobs with
`POST /api/new {"movie": "..."}` and watch `GET /api/jobs`.

"""阶段 2：素材准备。把原片拆成 Agent 能"看"的东西。

产出（work_dir/prep/）：
  meta.json          时长、分辨率、帧率、是否有黑边
  audio16k.wav       16k 单声道音频
  dialogue.srt       原片对白转写（mlx-whisper，本地）
  scenes.json        镜头切换时间点（ffmpeg 场景检测，估算）
  sheets/sheet_XX.jpg  联系表：每 N 秒一帧，每张 6x5=30 帧，帧上印时间码
  source_index.md    按联系表分段：图 + 该时段对白，供 Agent 逐段观看
用法：
  frs prep <原片> --work <工作目录> [--every 10] [--lang en|zh|ja|ko|auto] [--no-asr]
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from lib import die, duration, ensure_dir, ffprobe_json, font, log, mmss, run, save_json, which

COLS, ROWS = 6, 5


def detect_crop(src: str, dur: float) -> str | None:
    samples = [dur * f for f in (0.2, 0.4, 0.6, 0.8)]
    crops = []
    for t in samples:
        r = run([which("ffmpeg"), "-hide_banner", "-ss", f"{t:.1f}", "-i", src, "-t", "2", "-vf", "cropdetect=24:2:0",
                 "-f", "null", "-"], check=False)
        m = re.findall(r"crop=(\d+:\d+:\d+:\d+)", r.stderr)
        if m:
            crops.append(m[-1])
    if not crops:
        return None
    return max(set(crops), key=crops.count)


def transcribe(wav: Path, out_dir: Path, lang: str) -> Path | None:
    uvx = which("uvx")
    cmd = [uvx, "--python", "3.12", "--from", "mlx-whisper", "mlx_whisper", str(wav),
           "--model", "mlx-community/whisper-large-v3-turbo", "--output-format", "srt",
           "--output-dir", str(out_dir), "--condition-on-previous-text", "False"]
    if lang != "auto":
        cmd += ["--language", lang]
    log("  转写原片对白（本地 whisper，长片需要几分钟）…")
    r = subprocess.run(cmd, capture_output=True, text=True)
    srt = out_dir / (wav.stem + ".srt")
    if r.returncode != 0 or not srt.exists():
        log("  [警告] 转写失败，继续（只用画面）：" + "\n".join(r.stderr.splitlines()[-5:]))
        return None
    final = out_dir / "dialogue.srt"
    srt.replace(final)
    return final


def parse_srt(path: Path) -> list[tuple[float, float, str]]:
    items = []
    text = path.read_text(encoding="utf-8", errors="ignore")
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = block.strip().splitlines()
        if len(lines) < 2:
            continue
        m = re.match(r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)", lines[1] if "-->" in lines[1] else lines[0])
        if not m:
            continue
        g = list(map(int, m.groups()))
        a = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000
        b = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000
        body = " ".join(lines[2:] if "-->" in lines[1] else lines[1:]).strip()
        items.append((a, b, body))
    # 去掉 whisper 幻听：连续 3 条以上完全相同的句子只保留 1 条并标注
    cleaned = []
    for it in items:
        if len(cleaned) >= 2 and cleaned[-1][2] == it[2] == cleaned[-2][2].replace(" [重复]", ""):
            if not cleaned[-1][2].endswith("[重复]"):
                cleaned[-1] = (cleaned[-1][0], it[1], cleaned[-1][2] + " [重复]")
            else:
                cleaned[-1] = (cleaned[-1][0], it[1], cleaned[-1][2])
            continue
        cleaned.append(it)
    return cleaned


def scenes(src: str) -> list[float]:
    r = run([which("ffmpeg"), "-hide_banner", "-i", src, "-vf", "select='gt(scene\\,0.25)',metadata=print:file=-",
             "-an", "-f", "null", "-"], check=False)
    ts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", r.stdout)]
    return sorted(ts)


def contact_sheets(src: str, dur: float, every: float, out: Path) -> list[tuple[Path, float, float]]:
    from PIL import Image, ImageDraw
    tmp = Path(tempfile.mkdtemp(prefix="frs_frames_"))
    run([which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-i", src, "-vf",
         f"fps=1/{every},scale=384:-2", "-q:v", "4", str(tmp / "f_%05d.jpg")])
    frames = sorted(tmp.glob("f_*.jpg"))
    if not frames:
        die("没有抽到帧")
    fw, fh = Image.open(frames[0]).size
    per = COLS * ROWS
    sheets = []
    f_lbl = font(22)
    for si in range(0, len(frames), per):
        group = frames[si:si + per]
        sheet = Image.new("RGB", (COLS * fw, ROWS * fh), "black")
        d = ImageDraw.Draw(sheet)
        for k, fp in enumerate(group):
            t = (si + k) * every + every / 2  # fps 滤镜取每个区间中点附近
            x, y = (k % COLS) * fw, (k // COLS) * fh
            sheet.paste(Image.open(fp), (x, y))
            lbl = mmss((si + k) * every)
            d.rectangle([x, y, x + 78, y + 28], fill=(0, 0, 0))
            d.text((x + 5, y + 2), lbl, font=f_lbl, fill=(255, 220, 0))
        idx = si // per + 1
        p = out / f"sheet_{idx:02d}.jpg"
        sheet.save(p, quality=82)
        sheets.append((p, si * every, min(dur, (si + len(group)) * every)))
    shutil.rmtree(tmp, ignore_errors=True)
    return sheets


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--work", required=True)
    ap.add_argument("--every", type=float, default=10.0, help="联系表抽帧间隔秒数")
    ap.add_argument("--lang", default="auto")
    ap.add_argument("--no-asr", action="store_true")
    a = ap.parse_args()

    src = str(Path(a.video).resolve())
    if not Path(src).exists():
        die(f"原片不存在: {src}")
    prep = ensure_dir(Path(a.work) / "prep")
    sheets_dir = ensure_dir(prep / "sheets")

    info = ffprobe_json(src)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    if not v:
        die("原片没有视频流")
    has_audio = any(s["codec_type"] == "audio" for s in info["streams"])
    dur = float(info["format"]["duration"])
    num, den = (v.get("r_frame_rate") or "30/1").split("/")
    meta = {"source": src, "duration": dur, "width": v["width"], "height": v["height"],
            "fps": round(float(num) / float(den or 1), 3), "has_audio": has_audio}
    log(f"原片 {mmss(dur)}  {v['width']}x{v['height']}  {meta['fps']}fps  音频:{has_audio}")
    meta["crop"] = detect_crop(src, dur)
    log(f"  黑边检测 crop={meta['crop']}")
    save_json(prep / "meta.json", meta)

    dialogue = []
    if has_audio and not a.no_asr:
        wav = prep / "audio16k.wav"
        if not wav.exists():
            run([which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", str(wav)])
        srt = prep / "dialogue.srt"
        if not srt.exists():
            srt = transcribe(wav, prep, a.lang)
        if srt and srt.exists():
            dialogue = parse_srt(srt)
            log(f"  对白 {len(dialogue)} 条")

    sc_path = prep / "scenes.json"
    if not sc_path.exists():
        log("  场景检测…")
        sc = scenes(src)
        save_json(sc_path, sc)
    else:
        from lib import load_json
        sc = load_json(sc_path)
    log(f"  镜头切换（估算）{len(sc)} 个，平均 {dur / max(1, len(sc) + 1):.1f} 秒/镜")

    log("  生成联系表…")
    for old in sheets_dir.glob("*.jpg"):
        old.unlink()
    sheets = contact_sheets(src, dur, a.every, sheets_dir)

    lines = [f"# 原片索引：{Path(src).name}", "",
             f"- 时长 {mmss(dur)}，{v['width']}x{v['height']}，{meta['fps']}fps，黑边 crop={meta['crop']}",
             f"- 联系表每 {a.every:g} 秒一帧，帧左上角为该帧时间码（分:秒）",
             f"- 对白为自动转写，标 [重复] 的多为识别幻听", ""]
    for p, t0, t1 in sheets:
        lines += [f"## {mmss(t0)}–{mmss(t1)}", f"![]({p.relative_to(prep)})", ""]
        seg = [d for d in dialogue if t0 <= d[0] < t1]
        for s, e, txt in seg:
            lines.append(f"- [{s:.1f}–{e:.1f}] {txt}")
        lines.append("")
    (prep / "source_index.md").write_text("\n".join(lines), encoding="utf-8")
    log(f"完成：{prep / 'source_index.md'}（{len(sheets)} 张联系表）")


if __name__ == "__main__":
    main()

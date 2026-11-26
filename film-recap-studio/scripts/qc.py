"""阶段 9：成片质检。机器能查的先查掉，再由人/Agent 看片。

检查：规格、时长、响度、长静音、黑场、字幕与时间线一致；出成片联系表供目检。
产出 output/qc_<文件名>.md、output/qc_<文件名>_XX.jpg
用法：frs qc --work <工作目录> [--file output/master_16x9.mp4]
"""
from __future__ import annotations

import argparse
import re
import shutil
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

from lib import duration, ffprobe_json, font, load_json, log, mmss, run, which


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--file")
    ap.add_argument("--every", type=float, default=15)
    a = ap.parse_args()
    work = Path(a.work)
    outd = work / "output"
    f = Path(a.file) if a.file else outd / "master_16x9.mp4"
    info = ffprobe_json(f)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    au = [s for s in info["streams"] if s["codec_type"] == "audio"]
    dur = float(info["format"]["duration"])
    rows = [f"# 成片质检：{f.name}", "", f"- 规格：{v['width']}x{v['height']}，{v['r_frame_rate']}，{v['codec_name']}，音轨 {len(au)} 条",
            f"- 时长：{mmss(dur)}（{dur:.1f}s），文件 {f.stat().st_size / 1e6:.1f} MB"]
    issues = []

    r = run([which("ffmpeg"), "-hide_banner", "-nostats", "-i", str(f), "-af", "ebur128=peak=true", "-f", "null", "-"], check=False)
    m_i = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    m_tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r.stderr)
    if m_i:
        li = float(m_i[-1])
        rows.append(f"- 响度：{li} LUFS，真峰值 {m_tp[-1] if m_tp else '?'} dBFS（目标 -16±2 LUFS）")
        if abs(li + 16) > 2:
            issues.append(f"响度 {li} LUFS 偏离 -16")

    r = run([which("ffmpeg"), "-hide_banner", "-nostats", "-i", str(f), "-af", "silencedetect=n=-45dB:d=2.5", "-f", "null", "-"], check=False)
    sil = [(float(s), float(d)) for s, d in re.findall(r"silence_end: ([\d.]+) \| silence_duration: ([\d.]+)", r.stderr)]
    if sil:
        issues += [f"{mmss(e - d)} 起静音 {d:.1f}s" for e, d in sil]
    r = run([which("ffmpeg"), "-hide_banner", "-nostats", "-i", str(f), "-vf", "blackdetect=d=1.0:pic_th=0.95", "-an", "-f", "null", "-"], check=False)
    blk = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", r.stderr)
    issues += [f"{mmss(float(s))} 起黑场 {float(e) - float(s):.1f}s" for s, e in blk]

    tl = outd / "timeline.json"
    if tl.exists() and f.name.startswith("master"):
        t = load_json(tl)
        if abs(t[-1]["end"] - dur) > 1.0:
            issues.append(f"时间线总长 {t[-1]['end']:.1f}s 与成片 {dur:.1f}s 不一致")

    tmp = Path(tempfile.mkdtemp())
    run([which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-i", str(f), "-vf", f"fps=1/{a.every},scale=480:-2", "-q:v", "4", str(tmp / "q_%04d.jpg")])
    frames = sorted(tmp.glob("q_*.jpg"))
    sheets = []
    if frames:
        fw, fh = Image.open(frames[0]).size
        cols, rws = 5, 6
        for si in range(0, len(frames), cols * rws):
            g = frames[si:si + cols * rws]
            sh = Image.new("RGB", (cols * fw, rws * fh))
            d = ImageDraw.Draw(sh)
            for k, p in enumerate(g):
                x, y = k % cols * fw, k // cols * fh
                sh.paste(Image.open(p), (x, y))
                d.rectangle([x, y, x + 80, y + 28], fill=(0, 0, 0))
                d.text((x + 5, y + 2), mmss((si + k) * a.every), font=font(22), fill=(255, 220, 0))
            sp = outd / f"qc_{f.stem}_{si // (cols * rws) + 1:02d}.jpg"
            sh.save(sp, quality=80)
            sheets.append(sp)
    shutil.rmtree(tmp, ignore_errors=True)

    rows += ["", "## 机器发现的问题", *(f"- {x}" for x in issues or ["无"]), "", "## 成片联系表（每 %g 秒一帧）" % a.every,
             *(f"![]({p.name})" for p in sheets), "",
             "## 必须人工看的（机器替代不了）",
             "- [ ] 正常速度看完开头 3 分钟：第一句是否抓人、冷开场是否讲成一个完整小故事",
             "- [ ] 解说说到的动作，画面是不是正在发生（声画对位）",
             "- [ ] 每处原声留白是否完整、有没有半句对白被切断",
             "- [ ] 只听声音一遍：解说是否一句一停、太碎",
             "- [ ] 结尾停在悬念上 + 追更话术",
             "- [ ] 竖屏版标题是否被遮挡、封面在手机上是否看得清"]
    (outd / f"qc_{f.stem}.md").write_text("\n".join(rows), encoding="utf-8")
    log("\n".join(rows[:6]))
    log(f"问题 {len(issues)} 条；报告：{outd / f'qc_{f.stem}.md'}")


if __name__ == "__main__":
    main()

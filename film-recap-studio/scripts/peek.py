"""细看原片某一段：按秒抽帧拼成一张图，并列出该段对白和镜头切点，用于精确定入点/出点。
用法：frs peek --work <工作目录> --start 92:40 --end 93:10 [--every 1]
产出：work_dir/prep/peek_<start>_<end>.jpg
"""
from __future__ import annotations

import argparse
import math
import shutil
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

from lib import font, load_json, log, run, which
from prep import parse_srt
from render import t2s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--start", required=True)
    ap.add_argument("--end", required=True)
    ap.add_argument("--every", type=float, default=1.0)
    a = ap.parse_args()
    work = Path(a.work)
    meta = load_json(work / "prep" / "meta.json")
    s, e = t2s(a.start), t2s(a.end)
    tmp = Path(tempfile.mkdtemp())
    run([which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-ss", f"{s}", "-t", f"{e - s}", "-i", meta["source"],
         "-vf", f"fps=1/{a.every},scale=320:-2", "-q:v", "4", str(tmp / "p_%04d.jpg")])
    frames = sorted(tmp.glob("p_*.jpg"))
    cols = 8
    fw, fh = Image.open(frames[0]).size
    rows = math.ceil(len(frames) / cols)
    sheet = Image.new("RGB", (cols * fw, rows * fh))
    d = ImageDraw.Draw(sheet)
    for k, p in enumerate(frames):
        x, y = k % cols * fw, k // cols * fh
        sheet.paste(Image.open(p), (x, y))
        t = s + k * a.every
        lbl = f"{int(t // 60)}:{t % 60:04.1f}"
        d.rectangle([x, y, x + 96, y + 24], fill=(0, 0, 0))
        d.text((x + 4, y + 1), lbl, font=font(19), fill=(255, 220, 0))
    out = work / "prep" / f"peek_{int(s)}_{int(e)}.jpg"
    sheet.save(out, quality=82)
    shutil.rmtree(tmp, ignore_errors=True)
    log(f"图：{out}（每格 {a.every:g} 秒，格内时间为 分:秒，原片绝对时间 = 秒数）")
    sc = [x for x in load_json(work / "prep" / "scenes.json") if s <= x <= e]
    log("镜头切点：" + ", ".join(f"{x:.2f}" for x in sc))
    srt = work / "prep" / "dialogue.srt"
    if srt.exists():
        for a0, b0, txt in parse_srt(srt):
            if s - 1 <= a0 <= e:
                log(f"  [{a0:.1f}–{b0:.1f}] {txt}")


if __name__ == "__main__":
    main()

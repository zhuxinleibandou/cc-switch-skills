"""阶段 8：封面。从原片取一帧（或给一张图），叠大字标题，出三种比例。

  cover_16x9.jpg 1920x1080  西瓜 / YouTube / 抖音横屏
  cover_3x4.jpg  1080x1440  抖音 / 视频号 / 小红书 信息流
  cover_9x16.jpg 1080x1920  竖屏版封面
用法：
  frs cover --work <工作目录> --frame 01:23:45.5 [--frame2 12:30]
           [--title "为了防男友劈腿|她劈掉了他的双腿"] [--keywords 劈腿,双腿] [--tag 第1集]
  标题用 | 分行；不传则读 script.json 的 cover 字段：
  "cover": {"frame": "12:30", "title": ["第一行", "第二行"], "keywords": [...], "tag": "第1集"}
"""
from __future__ import annotations

import argparse
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

from lib import die, ensure_dir, load_json, log, run, which
from render import t2s
from textimg import RED, WHITE, draw_rich


def grab(src: str, t: float, crop: str | None) -> Image.Image:
    tmp = Path(tempfile.mkdtemp()) / "f.png"
    vf = f"crop={crop}" if crop else "null"
    run([which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", vf, str(tmp)])
    return Image.open(tmp).convert("RGB")


def cover_fit(img: Image.Image, w: int, h: int) -> Image.Image:
    r = max(w / img.width, h / img.height)
    im = img.resize((int(img.width * r + 0.5), int(img.height * r + 0.5)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def compose(img: Image.Image, w: int, h: int, lines, kws, tag, img2=None) -> Image.Image:
    if img2 is not None:  # 双图：上下（竖）或左右（横）分屏，制造对比
        if h > w:
            a, b = cover_fit(img, w, h // 2), cover_fit(img2, w, h - h // 2)
            base = Image.new("RGB", (w, h))
            base.paste(a, (0, 0)); base.paste(b, (0, h // 2))
        else:
            a, b = cover_fit(img, w // 2, h), cover_fit(img2, w - w // 2, h)
            base = Image.new("RGB", (w, h))
            base.paste(a, (0, 0)); base.paste(b, (w // 2, 0))
    else:
        base = cover_fit(img, w, h)
    base = ImageEnhance.Contrast(base).enhance(1.12)
    base = ImageEnhance.Color(base).enhance(1.15)
    base = base.filter(ImageFilter.UnsharpMask(radius=2, percent=60))
    # 底部渐暗，保证字清楚
    grad = Image.new("L", (1, h))
    for y in range(h):
        grad.putpixel((0, y), int(max(0, (y - h * 0.45) / (h * 0.55)) * 215))
    shade = Image.new("RGB", (w, h), (0, 0, 0))
    base = Image.composite(shade, base, grad.resize((w, h)))
    d = ImageDraw.Draw(base)
    unit = min(w, h)
    longest = max(len(l) for l in lines)
    size = int(min(unit * 0.13, (w * 0.9) / max(longest, 1)))
    y = h - len(lines) * (size * 1.22) - unit * 0.07
    for ln in lines:
        draw_rich(d, ln, kws, w / 2, y, size, stroke=max(5, size // 11))
        y += size * 1.22
    if tag:
        f_size = int(unit * 0.055)
        from lib import font
        f = font(f_size)
        tw = f.getlength(tag)
        x0, y0 = unit * 0.05, unit * 0.05
        d.rounded_rectangle([x0, y0, x0 + tw + f_size, y0 + f_size * 1.5], radius=f_size // 4, fill=RED)
        d.text((x0 + f_size / 2, y0 + f_size * 0.2), tag, font=f, fill=WHITE)
    return base


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--frame")
    ap.add_argument("--frame2")
    ap.add_argument("--image")
    ap.add_argument("--title")
    ap.add_argument("--keywords")
    ap.add_argument("--tag")
    a = ap.parse_args()
    work = Path(a.work)
    meta = load_json(work / "prep" / "meta.json")
    script = load_json(work / "script.json") if (work / "script.json").exists() else {}
    cfg = script.get("cover", {})
    lines = a.title.split("|") if a.title else cfg.get("title") or [script.get("title", "")]
    kws = a.keywords.split(",") if a.keywords else cfg.get("keywords", script.get("title_keywords", []))
    tag = a.tag or cfg.get("tag") or script.get("episode_tag")
    frame = a.frame or cfg.get("frame")
    frame2 = a.frame2 or cfg.get("frame2")
    if a.image:
        img = Image.open(a.image).convert("RGB")
    elif frame is not None:
        img = grab(meta["source"], t2s(frame), meta.get("crop"))
    else:
        die("需要 --frame 时间码或 --image 图片")
    img2 = grab(meta["source"], t2s(frame2), meta.get("crop")) if frame2 else None
    outd = ensure_dir(work / "output")
    for name, (w, h) in {"cover_16x9.jpg": (1920, 1080), "cover_3x4.jpg": (1080, 1440), "cover_9x16.jpg": (1080, 1920)}.items():
        compose(img, w, h, lines, kws, tag, img2).save(outd / name, quality=92)
        log(f"封面：{outd / name}")


if __name__ == "__main__":
    main()

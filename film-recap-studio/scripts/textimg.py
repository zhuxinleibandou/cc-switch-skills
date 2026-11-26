"""用 Pillow 画字幕、水印、竖屏标题、封面文字（本机 ffmpeg 没有字幕/文字滤镜）。"""
from __future__ import annotations

import re

from PIL import Image, ImageDraw

from lib import H, W, font

YELLOW = (255, 214, 0)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (230, 30, 40)


def runs(text: str, keywords: list[str]):
    """把一行切成 [(片段, 是否关键词)]。"""
    kws = sorted({k for k in (keywords or []) if k and k in text}, key=len, reverse=True)
    if not kws:
        return [(text, False)]
    pat = re.compile("(" + "|".join(map(re.escape, kws)) + ")")
    return [(p, p in kws) for p in pat.split(text) if p]


def draw_rich(draw: ImageDraw.ImageDraw, text: str, keywords, cx: float, y: float, size: int,
              color=WHITE, hl=YELLOW, stroke=None, align="center", bold=True):
    f = font(size, bold)
    stroke = max(2, size // 14) if stroke is None else stroke
    parts = runs(text, keywords)
    total = sum(f.getlength(p) for p, _ in parts)
    x = cx - total / 2 if align == "center" else cx
    for p, is_kw in parts:
        draw.text((x, y), p, font=f, fill=hl if is_kw else color, stroke_width=stroke, stroke_fill=BLACK)
        x += f.getlength(p)
    return total


def subtitle_png(path, text: str, keywords, size=60, box=False, y_bottom=None):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    y_bottom = y_bottom or H - 70
    y = y_bottom - size
    if box:
        f = font(size)
        tw = f.getlength(text)
        pad = 18
        d.rectangle([W / 2 - tw / 2 - pad * 2, y - pad, W / 2 + tw / 2 + pad * 2, y + size + pad], fill=(0, 0, 0, 150))
    draw_rich(d, text, keywords, W / 2, y - size * 0.12, size)
    img.save(path)


def brand_png(path, account: str | None, warning: str | None):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if account:
        f = font(30)
        d.text((48, 36), account, font=f, fill=(255, 255, 255, 170), stroke_width=2, stroke_fill=(0, 0, 0, 140))
    if warning:
        f = font(26)
        tw = f.getlength(warning)
        x1, y1 = W - 48 - tw - 28, 34
        d.rounded_rectangle([x1, y1, W - 48, y1 + 46], radius=8, fill=(0, 0, 0, 120))
        d.text((x1 + 14, y1 + 7), warning, font=f, fill=(255, 255, 255, 220))
    img.save(path)


def vertical_title_png(path, lines: list[str], keywords, tag: str | None = None):
    vw, vh = 1080, 1920
    img = Image.new("RGBA", (vw, vh), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    y = 230
    if tag:
        f = font(44)
        tw = f.getlength(tag)
        d.rounded_rectangle([vw / 2 - tw / 2 - 24, y - 90, vw / 2 + tw / 2 + 24, y - 24], radius=10, fill=RED)
        d.text((vw / 2 - tw / 2, y - 84), tag, font=f, fill=WHITE)
    for ln in lines:
        size = 84 if len(ln) <= 11 else max(56, int(84 * 11 / len(ln)))
        draw_rich(d, ln, keywords, vw / 2, y, size, stroke=6)
        y += size + 34
    img.save(path)

"""Shared helpers for film-recap-studio. Python 3.11+, stdlib + Pillow."""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

FONT_BOLD = ("/System/Library/Fonts/Hiragino Sans GB.ttc", 2)   # W6
FONT_REG = ("/System/Library/Fonts/Hiragino Sans GB.ttc", 0)    # W3
FONT_FALLBACK = ("/System/Library/Fonts/STHeiti Medium.ttc", 1)

W, H, FPS = 1920, 1080, 30
AR, AC = 48000, 2
VENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", str(FPS)]
AENC = ["-c:a", "aac", "-b:a", "192k", "-ar", str(AR), "-ac", str(AC)]


def die(msg: str, code: int = 2):
    print(f"[错误] {msg}", file=sys.stderr)
    sys.exit(code)


def log(msg: str):
    print(msg, flush=True)


def which(name: str) -> str:
    p = shutil.which(name)
    if not p:
        for cand in (f"/opt/homebrew/bin/{name}", f"/usr/local/bin/{name}", os.path.expanduser(f"~/.local/bin/{name}")):
            if os.path.exists(cand):
                return cand
        die(f"找不到 {name}")
    return p


def run(cmd: list[str], quiet: bool = True, check: bool = True) -> subprocess.CompletedProcess:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if check and r.returncode != 0:
        tail = "\n".join((r.stderr or "").splitlines()[-25:])
        die(f"命令失败: {' '.join(cmd[:6])} ...\n{tail}")
    if not quiet:
        print(r.stdout)
    return r


def ffprobe_json(path: str | Path) -> dict:
    r = run([which("ffprobe"), "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)])
    return json.loads(r.stdout)


def duration(path: str | Path) -> float:
    return float(ffprobe_json(path)["format"]["duration"])


def load_json(path: str | Path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str | Path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def font(size: int, bold: bool = True):
    from PIL import ImageFont
    for path, idx in ((FONT_BOLD if bold else FONT_REG), FONT_FALLBACK):
        try:
            return ImageFont.truetype(path, size, index=idx)
        except Exception:
            continue
    return ImageFont.load_default()


def hms(t: float) -> str:
    t = max(0, t)
    return f"{int(t // 3600):d}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def mmss(t: float) -> str:
    return f"{int(t // 60):02d}:{int(t % 60):02d}"


PUNCT_SPLIT = re.compile(r"([，。！？；：、…,.!?;:]+)")
STRIP_PUNCT = "，。！？；：、…,.!?;:“”\"' "


def split_subtitles(text: str, max_chars: int = 14) -> list[str]:
    """Split narration into short on-screen lines (punctuation dropped at line ends)."""
    parts = PUNCT_SPLIT.split(text)
    chunks: list[str] = []
    buf = ""
    for p in parts:
        if not p:
            continue
        if PUNCT_SPLIT.fullmatch(p):
            # keep ？！ so questions still read as questions
            keep = "".join(ch for ch in p if ch in "？！?!")
            buf += keep
            if buf.strip():
                chunks.append(buf.strip())
            buf = ""
        else:
            buf += p
    if buf.strip():
        chunks.append(buf.strip())
    out: list[str] = []
    for c in chunks:
        c = c.strip(STRIP_PUNCT.replace("？", "").replace("！", "")) or c
        if len(c) <= max_chars:
            out.append(c)
            continue
        n = -(-len(c) // max_chars)
        size = -(-len(c) // n)
        out.extend(c[i:i + size] for i in range(0, len(c), size))
    return [c for c in out if c]


def ensure_dir(p: str | Path) -> Path:
    p = Path(p)
    p.mkdir(parents=True, exist_ok=True)
    return p

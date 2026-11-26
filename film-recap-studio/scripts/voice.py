"""配音主流程（2026-11-25 定版）：VoxCPM2 按句合成 + 逗号停顿校准 + 固定句号停顿。

用法：frs voice --work work [--only 17,66] [--sentence-gap 0.70] [--comma-gap 0.25]

流程（每一步都可单独重跑，缓存按小句的文本+参数哈希计）：
  1. 把每段解说按句末标点（。！？…）切成小句，逗号不切——整句一起合成，语调才连贯。
  2. 调本机 VoxCPM2（独立 venv）逐句合成，参数见 PARAMS。
  3. 每个小句内部用 commafix 校准逗号停顿：转写定位逗号，把那里的静音统一替换成 comma_gap。
     只在小句内部做，所以绝不会碰到句号停顿。
  4. 修剪小句头尾静音后按 sentence_gap 拼接成段，句号停顿因此恒定。
  5. 写 work/tts/nar_XXX.wav 与 tts_meta.json，字段与 tts.py 一致，render.py 直接可用。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from lib import die, duration, ensure_dir, load_json, log, save_json, which
from tts import join_with_gap, split_chunks, split_sentences

SKILL_DIR = Path(__file__).resolve().parent.parent
VOX_HOME = Path(os.environ.get(
    "VOXCPM_HOME", "/Users/zhuxinlei/Documents/ChatGPT/本地项目工具集/voxcpm2-mcp")).expanduser()
DENOISER = Path(os.environ.get(
    "VOXCPM_DENOISER", "~/.cache/film-recap-narration/zipenhancer-16k")).expanduser()
DEFAULT_REF = SKILL_DIR / "voices" / "my_voice_voxcpm.wav"
SENT_GAP = 0.70   # 句号/问号/叹号后的停顿，实测 0.73–0.77s
COMMA_GAP = 0.25  # 逗号/顿号/分号/冒号后的停顿，实测中位 0.26s
UV = os.path.expanduser("~/.local/bin/uv")


def vox_python() -> Path:
    p = VOX_HOME / ".venv" / "bin" / "python"
    if not p.is_file():
        die(f"找不到本机 VoxCPM2 环境：{p}（可用 VOXCPM_HOME 指定）")
    return p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--only", help="只重做这些段，逗号分隔，如 17,66")
    ap.add_argument("--ref-audio", help="参考音色 wav，默认 voices/my_voice_voxcpm.wav")
    ap.add_argument("--sentence-gap", type=float)
    ap.add_argument("--comma-gap", type=float)
    a = ap.parse_args()

    work = Path(a.work).resolve()
    script = load_json(work / "script.json")
    sent_gap = a.sentence_gap if a.sentence_gap is not None else float(script.get("sentence_gap", SENT_GAP))
    comma_gap = a.comma_gap if a.comma_gap is not None else float(script.get("comma_gap", COMMA_GAP))
    only = {int(x) for x in a.only.split(",")} if a.only else None

    ref = Path(a.ref_audio or script.get("ref_audio") or DEFAULT_REF).expanduser()
    if not ref.is_file():
        die(f"找不到参考音色：{ref}")

    # 每段按句末标点切小句；逗号留在小句内部
    sdir = ensure_dir(work / "tts" / "sent")
    jobs, groups = [], {}
    for i, seg in enumerate(script["segments"]):
        if seg.get("type", "narration") != "narration":
            continue
        for s in split_sentences(seg["text"].strip()):
            jobs.append(s)
            groups.setdefault(i, []).append(len(jobs) - 1)
    log(f"解说 {len(groups)} 段，切成 {len(jobs)} 个小句；句号停顿 {sent_gap:.2f}s，逗号停顿 {comma_gap:.2f}s")

    # 1+2. VoxCPM2 合成：沿用 voxcpm2_tts.py，它自己按文本+参数哈希缓存
    vwork = ensure_dir(sdir / "_vox")
    ensure_dir(vwork / "prep")
    vref = vwork / "prep" / "ref_voice.wav"
    if not vref.is_file() or vref.read_bytes() != ref.read_bytes():
        vref.write_bytes(ref.read_bytes())
        (vwork / "prep" / "ref_voice_denoised.wav").unlink(missing_ok=True)
    save_json(vwork / "script.json", {"segments": [{"type": "narration", "text": t} for t in jobs]})
    r = subprocess.run([str(vox_python()), "-I", str(SKILL_DIR / "scripts" / "voxcpm2_tts.py"),
                        str(vwork), str(VOX_HOME / "models" / "VoxCPM2"), str(DENOISER)])
    if r.returncode != 0:
        die(f"VoxCPM2 合成失败（退出码 {r.returncode}），已完成的小句已缓存，可直接重跑")
    raw = [e["file"] for e in load_json(vwork / "tts" / "tts_meta.json")["segments"]]

    # 3. 逗号停顿校准：只对含逗号、且尚未校准的小句做
    fixed = ensure_dir(sdir / "fixed")
    # 缓存名直接沿用 VoxCPM2 的文件名（里面已含文本+参数哈希），改稿后不会误命中旧文件
    fixname = [f"{Path(f).stem}_c{comma_gap:.2f}.wav" for f in raw]
    todo = []
    for n, (text, f) in enumerate(zip(jobs, raw)):
        out = fixed / fixname[n]
        if out.exists():
            continue
        if not any(k == "comma" for _, k in split_chunks(text)):
            out.write_bytes((vwork / "tts" / f).read_bytes())
            continue
        todo.append({"index": n, "file": f, "text": text, "out": fixname[n]})
    if todo:
        save_json(sdir / "_fixjobs.json", todo)
        log(f"逗号停顿校准：{len(todo)} 个小句")
        r = subprocess.run([UV, "run", "--quiet", "--no-project", "--python", "3.12",
                            "--with", "mlx-whisper", "--with", "soundfile", "--with", "numpy",
                            "python", "-I", str(SKILL_DIR / "scripts" / "commafix.py"),
                            str(sdir / "_fixjobs.json"), str(vwork / "tts"), str(fixed),
                            f"{comma_gap}"])
        if r.returncode != 0:
            die("逗号停顿校准失败")
    # 汇总连读：这些逗号模型根本没停，不能靠脚本硬插（会切掉前字尾音或后字起音），
    # 只能改稿——把该逗号升级成句号，或改成不需要在那里停的写法。
    rpath = sdir / "_pause_report.json"
    if rpath.exists():
        allrep = json.loads(rpath.read_text(encoding="utf-8"))
        run_on = [(n, allrep[nm]["text"]) for n, nm in enumerate(fixname)
                  if nm in allrep and any("连读" in str(x) for x in allrep[nm]["report"])]
        if run_on:
            log(f"⚠ {len(run_on)} 处逗号被连读，建议改稿（详见 {rpath.name}）：")
            for n, t in sorted(run_on):
                log(f"   小句 {n}：{t}")

    # 4+5. 拼接成段并写 tts_meta.json
    tdir = work / "tts"
    meta = {"backend": "voxcpm2", "params": json.loads(
        (vwork / "tts" / "tts_meta.json").read_text(encoding="utf-8"))["params"],
        "reference": str(ref), "sentence_gap": sent_gap, "comma_gap": comma_gap, "segments": []}
    total = 0.0
    for i, seg in enumerate(script["segments"]):
        if seg.get("type", "narration") != "narration":
            meta["segments"].append(None)
            continue
        dst = tdir / f"nar_{i:03d}.wav"
        parts = [fixed / fixname[n] for n in groups[i]]
        newest = max((p.stat().st_mtime for p in parts), default=0)
        if only is None or i in only or not dst.exists() or dst.stat().st_mtime < newest:
            join_with_gap(parts, [sent_gap] * len(parts), dst)
        d = duration(dst)
        meta["segments"].append({"index": i, "file": dst.name, "text": seg["text"].strip(),
                                 "duration": round(d, 3)})
        total += d
    save_json(tdir / "tts_meta.json", meta)
    chars = sum(len(re.sub(r"\s", "", s["text"])) for s in script["segments"]
                if s.get("type", "narration") == "narration")
    log(f"完成：解说总时长 {total:.1f} 秒，{chars} 字，约 {chars/total:.1f} 字/秒")


if __name__ == "__main__":
    main()

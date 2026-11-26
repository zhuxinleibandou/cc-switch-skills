"""阶段 6：配音。逐段把 script.json 的解说词合成为语音。

支持两种后端：
- omnivoice（默认）：本机 Apple Silicon MPS 声音克隆，默认使用用户已确认的音色
  `voices/my_voice_read.wav`（speed=1.25），无需联网。
- edge：微软 edge-tts（免费、需联网），当 voice 为 `zh-CN-*` 等 Neural 音色或显式指定
  `--backend edge` 时自动使用。

产出 work_dir/tts/<hash>.wav（omnivoice）或 <hash>.mp3（edge）与 work_dir/tts/tts_meta.json。
文本/音色/语速不变的段落直接复用缓存，改稿后重跑只合成改动的句子。
用法：
  frs tts --work <工作目录>
  frs tts --work <工作目录> --backend omnivoice --speed 1.25 [--ref-audio <wav> --ref-text <文本>]
  frs tts --work <工作目录> --backend edge --voice zh-CN-YunxiNeural --rate +10%
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import os
import re
import subprocess
import tempfile
from pathlib import Path

from lib import die, duration, ensure_dir, load_json, log, save_json, which

SKILL_DIR = Path(__file__).resolve().parent.parent
DEFAULT_OMNI_PYTHON = Path.home() / "AI" / "OmniVoice" / ".venv" / "bin" / "python"
DEFAULT_REF_AUDIO = SKILL_DIR / "voices" / "my_voice_read.wav"
DEFAULT_REF_TEXT = SKILL_DIR / "voices" / "my_voice_read.txt"
DEFAULT_OMNI_SPEED = 1.25
DEFAULT_EDGE_VOICE = "zh-CN-YunxiNeural"


def is_edge_voice(voice: str | None) -> bool:
    if not voice:
        return False
    return "Neural" in voice or voice.startswith(("zh-", "en-", "ja-", "ko-"))


def file_sig(path: Path) -> str:
    h = hashlib.sha1()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()[:12]


def edge_key(text: str, voice: str, rate: str, pitch: str) -> str:
    return hashlib.sha1(f"edge|{voice}|{rate}|{pitch}|{text}".encode()).hexdigest()[:16]


def omni_key(
    text: str,
    ref_sig: str,
    ref_text: str,
    speed: float,
    language: str,
    num_step: int,
    guidance_scale: float,
    denoise: bool,
) -> str:
    raw = (
        f"omnivoice|{ref_sig}|{ref_text}|{speed:.3f}|{language}|"
        f"{num_step}|{guidance_scale:.2f}|{int(denoise)}|{text}"
    )
    return hashlib.sha1(raw.encode()).hexdigest()[:16]


async def synth_edge(text: str, voice: str, rate: str, pitch: str, out: Path, sem, retries: int = 4):
    import edge_tts
    async with sem:
        for i in range(retries):
            try:
                tmp = out.with_suffix(".part.mp3")
                await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(str(tmp))
                if tmp.stat().st_size < 1000:
                    raise RuntimeError("音频过小")
                tmp.replace(out)
                return
            except Exception as e:  # 网络抖动重试
                if i == retries - 1:
                    raise RuntimeError(f"配音失败：{text[:20]}… {e}")
                await asyncio.sleep(1.5 * (i + 1))


def resolve_ref(ref_audio_arg: str | None, ref_text_arg: str | None) -> tuple[Path, str]:
    ref_audio = Path(ref_audio_arg).expanduser() if ref_audio_arg else DEFAULT_REF_AUDIO
    if not ref_audio.is_file():
        die(f"找不到参考音色文件：{ref_audio}")
    if ref_text_arg is not None and ref_text_arg.strip():
        ref_text = ref_text_arg.strip()
    else:
        txt_path = ref_audio.with_suffix(".txt")
        if txt_path.is_file():
            ref_text = txt_path.read_text(encoding="utf-8").strip()
        elif ref_audio == DEFAULT_REF_AUDIO and DEFAULT_REF_TEXT.is_file():
            ref_text = DEFAULT_REF_TEXT.read_text(encoding="utf-8").strip()
        else:
            die(f"缺少参考音色文本：请提供 --ref-text 或创建 {txt_path}")
    if not ref_text:
        die(f"参考音色文本为空：{ref_audio}")
    return ref_audio.resolve(), ref_text


def resolve_backend(a, script: dict) -> str:
    if a.backend:
        return a.backend
    if a.ref_audio or a.ref_text:
        return "omnivoice"
    if a.voice:
        return "edge" if is_edge_voice(a.voice) else "omnivoice"
    if script.get("tts_backend"):
        return str(script["tts_backend"]).lower()
    if script.get("ref_audio"):
        return "omnivoice"
    sv = script.get("voice")
    if sv and is_edge_voice(str(sv)):
        return "edge"
    return "omnivoice"



SENT_END = "。！？!?…"
COMMA_MARKS = "，,、；;：:"
DEFAULT_SENT_GAP = 0.70   # 句号/问号/叹号后的净停顿（已修剪分句头尾静音）
DEFAULT_COMMA_GAP = 0.25  # 逗号/顿号/分号/冒号后的净停顿
EDGE_PAD = 0.05           # 整段头尾保留的静音
MIN_CHUNK_CHARS = 3       # 过短的逗号小句并入下一句，避免单字合成失真


def _core_len(t: str) -> int:
    return len(re.sub(r"[\s，,、；;：:。！？!?…“”\"'‘’（）()《》]", "", t))


def split_chunks(text: str, comma: bool = True) -> list[tuple[str, str]]:
    """切成 (小句, 停顿类型)，类型为 end / comma / last。标点留在小句末尾。"""
    out, buf = [], ""
    for ch in text:
        buf += ch
        if ch in SENT_END:
            out.append([buf.strip(), "end"]); buf = ""
        elif comma and ch in COMMA_MARKS:
            out.append([buf.strip(), "comma"]); buf = ""
    if buf.strip():
        out.append([buf.strip(), "end"])
    # 收尾引号等残片并入前一句
    merged = []
    for t, k in out:
        if merged and _core_len(t) == 0:
            merged[-1][0] += t; merged[-1][1] = k
        else:
            merged.append([t, k])
    # 过短的逗号小句并入后一句（保留逗号，合成时自然带短停）
    res = []
    carry = ""
    for t, k in merged:
        t = carry + t; carry = ""
        if k == "comma" and _core_len(t) < MIN_CHUNK_CHARS:
            carry = t
            continue
        res.append([t, k])
    if carry:
        if res:
            res[-1][0] += carry
        else:
            res.append([carry, "end"])
    # 过短的句末小句（如「没事。」）并回前一个逗号小句，单独合成容易读走样
    fixed = []
    for t, k in res:
        if fixed and fixed[-1][1] == "comma" and _core_len(t) < MIN_CHUNK_CHARS:
            fixed[-1][0] += t; fixed[-1][1] = k
        else:
            fixed.append([t, k])
    res = fixed
    if res:
        res[-1][1] = "last"
    return [(t, k) for t, k in res if t]


def split_sentences(text: str) -> list[str]:
    return [t for t, _ in split_chunks(text, comma=False)]


# 头部修剪可以狠一点；尾部必须宽松：句末轻声字（「西」「车」这类）的衰减尾音
# 常在 -45 ~ -55dB，用 -45dB 剪会把字尾吃掉，听起来像没读出来。
# 2026-11-25：尾部阈值放到 -55dB、多留 0.08s 余量；由此留下的那点余音属于“静音”
# （验收口径是 -40dB），所以补静音时要按实测余量扣掉，否则句号停顿会整体涨到 0.8s 以上。
TRIM = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
        "areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.08,areverse")

_TAILQ: dict[str, float] = {}


def tail_quiet(f: Path) -> float:
    """修剪之后、按验收口径（-40dB）仍算静音的尾巴有多长。"""
    k = str(f)
    if k in _TAILQ:
        return _TAILQ[k]
    r = subprocess.run([which("ffmpeg"), "-hide_banner", "-v", "info", "-i", str(f),
                        "-af", f"{TRIM},silencedetect=noise=-40dB:d=0.02", "-f", "null", "-"],
                       capture_output=True, text=True)
    err, dur = r.stderr, 0.0
    total = re.findall(r"time=(\d+):(\d+):([\d.]+)", err)
    tlen = 0.0
    if total:
        h, m, sec = total[-1]
        tlen = int(h)*3600 + int(m)*60 + float(sec)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    if starts:
        last = starts[-1]
        # 尾部静音：要么没有配对的 silence_end（一直到文件结尾），
        # 要么 silence_end 就落在文件结尾（ffmpeg 会在 EOF 补一个）
        if len(ends) < len(starts):
            dur = max(0.0, tlen - last)
        elif tlen and ends[-1] >= tlen - 0.03:
            dur = max(0.0, ends[-1] - last)
    _TAILQ[k] = dur
    return dur


def join_with_gap(parts: list[Path], gaps: list[float], out: Path) -> None:
    """修剪每个小句头尾静音，再按停顿类型补精确静音拼接。gaps[i] 为第 i 句之后的停顿。"""
    cmd = [which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y"]
    for f in parts:
        cmd += ["-i", str(f)]
    fc, labels = [], []
    n = len(parts)
    for i in range(n):
        tail = gaps[i] if i < n - 1 else EDGE_PAD
        if i < n - 1:
            tail = max(0.05, tail - tail_quiet(parts[i]))
        head = EDGE_PAD if i == 0 else 0.0
        chain = f"[{i}:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono,{TRIM}"
        if head > 0:
            chain += f",adelay={int(head*1000)}:all=1"
        chain += f",apad=pad_dur={tail:.3f}[p{i}]"
        fc.append(chain)
        labels.append(f"[p{i}]")
    fc.append("".join(labels) + f"concat=n={n}:v=0:a=1[aout]")
    cmd += ["-filter_complex", ";".join(fc), "-map", "[aout]", "-ar", "24000", "-ac", "1", str(out)]
    r = subprocess.run(cmd, check=False)
    if r.returncode != 0:
        die(f"分句拼接失败：{out.name}")


def run_omnivoice(a, script: dict, work: Path):
    omni_py = Path(os.environ.get("OMNIVOICE_PYTHON", str(DEFAULT_OMNI_PYTHON))).expanduser()
    if not omni_py.is_file():
        die(f"找不到本机 OmniVoice Python 环境：{omni_py}")
    worker = SKILL_DIR / "scripts" / "omnivoice_batch.py"
    if not worker.is_file():
        die(f"找不到 OmniVoice 批处理脚本：{worker}")

    voice = a.voice or script.get("voice") or "my_voice"
    if is_edge_voice(voice):
        voice = "my_voice"
    speed = float(a.speed if a.speed is not None else script.get("speed", DEFAULT_OMNI_SPEED))
    language = a.language or script.get("language", "zh")
    num_step = int(script.get("omni_num_step", 32))
    guidance_scale = float(script.get("omni_guidance_scale", 2.0))
    denoise = bool(script.get("omni_denoise", True))

    default_ref_audio, default_ref_text = resolve_ref(
        a.ref_audio or script.get("ref_audio"),
        a.ref_text or script.get("ref_text"),
    )
    sig_cache: dict[Path, str] = {default_ref_audio: file_sig(default_ref_audio)}

    tdir = ensure_dir(work / "tts")
    sent_gap = float(script.get("sentence_gap", DEFAULT_SENT_GAP))
    comma_gap = float(script.get("comma_gap", DEFAULT_COMMA_GAP))
    jobs, meta, merges = [], [], []
    for i, seg in enumerate(script["segments"]):
        if seg.get("type", "narration") != "narration":
            meta.append(None)
            continue
        text = seg["text"].strip()
        seg_speed = float(seg.get("speed", speed))
        seg_lang = seg.get("language", language)
        if seg.get("ref_audio") or seg.get("ref_text"):
            ra, rt = resolve_ref(seg.get("ref_audio") or str(default_ref_audio), seg.get("ref_text"))
            if ra not in sig_cache:
                sig_cache[ra] = file_sig(ra)
        else:
            ra, rt = default_ref_audio, default_ref_text
        k = omni_key(f"{text}|v3|gap{sent_gap:.2f}|cg{comma_gap:.2f}", sig_cache[ra], rt, seg_speed, seg_lang, num_step, guidance_scale, denoise)
        out = tdir / f"{k}.wav"
        meta.append({"index": i, "file": out.name, "text": text})
        if not out.exists():
            # 按句合成再用固定静音拼接：声音克隆引擎在句号处的停顿时长不稳定，
            # 整段一次合成常常把两句连读。分句后由我们自己控制句间停顿。
            chunks = split_chunks(text, comma=comma_gap > 0)
            gaps = [sent_gap if k == "end" else comma_gap for _, k in chunks]
            part_files = []
            for si, (sent, _k) in enumerate(chunks):
                pk = omni_key(sent, sig_cache[ra], rt, seg_speed, seg_lang, num_step, guidance_scale, denoise)
                pf = tdir / f"{pk}.wav"
                part_files.append(pf)
                if not pf.exists() and not any(j["out"] == str(pf.resolve()) for j in jobs):
                    jobs.append({
                        "text": sent,
                        "ref_audio": str(ra),
                        "ref_text": rt,
                        "speed": seg_speed,
                        "language": seg_lang,
                        "num_step": num_step,
                        "guidance_scale": guidance_scale,
                        "denoise": denoise,
                        "out": str(pf.resolve()),
                    })
            merges.append((out, part_files, gaps))

    total_narr = sum(1 for m in meta if m)
    log(
        f"配音（omnivoice）：音色 {voice}（{default_ref_audio.name}）语速 {speed:.2f}x，"
        f"需合成 {len(jobs)} 句，缓存命中 {total_narr - len(merges)}/{total_narr} 段，句号停顿 {sent_gap:.2f}s 逗号停顿 {comma_gap:.2f}s"
    )
    if jobs:
        with tempfile.NamedTemporaryFile("w", suffix=".json", prefix="omnivoice_", dir=str(tdir), delete=False, encoding="utf-8") as tf:
            manifest = Path(tf.name)
            save_json(manifest, {"jobs": jobs})
        try:
            proc = subprocess.run([str(omni_py), str(worker), str(manifest)], check=False)
            if proc.returncode != 0:
                die(f"OmniVoice 批处理配音失败（退出码 {proc.returncode}），已完成的段落已缓存，可直接重跑")
        finally:
            manifest.unlink(missing_ok=True)

    for out, part_files, gaps in merges:
        missing = [f for f in part_files if not f.exists()]
        if missing:
            die(f"分句音频缺失：{missing[0].name}")
        join_with_gap(part_files, gaps, out)

    total_dur = 0.0
    for m in meta:
        if m:
            m["duration"] = round(duration(tdir / m["file"]), 3)
            total_dur += m["duration"]
    save_json(
        tdir / "tts_meta.json",
        {
            "backend": "omnivoice",
            "voice": voice,
            "ref_audio": str(default_ref_audio),
            "speed": speed,
            "language": language,
            "segments": meta,
        },
    )
    n = sum(len(m["text"]) for m in meta if m)
    log(f"完成：解说总时长 {total_dur:.1f} 秒，{n} 字，约 {n / max(total_dur, 1):.1f} 字/秒")


async def run_edge(a, script: dict, work: Path):
    voice = a.voice or script.get("voice", DEFAULT_EDGE_VOICE)
    if not is_edge_voice(voice):
        voice = DEFAULT_EDGE_VOICE
    rate = a.rate or script.get("rate", "+10%")
    pitch = script.get("pitch", "+0Hz")
    tdir = ensure_dir(work / "tts")
    sem = asyncio.Semaphore(a.workers)
    jobs, meta = [], []
    for i, seg in enumerate(script["segments"]):
        if seg.get("type", "narration") != "narration":
            meta.append(None)
            continue
        text = seg["text"].strip()
        v = seg.get("voice", voice)
        if not is_edge_voice(v):
            v = voice
        r = seg.get("rate", rate)
        k = edge_key(text, v, r, pitch)
        out = tdir / f"{k}.mp3"
        meta.append({"index": i, "file": out.name, "text": text})
        if not out.exists():
            jobs.append(synth_edge(text, v, r, pitch, out, sem))
    log(f"配音（edge-tts）：音色 {voice} 语速 {rate}，需合成 {len(jobs)} 段，缓存命中 {sum(1 for m in meta if m) - len(jobs)} 段")
    if jobs:
        res = await asyncio.gather(*jobs, return_exceptions=True)
        errs = [r for r in res if isinstance(r, Exception)]
        if errs:
            die(f"{len(errs)} 段配音失败，例如：{errs[0]}（网络问题可直接重跑，已完成的会复用）")
    total = 0.0
    for m in meta:
        if m:
            m["duration"] = round(duration(tdir / m["file"]), 3)
            total += m["duration"]
    save_json(
        tdir / "tts_meta.json",
        {"backend": "edge", "voice": voice, "rate": rate, "pitch": pitch, "segments": meta},
    )
    n = sum(len(m["text"]) for m in meta if m)
    log(f"完成：解说总时长 {total:.1f} 秒，{n} 字，约 {n / max(total, 1):.1f} 字/秒")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--backend", choices=["omnivoice", "edge"])
    ap.add_argument("--voice")
    ap.add_argument("--speed", type=float)
    ap.add_argument("--rate")
    ap.add_argument("--language")
    ap.add_argument("--ref-audio")
    ap.add_argument("--ref-text")
    ap.add_argument("--workers", type=int, default=6)
    a = ap.parse_args()
    work = Path(a.work)
    script = load_json(work / "script.json")
    backend = resolve_backend(a, script)
    if backend == "edge":
        asyncio.run(run_edge(a, script, work))
    else:
        run_omnivoice(a, script, work)


if __name__ == "__main__":
    main()

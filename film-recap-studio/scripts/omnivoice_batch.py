"""Batch voice-cloning worker run under ~/AI/OmniVoice/.venv/bin/python.

Reads a JSON job manifest with structure:
{
  "jobs": [
    {
      "text": "...",
      "ref_audio": "/abs/path.wav",
      "ref_text": "...",
      "speed": 1.25,
      "language": "zh",
      "num_step": 32,
      "guidance_scale": 2.0,
      "denoise": true,
      "out": "/abs/path/to/<hash>.wav"
    }
  ]
}
Loads OmniVoice once, caches voice_clone_prompt per (ref_audio, ref_text),
and writes each output atomically (.part.wav -> .wav).
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from omnivoice.models.omnivoice import OmniVoice


def resolve_model_path() -> str:
    env_model = os.environ.get("OMNIVOICE_MODEL")
    if env_model:
        return env_model
    snap_root = Path.home() / ".cache/huggingface/hub/models--k2-fsa--OmniVoice/snapshots"
    if snap_root.is_dir():
        snaps = sorted(
            (p for p in snap_root.iterdir() if p.is_dir() and (p / "config.json").is_file()),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if snaps:
            return str(snaps[0])
    os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
    return "k2-fsa/OmniVoice"


def split_long_text(text: str, max_chars: int = 85) -> list[str]:
    text = text.strip()
    if len(text) <= max_chars:
        return [text]
    parts = re.split(r"([。！？!?；;])", text)
    sentences: list[str] = []
    buf = ""
    for p in parts:
        if not p:
            continue
        buf += p
        if re.fullmatch(r"[。！？!?；;]", p):
            if buf.strip():
                sentences.append(buf.strip())
            buf = ""
    if buf.strip():
        sentences.append(buf.strip())

    merged: list[str] = []
    cur = ""
    for s in sentences:
        if not cur:
            cur = s
        elif len(cur) + len(s) <= max_chars:
            cur += s
        else:
            merged.append(cur)
            cur = s
    if cur:
        merged.append(cur)
    return merged or [text]


def main() -> None:
    if len(sys.argv) != 2:
        print("usage: omnivoice_batch.py <manifest.json>", file=sys.stderr)
        sys.exit(2)
    manifest_path = Path(sys.argv[1])
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    jobs = data.get("jobs", [])
    if not jobs:
        return

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    dtype = torch.float16 if device == "mps" else torch.float32
    model_path = resolve_model_path()

    t0 = time.time()
    model = OmniVoice.from_pretrained(model_path, device_map=device, dtype=dtype)
    sr = int(model.sampling_rate)
    print(f"[omnivoice] 模型已加载 ({device}, {sr}Hz, {time.time() - t0:.1f}s)", flush=True)

    prompts: dict[tuple[str, str], object] = {}
    pause = np.zeros(int(sr * 0.12), dtype=np.float32)

    total = len(jobs)
    for idx, job in enumerate(jobs, 1):
        ref_key = (job["ref_audio"], job["ref_text"])
        if ref_key not in prompts:
            prompts[ref_key] = model.create_voice_clone_prompt(
                ref_audio=job["ref_audio"],
                ref_text=job["ref_text"],
            )
        prompt = prompts[ref_key]
        pieces = split_long_text(job["text"])
        wavs = []
        t1 = time.time()
        for k, piece in enumerate(pieces):
            audios = model.generate(
                text=piece,
                language=job.get("language", "zh"),
                voice_clone_prompt=prompt,
                speed=float(job.get("speed", 1.25)),
                num_step=int(job.get("num_step", 32)),
                guidance_scale=float(job.get("guidance_scale", 2.0)),
                denoise=bool(job.get("denoise", True)),
                postprocess_output=True,
            )
            wav = np.asarray(audios[0], dtype=np.float32).squeeze()
            if wav.ndim != 1 or len(wav) == 0:
                raise RuntimeError(f"第 {idx} 段生成音频为空：{piece[:20]}")
            wavs.append(wav)
            if k < len(pieces) - 1:
                wavs.append(pause)
        full = np.concatenate(wavs) if len(wavs) > 1 else wavs[0]
        peak = float(np.max(np.abs(full)))
        if peak > 0.98:
            full = full * (0.95 / peak)

        out = Path(job["out"])
        tmp = out.with_suffix(".part.wav")
        sf.write(str(tmp), full, sr, subtype="PCM_16")
        if tmp.stat().st_size < 1000:
            tmp.unlink(missing_ok=True)
            raise RuntimeError(f"第 {idx} 段音频过小：{job['text'][:20]}")
        tmp.replace(out)
        print(
            f"[omnivoice] {idx}/{total} 完成 ({len(full) / sr:.2f}s, 耗时 {time.time() - t1:.1f}s) {job['text'][:22]}",
            flush=True,
        )


if __name__ == "__main__":
    main()

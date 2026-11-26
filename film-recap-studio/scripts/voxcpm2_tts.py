from pathlib import Path
import hashlib, json, shutil, sys, time
import numpy as np, soundfile as sf, torch, torchaudio
from voxcpm.zipenhancer import ZipEnhancer
from voxcpm import VoxCPM

work = Path(sys.argv[1]); model_path = sys.argv[2]; den_path = sys.argv[3]
only = set(int(x) for x in sys.argv[4:]) if len(sys.argv) > 4 else None
PARAMS = dict(cfg_value=2.0, inference_timesteps=20, denoise=True, seed=42, normalize=False)
ref = work / "prep" / "ref_voice.wav"
script = json.loads((work / "script.json").read_text())
tts = work / "tts"; tts.mkdir(exist_ok=True)

def key(text):
    h = hashlib.sha256()
    h.update(("voxcpm2|" + model_path + "|" + text + "|").encode())
    h.update(hashlib.sha256(ref.read_bytes()).hexdigest().encode())
    h.update(json.dumps(PARAMS, sort_keys=True).encode())
    return h.hexdigest()[:12]

jobs = []
for i, s in enumerate(script["segments"]):
    if s["type"] != "narration":
        continue
    text = s.get("tts_text") or s["text"]
    k = key(text)
    out = tts / f"nar_{i:03d}_{k}.wav"
    if not out.exists():
        same = sorted(tts.glob(f"*_{k}.wav"))
        if same:
            shutil.copyfile(same[0], out)
    jobs.append((i, text, s["text"], out))
todo = [j for j in jobs if not j[3].exists() and (only is None or j[0] in only)]
print(f"待合成 {len(todo)}/{len(jobs)} 段", flush=True)

if todo:
    denoiser = ZipEnhancer(den_path)
    def normalize_reference(path):
        audio, sr = sf.read(path, dtype="float32", always_2d=True)
        sig = torch.from_numpy(audio.T.copy())
        gain = -20 - torchaudio.functional.loudness(sig, sr)
        sf.write(path, torchaudio.functional.gain(sig, gain).T.numpy(), sr, subtype="PCM_16")
    denoiser._normalize_loudness = normalize_reference
    model = VoxCPM.from_pretrained(model_path, load_denoiser=False, local_files_only=True, device="auto", optimize=False)
    model.denoiser = denoiser
    assert model.denoiser is not None
    rate = model.tts_model.sample_rate
    cache = work / "prep" / "ref_voice_denoised.wav"
    if not cache.exists():
        denoiser.enhance(str(ref), str(cache))
    def _reuse(input_path, output_path=None, **kw):
        if output_path and str(output_path) != str(cache):
            shutil.copyfile(cache, output_path)
            return str(output_path)
        return str(cache)
    model.denoiser.enhance = _reuse
    for n, (i, text, disp, out) in enumerate(todo, 1):
        t0 = time.time()
        wav = np.asarray(model.generate(text=text, reference_wav_path=str(cache), **PARAMS), dtype=np.float32).reshape(-1)
        assert wav.size and np.isfinite(wav).all() and np.max(np.abs(wav)) > .001, f"段 {i} 合成异常"
        tmp = out.with_suffix(".part.wav")
        sf.write(tmp, wav, rate, subtype="PCM_16"); tmp.replace(out)
        print(f"[{n}/{len(todo)}] #{i} {len(wav)/rate:.2f}s 用时 {time.time()-t0:.1f}s | {disp[:18]}", flush=True)

meta = {"backend": "voxcpm2", "params": PARAMS, "reference": str(ref), "segments": []}
jm = {i: (text, disp, out) for i, text, disp, out in jobs}
for i, s in enumerate(script["segments"]):
    if s["type"] != "narration":
        meta["segments"].append(None); continue
    text, disp, out = jm[i]
    info = sf.info(str(out))
    e = {"index": i, "file": out.name, "text": disp, "duration": round(info.frames / info.samplerate, 3)}
    if text != disp: e["synth_text"] = text
    meta["segments"].append(e)
(work / "tts" / "tts_meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
print("tts_meta.json 已写入", flush=True)

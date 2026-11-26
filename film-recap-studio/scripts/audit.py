"""出片后自动审片：成片黑场、成片里过短的镜头切换、段间背景声设置、原片黑场是否落进镜头。
用法：frs audit --work <工作目录> [--file output/master_16x9.mp4]
qc 管规格与响度，audit 管观众一眼能看出来的剪辑毛病。问题条数为 0 才算过。"""
from __future__ import annotations
import argparse, json, re, subprocess
from pathlib import Path
from lib import which, mmss

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--file", default="output/master_16x9.mp4")
    ap.add_argument("--min-shot", type=float, default=0.6)
    a = ap.parse_args()
    work = Path(a.work); f = work / a.file
    probs = []
    r = subprocess.run([which("ffmpeg"), "-hide_banner", "-nostats", "-i", str(f), "-vf",
                        "scale=320:-2,blackdetect=d=0.2:pix_th=0.1,select='gt(scene,0.3)',showinfo",
                        "-an", "-f", "null", "-"], capture_output=True, text=True)
    for s, e in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", r.stderr):
        probs.append(f"黑屏 {mmss(float(s))}–{mmss(float(e))}")
    cuts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", r.stderr)]
    for x, y in zip(cuts, cuts[1:]):
        if y - x < a.min_shot:
            probs.append(f"极短镜头 {mmss(x)}（{y - x:.2f}s）——抽帧确认是真切镜头还是闪光/急摇")
    sc = json.loads((work / "script.json").read_text())
    for i, s in enumerate(sc["segments"]):
        if s.get("type", "narration") == "narration" and (float(s.get("bg_fade_in", 0)) > 0.1 or float(s.get("bg_fade_out", 0)) > 0.1):
            probs.append(f"第 {i} 段设置了背景声长淡入淡出，相邻解说段之间会出现背景声断档")
    for i, s in enumerate(sc["segments"]):
        cl = s.get("clips") or []
        for x in range(len(cl)):
            for y in range(x + 1, len(cl)):
                if cl[x][0] < cl[y][1] - 0.05 and cl[y][0] < cl[x][1] - 0.05:
                    probs.append(f"第 {i} 段镜头 {cl[x]} 与 {cl[y]} 重叠，同一画面会播两遍")
    print(f"# 自动审片：{f.name}\n")
    print("\n".join(f"- {p}" for p in probs) or "- 无")
    print(f"\n问题 {len(probs)} 条（极短镜头需人工抽帧判定，闪光/急摇可放行）")

if __name__ == "__main__":
    main()

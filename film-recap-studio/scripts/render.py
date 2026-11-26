"""阶段 7：剪辑合成。按 script.json 逐段剪原片、配上解说和字幕，拼成成片。

每段单独渲染并缓存（work_dir/render/seg_XXX_<hash>.mp4），改稿后只重渲改动的段。
产出：
  output/master_16x9.mp4   横屏成片（抖音横屏/西瓜/YouTube/视频号横屏）
  output/vertical_9x16.mp4 竖屏版（模糊背景 + 顶部大标题，可用 --no-vertical 关闭）
  output/subtitles.srt     与成片对齐的解说字幕（可上传平台作 CC 字幕）
  output/timeline.json     每段在成片中的起止时间、对应原片区间
用法：frs render --work <工作目录> [--no-vertical] [--only-vertical] [--preview 120]
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from lib import AENC, AR, FPS, H, VENC, W, die, duration, ensure_dir, load_json, log, mmss, run, save_json, split_subtitles, which
from textimg import brand_png, subtitle_png, vertical_title_png

LEAD = 0.05


def t2s(v) -> float:
    if isinstance(v, (int, float)):
        return float(v)
    parts = [float(x) for x in str(v).split(":")]
    s = 0.0
    for p in parts:
        s = s * 60 + p
    return s


def fit_chain(meta: dict, mode: str) -> str:
    crop = meta.get("crop")
    pre = ""
    w, h = meta["width"], meta["height"]
    if crop:
        cw, ch, _, _ = map(int, crop.split(":"))
        if (cw, ch) != (w, h) and cw > w * 0.5 and ch > h * 0.5:
            pre = f"crop={crop},"
            w, h = cw, ch
    ar = w / h
    if mode == "auto":
        mode = "fill" if 1.70 <= ar <= 1.85 else ("letterbox" if ar > 1.85 else "blur")
    if mode == "letterbox":
        return pre + f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:black,setsar=1"
    if mode == "fill":
        return pre + f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    if mode == "blur":
        return (pre + "split[fa][fb];"
                f"[fa]scale=480:270:force_original_aspect_ratio=increase,crop=480:270,boxblur=10:2,scale={W}:{H},eq=brightness=-0.12[fbg];"
                f"[fb]scale={W}:{H}:force_original_aspect_ratio=decrease[ffg];[fbg][ffg]overlay=(W-w)/2:(H-h)/2,setsar=1")
    die(f"未知画面模式 {mode}")


def chunk_times(chunks: list[str], start: float, length: float):
    weights = [len(c) + 1.2 for c in chunks]
    tot = sum(weights)
    t = start
    out = []
    for c, wgt in zip(chunks, weights):
        d = length * wgt / tot
        out.append((c, t, t + d))
        t += d
    return out


def seg_hash(seg: dict, extra: str) -> str:
    return hashlib.sha1((json.dumps(seg, ensure_ascii=False, sort_keys=True) + extra).encode()).hexdigest()[:12]


MIN_SHOT = 1.2   # 成片里任何一个可见镜头不得短于此（原片自身快切的内部镜头除外）
SNAP = 1.0       # clip 边界离原片切点 < 1s 就吸附过去


def fit_clips(clips, D, cuts, black, src_dur):
    """把 clips 调到总长 D：按原片镜头处理，头尾不留 <MIN_SHOT 的碎镜头，延长不跨切点也不进黑场。
    返回 (clips, freeze)；freeze>0 表示实在补不够，靠末帧定格补齐。"""
    import bisect
    E = 0.04
    walls = sorted(set(cuts) | {x for bl in black for x in bl} | {0.0, src_dur})
    def nxt(t):  # t 之后的第一个切点（t 离切点 <0.03s 视为已到切点）
        k = bisect.bisect_right(walls, t - 0.03)
        return walls[k] if k < len(walls) else src_dur
    def prv(t):
        k = bisect.bisect_left(walls, t + 0.03)
        return walls[k - 1] if k > 0 else 0.0
    def inside(x, y):
        return [c for c in walls if x + 0.02 < c < y - 0.02]
    def in_black(t):
        return any(p - 0.02 <= t <= q + 0.02 for p, q in black)
    def hi_lim(c):  # c 往后延不能碰到本段其他 clip 已用的画面
        return min([o[0] - E for o in clips if o is not c and o[0] >= c[1] - 0.01] + [src_dur])
    def lo_lim(c):
        return max([o[1] + E for o in clips if o is not c and o[1] <= c[0] + 0.01] + [0.0])
    def grow(c, need):  # 在 c 首尾所在镜头内补长，返回补了多少
        got = 0.0
        room = max(0.0, min(nxt(c[1]) - E, hi_lim(c)) - c[1]); add = min(room, need - got); c[1] += add; got += add
        room = max(0.0, c[0] - max(prv(c[0]) + E, lo_lim(c))); add = min(room, need - got); c[0] -= add; got += add
        return got
    out = []
    for c in clips:
        c = list(c)
        if in_black(c[0]) or in_black(c[1]):
            pass
        # 头尾碎片
        ins = inside(c[0], c[1])
        if ins and ins[0] - c[0] < MIN_SHOT:
            c[0] = ins[0] + E
        ins = inside(c[0], c[1])
        if ins and c[1] - ins[-1] < MIN_SHOT:
            c[1] = ins[-1] - E
        if c[1] - c[0] < MIN_SHOT and not inside(c[0], c[1]):
            grow(c, MIN_SHOT - (c[1] - c[0]))
        if c[1] - c[0] >= 0.5:
            out.append(c)
    clips = out or [list(clips[0])]
    def shots(c):
        pts = [c[0]] + inside(c[0], c[1]) + [c[1]]
        return list(zip(pts, pts[1:]))
    L = sum(y - x for x, y in clips)
    over = L - D
    # 太长：从末镜往前剪；每个镜头要么留 ≥MIN_SHOT，要么整个拿掉
    while over > 0.01 and clips:
        c = clips[-1]; sh = shots(c); x, y = sh[-1]
        cap = (y - x) - MIN_SHOT
        if cap >= over:
            c[1] = y - over; over = 0
        elif len(sh) > 1:
            c[1] = x - E; over -= (y - c[1])
        elif len(clips) > 1:
            over -= (y - x); clips.pop()
        else:
            c[1] = c[0] + max(0.3, (y - x) - over); over = 0
    L = sum(y - x for x, y in clips)
    need = D - L
    # 太短：从最后一个 clip 往前，在各自首尾镜头内补
    for c in reversed(clips):
        if need <= 0.01: break
        need -= grow(c, need)
    # 同镜头内补不够：末 clip 往后续接下一个完整镜头（≥MIN_SHOT，不进黑场），多出的从首镜头头部修掉
    # 先按 MIN_SHOT 续；原片本身是快切蒙太奇时退一档，按原片节奏（≥0.6s 的完整镜头）续
    for min_next in (MIN_SHOT, 0.6):
        guard = 0
        while need > 0.01 and guard < 12:
            guard += 1
            # 从末 clip 往前找一个能往后续接、且下一个镜头没被本段用过的 clip
            done = False
            for c in reversed(clips):
                w1 = nxt(c[1]); w2 = nxt(w1 + 0.06)
                if in_black(w1 + 0.05) or w2 - w1 < min_next or w1 >= src_dur - 0.1 or hi_lim(c) < w2 - E:
                    continue
                take = min(w2 - E, w1 + max(need - (w1 - c[1]), min_next))
                need -= take - c[1]; c[1] = take; done = True
                break
            if not done:
                break
    if need < -0.01:
        over = -need
        for c in clips:
            sh = shots(c); x, y = sh[0]
            cap = max(0.0, (y - x) - MIN_SHOT)
            cut = min(cap, over); c[0] += cut; over -= cut
            if over <= 0.01: break
        if over > 0.01:  # 实在修不掉：退回末镜（宁可略短定格，也不让源比输出长）
            c = clips[-1]; c[1] -= over
        need = 0.0
    return clips, max(0.0, need)


def snap_original(a, b, cuts, black, src_dur):
    """原声段头尾碎镜头：离切点 <0.8s 就延到切点（台词只多不少）；延不了且碎片 <0.4s 才修掉。"""
    E = 0.04
    bad = lambda t: any(p - 0.05 <= t <= q + 0.05 for p, q in black)
    ins = [c for c in cuts if a + 0.02 < c < b - 0.02]
    if ins and ins[0] - a < 1.0:
        before = [c for c in cuts if c <= a - 0.02]
        if before and a - before[-1] < 0.8 and not bad(before[-1]):
            a = before[-1] + E
        elif ins[0] - a < 0.4:
            a = ins[0] + E
    ins = [c for c in cuts if a + 0.02 < c < b - 0.02]
    if ins and b - ins[-1] < 1.0:
        after = [c for c in cuts if c >= b + 0.02]
        if after and after[0] - b < 0.8 and not bad(after[0]) and after[0] < src_dur:
            b = after[0] - E
        elif b - ins[-1] < 0.4:
            b = ins[-1] - E
    return round(a, 3), round(b, 3)


def render_segment(i, seg, src, meta, fit, style, tts_meta, tdir: Path, rdir: Path, subdir: Path):
    kind = seg.get("type", "narration")
    has_audio = meta["has_audio"]
    src_dur = meta["duration"]
    size = style.get("size", 60)
    max_chars = style.get("max_chars", 14)
    box = style.get("box", False)
    kws = seg.get("keywords", [])

    if kind == "narration":
        tm = tts_meta[i]
        if not tm:
            die(f"第 {i} 段缺配音，先运行 tts")
        tts_file = tdir / tm["file"]
        speech = tm["duration"]
        D = round(LEAD + speech + float(seg.get("pause", 0.15)), 3)
        clips = [[t2s(a), t2s(b)] for a, b in seg.get("clips", [])]
        if not clips:
            die(f"第 {i} 段没有 clips")
        clips, freeze = fit_clips(clips, D, meta.get("_cuts", []), meta.get("_black", []), src_dur)
        if freeze > 0.5:
            log(f"  ⚠ 第 {i} 段画面不够，末帧定格 {freeze:.1f}s，建议在 script.json 补镜头")
        sub_items = chunk_times(split_subtitles(seg["text"], max_chars), LEAD, speech)
        extra = tts_file.name + json.dumps(style, sort_keys=True) + fit + json.dumps([[round(a, 3), round(b, 3)] for a, b in clips])
    elif kind == "original":
        a, b = map(t2s, seg["src"])
        a, b = snap_original(a, b, meta.get("_cuts", []), meta.get("_black", []), src_dur)
        clips = [[a, b]]
        D = round(b - a, 3)
        show_orig_sub = style.get("orig_sub", True)
        sub_items = chunk_times(split_subtitles(seg["sub"], max_chars + 4), 0.1, D - 0.2) if (show_orig_sub and seg.get("sub")) else []
        extra = json.dumps(style, sort_keys=True) + fit
    else:
        die(f"第 {i} 段 type 只能是 narration / original")

    for a, b in clips:
        if a < 0 or b > src_dur + 0.5 or b <= a:
            die(f"第 {i} 段镜头区间不合法 {a}-{b}（原片 {src_dur:.1f}s）")

    h = seg_hash(seg, extra)
    out = rdir / f"seg_{i:03d}_{h}.mp4"
    if out.exists():
        return out, D, sub_items

    for old in rdir.glob(f"seg_{i:03d}_*.mp4"):
        old.unlink()

    cmd = [which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y"]
    for a, b in clips:
        cmd += ["-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", src]
    n = len(clips)
    idx = n
    if kind == "narration":
        cmd += ["-i", str(tts_file)]
        tts_idx = idx
        idx += 1
    sub_pngs = []
    for k, (txt, s, e) in enumerate(sub_items):
        p = subdir / f"s{i:03d}_{k:02d}_{h}.png"
        if not p.exists():
            subtitle_png(p, txt, kws, size=size, box=box or kind == "original" and style.get("orig_box", True), y_bottom=style.get("y_bottom"))
        cmd += ["-i", str(p)]
        sub_pngs.append((idx, s, e))
        idx += 1

    fc = []
    if has_audio:
        fc.append("".join(f"[{k}:v][{k}:a]" for k in range(n)) + f"concat=n={n}:v=1:a=1[cv][ca]")
    else:
        fc.append("".join(f"[{k}:v]" for k in range(n)) + f"concat=n={n}:v=1:a=0[cv]")
        fc.append(f"anullsrc=r={AR}:cl=stereo,atrim=0:{D}[ca]")
    fc.append("[cv]" + fit_chain(meta, fit) + "[fit]")
    fc.append(f"[fit]fps={FPS},tpad=stop_mode=clone:stop_duration={D + 1:.2f},trim=duration={D},setpts=PTS-STARTPTS[v0]")
    last = "v0"
    if kind == "narration" and int(style.get("mask_bottom", 0)) > 0:
        mh = int(style["mask_bottom"])
        my = H - mh
        fc.append(
            f"[{last}]split[mb_a][mb_b];"
            f"[mb_b]crop={W}:{mh}:0:{my},boxblur=18:2,eq=brightness=-0.35:saturation=0.4[mb_blur];"
            f"[mb_a][mb_blur]overlay=0:{my}[v0m]"
        )
        last = "v0m"
    for k, (ii, s, e) in enumerate(sub_pngs):
        fc.append(f"[{last}][{ii}:v]overlay=0:0:enable='between(t,{s:.3f},{e:.3f})'[v{k + 1}]")
        last = f"v{k + 1}"
    fc.append(f"[{last}]format=yuv420p[vout]")
    if kind == "narration":
        duck = float(seg.get("duck", style.get("duck", 0.12)))
        bfi = min(float(seg.get("bg_fade_in", style.get("bg_fade_in", 0.05))), D / 3)
        bfo = min(float(seg.get("bg_fade_out", style.get("bg_fade_out", 0.05))), D / 3)
        fc.append(f"[ca]aresample={AR},aformat=channel_layouts=stereo,volume={duck},"
                  f"afade=t=in:d={bfi:.3f},afade=t=out:st={max(0, D - bfo):.3f}:d={bfo:.3f},"
                  f"apad,atrim=0:{D}[oa]")
        fc.append(f"[{tts_idx}:a]aresample={AR},aformat=channel_layouts=stereo,volume=1.0,adelay={int(LEAD * 1000)}|{int(LEAD * 1000)},apad,atrim=0:{D}[na]")
        fc.append("[oa][na]amix=inputs=2:duration=first:normalize=0,asetpts=PTS-STARTPTS[aout]")
    else:
        vol = float(seg.get("volume", 1.0))
        fi = min(float(seg.get("fade_in", style.get("fade_in", 0.35))), D / 2)
        fo = min(float(seg.get("fade_out", style.get("fade_out", 0.9))), D / 2)
        fc.append(f"[ca]aresample={AR},aformat=channel_layouts=stereo,volume={vol},"
                  f"afade=t=in:d={fi:.3f},"
                  f"afade=t=out:st={max(0, D - fo):.3f}:d={fo:.3f},apad,atrim=0:{D},asetpts=PTS-STARTPTS[aout]")
    cmd += ["-filter_complex", ";".join(fc), "-map", "[vout]", "-map", "[aout]", *VENC, *AENC, "-t", f"{D}", str(out)]
    run(cmd)
    return out, D, sub_items


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def make_vertical(master: Path, out: Path, work: Path, script: dict):
    lines = script.get("vertical_title") or [script.get("title", "")]
    tp = work / "render" / "vertical_title.png"
    vertical_title_png(tp, lines, script.get("title_keywords", []), script.get("episode_tag"))
    # 竖屏：取横屏画面中间一块放大（字幕居中，不会被裁），默认 4:3 宽；宽银幕片可在 script.json 设 vertical_crop: 1920
    cw = int(script.get("vertical_crop", 1440))
    fc = ("[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
          "scale=270:480,boxblur=8:2,scale=1080:1920,eq=brightness=-0.25[bg];"
          f"[b]crop={cw}:1080,scale=1080:-2[fg];[bg][fg]overlay=0:(H-h)/2+60[v1];[v1][1:v]overlay=0:0,format=yuv420p[v]")
    run([which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y", "-i", str(master), "-i", str(tp),
         "-filter_complex", fc, "-map", "[v]", "-map", "0:a", *VENC, "-c:a", "copy", str(out)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--no-vertical", action="store_true")
    ap.add_argument("--only-vertical", action="store_true")
    ap.add_argument("--preview", type=float, default=0, help="只渲染成片前 N 秒用于试看")
    a = ap.parse_args()
    work = Path(a.work)
    script = load_json(work / "script.json")
    meta = load_json(work / "prep" / "meta.json")
    sc_p, bl_p = work / "prep" / "scenes.json", work / "prep" / "black.json"
    meta["_cuts"] = load_json(sc_p) if sc_p.exists() else []
    meta["_black"] = load_json(bl_p) if bl_p.exists() else []
    src = script.get("source") or meta["source"]
    if not Path(src).exists():
        die(f"原片不存在：{src}")
    outd = ensure_dir(work / "output")
    master = outd / ("preview_16x9.mp4" if a.preview else "master_16x9.mp4")

    if a.only_vertical:
        make_vertical(outd / "master_16x9.mp4", outd / "vertical_9x16.mp4", work, script)
        log(f"竖屏版：{outd / 'vertical_9x16.mp4'}")
        return

    tts_meta_path = work / "tts" / "tts_meta.json"
    tts_meta = load_json(tts_meta_path)["segments"] if tts_meta_path.exists() else []
    if len(tts_meta) != len(script["segments"]):
        die("配音与稿件段数不一致：改稿后请先重跑 tts")
    fit = script.get("fit", "auto")
    style = script.get("subtitle", {})
    tdir, rdir = work / "tts", ensure_dir(work / "render")
    subdir = ensure_dir(rdir / "subs")

    pieces, timeline, srt, t = [], [], [], 0.0
    segs = script["segments"]
    for i, seg in enumerate(segs):
        if a.preview and t >= a.preview:
            break
        p, D, subs = render_segment(i, seg, src, meta, fit, style, tts_meta, tdir, rdir, subdir)
        real = duration(p)
        pieces.append(p)
        timeline.append({"index": i, "type": seg.get("type", "narration"), "beat": seg.get("beat"),
                         "start": round(t, 3), "end": round(t + real, 3),
                         "text": seg.get("text") or seg.get("sub") or seg.get("note", ""),
                         "source": seg.get("clips") or seg.get("src")})
        for txt, s, e in subs:
            srt.append((t + s, t + e, txt))
        t += real
        if (i + 1) % 10 == 0 or i == len(segs) - 1:
            log(f"  已渲染 {i + 1}/{len(segs)} 段，成片 {mmss(t)}")

    lst = rdir / "concat.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in pieces), encoding="utf-8")
    body = rdir / "body.mp4"
    run([which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(body)])

    bp = rdir / "brand.png"
    brand_png(bp, script.get("account"), script.get("warning"))
    cmd = [which("ffmpeg"), "-hide_banner", "-loglevel", "error", "-y", "-i", str(body), "-i", str(bp)]
    bgm = script.get("bgm")
    afc = "[0:a]aresample=48000[a0]"
    if bgm and bgm.get("file") and Path(bgm["file"]).exists():
        cmd += ["-stream_loop", "-1", "-i", bgm["file"]]
        afc = f"[2:a]aresample=48000,aformat=channel_layouts=stereo,volume={bgm.get('volume', 0.08)}[bg];[0:a][bg]amix=inputs=2:duration=first:normalize=0[a0]"
    fc = f"[0:v][1:v]overlay=0:0,format=yuv420p[v];{afc};[a0]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]"
    cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", *VENC, *AENC, "-movflags", "+faststart", str(master)]
    log("  合成成片（加水印、响度统一）…")
    run(cmd)

    (outd / "subtitles.srt").write_text("".join(f"{k + 1}\n{srt_time(s)} --> {srt_time(e)}\n{txt}\n\n" for k, (s, e, txt) in enumerate(srt)), encoding="utf-8")
    save_json(outd / "timeline.json", timeline)
    log(f"横屏成片：{master}（{mmss(duration(master))}）")
    if not a.no_vertical and not a.preview:
        log("  生成竖屏版…")
        make_vertical(master, outd / "vertical_9x16.mp4", work, script)
        log(f"竖屏版：{outd / 'vertical_9x16.mp4'}")


if __name__ == "__main__":
    main()

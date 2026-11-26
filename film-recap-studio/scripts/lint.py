"""阶段 5：稿件体检。配音前检查 script.json 是否符合爆款结构，以及镜头区间是否合法。

错误（必须改）：结构/区间问题；警告（建议改）：偏离爆款公式的地方。
用法：frs lint --work <工作目录> [--cps 5.6]
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

from lib import load_json, log, mmss, save_json
from render import t2s

HOOK_WORDS = ["就在这时", "殊不知", "然而", "没想到", "直到", "可", "谁知", "下一秒", "原来", "竟然", "却"]
QUESTION = re.compile(r"[？?]|为何|为什么|到底|究竟|会不会|能否|是否")
# 逗号前若是「认知动词 + 省略『是』的宾语从句」，TTS 会按自己的理解重新断句，
# 把逗号读成连读（S01E01「杰西不相信只是为了钱，盯着他等下文。」）。
AMBIG_COMMA = re.compile(
    r"(?:不相信|不信|不知道|没想到|没发现|不觉得|不认为|以为|才发现)"
    r"[^，。！？、；]{0,6}?(?:只是|就是|其实|原来|因为|为了|不过是)[^，。！？、；]{0,10}?，")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True)
    ap.add_argument("--cps", type=float, default=5.6, help="预估语速 字/秒（+10% 语速约 5.6）")
    a = ap.parse_args()
    work = Path(a.work)
    s = load_json(work / "script.json")
    meta = load_json(work / "prep" / "meta.json")
    segs = s.get("segments", [])
    errs, warns = [], []

    if not segs:
        errs.append("没有 segments")
    t = 0.0
    est = []
    last_orig_t = 0.0
    longest_no_orig = 0.0
    for i, g in enumerate(segs):
        kind = g.get("type", "narration")
        if kind == "narration":
            txt = (g.get("text") or "").strip()
            if not txt:
                errs.append(f"#{i} 解说词为空")
                continue
            d = len(txt) / a.cps + 0.2
            clips = g.get("clips") or []
            if not clips:
                errs.append(f"#{i} 没有 clips（每句解说必须配原片画面）")
            L = 0.0
            for c in clips:
                try:
                    x, y = t2s(c[0]), t2s(c[1])
                except Exception:
                    errs.append(f"#{i} clips 格式错误 {c}")
                    continue
                if x < 0 or y > meta["duration"] + 0.5 or y <= x:
                    errs.append(f"#{i} 镜头区间不合法 {c}")
                L += max(0, y - x)
            if clips and L < d * 0.5:
                warns.append(f"#{i} 画面 {L:.1f}s 明显短于解说约 {d:.1f}s，会自动往后延长最后一个镜头，可能对不上画面")
            if len(txt) > 60:
                warns.append(f"#{i} 一段 {len(txt)} 字偏长，建议拆成两段并各配画面")
            for kw in g.get("keywords", []):
                if kw not in txt:
                    warns.append(f"#{i} 关键词「{kw}」不在本句中")
            for m in AMBIG_COMMA.finditer(txt):
                warns.append(f"#{i} 「{m.group(0)}」逗号前是带宾语从句的分句，配音容易重新断句、把逗号读成连读，"
                             f"建议拆成两个独立短句（见 editing-craft 第六节）")
        elif kind == "original":
            try:
                x, y = map(t2s, g["src"])
                d = y - x
                if d <= 0 or y > meta["duration"] + 0.5:
                    errs.append(f"#{i} 原声区间不合法 {g['src']}")
                if d > 15:
                    warns.append(f"#{i} 原声留白 {d:.1f}s 偏长（爆款多为 3–10 秒，结尾可更长）")
            except Exception:
                errs.append(f"#{i} original 段需要 src: [开始, 结束]")
                d = 0
            longest_no_orig = max(longest_no_orig, t - last_orig_t)
            last_orig_t = t + d
        else:
            errs.append(f"#{i} type 只能是 narration / original")
            d = 0
        est.append((i, t, d, g))
        t += d
    total = t
    longest_no_orig = max(longest_no_orig, total - last_orig_t)

    nar = [g for g in segs if g.get("type", "narration") == "narration" and g.get("text")]
    if nar:
        first = nar[0]["text"]
        first_sent = re.split(r"[，。！？,.!?]", first)[0]
        if len(first) > 30:
            warns.append(f"第一句 {len(first)} 字：爆款第一句一般不超过 20 字，直接抛出最反常的事")
        beats = [g.get("beat") for g in segs]
        if "cold_open" not in beats:
            warns.append("没有标 beat=cold_open 的开头钩子段（结局前置 / 高潮前置 / IP 前传 三选一）")
        if "title" in beats:
            ti = beats.index("title")
            tt = sum(d for (i, _, d, _) in est if i < ti)
            if tt > max(240, total * 0.3):
                warns.append(f"报片名在 {mmss(tt)}，偏晚（参考 0:08–3:12，且不超过全片 30%）")
        else:
            warns.append("没有 beat=title 段（一句片名 + 三句世界观）")
        q_first = [i for i, t0, d, g in est if g.get("type", "narration") == "narration" and QUESTION.search(g.get("text", ""))]
        if not q_first:
            warns.append("全稿没有向观众抛问题（为何 / 到底 / ？）")
        last_txt = "".join(g.get("text", "") for g in nar[-3:])
        if not re.search(r"下期|下集|下一集|追更|合集", last_txt):
            warns.append("结尾没有追更钩子（「下期再见」/挂合集）")
        hooks = sum(1 for g in nar if any(w in g["text"] for w in HOOK_WORDS))
        if hooks < len(nar) * 0.15:
            warns.append(f"转折词偏少（{hooks}/{len(nar)} 段），可用：{'、'.join(HOOK_WORDS[:7])}")
        long_lines = [g["text"] for g in nar if max(len(x) for x in re.split(r"[，。！？；,.!?;]", g["text"])) > 22]
        if long_lines:
            warns.append(f"{len(long_lines)} 段有超过 22 字不带标点的长句，字幕会被硬切，例如：{long_lines[0][:24]}…")
    n_orig = sum(1 for g in segs if g.get("type") == "original")
    per10 = n_orig / max(total / 600, 0.1)
    if per10 < 5:
        warns.append(f"原声留白 {n_orig} 处（折合每 10 分钟 {per10:.1f} 处），爆款参考每 10 分钟 7–10 处")
    if longest_no_orig > 150:
        warns.append(f"最长连续解说约 {longest_no_orig:.0f} 秒没有原声停顿，观众易疲劳（建议 ≤ 90 秒）")
    tgt = s.get("target_minutes")
    if tgt and abs(total / 60 - tgt) > tgt * 0.2:
        warns.append(f"预估成片 {mmss(total)}，与目标 {tgt} 分钟偏差超过 20%")

    report = {"estimated_duration": round(total, 1), "narration_segments": len(nar), "original_segments": n_orig,
              "errors": errs, "warnings": warns}
    save_json(work / "lint.json", report)
    log(f"预估成片 {mmss(total)}，解说 {len(nar)} 段，原声 {n_orig} 段")
    for e in errs:
        log(f"  ✗ {e}")
    for w in warns:
        log(f"  △ {w}")
    if not errs and not warns:
        log("  ✓ 全部通过")
    raise SystemExit(1 if errs else 0)


if __name__ == "__main__":
    main()

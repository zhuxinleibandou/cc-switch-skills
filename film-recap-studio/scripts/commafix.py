"""小句内部的逗号停顿校准（2026-11-25 第二版）。

做法：whisper 词级时间戳定位每个逗号前一个字的结束时刻 t0，再把 t0 附近的静音
整段替换成固定的 comma_gap。

2026-11-25 修订（起因：「杰西不相信只是为了钱，盯着他等下文。」逗号连读）：
  1. 选段改为「离逗号最近」而不是「窗内最长」。旧版窗口 ±0.65s、取最长静音，
     会把 0.5 秒开外、处于别的词组之间的停顿误判成逗号，结果逗号照旧连读、
     无逗号处反而更顿。
  2. 窗口收窄到 ±0.40s，候选静音段起点须在 t0 ±0.25s 内；都不满足时，
     说明模型把逗号连读了，直接在 t0 附近能量最低点插入 comma_gap。
  3. 校准完复测一次，偏差超 0.08s 记 "!" 由主流程打印。
  4. 顺带报告「非标点处 ≥0.18s 的停顿」(stray)：这是模型自己断错句的信号，
     应改写文案，而不是靠脚本补救。--trim-stray 可强行压到 0.10s。
"""
import sys, json, re, difflib, subprocess
import numpy as np, soundfile as sf
import mlx_whisper
PUNC = "，,、；;：:"
ALLP = r"[\s，,、；;：:。！？!?…“”\"'‘’（）()《》—]"
HOP = 0.005
WIN = 0.40        # 搜索窗（单侧）
NEAR = 0.25       # 候选静音段起点允许偏离 t0 的上限
STRAY = 0.18      # 非标点处停顿达到这个长度就报告
def core(t): return re.sub(ALLP, "", t)

def comma_char_idx(text):
    """返回每个逗号前一个核心字的序号（核心字=去标点后）"""
    out, n = [], 0
    for ch in text:
        if re.match(ALLP, ch):
            if ch in PUNC and n > 0: out.append(n - 1)
        else: n += 1
    return out

def env_db(y, sr, hop=HOP):
    h = int(sr*hop); n = len(y)//h
    fr = y[:n*h].reshape(n, h)
    return 20*np.log10(np.sqrt((fr**2).mean(1))+1e-9), hop

def quiet_runs(db, thr, hop=HOP):
    """返回 [(起, 长)] 的静音段列表，单位秒"""
    runs, cur, bs = [], 0, None
    for k, q in enumerate(db < thr):
        if q:
            if cur == 0: bs = k
            cur += 1
        else:
            if cur: runs.append((bs*hop, cur*hop))
            cur = 0
    if cur: runs.append((bs*hop, cur*hop))
    return runs

def align_chars(wav, text):
    r = mlx_whisper.transcribe(wav, path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                               language="zh", word_timestamps=True, initial_prompt=text)
    chars = []  # (char, start, end)
    for s in r["segments"]:
        for w in s.get("words", []):
            ws = core(w["word"])
            if not ws: continue
            d = (w["end"]-w["start"])/len(ws)
            for k, c in enumerate(ws): chars.append((c, w["start"]+k*d, w["start"]+(k+1)*d))
    ref = core(text); hyp = "".join(c for c, _, _ in chars)
    sm = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
    m = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n): m[a+k] = b+k
    return chars, m

def retime(y, sr, ops):
    """把每个 (起, 止, 目标长度) 的静音段改成目标长度——**非破坏性**：
    保留原音频，只在该静音段的中点插入或删掉采样，所以永远不会切到说话声。
    （旧版是整段替换成零，会吃掉前一个字的尾音或下一个字的起音。）"""
    if not ops:
        return y
    fd = int(0.005*sr)
    out, last = [], 0
    for ss, ee, tgt in sorted(ops):
        p0, p1 = int(ss*sr), int(ee*sr)
        if p0 < last:
            continue
        have, mid = ee-ss, (p0+p1)//2
        if tgt >= have:
            a = y[last:mid].copy()
            if len(a) > fd: a[-fd:] *= np.linspace(1, 0, fd)
            out += [a, np.zeros(int(round((tgt-have)*sr)), np.float32)]
            last = mid
            # 插完静音后，下一段开头淡入
            tail_fade = True
        else:
            cut = int(round((have-tgt)*sr))
            a0 = max(p0, mid - cut//2); a1 = min(p1, a0 + cut)
            out.append(y[last:a0])
            last = a1
            tail_fade = False
        if tail_fade and last < len(y):
            b = y[last:].copy()
            if len(b) > fd: b[:fd] *= np.linspace(0, 1, fd)
            y = np.concatenate([y[:last], b])
    out.append(y[last:])
    return np.concatenate(out)


def fix(wav, text, target=0.25, out=None, trim_stray=False):
    y, sr = sf.read(wav, dtype="float32")
    if y.ndim > 1: y = y.mean(1)
    chars, m = align_chars(wav, text)
    db, hop = env_db(y, sr)
    thr = max(-40.0, db.max()-50)   # 与出片自检同一门槛（绝对 -40dB）
    runs = quiet_runs(db, thr)
    cidx = comma_char_idx(text)

    ops, report = [], []
    marks = []   # 逗号的 t0，用来判断哪些停顿属于“非标点处”
    for ci in cidx:
        loose = False
        if ci in m: t0 = chars[m[ci]][2]
        elif ci+1 in m: t0 = chars[m[ci+1]][1]
        else:
            # 该字转写错了：用前后最近的对齐字线性插值，别放弃校准
            lo_i = max((k for k in m if k < ci), default=None)
            hi_i = min((k for k in m if k > ci), default=None)
            n_core = len(core(text))
            if lo_i is not None and hi_i is not None:
                a, b = chars[m[lo_i]][2], chars[m[hi_i]][1]
                t0 = a + (b-a) * (ci-lo_i) / (hi_i-lo_i)
            elif n_core:
                # 整句都没转写出来：按字数在有声区间里等分估位
                voiced = [k for k, q in enumerate(db >= thr)]
                if not voiced:
                    report.append((ci, "未对齐")); continue
                v0, v1 = voiced[0]*hop, voiced[-1]*hop
                t0 = v0 + (v1-v0) * (ci+1) / n_core
            else:
                report.append((ci, "未对齐")); continue
            report.append((round(t0, 2), "估位"))
            loose = True
        marks.append(t0)
        # 只在 t0 之后一点点的范围里找，并且取离 t0 最近的静音段（不是最长的）。
        # 逗号的静音必然起于该字收尾之后，起点早于 t0-0.06 的都是字内的能量低谷，不能动。
        cand = [(s, d) for s, d in runs
                if -0.06 <= s-t0 <= NEAR and d >= 0.03]
        if loose and not cand:
            # 位置是估的，容差放宽，并接受把 t0 包在里面的静音段
            cand = [(s, d) for s, d in runs
                    if (s-0.30 <= t0 <= s+d+0.30) and d >= 0.03]
        if cand:
            ss, d = min(cand, key=lambda x: abs(x[0]-t0))
            ops.append((ss, ss+d, target))
            report.append((round(t0, 2), round(d, 2), round(target-d, 2)))
        else:
            # 逗号被连读了。绝不硬插：在语流中间插静音一定会切到前一个字的尾音
            # 或下一个字的起音（S01E01 用户听出「开场那辆车，」的「车」像没读出来、
            # 「汉克顺口邀他改天跟车，去现场看一眼，」整句不对，全是硬插位置）。
            # 这里只报告，交给改稿：把该逗号升级成句号（句号停顿由拼接环节固定给足），
            # 或把句子改成不需要在这里停的写法。
            report.append((round(t0, 2), "连读"))

    # 非标点处的长停顿：模型断错句的信号，默认只报告
    stray = []
    for s_, d in runs:
        if d < STRAY: continue
        if s_ < 0.15 or s_+d > len(db)*hop - 0.15: continue       # 头尾静音不算
        if any(abs(s_-t0) <= NEAR for t0 in marks): continue      # 逗号处不算
        if any(abs(s_-os_) <= 0.03 for os_, _oe, _t in ops): continue  # 已被校准的不算
        stray.append((round(s_, 2), round(d, 2)))
        if trim_stray: ops.append((s_, s_+d, 0.10))

    z = retime(y, sr, ops)

    # 复测 + 二次修正：5ms RMS 包络和 ffmpeg 的静音判定在边界上有出入，
    # 改完的停顿可能和相邻的低能量段连成一片（实测出现过逗号被拉到 0.54s）。
    pos_list, shift = [], 0.0
    for (ss, ee, tgt) in sorted(ops):
        pos_list.append((ss + shift + min(tgt, ee-ss)/2, tgt))
        shift += tgt - (ee-ss)
    bad = []
    for _ in range(2):
        db2, _h = env_db(z, sr)
        runs2 = quiet_runs(db2, max(-40.0, db2.max()-50))
        over = []
        for pos, tgt in pos_list:
            hit = next(((a, d) for a, d in runs2 if a - 0.03 <= pos <= a + d + 0.03), None)
            if hit and tgt == target and abs(hit[1]-tgt) > 0.06:
                over.append((hit[0], hit[0]+hit[1], tgt))
        if not over:
            bad = []
            break
        bad = [(round(a, 2), round(b-a, 2)) for a, b, _t in over]
        z = retime(z, sr, over)
        fixmap = sorted(over)
        pos_list = [(pos + sum(t - (e-a) for a, e, t in fixmap if e <= pos), tgt)
                    for pos, tgt in pos_list]
    sf.write(out or wav, z, sr)
    if stray: report.append(("stray", stray))
    if bad: report.append(("!偏差", bad))
    return report

if __name__ == "__main__":
    # 用法 1（配音主流程）：commafix.py <jobs.json> <源目录> <输出目录> [逗号停顿秒] [--trim-stray]
    #   jobs.json: [{"index":n,"file":"x.wav","text":"...","out":"s0001_0.25.wav"}]
    # 用法 2（临时核对）：同上但 jobs 项无 out 字段，输出名为 seg<index>.wav
    argv = [a for a in sys.argv[1:] if not a.startswith("--")]
    trim = "--trim-stray" in sys.argv
    jobs = json.load(open(argv[0], encoding="utf-8"))
    src, od = argv[1], argv[2]
    target = float(argv[3]) if len(argv) > 3 else 0.25
    if isinstance(jobs, dict):
        jobs = [x for x in jobs.get("segments", []) if x]
    import os
    rpath = os.path.join(os.path.dirname(od.rstrip("/")), "_pause_report.json")
    try:
        allrep = json.load(open(rpath, encoding="utf-8"))
    except Exception:
        allrep = {}
    for x in jobs:
        name = x.get("out") or f"seg{x['index']}.wav"
        rep = fix(f"{src}/{x['file']}", x["text"], target=target, out=f"{od}/{name}",
                  trim_stray=trim)
        print(x["index"], rep, flush=True)
        # 报告落盘：连读/估位/偏差 的位置要能在配音跑完之后复查，不能只留在终端里
        # 用输出文件名做键（名里含文本+参数哈希），改稿后小句序号会整体平移，
        # 按序号存会留下错位的旧记录
        allrep[name] = {"text": x["text"],
                                   "report": [[(float(v) if isinstance(v, float) else v)
                                               for v in (r if isinstance(r, tuple) else [r])]
                                              for r in rep]}
        json.dump(allrep, open(rpath, "w", encoding="utf-8"), ensure_ascii=False, indent=1,
                  default=str)

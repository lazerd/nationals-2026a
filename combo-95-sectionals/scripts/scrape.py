import re, json, subprocess, sys, os, html, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tx import text

BASE = "https://leagues.ustanorcal.com/"
WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")

def get(path, fname, refresh=False):
    f = os.path.join(WEB, fname)
    if refresh or not os.path.exists(f) or os.path.getsize(f) < 1000:
        subprocess.run(["curl", "-s", "-m", "40", BASE + path, "-o", f])
        time.sleep(0.3)
    return open(f, encoding="latin-1").read()

def norm(n):  # "Cohen,Darrin" / "Cohen, Darrin" -> "Darrin Cohen"
    n = re.sub(r"\s+", " ", n).strip().strip("/").strip()
    if "," in n:
        last, first = [x.strip() for x in n.split(",", 1)]
        return f"{first} {last}".strip()
    return n

def team(tid, refresh=False):
    s = get(f"teaminfo.asp?id={tid}", f"t{tid}.html", refresh)
    t = text(s)
    name = re.search(r"Team Information \| (.+?)\s*\n", t).group(1).strip()
    cap = re.search(r"Captain: ([^\n]+?)\s*\n", t)
    area = re.search(r"Area: ([^\n]+?)\s*\n", t)
    rounds = re.findall(r"\n\s*(Local|PlayOff[^|]*?) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|", t)
    roster = []
    m = re.search(r"Team Roster(.*?)LEGEND", t, re.S)
    for line in (m.group(1) if m else "").split("\n"):
        c = [x.strip() for x in line.split("|")]
        if len(c) > 8 and re.match(r"^\d\.\d", c[3] or ""):
            wl = re.match(r"(\d+) / (\d+)", c[6])
            roster.append({"name": norm(c[0]), "rating": c[3], "w": int(wl.group(1)) if wl else 0, "l": int(wl.group(2)) if wl else 0, "P": c[12] if len(c) > 12 else ""})
    cards = re.findall(r'href=["\']?(scorecard\.asp\?id=(\d+)[^"\' >]*)', s)
    seen, out = set(), []
    for href, cid in cards:
        if cid in seen: continue
        seen.add(cid); out.append((href.replace("&amp;", "&"), cid))
    matches = [scorecard(h, c, name, refresh) for h, c in out]
    return {"id": tid, "name": name, "captain": norm(cap.group(1)) if cap else "", "area": area.group(1) if area else "",
            "rounds": [{"round": r[0].strip(), "played": int(r[2]), "w": int(r[3]), "l": int(r[4]), "lines": int(r[5])} for r in rounds],
            "roster": roster, "matches": [m for m in matches if m]}

def scorecard(href, cid, ours, refresh=False):
    s = get(href, f"sc{cid}.html", refresh)
    t = text(s)
    hm = re.search(r"\n\s*(\d\d/\d\d/\d\d) \| (.+?) \| (\d+) \| (.+?) \| (\d+) \|", t)
    if not hm: return None
    date, home, hp, away, ap = hm.groups()
    weare = "Home" if home.strip() == ours.strip() else "Visitor"
    stage = "playoff" if re.search(r"play\s*off", t, re.I) and False else None
    lines = []
    for lm in re.finditer(r"\n\s*([123]) \| (.+?) \| (.+?) \| (.*?) \| (Home|Visitor|) \|", t, re.S):
        n, hpl, vpl, score, win = lm.groups()
        hp_ = [norm(x) for x in hpl.split("/") if x.strip()]
        vp_ = [norm(x) for x in vpl.split("/") if x.strip()]
        us, them = (hp_, vp_) if weare == "Home" else (vp_, hp_)
        res = "" if not win else ("W" if win == weare else "L")
        lines.append({"line": "D" + n, "us": us, "them": them, "score": score.strip(), "result": res})
    return {"id": cid, "date": "20" + date[6:8] + "-" + date[0:2] + "-" + date[3:5], "opponent": (away if weare == "Home" else home).strip(),
            "home": weare == "Home", "pts": f"{hp if weare=='Home' else ap}-{ap if weare=='Home' else hp}", "lines": lines}

if __name__ == "__main__":
    ids = sys.argv[1].split(",")
    res = [team(i, refresh="--refresh" in sys.argv) for i in ids]
    json.dump(res, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "teams.json"), "w"), indent=1)
    for r in res:
        print(r["name"], "|", r["area"], "|", r["captain"], "|", r["rounds"], "| roster", len(r["roster"]), "| matches", len(r["matches"]))

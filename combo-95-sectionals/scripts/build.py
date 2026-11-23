import json, re, os, unicodedata
D = os.path.dirname(os.path.abspath(__file__))
T = {t["id"]: t for t in json.load(open(os.path.join(D, "teams.json")))}
TR = json.load(open(os.path.join(D, "tr.json")))
MAP = {"us": "111723", "wash": "111566", "merv": "111940", "bcsf": "111571", "goldman": "112057", "sierra": "112053", "goldriv": "112126"}
SUMMARY = {
 "us": "South Bay · 9–1 regular season, beat Almaden 3–0 in the playoff · captain Garrett Chun",
 "wash": "1st in East Bay · 8–2 · 21–9 courts · captain Charlie Dewett",
 "merv": "2nd in East Bay · 7–3 · 20–10 courts · captain Cesar Hernandez",
 "bcsf": "1st in San Francisco · 8–2 · 20–10 courts · captain Kelemen Papp",
 "goldman": "2nd in San Francisco · 6–4 · 15–15 courts · captain David Sun",
 "sierra": "1st in Sacramento · 7–3 · 19–11 courts · captain Matt Brunnquell",
 "goldriv": "2nd in Sacramento · 3–7 · 11–19 courts · captain Michael Dong",
}
def slug(s):
    s = unicodedata.normalize("NFKD", s.lower())
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", s))
FIX = {"Mtc":"MTC","Sr":"SR","Rc":"RC","Tc":"TC","Hs":"HS","Sf":"SF","Ta/Nicholl":"TA/Nicholl"}
def short(n):
    n = re.sub(r"\s*\[.*\]$", "", n)
    m = re.search(r"\s*CM9\.5([A-Z])$", n); suf = m.group(1) if m else "A"
    n = re.sub(r"\s*CM9\.5[A-Z]$", "", n)
    w = " ".join(FIX.get(x, x) for x in n.title().split())
    return w + ("" if suf == "A" else " " + suf)

NOTES = {  # (team, player) -> (out, note)
 ("wash", "Ryan Sablan"): (True, "Also on our roster — played our 11/22 playoff, so he's locked to Sunnyvale"),
 ("bcsf", "Ryan Sablan"): (True, "Also on our roster — played our 11/22 playoff, so he's locked to Sunnyvale"),
 ("merv", "Bryce Young"): (False, "Also rostered on Bay Club SF — can only play Sectionals for one of them"),
 ("bcsf", "Bryce Young"): (False, "Also rostered on Mervyn Morris — can only play Sectionals for one of them"),
 ("merv", "Brian Higashi"): (False, "Also on our roster — if he plays Mervyn's playoff he's theirs for Sectionals"),
 ("us", "Brian Higashi"): (False, "Also rostered on Mervyn Morris — if he plays their playoff he's locked to them"),
}
out, unmatched = {}, []
for key, tid in MAP.items():
    t = T[tid]; tr = {k.lower(): v for k, v in TR.get(tid, {}).items()}
    players = {}
    def add(name, rating=None):
        pid = slug(name)
        if pid not in players:
            r = tr.get(name.lower())
            if r is None: unmatched.append((key, name))
            ntrp = float(rating[:3]) if rating else (r["ntrp"] if r else None)
            o, note = NOTES.get((key, name), (False, ""))
            players[pid] = {"id": pid, "name": name, "ntrp": ntrp, "tr": r["tr"] if r else None, "out": o, "note": note}
        return pid
    for p in t["roster"]: add(p["name"], p["rating"])
    matches = []
    for m in sorted(t["matches"], key=lambda m: m["date"]):
        if not m["lines"]: continue
        matches.append({"id": "nc" + m["id"], "date": m["date"], "stage": "playoff" if m["date"] >= "2026-11-12" else "regular",
            "opponent": short(m["opponent"]), "pts": m["pts"],
            "lines": [{"line": l["line"], "players": [add(n) for n in l["us"] if n.lower() != "default"], "result": l["result"], "score": l["score"], "vs": " / ".join(n for n in l["them"] if n.lower() != "default") or "(default)"} for l in m["lines"]]})
    doc = {"name": short(t["name"]), "teamName": t["name"], "summary": SUMMARY[key], "players": list(players.values()), "matches": matches,
           "plan": {}, "notes": "", "knownPairs": [], "weights": {"regular": 1, "playoff": 2, "sectional": 2, "recent": 1.5}}
    if key == "us":
        last = matches[-1]
        doc["knownPairs"] = [l["players"] for l in last["lines"]]
    out[key] = doc
json.dump(out, open(os.path.join(D, "docs.json"), "w"))
for k, d in out.items(): print(k, len(d["players"]), "players", len(d["matches"]), "matches", sum(1 for p in d["players"] if p["tr"] is None), "no TR")
print("unmatched:", unmatched)
print("size", len(json.dumps(out)))

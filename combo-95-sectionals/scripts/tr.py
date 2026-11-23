import re, json, subprocess, os, sys, html, urllib.parse, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tx import text
D = os.path.dirname(os.path.abspath(__file__))
teams = json.load(open(os.path.join(D, "teams.json")))
out = {}
for t in teams:
    nm = re.sub(r"\s*\[.*\]$", "", t["name"]).strip()
    f = os.path.join(D, "web", "tr_" + re.sub(r"\W+", "_", nm) + ".html")
    if not os.path.exists(f) or os.path.getsize(f) < 2000:
        subprocess.run(["curl", "-s", "-m", "40", "https://www.tennisrecord.com/adult/teamprofile.aspx?teamname=" + urllib.parse.quote(nm) + "&year=2026", "-o", f]); time.sleep(0.5)
    s = text(open(f, encoding="utf-8", errors="replace").read())
    cells = [c.strip() for c in re.split(r"\|\s*\n?", s)]
    rows = {}
    try:
        i = cells.index("Rating") + 1
    except ValueError:
        print("NO TABLE", nm); continue
    cells = cells[:i] + [c for c in cells[i:] if not re.fullmatch(r"[A-Z]{1,2}", c)]
    while i + 5 < len(cells):
        name, loc, ntrp, rec, loc_d, rat = cells[i:i+6]
        if not re.match(r"^\d\.\d$", ntrp): break
        rows[name] = {"ntrp": float(ntrp), "tr": float(rat) if re.match(r"^\d\.\d+$", rat) else None, "record": rec, "loc": loc}
        i += 6
    out[t["id"]] = rows
    print(nm, len(rows), "players;", sum(1 for r in rows.values() if r["tr"]), "rated")
json.dump(out, open(os.path.join(D, "tr.json"), "w"), indent=1)

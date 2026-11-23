"""Deploy combo-95-sectionals (index.html + data.json) to Vercel as a static site.
The token is injected by the session's network proxy, so the Authorization header here is a placeholder."""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAME = sys.argv[1] if len(sys.argv) > 1 else "sunnyvale-combo-scouting"
TEAM = sys.argv[2] if len(sys.argv) > 2 else ""

files = []
for f in ["index.html", "data.json"]:
    files.append({"file": f, "data": open(os.path.join(HERE, f), encoding="utf-8").read()})
body = {"name": NAME, "files": files, "target": "production",
        "projectSettings": {"framework": None, "buildCommand": None, "outputDirectory": None, "installCommand": None}}
url = "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1" + (f"&teamId={TEAM}" if TEAM else "")
out = subprocess.run(["curl", "-s", "-m", "120", "-X", "POST", url, "-H", "Authorization: Bearer proxy-injected",
                      "-H", "Content-Type: application/json", "--data-binary", "@-"],
                     input=json.dumps(body), capture_output=True, text=True).stdout
d = json.loads(out)
if "error" in d:
    print("ERROR", d["error"]); sys.exit(1)
print("id", d.get("id"), "state", d.get("readyState"), "url", d.get("url"), "alias", d.get("alias"))

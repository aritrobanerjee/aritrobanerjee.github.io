import glob
import re
import os

deliverables_dir = r"C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy"
md_files = glob.glob(os.path.join(deliverables_dir, "*.md"))

patterns = [r"\bTODO\b", r"\bFIXME\b", r"\bPLACEHOLDER\b", r"\bTBD\b", r"\bXXX\b"]

matches = []

for md in md_files:
    fname = os.path.basename(md)
    with open(md, encoding="utf-8") as f:
        lines = f.readlines()
    for idx, line in enumerate(lines, 1):
        for p in patterns:
            if re.search(p, line, re.IGNORECASE):
                matches.append((fname, idx, line.strip()))

print(f"Total potential placeholder matches found: {len(matches)}")
for m in matches:
    print(f"  [{m[0]}:{m[1]}] {m[2]}")

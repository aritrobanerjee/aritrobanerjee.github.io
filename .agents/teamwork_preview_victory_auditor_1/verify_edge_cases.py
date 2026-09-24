import re

matrix_path = r"C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\05_EDGE_CASE_MATRIX_AND_VERIFICATION.md"
with open(matrix_path, encoding="utf-8") as f:
    text = f.read()

# Extract all E## identifiers
e_ids = sorted(set(re.findall(r"\*\*(E\d{2})\*\*", text)))
print(f"Total edge case IDs found: {len(e_ids)}")
print(f"First: {e_ids[0]}, Last: {e_ids[-1]}")
expected = [f"E{i:02d}" for i in range(1, 33)]
assert e_ids == expected, f"Mismatch in edge cases: set difference {set(expected) - set(e_ids)}"
print("SUCCESS: All 32 edge cases (E01 - E32) are sequentially defined and present in master table.")

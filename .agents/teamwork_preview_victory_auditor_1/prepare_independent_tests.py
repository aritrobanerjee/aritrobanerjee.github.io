import re
import os

work_dir = r"C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\teamwork_preview_victory_auditor_1"
deliverables_dir = r"C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy"

# 1. PR 1 Extraction
with open(os.path.join(deliverables_dir, "02_PR1_CORE_REFUTATION_SUMMARY.md"), encoding="utf-8") as f:
    pr1_md = f.read()

# Extract Section 5 code
sec5_m = re.search(r"## 5\. Complete Production Implementation.*?```python\s*(.*?)\s*```", pr1_md, re.DOTALL)
pr1_impl = sec5_m.group(1)

# Extract Section 7 tests
sec7_m = re.search(r"## 7\. Comprehensive Unit Test Suite.*?```python\s*(.*?)\s*```", pr1_md, re.DOTALL)
pr1_test = sec7_m.group(1)

# In test, rewire the import of refutation_summary to local namespace
pr1_test_rewired = re.sub(
    r"from dowhy\.causal_refuters\.refutation_summary import \(.*?\)",
    "# imported from local implementation above",
    pr1_test,
    flags=re.DOTALL
)

pr1_full = f"""# Independent PR 1 Verification Test Suite
{pr1_impl}

{pr1_test_rewired}
"""

with open(os.path.join(work_dir, "test_pr1_audit.py"), "w", encoding="utf-8") as f:
    f.write(pr1_full)

print("test_pr1_audit.py written successfully.")

# 2. PR 3 Extraction
with open(os.path.join(deliverables_dir, "04_PR3_NETWORK_INTERFERENCE_REFUTER.md"), encoding="utf-8") as f:
    pr3_md = f.read()

sec6_m = re.search(r"### 6\.1 Target File:.*?```python\s*(.*?)\s*```", pr3_md, re.DOTALL)
pr3_impl = sec6_m.group(1)

sec7_m = re.search(r"### 7\.1 Target File:.*?```python\s*(.*?)\s*```", pr3_md, re.DOTALL)
pr3_test = sec7_m.group(1)

pr3_test_rewired = re.sub(
    r"from dowhy\.causal_refuters\.network_interference_refuter import \(.*?\)",
    "# imported from local implementation above",
    pr3_test,
    flags=re.DOTALL
)

pr3_full = f"""# Independent PR 3 Verification Test Suite
{pr3_impl}

{pr3_test_rewired}
"""

with open(os.path.join(work_dir, "test_pr3_audit.py"), "w", encoding="utf-8") as f:
    f.write(pr3_full)

print("test_pr3_audit.py written successfully.")

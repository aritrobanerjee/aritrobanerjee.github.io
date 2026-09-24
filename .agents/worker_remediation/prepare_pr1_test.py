import re

with open(r"c:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\02_PR1_CORE_REFUTATION_SUMMARY.md", "r", encoding="utf-8") as f:
    content = f.read()

# Section 5 implementation
sec5_start = content.find("## 5. Complete Production Implementation")
sec5_code_start = content.find("```python\n", sec5_start) + len("```python\n")
sec5_code_end = content.find("\n```\n\n---", sec5_code_start)
impl_code = content[sec5_code_start:sec5_code_end]

# Section 7 unit tests
sec7_start = content.find("## 7. Comprehensive Unit Test Suite")
sec7_code_start = content.find("```python\n", sec7_start) + len("```python\n")
sec7_code_end = content.find("\n```\n\n---", sec7_code_start)
test_code = content[sec7_code_start:sec7_code_end]

# In test_code, replace dowhy.causal_refuters.refutation_summary imports
test_code = re.sub(
    r"from dowhy\.causal_refuters\.refutation_summary import \(.*?\)",
    "# imported locally",
    test_code,
    flags=re.DOTALL,
)

combined = impl_code + "\n\n" + test_code

with open(r"c:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\worker_remediation\generated_pr1_test.py", "w", encoding="utf-8") as f:
    f.write(combined)

print("Generated generated_pr1_test.py successfully!")

import re
import ast
import numpy as np
import pandas as pd
import pytest
from scipy import sparse

# Read and extract code from 04_PR3_NETWORK_INTERFERENCE_REFUTER.md
with open(r"c:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\04_PR3_NETWORK_INTERFERENCE_REFUTER.md", "r", encoding="utf-8") as f:
    content = f.read()

# Extract code block from Section 6.1
sec6_start = content.find("### 6.1 Target File:")
sec6_code_start = content.find("```python\n", sec6_start) + len("```python\n")
sec6_code_end = content.find("\n```\n\n### 6.2", sec6_code_start)
impl_code = content[sec6_code_start:sec6_code_end]

# Extract tests from Section 7.1
sec7_start = content.find("### 7.1 Target File:")
sec7_code_start = content.find("```python\n", sec7_start) + len("```python\n")
sec7_code_end = content.find("\n```\n\n---", sec7_code_start)
test_code = content[sec7_code_start:sec7_code_end]

# Replace import in test_code
test_code = re.sub(
    r"from dowhy\.causal_refuters\.network_interference_refuter import \(.*?\)",
    "# imported from local namespace",
    test_code,
    flags=re.DOTALL,
)

combined_code = impl_code + "\n\n" + test_code

with open(r"c:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\worker_remediation\generated_pr3_test.py", "w", encoding="utf-8") as f:
    f.write(combined_code)

print("Generated generated_pr3_test.py successfully!")

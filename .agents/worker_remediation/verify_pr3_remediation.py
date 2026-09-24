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

# Replace the import from dowhy.causal_refuters.network_interference_refuter with a comment
test_code = re.sub(
    r"from dowhy\.causal_refuters\.network_interference_refuter import \(.*?\)",
    "# imported from local namespace",
    test_code,
    flags=re.DOTALL,
)

print(f"Extracted impl_code: {len(impl_code)} chars")
print(f"Extracted test_code: {len(test_code)} chars")

namespace = {}
exec(impl_code, namespace)
print("PR3 implementation parsed and compiled successfully!")

exec(test_code, namespace)
print("PR3 tests compiled successfully!")

# Run tests
print("Running synthetic spillover experiment fixture...")
spillover_data = namespace["synthetic_spillover_experiment"]()

print("Testing cluster leave-one-out mode...")
namespace["test_cluster_leave_one_out_mode"](spillover_data)
print("PASS: test_cluster_leave_one_out_mode passed!")

print("Testing pre-flight NaN null check (E27)...")
namespace["test_missing_values_raise_value_error"](spillover_data)
print("PASS: test_missing_values_raise_value_error passed!")

print("Testing true spillover detection...")
namespace["test_network_interference_detects_true_spillover"](spillover_data)
print("PASS: test_network_interference_detects_true_spillover passed!")

print("Testing disconnected graph...")
namespace["test_disconnected_graph_returns_null_safely"](spillover_data)
print("PASS: test_disconnected_graph_returns_null_safely passed!")

print("Testing clean null experiment fixture...")
null_data = namespace["clean_null_experiment"]()
namespace["test_network_interference_retains_null_when_no_spillover"](null_data)
print("PASS: test_network_interference_retains_null_when_no_spillover passed!")

print("Testing sparse matrix support...")
namespace["test_sparse_matrix_support"](spillover_data)
print("PASS: test_sparse_matrix_support passed!")

print("Testing precomputed exposure vector...")
namespace["test_precomputed_exposure_vector"](spillover_data)
print("PASS: test_precomputed_exposure_vector passed!")

print("Testing invalid parameter bounds...")
namespace["test_small_sample_size_raises_value_error"]()
namespace["test_invalid_exposure_decay_raises_value_error"](spillover_data)
namespace["test_dimension_mismatch_raises_value_error"](spillover_data)
namespace["test_self_loops_raise_value_error"](spillover_data)
namespace["test_multiple_input_modes_raise_value_error"](spillover_data)
print("PASS: all validation error tests passed!")

print("\n>>> ALL PR3 TESTS AND DEFENSIVE CHECKS PASSED 100%! <<<")

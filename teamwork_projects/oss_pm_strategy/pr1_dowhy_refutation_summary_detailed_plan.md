# PR 1 Detailed Strategy & Implementation Plan: `refutation_summary` (PyWhy DoWhy)

**Target Repository**: `py-why/dowhy`  
**Parent Issues Addressed**:
- [Issue #847](https://github.com/py-why/dowhy/issues/847): *"Improvement documentation | Refutation results"* (Community request: 4 upvotes, 14 comments)
- [Issue #532](https://github.com/py-why/dowhy/issues/532): *"Guide on refutations and how to interpret p-values"* (Filed directly by core maintainer Amit Sharma)
- [Issue #816](https://github.com/py-why/dowhy/issues/816): *"Improvement of the documentation | Estimation output"*

---

## 1. Executive Summary & Value Proposition

### 1.1 The Pain Point
In causal inference workflows with DoWhy, users follow the 4-step pipeline:
1. `model = CausalModel(...)`
2. `estimand = model.identify_effect(...)`
3. `estimate = model.estimate_effect(...)`
4. `refutation = model.refute_estimate(...)`

While Step 3 gives an estimate (e.g. `2.34`), Step 4 requires running multiple falsification tests (Placebo Treatment, Add Random Common Cause, Data Subset, Dummy Outcome, Unobserved Common Cause). Each test returns a separate `CausalRefutation` object with idiosyncratic attributes, p-values, and string representations.

Practitioners (data scientists, econometrics engineers, platform PMs) are forced to write ad-hoc helper scripts to:
- Aggregate multiple `CausalRefutation` outputs into a single tabular comparison.
- Understand what the p-value actually means for each specific test (e.g., in Placebo, high p-value means pass; in other tests, stability around the original estimate is what matters).
- Present an executive or team-ready diagnostic table without hand-crafting markdown or slides.

### 1.2 The Proposed Solution
Implement a clean, robust formatting and interpretation utility:
```python
from dowhy.causal_refuters import refutation_summary

# Or:
summary = refutation_summary(refutations=[placebo_res, random_cause_res, subset_res])
print(summary.to_text())
print(summary.to_markdown())
df = summary.to_dataframe()
```

---

## 2. Technical Architecture & Codebase Grounding

### 2.1 Where It Fits in DoWhy
- **Location**: `dowhy/causal_refuters/refutation_summary.py` (or `dowhy/interpreters/refutation_summary_interpreter.py`).
- **Exporting**: Exported via `dowhy/causal_refuters/__init__.py` and exposed as a method/utility function:
  `refutation_summary(refutations, estimate=None, format="text")`
- **Zero Breaking Changes**: Fully additive. Does not modify any underlying math, estimator, or existing refuter classes.
- **Dependencies**: Uses standard library (`dataclasses`, `typing`) + `pandas` (already a core dependency).

### 2.2 `CausalRefutation` Attribute Map & Interpretations

| Refuter Method | Key Attributes | What Constitutes a "Pass" | Interpretation Logic |
|---|---|---|---|
| **Placebo Treatment** (`PlaceboTreatmentRefuter`) | `new_effect`, `p_value` | `new_effect ≈ 0` and `p_value > 0.05` | When treatment is randomized/zeroed, estimated effect vanishes. |
| **Add Random Common Cause** (`RandomCommonCause`) | `new_effect`, `p_value` | `new_effect ≈ original_effect` | Effect is invariant to adding independent random noise as a confounder. |
| **Data Subset Refuter** (`DataSubsetRefuter`) | `new_effect`, `p_value` | `new_effect ≈ original_effect` | Effect is stable across random sample subsets (not driven by outliers). |
| **Dummy Outcome Refuter** (`DummyOutcomeRefuter`) | `new_effect`, `p_value` | `new_effect ≈ 0` and `p_value > 0.05` | Replacing outcome with random noise removes any causal signal. |
| **Add Unobserved Common Cause** | `e_value`, `critical_effect` | Sensitivity threshold evaluation | Measures required unobserved confounding strength to nullify effect. |

---

## 3. Specification & API Design

### 3.1 Data Structures
```python
from dataclasses import dataclass
from typing import List, Optional, Union
import pandas as pd
from dowhy.causal_refuter import CausalRefutation
from dowhy.causal_estimator import CausalEstimate

@dataclass
class RefutationSummaryRow:
    method_name: str
    original_effect: float
    new_effect: float
    effect_difference: float
    percent_change: Optional[float]
    p_value: Optional[float]
    status: str  # "PASS", "FAIL", "WARNING", "INCONCLUSIVE"
    interpretation: str

class RefutationSummary:
    def __init__(self, rows: List[RefutationSummaryRow]):
        self.rows = rows

    def to_dataframe(self) -> pd.DataFrame:
        ...

    def to_text(self) -> str:
        ...

    def to_markdown(self) -> str:
        ...

    def __repr__(self) -> str:
        return self.to_text()
```

### 3.2 Output Format Mockup

```text
====================================================================================================
                                      DOWHY REFUTATION SUMMARY                                      
====================================================================================================
Method                  Original   New Effect   % Change   p-value   Status   Interpretation
----------------------------------------------------------------------------------------------------
Placebo Treatment       2.3400     0.0120       -99.49%    0.8420    PASS     Effect vanishes under placebo
Random Common Cause     2.3400     2.3150       -1.07%     0.7890    PASS     Robust to independent noise
Data Subset (0.8)       2.3400     2.2980       -1.79%     0.9120    PASS     Stable across subsets
----------------------------------------------------------------------------------------------------
Overall Assessment: 3/3 refutations PASSED. Estimated effect appears statistically robust.
====================================================================================================
```

---

## 4. Step-by-Step Implementation Roadmap

### Step 1: Pre-Submission Community Alignment (Issue #847)
Leave a constructive, concise comment on Issue #847 outlining the proposal:
> *"Hi @amit-sharma and @Klesel - I noticed this issue and #532 asking for a standardized way to summarize and interpret refutation outputs. I have drafted a lightweight, zero-dependency `refutation_summary` utility that formats multiple `CausalRefutation` results into a clean table (Text, Markdown, DataFrame) with plain-English pass/fail interpretations per method. Would the team welcome a PR for this?"*

### Step 2: Implementation Files
1. `dowhy/causal_refuters/refutation_summary.py`: Core dataclass, formatting logic, rules engine.
2. `dowhy/causal_refuters/__init__.py`: Export `refutation_summary`, `RefutationSummary`.
3. `tests/causal_refuters/test_refutation_summary.py`: Unit tests with mock `CausalRefutation` and real synthetic model pipelines.

### Step 3: Test Coverage Plan
- Test with single refuter result vs. list of multiple refuters.
- Test handling of missing p-values or custom simulation counts.
- Test formatting outputs (`to_markdown`, `to_dataframe`, `to_text`).
- Test edge cases (division by zero when `original_effect == 0`).

---

## 5. Trust Ladder Progression

1. **PR 1 (This PR)**: `refutation_summary` utility function + test suite. Addresses community pain points (#847, #532). Small, safe, high-leverage (~150 LOC).
2. **PR 2 (Follow-up)**: `ExecutiveReportInterpreter` (under `dowhy/interpreters/`) providing complete executive diagnostics, defensibility grades, and HTML export.
3. **PR 3 (Novel Research / Extension)**: `NetworkInterferenceRefuter` for detecting SUTVA violations in graph/marketplace data.

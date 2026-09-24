# Adversarial Review & Empirical Verification Report: PR 1 Refutation Summary

**Target Artifacts**:
- `teamwork_projects/pywhy_pr_strategy/02_PR1_CORE_REFUTATION_SUMMARY.md`
- `teamwork_projects/pywhy_pr_strategy/05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`

**Auditor / Challenger**: Challenger 1 (Empirical Code Execution & LOC Budget Challenger)  
**Date**: 2026-09-22T00:10:00Z  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Executive Summary & Verification Overview

As an Empirical Challenger, the proposed production implementation for DoWhy PR 1 (`dowhy/causal_refuters/refutation_summary.py`) was subjected to automated AST/tokenized line audits and direct runtime execution in a clean Python 3.11 environment with `dowhy 0.14`, `numpy 2.4.6`, and `pandas 3.0.6`.

### Key Verification Metrics:
- **Operational LOC Budget**: **122 Source Lines of Code (SLOC)** (including imports; **118 SLOC** excluding imports). **PASS (< 150 LOC)**.
- **Arithmetic Edge Cases (`original_effect == 0.0`)**: **PASS** (Correctly avoids `ZeroDivisionError`, returns `"% Change": "N/A"`).
- **Polymorphic Ingestion (Tuples, Arrays, None p-values)**: **PASS** (Bounds formatted cleanly, p-values mapped to `"Sensitivity"` / `"N/A"`).
- **DataFrame & Text Formats**: **PASS** (Clean tabular formatting, correct column headers).
- **String Input / Invalid Elements Ingestion**: **FAIL (CRITICAL)** — Unhandled `RecursionError` in `_flatten_refutations`.
- **Markdown Export (`to_markdown`)**: **FAIL (CRITICAL)** — Unhandled `ImportError` in clean DoWhy environments missing `tabulate`.
- **API Consistency**: **WARN (MEDIUM)** — `effect_tolerance` parameter is defined, passed, documented, but completely unreferenced in verdict derivation.

---

## 2. Critical Challenges & Empirical Bug Reports

### [CRITICAL] Challenge 1: Infinite Recursion & `RecursionError` in `_flatten_refutations`

- **Assumption Challenged**: That `_flatten_refutations` safely filters out non-refutation items and flattens nested iterables.
- **Attack Scenario**: Passing any string into `refutation_summary` (e.g. `refutation_summary(["not_a_refutation", 42])` or `refutation_summary("Refute: Placebo")`).
- **Empirical Execution**:
  ```python
  from dowhy.causal_refuters.refutation_summary import refutation_summary
  invalid_summary = refutation_summary(["not_a_refutation", 42])
  ```
- **Verbatim Runtime Error**:
  ```text
  Traceback (most recent call last):
    File "<string>", line 123, in refutation_summary
    File "<string>", line 18, in _flatten_refutations
    File "<string>", line 18, in _flatten_refutations
    ...
    [Previous line repeated 993 more times]
    File "<string>", line 16, in _flatten_refutations
  RecursionError: maximum recursion depth exceeded in __instancecheck__
  ```
- **Root Cause**:
  In `02_PR1_CORE_REFUTATION_SUMMARY.md:175-177`:
  ```python
  elif isinstance(items, (list, tuple, set)) or hasattr(items, "__iter__"):
      for sub in items:
          yield from _flatten_refutations(sub)
  ```
  In Python, strings (`str`, `bytes`) are iterables (`hasattr(s, "__iter__") == True`). Iterating over a string produces 1-character strings. A 1-character string is itself an iterable of 1-character strings. This creates infinite recursion on 1-character strings until Python exceeds recursion depth.
- **Severity**: **CRITICAL**. This bug directly breaks the author's own unit test in Section 7, line 516 (`test_empty_and_invalid_inputs`).
- **Mitigation**: Add an explicit guard for string and byte sequences:
  ```python
  def _flatten_refutations(items: Any) -> Iterable[CausalRefutation]:
      if isinstance(items, CausalRefutation):
          yield items
      elif isinstance(items, (str, bytes)):
          return
      elif isinstance(items, (list, tuple, set)) or hasattr(items, "__iter__"):
          for sub in items:
              yield from _flatten_refutations(sub)
  ```

---

### [CRITICAL] Challenge 2: Hidden Foreign Dependency Crash on `to_markdown()` (`ImportError`)

- **Assumption Challenged**: The blueprint claims "Zero Foreign Dependencies: Built exclusively on Python standard library and pandas / numpy" (line 43) and assures maintainers: *"Does this add dependencies like tabulate or rich? Zero foreign dependencies"* (line 583).
- **Attack Scenario**: Running `refutation_summary(ref, output_format="markdown")` or calling `summary.to_markdown()` in a standard upstream DoWhy installation.
- **Empirical Execution**:
  Checked `pyproject.toml` of `py-why/dowhy` and checked installed packages in a standard DoWhy environment: `tabulate` is NOT installed.
  Executing `refutation_summary(ref, output_format="markdown")`:
- **Verbatim Runtime Error**:
  ```text
  ImportError: `Import tabulate` failed. Use pip or conda to install the tabulate package.
  ```
- **Root Cause**:
  `RefutationSummary.to_markdown()` calls `self._df.to_markdown(index=False)`. Pandas delegates `to_markdown` to the optional third-party library `tabulate`. Because DoWhy does not list `tabulate` in its mandatory dependencies, calling `to_markdown()` raises `ImportError` on any vanilla DoWhy setup.
- **Severity**: **CRITICAL**. Contradicts the PR's core selling proposition of zero new dependencies and causes runtime crashes on advertised public API features.
- **Mitigation**: Implement a lightweight, zero-dependency pure-Python fallback table formatter inside `to_markdown()`:
  ```python
  def to_markdown(self) -> str:
      if self._df.empty:
          return "No refutations to summarize."
      header = f"### Causal Refutation Summary (alpha={self.alpha:.2f})\n"
      note = "\n*Note: Negative control & invariance tests pass when p >= alpha (retaining the null hypothesis).*\n"
      try:
          table = self._df.to_markdown(index=False)
      except ImportError:
          cols = list(self._df.columns)
          widths = [max(len(str(c)), max((len(str(v)) for v in self._df[c]), default=0)) for c in cols]
          h_str = "| " + " | ".join(c.ljust(w) for c, w in zip(cols, widths)) + " |"
          sep_str = "| " + " | ".join("-" * max(w, 3) for w in widths) + " |"
          rows_str = ["| " + " | ".join(str(val).ljust(w) for val, w in zip(row, widths)) + " |" for row in self._df.itertuples(index=False)]
          table = "\n".join([h_str, sep_str] + rows_str)
      return header + table + note
  ```

---

### [MEDIUM] Challenge 3: Phantom / Dead Parameter `effect_tolerance`

- **Assumption Challenged**: The docstring states:
  `:param effect_tolerance: Maximum acceptable fractional drift in point estimate (|Δ| / |orig|) for invariance tests (default: 0.10).`
- **Attack Scenario**: Setting `effect_tolerance = 0.01` on an invariance test where point estimate drifts by 80%, but $p = 0.40$.
- **Empirical Observation**:
  In `_determine_status_and_interpretation(name, orig_val, new_val, p_val, alpha, tolerance)` (lines 200-223), `tolerance` is never read or referenced. Status is determined purely by `p_val >= alpha`.
- **Severity**: **MEDIUM**. Misleads users into believing an effect drift tolerance guard is active when it is completely dead code.
- **Mitigation**: Either:
  1. Actively evaluate effect drift in invariance tests: if `pct_change` exceeds `effect_tolerance`, flag the interpretation or status.
  2. Or, if intentionally deferred to PR 2 to maintain maintainer consensus on descriptive verdicts, explicitly document that `effect_tolerance` is currently reserved or remove it from PR 1 to prevent maintainer review friction.

---

## 3. Operational Lines of Code (LOC) Audit

We performed an AST and lexical tokenization audit on lines 160–331 of `teamwork_projects/pywhy_pr_strategy/02_PR1_CORE_REFUTATION_SUMMARY.md`:

| Category | Line Count | Notes |
|---|---|---|
| **Total Physical Lines in Snippet** | 171 | Lines 160–330 inclusive |
| **Docstrings** | 21 | Module, class, and function docstrings |
| **Comments (`#`)** | 2 | Inline comments |
| **Blank Lines** | 28 | PEP8 whitespace |
| **Imports** | 4 | `typing`, `numpy`, `pandas`, `dowhy.causal_refuter` |
| **Operational Code (SLOC excluding imports)** | **118** | Pure functional and class execution statements |
| **Total SLOC (including imports)** | **122** | Measured via Python `tokenize` |
| **LOC Budget Limit** | **< 150** | **COMPLIANT** (28 lines under budget) |
| **Projected SLOC with Bug Fixes** | **131** | **COMPLIANT** (19 lines under budget) |

---

## 4. Empirical Test Suite Matrix

The table below summarizes empirical execution results of all 16 test cases executed against the Python runtime:

| Test ID | Scenario | Input Data / Condition | Expected Output | Original Code | Fixed Code |
|---|---|---|---|---|---|
| **T01** | Invariant Test (Robust) | RCC: `orig=1.25, new=1.24, p=0.42` | Status: `"Robust"`, `"Passed: estimate invariant"` | **PASS** | **PASS** |
| **T02** | Invariant Test (Fragile) | Subset: `orig=1.50, new=0.80, p=0.012` | Status: `"Fragile"`, `"Failed: estimate shifted"` | **PASS** | **PASS** |
| **T03** | Placebo Test (Robust) | Placebo: `orig=2.0, new=0.01, p=0.85` | Status: `"Robust"`, `"Passed: effect vanishes"` | **PASS** | **PASS** |
| **T04** | Placebo Test (Fragile) | Placebo: `orig=2.0, new=1.95, p=0.002` | Status: `"Fragile"`, `"Failed: spurious effect"` | **PASS** | **PASS** |
| **T05** | Zero Baseline Effect | `orig=0.0, new=0.05, p=0.30` | `Original: "0.0000"`, `% Change: "N/A"` | **PASS** | **PASS** |
| **T06** | Missing p-value (Sensitivity) | `AddUnobservedCommonCause`, `new=(-0.2, 0.5)` | Status: `"Sensitivity"`, `p-value: "N/A"` | **PASS** | **PASS** |
| **T07** | Missing p-value (Diagnostic) | Custom diagnostic, `p_val=None` | Status: `"N/A"`, `p-value: "N/A"` | **PASS** | **PASS** |
| **T08** | Tuple Bounds Formatting | `new_effect = (-0.2, 0.5)` | Formats as `"[-0.2000, 0.5000]"` | **PASS** | **PASS** |
| **T09** | 1D NumPy Array Effect | `orig = np.array([2.5])` | Formats as `"2.5000"` | **PASS** | **PASS** |
| **T10** | Multi-element Array Effect | `new = np.array([2.3, 2.7])` | Formats as `"[2.3000, 2.7000]"` | **PASS** | **PASS** |
| **T11** | Nested List Unpacking | `[ref1, [ref2, [ref3, ref4]]]` | Flattens to 4 rows | **PASS** | **PASS** |
| **T12** | DataFrame Export | `output_format="dataframe"` | Returns `pd.DataFrame` instance | **PASS** | **PASS** |
| **T13** | Text Table Export | `output_format="text"` | Returns plain-text table string | **PASS** | **PASS** |
| **T14** | HTML Repr | `summary._repr_html_()` | Returns table HTML with caption | **PASS** | **PASS** |
| **T15** | String & Invalid Ingestion | `["not_a_refutation", 42]` | Gracefully ignores invalid items | **FAIL (RecursionError)** | **PASS** |
| **T16** | Markdown Export (Clean Env) | `output_format="markdown"` | Returns GFM table without `tabulate` | **FAIL (ImportError)** | **PASS** |

---

## 5. Recommended Code Patch for Blueprint 02

To resolve these empirical failures before maintainer submission, apply the following modifications to `dowhy/causal_refuters/refutation_summary.py`:

```python
# 1. Fix _flatten_refutations to terminate recursion on strings/bytes
def _flatten_refutations(items: Any) -> Iterable[CausalRefutation]:
    """Recursively unwraps single refutations, lists, or nested iterables."""
    if isinstance(items, CausalRefutation):
        yield items
    elif isinstance(items, (str, bytes)):
        return
    elif isinstance(items, (list, tuple, set)) or hasattr(items, "__iter__"):
        for sub in items:
            yield from _flatten_refutations(sub)


# 2. Fix RefutationSummary.to_markdown to provide a zero-dependency pure-python fallback
def to_markdown(self) -> str:
    """Returns the summary formatted as a GitHub-flavored Markdown table."""
    if self._df.empty:
        return "No refutations to summarize."
    header = f"### Causal Refutation Summary (alpha={self.alpha:.2f})\n"
    note = "\n*Note: Negative control & invariance tests pass when p >= alpha (retaining the null hypothesis).*\n"
    try:
        table = self._df.to_markdown(index=False)
    except ImportError:
        cols = list(self._df.columns)
        widths = [max(len(str(c)), max((len(str(v)) for v in self._df[c]), default=0)) for c in cols]
        h_str = "| " + " | ".join(c.ljust(w) for c, w in zip(cols, widths)) + " |"
        sep_str = "| " + " | ".join("-" * max(w, 3) for w in widths) + " |"
        rows_str = [
            "| " + " | ".join(str(val).ljust(w) for val, w in zip(row, widths)) + " |"
            for row in self._df.itertuples(index=False)
        ]
        table = "\n".join([h_str, sep_str] + rows_str)
    return header + table + note
```

With these two fixes:
- All 16 unit tests pass 100%.
- Operational SLOC rises from 122 to 131, remaining well below the 150 LOC threshold.
- The PR honors its absolute promise of zero foreign dependencies.

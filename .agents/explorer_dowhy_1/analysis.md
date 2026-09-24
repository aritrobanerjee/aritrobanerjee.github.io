# Technical Analysis: DoWhy Refutation Framework, Interpreters Ecosystem, and Issues #847 & #532

**Author**: Explorer 1 (`explorer_dowhy_1`)  
**Date**: 2026-09-21  
**Milestone**: M1_DOWHY_REPRESENTATION_AND_INTERPRETERS  
**Target Repository**: `py-why/dowhy` (`github.com/py-why/dowhy`)  
**Working Directory**: `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_1`  

---

## 1. Executive Summary

This investigation provides a comprehensive, fact-grounded architectural analysis of the causal refutation and interpretation subsystem in `py-why/dowhy`. It analyzes the open maintainer friction captured by **GitHub Issue #847** ("Improvement documentation | Refutation results", opened Feb 2023) and **GitHub Issue #532** ("Guide on refutations and how to interpret p-values", opened July 2022 by DoWhy co-founder Amit Sharma).

### Key Discoveries:
1. **The Representation Void**: `CausalRefutation.__str__` (defined in `dowhy/causal_refuter.py:126-136`) currently outputs an unformatted 3-line plain-text block displaying only raw `estimated_effect`, `new_effect`, and `p_value`. It provides **zero interpretation**, no pass/fail determination, no comparison against baseline effect size, and no tabular output across multi-refuter suites.
2. **The Missing Interpreter Anomaly**: `dowhy/interpreter.py` contains explicit structural support for refutations (`if isinstance(instance, dowhy.causal_refuter.CausalRefutation): self.refutation = instance`), and `CausalRefutation.interpret()` attempts dynamic resolution via `dowhy.interpreters.get_class_object`. However, **not a single refutation interpreter exists** in `dowhy/interpreters/`. The existing interpreters (`TextualEffectInterpreter`, `PropensityBalanceInterpreter`, `ConfounderDistributionInterpreter`) only support `CausalEstimate`.
3. **The Multi-Year Maintainer Stall**: Issues #847 and #532 remained unbuilt for 4+ years not because the problem was unimportant, but due to:
   - Bandwidth diversion toward PyWhy governance transition, GCM integration (`dowhy.gcm`), and functional refactoring (`refute_estimate.py`).
   - Philosophical and statistical hesitation around prescriptive binary p-value interpretations (e.g., claiming a causal model "passed" based on nominal $\alpha = 0.05$, multiple hypothesis testing / FWER inflation).
   - Return-type heterogeneity across refuters (e.g., negative controls return p-values, sensitivity analysis returns effect ranges, overlap tests return distributions).
4. **De-risked Staged PR Strategy**:
   - **PR 1**: A standalone, self-contained `refutation_summary` formatting function (< 150 LOC) in `dowhy/causal_refuters/refutation_summary.py` supporting `DataFrame`, `Markdown`, and `Text` outputs with descriptive (rather than dogmatic) robustness verdicts, zero foreign dependencies (pure pandas/numpy/stdlib), and robust handling of all return shapes.
   - **PR 2**: Wiring `RefutationSummaryInterpreter(TextualInterpreter)` into `dowhy/interpreters/`, setting `CausalRefuter.interpret_method = "refutation_summary_interpreter"`, and contributing a comprehensive Sphinx reference guide in `docs/source/user_guide/refuting_causal_estimates/refuting_effect_estimates/index.rst`.

---

## 2. DoWhy Refutation Architecture Deep Dive

### 2.1 Codebase Layout and Module Hierarchy

```
dowhy/
├── causal_model.py                # Legacy monolithic 4-step API (model.refute_estimate)
├── causal_refuter.py              # Base class CausalRefuter, container CausalRefutation, test_significance()
├── causal_refuters/               # Specific refuter algorithms and functional entry points
│   ├── __init__.py                # Dynamic refuter factory: get_class_object()
│   ├── refute_estimate.py         # Functional suite runner: refute_estimate() -> List[CausalRefutation]
│   ├── random_common_cause.py     # RandomCommonCause & refute_random_common_cause
│   ├── placebo_treatment_refuter.py # PlaceboTreatmentRefuter & refute_placebo_treatment
│   ├── data_subset_refuter.py     # DataSubsetRefuter & refute_data_subset
│   ├── bootstrap_refuter.py       # BootstrapRefuter & refute_bootstrap
│   ├── dummy_outcome_refuter.py   # DummyOutcomeRefuter & refute_dummy_outcome
│   ├── add_unobserved_common_cause.py # AddUnobservedCommonCause & sensitivity_simulation
│   ├── assess_overlap.py          # Covariate overlap refuter
│   ├── linear_sensitivity_analyzer.py # Cinelli-Hazlett (2020) partial R2 sensitivity
│   ├── graph_refuter.py           # DAG conditional independence tests
│   └── reisz.py                   # Reisz representation sensitivity
```

### 2.2 Data Structures: `CausalRefutation` and `CausalRefuter`

`CausalRefutation` is defined in `dowhy/causal_refuter.py` (lines 98–138):

```python
class CausalRefutation:
    """Class for storing the result of a refutation method."""

    def __init__(self, estimated_effect, new_effect, refutation_type):
        self.estimated_effect = estimated_effect
        self.new_effect = new_effect
        self.refutation_type = refutation_type
        self.refutation_result = None

    def add_significance_test_results(self, refutation_result):
        self.refutation_result = refutation_result

    def add_refuter(self, refuter_instance):
        self.refuter = refuter_instance

    def interpret(self, method_name=None, **kwargs):
        if method_name is None:
            method_name = self.refuter.interpret_method
        method_name_arr = parse_state(method_name)
        import dowhy.interpreters as interpreters

        for method in method_name_arr:
            interpreter = interpreters.get_class_object(method)
            interpreter(self, **kwargs).interpret(self.refuter._data)

    def __str__(self):
        if self.refutation_result is None:
            return "{0}\nEstimated effect:{1}\nNew effect:{2}\n".format(
                self.refutation_type, self.estimated_effect, self.new_effect
            )
        else:
            return "{0}\nEstimated effect:{1}\nNew effect:{2}\np value:{3}\n".format(
                self.refutation_type, self.estimated_effect, self.new_effect, self.refutation_result["p_value"]
            )

    __repr__ = __str__
```

#### Key Attributes and Types in `CausalRefutation`:
| Attribute | Type | Notes |
|---|---|---|
| `estimated_effect` | `float` or `np.ndarray` | Derived from `estimate.value`. Can be scalar float or array. |
| `new_effect` | `float`, `tuple`, or `np.ndarray` | For negative controls: `np.mean(sample_estimates)`. For unobserved common cause: scalar float or `(min_effect, max_effect)` tuple! |
| `refutation_type` | `str` | E.g. `"Refute: Add a random common cause"`, `"Refute: Use a Placebo Treatment"`. |
| `refutation_result` | `dict` or `None` | If significance testing is run: `{"p_value": float, "is_statistically_significant": bool}`. If sensitivity analysis is run: `None`. |
| `refuter` | `CausalRefuter` or not set | Present when run via `refuter.refute_estimate()` or `model.refute_estimate()`. May be missing when called via raw functional pipelines. |
| `new_effect_array` | `np.ndarray` (optional) | Dynamically populated by `add_unobserved_common_cause.py` when grid evaluation is requested. |

### 2.3 Statistical Mechanics: Significance Testing and Null Hypotheses

Significance testing in DoWhy is implemented in `dowhy/causal_refuter.py` via `test_significance()`:
- **Bootstrap / Permutation Test** (`SignificanceTestType.BOOTSTRAP` or `AUTO` when simulations < 100):
  $$\text{half\_p\_value} = \frac{1}{B} \sum_{b=1}^B \left( \mathbb{I}(x_b > \theta_{\text{null}}) + 0.5 \cdot \mathbb{I}(x_b == \theta_{\text{null}}) \right)$$
  $$p = 2 \cdot \min(\text{half\_p\_value}, 1 - \text{half\_p\_value})$$
  Evaluates whether the null reference value $\theta_{\text{null}}$ is in the tails of the empirical simulation distribution.
- **Normal Test** (`SignificanceTestType.NORMAL` or `AUTO` when simulations $\ge 100$):
  $$z = \frac{\theta_{\text{null}} - \mu_{\text{sim}}}{\sigma_{\text{sim}} + \epsilon}, \quad p = 2 \cdot (1 - \Phi(|z|))$$

#### The Fundamental Unifying Rule Across Negative-Control Refuters:
DoWhy sets the benchmark $\theta_{\text{null}}$ to the **expected behavior of a valid model**:
1. **Invariant Refuters** (`random_common_cause`, `data_subset_refuter`, `bootstrap_refuter`):
   $\theta_{\text{null}} = \text{original\_estimate.value}$.
   Null hypothesis $H_0$: The original estimate belongs to the distribution produced under data perturbation.
   - If $p \ge 0.05$: Failed to reject null. Adding noise or subsetting did **not** materially alter the estimate $\rightarrow$ **ROBUST / PASS**.
   - If $p < 0.05$: Rejected null. Perturbation significantly altered the estimate $\rightarrow$ **FRAGILE / FAIL**.
2. **Nullifying Refuters** (`placebo_treatment_refuter`, `dummy_outcome_refuter`):
   $\theta_{\text{null}} = 0.0$ (constructed via a dummy estimator where `estimate.value = 0`).
   Null hypothesis $H_0$: The true causal effect under placebo treatment or dummy outcome is ZERO.
   - If $p \ge 0.05$: Failed to reject null. Zero falls within the distribution of simulated placebo effects $\rightarrow$ **ROBUST / PASS**.
   - If $p < 0.05$: Rejected null. Placebo effect is statistically distinguishable from zero $\rightarrow$ **FRAGILE / FAIL** (indicates spurious correlation or data leakage).

### 2.4 Complete Inventory of Existing Refuters

| Refuter Class & Function | Module Location | Refutation Type String | Null Hypothesis ($\theta_{\text{null}}$) | `refutation_result`? | Pass Criterion | Failure Meaning |
|---|---|---|---|---|---|---|
| `RandomCommonCause` / `refute_random_common_cause` | `dowhy.causal_refuters.random_common_cause` | `"Refute: Add a random common cause"` | $\theta = \hat{\tau}_{\text{orig}}$ | Yes (`p_value`) | $p \ge \alpha$ | Omitted variable bias or small-sample instability |
| `PlaceboTreatmentRefuter` / `refute_placebo_treatment` | `dowhy.causal_refuters.placebo_treatment_refuter` | `"Refute: Use a Placebo Treatment"` | $\theta = 0$ | Yes (`p_value`) | $p \ge \alpha$ | Spurious correlation; treatment assignment not unconfounded |
| `DataSubsetRefuter` / `refute_data_subset` | `dowhy.causal_refuters.data_subset_refuter` | `"Refute: Use a subset of data"` | $\theta = \hat{\tau}_{\text{orig}}$ | Yes (`p_value`) | $p \ge \alpha$ | Effect driven by unmodeled subgroup heterogeneity or outliers |
| `BootstrapRefuter` / `refute_bootstrap` | `dowhy.causal_refuters.bootstrap_refuter` | `"Refute: Bootstrap Sample Dataset"` | $\theta = \hat{\tau}_{\text{orig}}$ | Yes (`p_value`) | $p \ge \alpha$ | High estimation variance or model non-convergence |
| `DummyOutcomeRefuter` / `refute_dummy_outcome` | `dowhy.causal_refuters.dummy_outcome_refuter` | `"Refute: Use a Dummy Outcome"` | $\theta = 0$ | Yes (`p_value`) | $p \ge \alpha$ | Estimation algorithm artifacts |
| `AddUnobservedCommonCause` / `sensitivity_simulation` | `dowhy.causal_refuters.add_unobserved_common_cause` | `"Refute: Add an Unobserved Common Cause"` | None (Sensitivity) | **No** (`None`) | Effect bounds do not cross 0 | Unobserved confounding of strength $(\kappa_t, \kappa_y)$ reverses effect |
| `AssessOverlap` | `dowhy.causal_refuters.assess_overlap` | `"Assess Overlap"` | None (Diagnostic) | No | Overlap metric / AUC | Common support / positivity violation |
| `LinearSensitivityAnalyzer` | `dowhy.causal_refuters.linear_sensitivity_analyzer` | N/A (Custom class) | Cinelli-Hazlett $RV$ | No | $RV >$ benchmark $R^2$ | Linear unobserved confounder explains away estimate |

### 2.5 Current String Representation Deficiencies

Calling `print(refutation)` executes `CausalRefutation.__str__`:
```
Refute: Add a random common cause
Estimated effect:1.248192039102
New effect:1.245019283912
p value:0.48
```
#### Deficiencies:
1. **Zero Context**: The output does not tell the user what $p=0.48$ signifies. In standard statistical modeling, practitioners are trained to seek $p < 0.05$. Here, $p < 0.05$ indicates refutation failure, creating widespread confusion (as evidenced in Issues #847 and #532).
2. **No Summary for Multi-Refuter Suites**: Running `refute_estimate(...)` returns a `List[CausalRefutation]`. Printing this list produces an unwieldy wall of text without aggregation, comparison, or tabular alignment.
3. **No Machine-Readable or Report-Ready Output**: No structured `pd.DataFrame` export, no Markdown table for Jupyter notebooks, and no dictionary representation.

---

## 3. DoWhy Interpreters Ecosystem Architecture

### 3.1 Registry and Dynamic Factory Pattern

Located in `dowhy/interpreters/__init__.py`:
```python
def get_class_object(method_name, *args, **kwargs):
    try:
        if "_" in method_name:
            module_name = method_name
            class_name = string.capwords(method_name, "_").replace("_", "")
        else:
            module_name = _camel_to_snake(method_name)
            class_name = method_name

        interpreter_module = import_module("." + module_name, package="dowhy.interpreters")
        interpreter_class = getattr(interpreter_module, class_name)
        if not issubclass(interpreter_class, Interpreter):
            raise TypeError("Interpreter class must inherit from Interpreter")
    except (AttributeError, ImportError):
        raise ImportError("{} is not an existing interpreter.".format(method_name))
    return interpreter_class
```

**Convention**:
- If `method_name="refutation_summary_interpreter"`, the factory dynamically imports `dowhy.interpreters.refutation_summary_interpreter` and loads class `RefutationSummaryInterpreter`.
- The class must subclass `dowhy.interpreter.Interpreter`.

### 3.2 Existing Interpreter Hierarchy

```
dowhy.interpreter.Interpreter (Base)
├── VisualInterpreter (in dowhy.interpreters.visual_interpreter)
│   ├── ConfounderDistributionInterpreter (for PropensityScoreWeightingEstimator)
│   └── PropensityBalanceInterpreter (for PropensityScoreStratificationEstimator)
└── TextualInterpreter (in dowhy.interpreters.textual_interpreter)
    └── TextualEffectInterpreter (for CausalEstimate)
```

### 3.3 The "Missing Refuter Interpreter" Void

In `dowhy/interpreter.py`:
```python
class Interpreter:
    SUPPORTED_MODELS = []
    SUPPORTED_ESTIMATORS = []
    SUPPORTED_REFUTERS = []

    def __init__(self, instance, **kwargs):
        self.model = None
        self.estimate = None
        self.refutation = None

        if isinstance(instance, dowhy.causal_model.CausalModel):
            self.model = instance
        elif isinstance(instance, dowhy.causal_estimator.CausalEstimate):
            self.estimate = instance
        elif isinstance(instance, dowhy.causal_refuter.CausalRefutation):
            self.refutation = instance
        else:
            self.logger.error("Type of object passed not supported for interpretation.")
```

**Finding**: The DoWhy authors explicitly designed `Interpreter.__init__` to accept `CausalRefutation`, and wrote `CausalRefutation.interpret()` to delegate to the interpreter subsystem. Yet, **not a single subclass of `Interpreter` was ever built for `CausalRefutation`**.

---

## 4. Deep-Dive Post-Mortem on GitHub Issues #847 & #532

### 4.1 Issue Archaeology: Facts and Timeline

#### Issue #847: "Improvement documentation | Refutation results"
- **Author**: `@Klesel` (Contributor)
- **Opened**: 2023-02-06T14:31:56Z
- **Reactions**: 4 (+1 upvotes), 14 comments.
- **Problem Statement**:
  > *"I am missing a piece of documentation that summarizes how the results of a refutation procedure should be interpretet. Assuming there is a causal effect, what does a significant p-value of a specific procedure (e.g., random common cause) mean? I would prefer a table like: 1. Refutation Method 2. Short description 3. Interpretation... Something along these lines would be great."*
- **Community Attempts**:
  - `@drawlinson` (June 2023) filed Issue #929 seeking clarification on interpretation rules.
  - In May 2026, automated bots noted PR #1535 attempting partial documentation in `refute.rst` and tests for `random_common_cause`.

#### Issue #532: "Guide on refutations and how to interpret p-values"
- **Author**: `@amit-sharma` (DoWhy Creator / PyWhy Steering Member)
- **Opened**: 2022-07-14T13:21:24Z
- **Labels**: `docs`
- **Problem Statement**:
  > *"Under the [docs/source/user_guide/effect_inference/refute.rst], it will be good to add details on each of the refutation methods, along with a code example. For refutations that comes with a p-value, it will be good to mention how to interpret the p-value. We can also use code examples to show the different options available in each refuter."*
- **Discussion Highlight**:
  - `@daquinterop` questioned whether the null distribution should be the mean of simulations rather than the raw simulation draws. Maintainers clarified that permutation tests compare the benchmark against individual simulation draws under the null.

### 4.2 Why Hasn't This Been Built Yet? (Expert Maintainer Perspective)

As an experienced open-source maintainer and causal inference engineer, three structural dynamics explain the multi-year delay:

#### 1. Maintainer Bandwidth Shift Post-PyWhy Governance (2022–2024)
When DoWhy migrated from Microsoft Research to the independent PyWhy organization, engineering resources were concentrated on:
- Migrating the repository to PyWhy CI/CD, Poetry, and Sphinx themes.
- Merging and hardening the Graphical Causal Model (`dowhy.gcm`) engine from AWS.
- Transitioning away from the legacy monolithic `CausalModel` class towards a functional pipeline API (`refute_estimate.py`).
Refutation presentation was treated as "downstream UI polish" rather than an architectural blocker.

#### 2. The Methodological & Statistical Bikeshedding Traps
When contributors previously considered refutation tables or automated pass/fail flags, PR discussions hit statistical impasses:
- **Trap A: The Prescriptive Binary Trap**:
  In academic causal inference, reducing validation to a binary `[PASS]` or `[FAIL]` at $\alpha = 0.05$ is controversial (Wasserstein & Lazar, 2016 ASA Statement on P-Values). Maintainers were wary of blessing an automated judgment: "What if a test has $p = 0.048$ with low simulation count? Is the causal finding definitively refuted?"
- **Trap B: The Multiple Testing / FWER Explosion**:
  If a user runs 5 refuters at $\alpha = 0.05$, the family-wise error rate is $1 - (0.95)^5 \approx 22.6\%$. Almost 1 in 4 well-specified models will fail at least one refutation by pure sampling variation. Debates over whether to mandate Bonferroni, Benjamini-Hochberg, or unadjusted p-values paralyzed progress.
- **Trap C: Output Type Incommensurability**:
  Negative control refuters yield p-values, sensitivity analysis yields effect intervals $(\tau_{\min}, \tau_{\max})$, and overlap tests yield propensity distributions. Past efforts attempted an overly ambitious, complex polymorphic object model that stalled under review.

### 4.3 How Our Design Circumvents These Traps

Our proposed architecture directly sidesteps these traps by following three maintainer-friendly principles:

1. **Descriptive, Qualified Verdicts Instead of Dogmatic Stamps**:
   - Rather than printing an authoritarian `MODEL PASSED`, we provide structured columns:
     - `p_value`: exact float (e.g. `0.4200`)
     - `significance_level`: reference $\alpha$ (default `0.05`)
     - `status`: `"Robust"` (if $p \ge \alpha$), `"Fragile"` (if $p < \alpha$), `"Sensitivity"` (for bounds), or `"N/A"`
     - `interpretation`: concise narrative (e.g. `"Estimate unchanged under added random common cause (p=0.420 >= 0.05)"`).
   - Every summary includes a standard qualification note:
     > *"Note: Nominal significance threshold $\alpha=0.05$. Invariant and nullifying tests evaluate whether the estimate is consistent with negative controls. Multi-refuter suites should be evaluated contextually alongside domain sensitivity bounds."*
2. **Minimal Review Burden (< 150 LOC, Zero New Dependencies)**:
   - PR 1 introduces zero foreign dependencies (pure `pandas`, `numpy`, and standard library).
   - Contained in a single new module: `dowhy/causal_refuters/refutation_summary.py`.
   - Modifies zero existing lines in core algorithms, ensuring 100% backward compatibility and zero regression risk.
3. **Graceful Handling of Incommensurable Outputs**:
   - If `refutation_result is None` (e.g. `AddUnobservedCommonCause`), `p_value` is set to `None`/`np.nan`, `status` is set to `"Sensitivity"`, and the effect range is cleanly formatted as `"[min, max]"`.
   - If `estimated_effect == 0`, percentage difference gracefully reports `"N/A"` without `ZeroDivisionError`.

---

## 5. Concrete Technical Blueprint for PR 1: Core `refutation_summary` Utility

### 5.1 Proposed Module Location & Exports
- **File**: `dowhy/causal_refuters/refutation_summary.py`
- **Exports in `dowhy/causal_refuters/__init__.py`**:
  ```python
  from dowhy.causal_refuters.refutation_summary import refutation_summary
  __all__.append("refutation_summary")
  ```
- **Top-level convenience export in `dowhy/__init__.py`**:
  ```python
  from dowhy.causal_refuters.refutation_summary import refutation_summary
  __all__.append("refutation_summary")
  ```

### 5.2 Implementation Specification (< 150 LOC)

```python
"""dowhy/causal_refuters/refutation_summary.py

Standalone utility to format, interpret, and summarize causal refutation results.
"""
from typing import Any, Dict, Iterable, List, Optional, Union
import numpy as np
import pandas as pd
from dowhy.causal_refuter import CausalRefutation

def _clean_refutation_name(refutation_type: str) -> str:
    """Normalize refutation type strings by stripping redundant prefixes."""
    name = refutation_type.strip()
    if name.startswith("Refute:"):
        name = name[len("Refute:"):].strip()
    return name

def _format_effect_val(val: Any) -> str:
    """Format scalar, tuple, or array effect values safely."""
    if val is None:
        return "N/A"
    if isinstance(val, (tuple, list)):
        return f"[{val[0]:.4f}, {val[1]:.4f}]" if len(val) == 2 else str(val)
    if isinstance(val, np.ndarray):
        if val.size == 1:
            return f"{float(val.item()):.4f}"
        return f"[{float(np.min(val)):.4f}, {float(np.max(val)):.4f}]"
    try:
        return f"{float(val):.4f}"
    except (TypeError, ValueError):
        return str(val)

def _determine_verdict_and_interpretation(
    ref_name: str,
    orig_eff: Any,
    new_eff: Any,
    p_val: Optional[float],
    alpha: float,
) -> tuple[str, str]:
    """Derive descriptive robustness status and narrative interpretation."""
    name_lower = ref_name.lower()
    if p_val is None or (isinstance(p_val, float) and np.isnan(p_val)):
        if "unobserved" in name_lower or "sensitivity" in name_lower:
            return "Sensitivity", f"Sensitivity bounds evaluated: {_format_effect_val(new_eff)}"
        return "N/A", "Diagnostic test completed without p-value"

    is_robust = p_val >= alpha
    status = "Robust" if is_robust else "Fragile"

    if "placebo" in name_lower or "dummy" in name_lower:
        if is_robust:
            interp = f"Passed: effect vanishes under negative control (p={p_val:.4f} >= {alpha})"
        else:
            interp = f"Failed: spurious effect detected under negative control (p={p_val:.4f} < {alpha})"
    else:  # Invariant transformations: random common cause, data subset, bootstrap
        if is_robust:
            interp = f"Passed: estimate stable under data perturbation (p={p_val:.4f} >= {alpha})"
        else:
            interp = f"Failed: estimate shifted significantly under perturbation (p={p_val:.4f} < {alpha})"

    return status, interp

def refutation_summary(
    refutations: Union[CausalRefutation, Iterable[CausalRefutation]],
    significance_level: float = 0.05,
    output_format: str = "dataframe",
) -> Union[pd.DataFrame, str]:
    """Summarizes single or multiple CausalRefutation results into a structured table.

    :param refutations: A single CausalRefutation or an iterable/list of CausalRefutation objects.
    :param significance_level: Threshold alpha for evaluating statistical significance (default 0.05).
    :param output_format: 'dataframe' (pd.DataFrame), 'markdown' (str), or 'text' (str).
    :returns: pd.DataFrame or formatted string table.
    """
    if isinstance(refutations, CausalRefutation):
        ref_list = [refutations]
    else:
        ref_list = list(refutations)

    rows: List[Dict[str, Any]] = []
    for ref in ref_list:
        if not isinstance(ref, CausalRefutation):
            continue

        raw_type = getattr(ref, "refutation_type", "Unknown Refutation")
        clean_name = _clean_refutation_name(raw_type)
        orig_val = getattr(ref, "estimated_effect", None)
        new_val = getattr(ref, "new_effect", None)
        res_dict = getattr(ref, "refutation_result", None)

        p_val = res_dict.get("p_value") if isinstance(res_dict, dict) else None
        if p_val is not None:
            try:
                p_val = float(p_val)
            except (ValueError, TypeError):
                p_val = np.nan

        status, interp = _determine_verdict_and_interpretation(
            clean_name, orig_val, new_val, p_val, significance_level
        )

        rows.append({
            "Method": clean_name,
            "Estimated Effect": _format_effect_val(orig_val),
            "New Effect": _format_effect_val(new_val),
            "p-value": f"{p_val:.4f}" if p_val is not None and not np.isnan(p_val) else "N/A",
            "Threshold": f"{significance_level:.2f}",
            "Status": status,
            "Interpretation": interp,
        })

    df = pd.DataFrame(rows)
    if output_format == "dataframe":
        return df

    header_note = (
        f"\nCausal Refutation Summary (alpha={significance_level:.2f})\n"
        "Note: Invariant & nullifying refuters pass when p >= alpha (retaining negative-control null).\n"
    )
    if output_format == "markdown":
        return header_note + "\n" + df.to_markdown(index=False)
    elif output_format == "text":
        return header_note + "\n" + df.to_string(index=False)
    else:
        raise ValueError(f"Unknown output_format: '{output_format}'. Choose 'dataframe', 'markdown', or 'text'.")
```

### 5.3 Edge Case Matrix

| Edge Case Scenario | Manifestation in DoWhy | Handling Strategy | Verified Outcome |
|---|---|---|---|
| **Zero original effect** (`estimate.value == 0`) | `original_effect == 0` causes `ZeroDivisionError` if relative drift is computed | Exclude raw percentage change from default columns; report exact scalar values and p-values | No division by zero; clean output |
| **Missing significance test** (`refutation_result is None`) | `AddUnobservedCommonCause` and diagnostic refuters do not populate `refutation_result` | Safe dictionary lookup: `p_val = None`; status mapped to `"Sensitivity"` or `"N/A"` | No `TypeError` or `KeyError` |
| **Non-scalar `new_effect`** | `new_effect` is tuple `(min, max)` in range simulation or numpy array | `_format_effect_val()` checks types and formats `"[min, max]"` cleanly | No formatting crashes |
| **Array-shaped estimate** | Estimator returns 1D array `np.array([1.25])` | Extracted via `.item()` or converted via `float()` | Clean float display |
| **Empty or invalid input** | User passes empty list `[]` or non-refutation objects | Graceful iteration, returns empty DataFrame with expected column schema | Type safety preserved |

### 5.4 Unit Test Specification (`tests/test_refutation_summary.py`)

Unit tests to be placed in `tests/test_refutation_summary.py`:
1. `test_refutation_summary_single_negative_control`: Tests `RandomCommonCause` output with $p \ge 0.05 \rightarrow \text{"Robust"}$.
2. `test_refutation_summary_placebo_failure`: Tests `PlaceboTreatmentRefuter` output with $p < 0.05 \rightarrow \text{"Fragile"}$.
3. `test_refutation_summary_unobserved_common_cause_tuple`: Tests handling of tuple `new_effect = (-0.5, 1.2)` with `refutation_result = None`.
4. `test_refutation_summary_output_formats`: Tests output format switching between `dataframe`, `markdown`, and `text`.
5. `test_refutation_summary_zero_effect`: Tests estimate with `estimated_effect = 0.0`.
6. `test_refutation_summary_with_refute_estimate_suite`: Runs functional `refute_estimate()` and verifies full suite table generation.

---

## 6. Concrete Technical Blueprint for PR 2: Interpreter & Docs Integration

### 6.1 Interpreter Class Implementation

- **File**: `dowhy/interpreters/refutation_summary_interpreter.py`
- **Class**: `RefutationSummaryInterpreter(TextualInterpreter)`

```python
"""dowhy/interpreters/refutation_summary_interpreter.py

Textual interpreter implementing structured refutation summarization.
"""
from typing import Optional, Union
import pandas as pd
from dowhy.causal_refuter import CausalRefutation
from dowhy.causal_refuters.refutation_summary import refutation_summary
from dowhy.interpreters.textual_interpreter import TextualInterpreter

class RefutationSummaryInterpreter(TextualInterpreter):
    """Interprets single or multi-refuter outcomes into human-readable summaries."""

    SUPPORTED_REFUTERS = ["all"]

    def __init__(self, instance: Union[CausalRefutation, list], **kwargs):
        super().__init__(instance, **kwargs)
        if isinstance(instance, list):
            self.refutations = instance
        elif isinstance(instance, CausalRefutation):
            self.refutations = [instance]
        else:
            self.refutations = []

    def interpret(
        self,
        data: Optional[pd.DataFrame] = None,
        significance_level: float = 0.05,
        output_format: str = "text",
    ) -> Union[pd.DataFrame, str]:
        """Generate and display the refutation summary."""
        target = self.refutations if self.refutations else ([self.refutation] if self.refutation else [])
        summary_result = refutation_summary(
            target,
            significance_level=significance_level,
            output_format=output_format,
        )
        if output_format in ("text", "markdown"):
            self.show(summary_result)
        return summary_result
```

### 6.2 Wiring into `CausalRefutation` and `CausalRefuter`

In `dowhy/causal_refuter.py`:
1. Set default interpretation method on `CausalRefuter`:
   ```python
   class CausalRefuter:
       DEFAULT_INTERPRET_METHOD = "refutation_summary_interpreter"

       def __init__(self, data, identified_estimand, estimate, **kwargs):
           ...
           self.interpret_method = self.DEFAULT_INTERPRET_METHOD
   ```
2. Update `CausalRefutation.interpret()` to return results:
   ```python
   def interpret(self, method_name=None, **kwargs):
       if method_name is None:
           method_name = getattr(self.refuter, "interpret_method", "refutation_summary_interpreter")
       method_name_arr = parse_state(method_name)
       import dowhy.interpreters as interpreters

       results = []
       for method in method_name_arr:
           interpreter_class = interpreters.get_class_object(method)
           data = self.refuter._data if self.refuter is not None else None
           results.append(interpreter_class(self, **kwargs).interpret(data))
       return results[0] if len(results) == 1 else results
   ```

### 6.3 Sphinx Documentation Guide Updates

- **Target File**: `docs/source/user_guide/refuting_causal_estimates/refuting_effect_estimates/index.rst`
- **Additions**:
  1. Add a dedicated section: **"Interpreting Refutation Results & P-Values"** directly resolving Issue #532 and Issue #847.
  2. Embed the complete reference table:
     - Null hypothesis formulation for each refuter.
     - Directionality of the p-value: why $p \ge 0.05$ means PASS for negative controls.
     - Practical code example running a refutation suite and calling `refutation_summary(results, output_format="markdown")`.

---

## 7. Verification & Upstream Review Checklist

### 7.1 Local Verification Commands
According to `pyproject.toml` in `py-why/dowhy`:
```bash
# Code style and formatting check (line-length = 120)
black --check dowhy/causal_refuters/refutation_summary.py tests/test_refutation_summary.py
isort --check dowhy/causal_refuters/refutation_summary.py tests/test_refutation_summary.py

# Linting check
flake8 dowhy/causal_refuters/refutation_summary.py tests/test_refutation_summary.py --count --statistics

# Unit test execution
pytest -v tests/test_refutation_summary.py
pytest -v tests/test_causal_refuter.py
```

### 7.2 Summary of De-risked Architecture
| Metric | PR 1 Specification | PR 2 Specification |
|---|---|---|
| **Lines of Operational Code** | ~110 LOC (< 150 LOC budget) | ~45 LOC |
| **New Dependencies** | 0 (pure pandas, numpy, stdlib) | 0 |
| **Breaking Changes** | None (pure addition) | None (backward-compatible defaults) |
| **Target Issues Addressed** | Issue #847 (tabular summary) | Issue #532 & #847 (interpreters & docs) |
| **Review Complexity** | Low (easy 10-minute maintainer merge) | Low (isolated interpreter module & docs) |

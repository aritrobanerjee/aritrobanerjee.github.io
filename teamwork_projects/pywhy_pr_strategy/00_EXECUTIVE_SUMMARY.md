# Strategic Roadmap: Bridging the Causal Refutation & Falsification Chasm in `py-why/dowhy`

**Project**: PyWhy / DoWhy Open-Source Pull Request Strategy  
**Domain**: Causal Measurement, Quasi-Experimentation, and Platform Diagnostics  
**Contributor Persona**: Staff-track Platform Product Manager (ex-Google Ads Measurement, Google Play Services)  
**Target Repository**: `py-why/dowhy` (PyWhy / Linux Foundation)  
**Date**: September 2026  
**Document**: 00_EXECUTIVE_SUMMARY.md  

---

## Executive Overview

In data-driven enterprises, causal inference has superseded naive correlational analysis for pricing, policy decisions, algorithmic recommendations, and product interventions. Microsoft's and PyWhy's `dowhy` is the preeminent open-source Python ecosystem for causal inference, pioneering a formal four-step workflow: **Model $\rightarrow$ Identify $\rightarrow$ Estimate $\rightarrow$ Refute**.

While estimation algorithms (propensity score matching, instrumental variables, double machine learning via EconML) receive significant research attention, **refutation (falsification testing) is the single most critical step in production causal inference**. In the potential outcomes framework and Pearlian structural causal models, an unrefuted estimate is untrustworthy: unobserved confounders, placebo effects, sample selection bias, and SUTVA violations can invalidate point estimates without triggering numeric errors.

Despite this theoretical centrality, DoWhy's refutation subsystem suffers from a severe **usability and diagnostic chasm**:
1. **Cryptic, Unaggregated Terminal Dumps**: Calling `model.refute_estimate()` yields raw `CausalRefutation` objects whose default `__str__` outputs a fragmented 3-line terminal string. Running a multi-refuter suite produces an unstructured wall of text with no tabular aggregation, no baseline comparisons, and no export capabilities for dataframes or Markdown reports.
2. **The Interpretation Paradox**: In standard hypothesis testing, practitioners celebrate $p < 0.05$. In DoWhy negative-control refuters, the null hypothesis represents stability under perturbation—meaning $p < 0.05$ signals **model failure**. This counter-intuitive directionality causes rampant confusion across industry practitioners.
3. **The Unbuilt Foundation**: Maintainers recognized this gap years ago. DoWhy co-creator Amit Sharma filed **Issue #532** in July 2022 ("Guide on refutations and how to interpret p-values"), and community contributor Dr. Michael Klesel filed **Issue #847** in February 2023 ("Improvement documentation | Refutation results"). Yet both have sat open and unbuilt for over four years.

This strategic roadmap presents a **staged 3-PR progression** engineered to solve the refutation usability crisis, resolve long-standing maintainer issues, and introduce novel marketplace diagnostics—all while enforcing strict lines-of-code (LOC) budgets, zero foreign dependencies, and defensive statistical designs that eliminate maintainer bikeshedding.

---

## 1. The Strategic Opportunity: The Causal Refutation Gap

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               THE DOWHY 4-STEP PIPELINE                                │
├───────────────────┬───────────────────┬────────────────────────┬───────────────────────┤
│    1. MODEL       │   2. IDENTIFY     │      3. ESTIMATE       │      4. REFUTE        │
│ Pearl Causal DAG  │ Backdoor Criterion│ Propensity Score, IV,  │ Falsification Tests   │
│ & Unobserved Node │ & Frontdoor Path  │ EconML Double ML       │ (Placebo, Confounder) │
├───────────────────┼───────────────────┼────────────────────────┼───────────────────────┤
│ Maturity: High    │ Maturity: High    │ Maturity: High         │ Maturity: Fragmented  │
│ Rich GraphViz &   │ Full ID Algorithm │ Seamless Integration   │ ❌ 3-line print dump  │
│ NetworkX support  │ & Graph Validation│ with scikit-learn      │ ❌ No tabular summary │
│                   │                   │                        │ ❌ p-value ambiguity  │
│                   │                   │                        │ ❌ Zero interpreters  │
└───────────────────┴───────────────────┴────────────────────────┴───────────────────────┘
```

### The Production Dilemma
When an applied data science team presents a causal recommendation to executive leadership (e.g., "Increasing ad exposure increases subscriber LTV by \$4.20"), leadership asks: *"How do we know this isn't an artifact of seasonality, user self-selection, or unobserved intent?"*

Under DoWhy, the practitioner runs four standard refutation procedures:
* **Placebo Treatment**: Replace treatment with random noise. (Expected effect: 0).
* **Random Common Cause**: Add an independent random covariate. (Expected effect: unchanged).
* **Data Subset**: Re-estimate on 80% random subsamples. (Expected effect: stable).
* **Unobserved Common Cause**: Simulate unobserved confounding sensitivity bounds.

However, DoWhy provides **no native way to consolidate these results into a unified diagnostic report**. The practitioner is forced to manually parse text strings, inspect dictionary internals, write ad-hoc regex wrappers, and guess whether $p=0.038$ represents robustness or failure.

### The Missing Interpreter Void
DoWhy features a sophisticated interpreter subsystem (`dowhy.interpreter.Interpreter`) designed to translate mathematical objects into human-readable narratives. The base class in `dowhy/interpreter.py` explicitly contains plumbing for refutations:
```python
if isinstance(instance, dowhy.causal_refuter.CausalRefutation):
    self.refutation = instance
```
Furthermore, `CausalRefutation.interpret()` attempts to dynamically load refutation interpreters from `dowhy.interpreters`. **Yet in the current codebase, exactly zero refutation interpreters exist.** The interpreter directory contains estimators (`TextualEffectInterpreter`, `PropensityBalanceInterpreter`), but the refutation branch was left completely unpopulated.

---

## 2. Why Hasn't This Been Built Yet? (The Maintainer Impasse)

A forensic audit of GitHub Issues #847, #532, and #929 reveals why past community discussions stalled:

1. **The Econometrics Scope-Creep Trap**: When community members requested a simple summary table (Issue #847), discussion was immediately derailed by proposals to implement complex estimator-specific tests (such as the Durbin-Wu-Hausman test via `statsmodels`). Maintainers broadened the scope to an architectural redesign of all estimators, causing the original documentation and formatting request to be abandoned.
2. **PyWhy Governance & Strategic GCM Pivot (2022–2024)**: Core maintainer bandwidth shifted heavily toward forming the independent PyWhy foundation under the Linux Foundation and integrating Amazon's Graphical Causal Model (`dowhy.gcm`) library. Tactical UI and reporting enhancements were deprioritized.
3. **The 5 Statistical Bikeshedding Traps**:
   - *Trap 1: Prescriptive vs. Descriptive p-values*: Academic statisticians reject binary "PASS/FAIL" labels, citing the ASA Statement on P-Values.
   - *Trap 2: The Multiple Testing Paradox*: Applying Bonferroni adjustments to negative controls lowers $\alpha$, paradoxically making unstable models *easier* to pass.
   - *Trap 3: Arbitrary Alpha Thresholds*: Significance at $\alpha=0.05$ is heavily confounded by sample size $N$.
   - *Trap 4: Heterogeneous Return Types*: Refuters return diverse types—scalar floats, tuples of bounds `(min, max)`, arrays, `None` p-values, and nested lists of refutations.
   - *Trap 5: API Transitions*: Tensions between legacy `CausalModel` OOP paradigms and modern functional APIs (`refute_estimate.py`).
4. **Aggressive Stale-Bot Auto-Closures**: Thoughtful community contributions (such as Issue #929 by `@drawlinson`) were auto-closed by GitHub Actions bots after brief periods of maintainer silence.

Our roadmap directly circumvents every one of these historical roadblocks through a decoupled, staged technical architecture.

---

## 3. The 3-Stage Pull Request Roadmap Architecture

To guarantee swift maintainer acceptance and prevent review fatigue, the roadmap decomposes the solution into three independent, progressive pull requests:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                STAGED 3-PR PROGRESSION                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PR 1: Core Refutation Summary Utility (<150 LOC)                                       │
│ Target: `dowhy/causal_refuters/refutation_summary.py`                                  │
│ - Compact, standalone formatting function: `refutation_summary()`                      │
│ - Input: `Union[CausalRefutation, List[CausalRefutation]]`                             │
│ - Output: `pd.DataFrame`, `Markdown`, and formatted `Text`                             │
│ - Zero new dependencies (pure pandas, numpy, stdlib)                                   │
│ - Descriptive verdicts ("Robust", "Fragile", "Sensitivity") avoiding dogmatic traps   │
│ - Defensive ingestion: handles tuples, arrays, missing p-values, zero original effects │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                          │ (Merge PR 1)                                │
│                                          ▼                                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PR 2: Interpreter Ecosystem & User Documentation Guide                                 │
│ Target: `dowhy/interpreters/refutation_summary_interpreter.py` & `docs/.../refute.rst` │
│ - Subclasses `TextualInterpreter` in `dowhy.interpreters`                              │
│ - Wires `CausalRefutation.interpret(method_name="refutation_summary_interpreter")`     │
│ - Closes Issue #532 & Issue #847 with comprehensive Sphinx documentation guide         │
│ - Provides the authoritative Null Hypothesis Reference Table across all refuters       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                          │ (Merge PR 2)                                │
│                                          ▼                                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PR 3: Novel Platform Diagnostic — `NetworkInterferenceRefuter` (SUTVA Test)            │
│ Target: `dowhy/causal_refuters/network_interference_refuter.py`                        │
│ - Falsifies Stable Unit Treatment Value Assumption (SUTVA) in networked settings       │
│ - Critical for marketplaces (Uber, Airbnb, DoorDash) & social networks                 │
│ - Implements linear neighborhood exposure mapping & cluster permutation inference      │
│ - Pure numpy/scipy implementation (zero heavy graph library dependencies)              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Stage-by-Stage Breakdown

#### PR 1: Core Refutation Summary Utility (The Review-Burden Minimizer)
* **Objective**: Provide an immediate, zero-friction utility to format and summarize refutation results.
* **Code Footprint**: < 150 lines of operational code in a single new file: `dowhy/causal_refuters/refutation_summary.py`.
* **Zero Foreign Dependencies**: Uses exclusively Python standard library (`typing`, `dataclasses`), `numpy`, and `pandas` (already mandatory core dependencies of DoWhy).
* **Review Burden**: **Minimal (10-minute maintainer review)**. It touches zero existing algorithmic code, modifies no existing tests, and introduces no breaking changes.
* **Descriptive Design**: Avoids the "Prescriptive P-Value Trap" by labeling results descriptively (`"Robust (p >= alpha)"`, `"Fragile (p < alpha)"`, `"Sensitivity"`) while providing an optional, configurable `significance_level=0.05` parameter.

#### PR 2: Interpreter Ecosystem & Sphinx Documentation Guide
* **Objective**: Formally wire the summary capability into DoWhy's object-oriented architecture and close GitHub Issues #532 and #847.
* **Architecture**: Implements `RefutationSummaryInterpreter` inheriting from `TextualInterpreter` in `dowhy/interpreters/refutation_summary_interpreter.py`. Sets `CausalRefuter.DEFAULT_INTERPRET_METHOD = "refutation_summary_interpreter"`.
* **Documentation Impact**: Updates `docs/source/user_guide/refuting_causal_estimates/refuting_effect_estimates/index.rst` with:
  - An exhaustive reference table detailing null hypotheses, test statistics, and expected directional behavior across all refuters.
  - An end-to-end tutorial demonstrating automated refutation pipelines and Jupyter notebook Markdown rendering.

#### PR 3: Novel Platform Diagnostic — `NetworkInterferenceRefuter` (SUTVA Violation Test)
* **Objective**: Expand DoWhy's core falsification repertoire with a cutting-edge platform diagnostic targeting networked environments.
* **The Problem**: In peer-to-peer marketplaces (ridesharing dispatch, ad auctions, delivery logistics), treating unit $i$ affects control unit $j$ through capacity competition or social contagion, violating SUTVA ($Y_i(t_i, \mathbf{t}_{-i}) \neq Y_i(t_i)$). Standard DoWhy refuters assume uncoupled units and fail to detect spillover bias.
* **Technical Innovation**: Implements a lightweight `NetworkInterferenceRefuter` that maps treatment vectors through a spatial or topological adjacency matrix $\mathbf{A}$, computes effective neighborhood exposure $D_i = \sum_j A_{ij} T_j$, and executes Monte Carlo permutation inference against synthetic spillover models.
* **Zero Heavy Dependencies**: Implemented using sparse matrix operations in `scipy.sparse` and `numpy`, avoiding cumbersome external dependencies like `torch_geometric` or `networkx` graph engines.

---

## 4. Quantitative PR Architecture & Risk Profile

The following matrix contrasts the three pull requests across operational metrics, review complexity, and regression risk:

| Dimension | PR 1: Core Summary Utility | PR 2: Interpreter & Docs Integration | PR 3: Network Interference Refuter |
|---|---|---|---|
| **Target Path** | `dowhy/causal_refuters/refutation_summary.py` | `dowhy/interpreters/refutation_summary_interpreter.py`<br>`docs/.../refute.rst` | `dowhy/causal_refuters/network_interference_refuter.py`<br>`tests/test_network_interference_refuter.py` |
| **Lines of Code (LOC)** | ~110 LOC (strict <150 budget) | ~45 LOC Python + ~180 LOC RST | ~220 LOC Python + ~120 LOC Tests |
| **New Dependencies** | **0** (pure pandas, numpy, stdlib) | **0** (Sphinx built-ins) | **0** (numpy, scipy.sparse) |
| **Files Modified** | 1 new file, 2 exports (`__init__.py`) | 1 new file, 2 existing files touched | 1 new file, 1 test file, 1 export |
| **Regression Risk** | **Zero** (100% additive utility) | **Zero** (additive interpreter class) | **Zero** (isolated refuter class) |
| **Review Complexity** | Very Low (10–15 min maintainer audit) | Low (Documentation + boilerplate) | Medium (Statistical review of permutation test) |
| **Issues Resolved** | Unblocks Issue #847 | Formally closes **#532** and **#847** | Establishes novel PyWhy diagnostic capability |
| **Merging Velocity** | Immediate (Sprint 1) | Fast (Sprint 2, follows PR 1) | Deliberate (Sprint 3, peer-reviewed) |

---

## 5. Strategic Value Proposition: The Contributor Signal

For a **Staff-track Platform Product Manager** (specializing in causal measurement, ad experimentation, and platform developer ergonomics), this roadmap provides exceptional career and reputational signal:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       STAFF PLATFORM PM CREDENTIAL SIGNAL MAP                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Customer-Centric Empathy & DX Mastery                                              │
│    - Identified the unaddressed pain of thousands of practitioners trapped in cryptic   │
│      3-line terminal outputs.                                                          │
│    - Transformed raw mathematical outputs into decision-ready executive tables.        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. Systems Architecture & Review Diplomacy                                            │
│    - Avoided the "eager contributor trap" of submitting an unreviewable 1,000-line PR. │
│    - Decomposed complex capabilities into atomic, unassailable, dependency-free PRs.  │
│    - Anticipated and neutralized five subtle statistical and philosophical debates.     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. Deep Methodological Domain Authority                                                │
│    - Grounded in rigorous causal econometrics: potential outcomes, negative controls,   │
│      Pearlian falsification, and SUTVA spillover dynamics.                             │
│    - Directly formulated the mathematics of permutation tests and exposure mappings.   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. Platform API Ergonomics & Open-Source Governance                                    │
│    - Bridged legacy OOP (`CausalModel`) and modern functional architectures.            │
│    - Resolved multi-year stale issues (#532, #847) while aligning with PyWhy / Linux  │
│      Foundation long-term goals.                                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Real-World Business Alignment
In enterprise experimentation environments (e.g., Google Ads auction dynamics, ride-hailing pricing, marketplace matchmaking), naive A/B testing routinely breaks down due to cannibalization, network interference, and latent confounders. 

By contributing the `refutation_summary` framework and the `NetworkInterferenceRefuter` to DoWhy, the contributor establishes a public, authoritative track record of:
* Bridging the gap between high-level statistical theory and daily developer tooling.
* Building defensible, enterprise-grade measurement diagnostics that withstand executive scrutiny.
* Designing developer-first APIs that scale gracefully across diverse organizational skill levels.

---

## 6. Deliverable Directory Structure & Master Index

The complete PR roadmap is documented in the following authoritative deliverables located in `teamwork_projects/pywhy_pr_strategy/`:

```
teamwork_projects/pywhy_pr_strategy/
├── 00_EXECUTIVE_SUMMARY.md               <-- [This Document] High-level strategy, roadmap, & PM signal
├── 01_MAINTAINER_POST_MORTEM.md          <-- Root-cause forensic audit of Issues #847 & #532, 5 traps
├── 02_PR1_CORE_REFUTATION_SUMMARY.md     <-- Complete technical blueprint & production code for PR 1
├── 03_PR2_INTERPRETER_AND_GUIDE.md       <-- Blueprint for RefutationSummaryInterpreter & Sphinx guide
├── 04_PR3_NETWORK_INTERFERENCE_REFUTER.md<-- Mathematical & code blueprint for SUTVA violation test
├── 05_EDGE_CASE_MATRIX_AND_VERIFICATION.md<-- Comprehensive edge case guards & local CI test harness
└── 06_UPSTREAM_GITHUB_TEMPLATES.md       <-- Copy-paste GitHub issues, PR drafts, & maintainer scripts
```

### Next Steps for Implementation
1. **Review Milestone Deliverables**: Verify technical blueprints across PR 1, PR 2, and PR 3.
2. **Execute Local Verification**: Run the automated test harness specified in `05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`.
3. **Engage PyWhy Maintainers**: Utilize the issue pre-proposal templates in `06_UPSTREAM_GITHUB_TEMPLATES.md` to initiate proactive maintainer dialogue before opening PR 1.

# Upstream GitHub Engagement & PM Playbook Analysis

**Author**: Worker 4 (`worker_m4`)  
**Working Directory**: `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\worker_m4`  
**Date**: 2026-09-22  
**Target Repository**: `py-why/dowhy` (`github.com/py-why/dowhy`)  
**Deliverable**: `teamwork_projects\pywhy_pr_strategy\06_UPSTREAM_GITHUB_TEMPLATES.md`  

---

## 1. Context & Architectural Mission

This analysis establishes the operational and communicative foundation for engaging with the `py-why/dowhy` core maintainers and broader PyWhy open-source community.

While Workers M1, M2, and M3 produce the strategic roadmaps, technical blueprints, and mathematical proofs for PR 1 (Core Refutation Summary), PR 2 (Interpreter & Docs Integration), and PR 3 (Network Interference / SUTVA Refuter), Worker M4 translates these technical assets into **production-ready GitHub engagement artifacts**:
1. Polished, maintainer-grade Pull Request description templates that immediately signal seniority, empathy, and adherence to PyWhy engineering standards.
2. Scripted maintainer objection handling templates addressing the statistical, architectural, and operational pushback that historically stalled Issues #847 and #532.
3. An end-to-end 2-Week "PM-with-AI" execution roadmap and pre-flight local verification protocol designed for a Staff-track Platform Product Manager (ex-Google Ads measurement, Google Play Services) operating with high leverage and zero low-level SWE friction.

---

## 2. Maintainer Persona & Psychology Analysis

Drawing directly from the archaeological discoveries in `explorer_dowhy_2/analysis.md`, the DoWhy repository governance is characterized by distinct maintainer personas:

### 2.1 The Academic Purist (Amit Sharma - MSR / PyWhy Founder)
- **Primary Concern**: Preserving methodological purity and preventing practitioners from making false causal claims based on crude heuristics or misinterpreted p-values.
- **Vulnerability**: Easily tempted by theoretical completeness (e.g., expanding Issue #847 into Durbin-Wu-Hausman IV refuters via statsmodels).
- **Communication Strategy**: 
  - Explicitly frame PR 1 as a *descriptive presentation utility* rather than an automated decision stamp.
  - Acknowledge the Wasserstein & Lazar (2016) ASA Statement on P-Values.
  - Reference his own 2022 proposal in Issue #532 to establish collaborative alignment.

### 2.2 The Enterprise Architect (Patrick Blöbaum / Jonas Wahl - AWS / GCM)
- **Primary Concern**: Clean modularity, functional API paradigms, eliminating global state, and avoiding bloat in the legacy monolithic `CausalModel` god-object.
- **Vulnerability**: Skepticism toward PRs that patch legacy classes or introduce heavy third-party dependencies.
- **Communication Strategy**:
  - Emphasize that PR 1 is a standalone functional primitive (<150 LOC) with zero dependencies beyond `pandas`/`numpy`.
  - Highlight dual-interface support: works seamlessly with both modern functional `refute_estimate()` and legacy `CausalModel`.
  - In PR 3, highlight zero graph-dependency vectorization (BLAS-accelerated NumPy/SciPy instead of NetworkX).

### 2.3 The Applied Practitioner / Triage Contributor (Michael Klesel, drawlinson, Padarn Wilson)
- **Primary Concern**: Executive readability, reporting in Jupyter notebooks, and having an automated summary table for stakeholder presentations.
- **Vulnerability**: Frustration with silent maintainer delays and aggressive GitHub stale bots auto-closing legitimate discussions.
- **Communication Strategy**:
  - Deliver the exact 3-column table requested in Issue #847 with Markdown, DataFrame, and Text formatters.
  - Provide ready-to-use Sphinx docs and Jupyter tutorial previews.

---

## 3. Deconstructing the 5 Pushback Scenarios

To prevent the PRs from being derailed into endless bikeshedding, we prepare mathematically sound, maintainer-friendly responses for five key objections:

### Pushback 1: "Why not apply Bonferroni or Benjamini-Hochberg multiple testing correction?"
- **The Core Paradox**: In standard discovery testing ($H_0: \text{Effect} = 0$), lowering $\alpha$ (e.g. from $0.05$ to $0.0125$) is conservative because it requires stronger evidence to claim an effect. 
- In negative-control refutation testing ($H_0: \text{Original Estimate is Valid / Invariant to Noise}$), the decision rule is:
  - If $p < \alpha \implies$ REJECT $H_0 \implies$ REFUTATION FAILS (Model is fragile).
  - If $p \ge \alpha \implies$ FAIL TO REJECT $H_0 \implies$ REFUTATION PASSES (Model is robust).
- **Mathematical Implication**: If Bonferroni lowers $\alpha$ from $0.05$ to $0.0125$, a model with $p = 0.03$ (which failed at $\alpha=0.05$) now passes at $\alpha=0.0125$! Applying standard FWER corrections **lowers the barrier for passing falsification tests**, inflating the false acceptance of bad models!
- **Resolution**: Report unadjusted exact p-values alongside nominal $\alpha$, allowing users to inspect exact tail probabilities without perverse threshold shifts.

### Pushback 2: "Why not use statsmodels for estimator-specific refuters like Hausman?"
- **The Core Trap**: Issue #847 stalled when Amit Sharma and Padarn Wilson debated building an estimator-specific refutation architecture backed by `statsmodels`.
- **Resolution**: Decouple formatting and interpretation from estimator-specific econometrics. PR 1 provides the universal container and presentation layer for all existing 8+ refuters. When estimator-specific refuters (like Hausman IV) are eventually built, they simply emit standard `CausalRefutation` objects that instantly inherit `refutation_summary()` without further work.

### Pushback 3: "Why not use NetworkX or igraph for PR 3's network interference?"
- **The Dependency Hazard**: NetworkX adds Python object overhead ($O(N+E)$ dictionaries) and slows down Monte Carlo permutation loops (100 simulations). `igraph` requires C compilation.
- **Resolution**: Pure BLAS-accelerated NumPy linear algebra ($A \mathbf{w}$) and SciPy sparse matrices execute 100 permutations over 10,000 nodes in under 800ms with zero new requirements in `pyproject.toml`.

### Pushback 4: "Is a binary 'Pass/Fail' column too dogmatic?"
- **Resolution**: PR 1 uses descriptive status categories (`"Stable"`, `"Drift Detected"`, `"Invariant to Placebo"`, `"Sensitivity Bounds"`) accompanied by explicit narrative strings explaining *why* the status was assigned, backed by a standard footer note referencing nominal $\alpha=0.05$.

### Pushback 5: "How are heterogeneous return types handled without crashing?"
- **Resolution**: Defensive typing handles scalar floats, 1D NumPy arrays via `.item()`, sensitivity intervals `(min, max)` from unobserved confounding, None p-values, and nested lists from `DummyOutcomeRefuter`.

---

## 4. 2-Week PM-with-AI Operational Leverage Model

The implementation roadmap is structured for a Staff-track Platform Product Manager spending 1–1.5 hours per day (12–15 hours total) using modern AI pair-programming:
- **Phase 1 (Days 1–4)**: PR 1 (Core Utility) — Implementation, unit tests, local verification, PR submission, initial triage.
- **Phase 2 (Days 5–8)**: PR 2 (Interpreters & Docs) — Subclassing `TextualInterpreter`, Sphinx documentation guide, tutorial notebook, PR submission.
- **Phase 3 (Days 9–12)**: PR 3 (SUTVA / Network Interference) — Linear exposure mapping, Monte Carlo permutation test, unit tests, PR submission.
- **Phase 4 (Days 13–14)**: Upstream shepherd, maintainer review synthesis, portfolio artifact freeze.

---

## 5. Deliverable Structure Plan for `06_UPSTREAM_GITHUB_TEMPLATES.md`

1. **Executive Context & Upstream Engagement Philosophy**
   - The Staff PM Open-Source Philosophy
   - Tone, etiquette, and maintainer empathy guidelines
2. **Pre-PR Engagement & Issue Revitalization Templates**
   - Template A: Reviving Issue #847 (Constructive, non-prescriptive proposal)
   - Template B: Reconnecting with Issue #532 (Amit Sharma follow-up)
   - Template C: RFC / Architecture Discussion Template for PR 3 (SUTVA Diagnostic)
3. **PR 1 Production Description Template: Core Refutation Summary Utility**
   - Title, labels, closes tags
   - Background & Motivation (<150 LOC, zero dependencies, Issue #847)
   - Detailed Technical Changes
   - Terminal & Markdown Visual Previews
   - Verification Commands & Pytest Results
   - Defensive Edge-Case Matrix
4. **PR 2 Production Description Template: Interpreters & Docs Integration**
   - Background & Motivation (Issue #532, `Interpreter` base class support)
   - Architectural Changes (`RefutationSummaryInterpreter`)
   - Sphinx Documentation Preview & Null Hypothesis Reference Table
   - Jupyter Tutorial Snippet & Verification
5. **PR 3 Production Description Template: Network Interference Refuter**
   - Background & Business Value (Two-sided marketplaces, SUTVA collapse)
   - Mathematical Formulation (Athey et al. 2018, Aronow & Samii 2017)
   - 3 Input Modes (Adjacency matrix, cluster leave-one-out, precomputed vector)
   - Zero-dependency BLAS vectorization
   - Empirical Validation & Synthetic Simulation Benchmarks
6. **Scripted Maintainer Pushback & Objection Handling Playbook**
   - Objection 1: Bonferroni / Multiple Testing Paradox
   - Objection 2: Statsmodels / Estimator-Specific Scope Creep
   - Objection 3: NetworkX / Heavy Graph Dependencies
   - Objection 4: Binary Pass/Fail vs. ASA P-Value Warning
   - Objection 5: Heterogeneous Return Types & Missing P-Values
7. **2-Week PM-with-AI Implementation Roadmap & Time Budget**
   - 14-Day Day-by-Day Execution Schedule (13.5 Total Hours)
   - Exact AI Prompting Sequences for Code Generation, Unit Testing, and Documentation
8. **Pre-Flight Local Verification Protocol & CI Checklists**
   - Python Virtual Environment Setup & Poetry
   - Code Formatting & Linting (`black`, `isort`, `flake8`)
   - Unit Test Execution & Coverage (`pytest -v --cov`)
   - Sphinx HTML Documentation Build
   - Clean Git Commit & Branching Discipline

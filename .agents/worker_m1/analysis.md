# Analysis: Milestone 1 — Strategic Roadmap & Maintainer Post-Mortem

**Agent**: `worker_m1`  
**Milestone**: M1 (Strategic Roadmap & Maintainer Post-Mortem)  
**Date**: September 22, 2026 (UTC)  
**Target Repository**: `py-why/dowhy` (`github.com/py-why/dowhy`)  
**Assigned Deliverables**:
1. `teamwork_projects/pywhy_pr_strategy/00_EXECUTIVE_SUMMARY.md`
2. `teamwork_projects/pywhy_pr_strategy/01_MAINTAINER_POST_MORTEM.md`

---

## 1. Context & Objectives

The goal of Milestone 1 is to establish the strategic and historical foundation for an open-source contribution to `py-why/dowhy` by an aspiring Staff-track Platform Product Manager (ex-Google Ads Measurement / Google Play Services). 

Rather than jumping into ungrounded code modifications, Milestone 1 answers two foundational questions:
1. **What is the strategic roadmap that maximizes customer value while minimizing open-source review friction?** (Addressed in `00_EXECUTIVE_SUMMARY.md`)
2. **Why hasn't this been done yet, despite overwhelming community demand and maintainer interest?** (Addressed in `01_MAINTAINER_POST_MORTEM.md`)

---

## 2. Authoritative Input Synthesis & Forensic Evidence Chain

### 2.1 Inputs Reviewed
1. `ORIGINAL_REQUEST.md` (Timestamp: `2026-09-21T23:55:53Z`): Sets requirements for 3-PR decomposition, maintainer post-mortem, technical blueprint specifications, and PM credentials signal.
2. `explorer_dowhy_2/analysis.md`: Detailed audit of Issues #847, #532, #929, PR #1535, maintainer personas, and the 5 bikeshedding traps.
3. `explorer_dowhy_1/analysis.md`: Technical investigation of `dowhy/causal_refuter.py`, existing refuters, `dowhy/interpreter.py`, missing refutation interpreters, and concrete module blueprints.
4. `teamwork_preview_orchestrator_2/PROJECT.md`: Master architectural plan and milestone breakdown across workers.

### 2.2 Forensic Findings
* **The "3-Line Terminal Print" Defect**: `CausalRefutation.__str__` (`dowhy/causal_refuter.py:126-136`) prints only raw values without interpretation or multi-refuter aggregation.
* **The "Missing Interpreter" Defect**: `dowhy/interpreter.py` explicitly supports `CausalRefutation`, but `dowhy/interpreters/` contains zero refuter interpreters.
* **Issue #847 (Feb 2023)**: Dr. Michael Klesel requested a 3-column interpretation table. Padarn Wilson proposed Hausman tests. Amit Sharma suggested statsmodels redesign. The issue was abandoned to Discord and stale bots.
* **Issue #532 (July 2022)**: Amit Sharma filed for refutation documentation and p-value interpretation. Stalled due to PyWhy Linux Foundation migration, AWS GCM integration, and functional API refactoring.
* **Issue #929 (April–June 2023)**: `@drawlinson` reverse-engineered DoWhy and offered to document p-value directionality. Auto-closed by stale bot after 14 days of maintainer silence.
* **PR #1535 (May 2026)**: Automated bot touched `refute.rst` and added unit tests for `random_common_cause`.

---

## 3. The 5 Bikeshedding Traps Identified

1. **Prescriptive vs. Descriptive P-Values**: The ASA warning against hardcoded PASS/FAIL stamps vs. practitioner need for actionable conclusions.
2. **The Multiple Testing Paradox**: Lowering $\alpha$ via Bonferroni ($0.05 \rightarrow 0.01$) makes it *easier* for fragile models to pass negative control refutations.
3. **Arbitrary Alpha Thresholds**: Confounding between statistical significance ($p < 0.05$) and sample size $N$ (massive false alarms on big data, blind spots on small data).
4. **Heterogeneous Return Types**: Scalars, tuples of bounds `(min, max)`, arrays, `None` p-values, and nested lists crashing naive summary scripts.
5. **API Evolution Chasm**: Legacy `CausalModel` OOP methods vs. modern functional `refute_estimate` pipelines.

---

## 4. Deliverables Produced & Verification

### Deliverable 1: `teamwork_projects/pywhy_pr_strategy/00_EXECUTIVE_SUMMARY.md`
- **Scope & Architecture**: High-level strategic roadmap, framing causal refutation as the critical falsification pillar of causal inference.
- **3-Stage PR Progression**:
  * PR 1: Core Refutation Summary Utility (<150 LOC, zero dependencies, descriptive verdicts).
  * PR 2: Interpreter Ecosystem & Sphinx Documentation Guide (closes Issues #532 and #847).
  * PR 3: Novel Platform Diagnostic — `NetworkInterferenceRefuter` (SUTVA violation test for marketplaces).
- **Quantitative Comparison Matrix**: LOC, dependencies, risk, and review time across all 3 PRs.
- **PM Credential Signal**: Customer empathy, platform ergonomics, review diplomacy, and domain expertise.

### Deliverable 2: `teamwork_projects/pywhy_pr_strategy/01_MAINTAINER_POST_MORTEM.md`
- **Root-Cause Analysis**: Exhaustive forensic timeline of Issue #847, Issue #532, and Issue #929.
- **Maintainer Personas**: Detailed profile of Amit Sharma, Patrick Blöbaum/Jonas Wahl, Padarn Wilson, and PyWhy CI bots.
- **Deep-Dive on the 5 Bikeshedding Traps**: Complete mathematical and architectural explanations.
- **Maintainer Circumvention Playbook**: Five golden rules (Descriptive-First, Universal Defensive Ingestion, Zero Foreign Dependencies, Decoupled Staging, Dual Interface).
- **Historical Comparison Scorecard**: Past stalled attempts vs. our PR blueprint.

---

## 5. Conclusion

Milestone 1 establishes a rock-solid, evidence-grounded strategic roadmap and maintainer post-mortem. It provides the downstream workers (`worker_m2`, `worker_m3`, `worker_m4`) with the exact architectural constraints, statistical guardrails, and historical context required to author publication-grade technical specifications.

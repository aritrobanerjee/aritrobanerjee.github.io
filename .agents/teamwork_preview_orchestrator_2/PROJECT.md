# Project: py-why/dowhy Open-Source PR Roadmap

## Architecture
- **Target Repository**: `py-why/dowhy` (Python causal inference library under PyWhy / Linux Foundation).
- **Core Focus**: Three-stage PR roadmap delivering core refutation summary utility, interpreter ecosystem integration, and novel SUTVA network interference refuter.
- **Deliverables Directory**: `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\`
- **Survey Findings Synthesis**:
  - **Issue #847**: Open since Feb 2023. User `@Klesel` requested 3-column interpretation table. Stalled due to scope creep (Padarn Wilson proposing Hausman test, Amit Sharma proposing statsmodels redesign, discussion moving to Discord, stale bot auto-closing related work).
  - **Issue #532**: Opened July 2022 by Amit Sharma. Remained unbuilt due to Linux Foundation governance transfer, Amazon GCM engine influx, and functional API refactoring.
  - **The Missing Interpreter Void**: `dowhy/interpreter.py` specifically provides a branch for `CausalRefutation`, but exactly zero refuter interpreters exist in `dowhy/interpreters/`.
  - **5 Bikeshedding Traps Solved**:
    1. Prescriptive vs descriptive p-value interpretations (descriptive verdicts `"Robust"`, `"Fragile"`, `"Sensitivity"`, `"N/A"` with explicit ASA caveats).
    2. Multiple testing paradox (clarified why Bonferroni paradoxically weakens negative controls, user-configured significance levels).
    3. Arbitrary alpha thresholds (configurable alpha & tolerance, descriptive interpretation).
    4. Heterogeneous return types (defensive polymorphic ingestion handling p-values, tuple bounds, scalar effects, nested lists).
    5. API transition (dual-support for `CausalModel` and functional API patterns).
  - **Circumvention Strategy**:
    - PR 1: Compact standalone formatting function `refutation_summary` (143 operational LOC, zero foreign dependencies, pure-Python markdown fallback, string recursion guard).
    - PR 2: Subclasses `TextualInterpreter` in `dowhy/interpreters/` and adds Sphinx documentation guide.
    - PR 3: `NetworkInterferenceRefuter` testing SUTVA violations with linear exposure mapping and Monte Carlo permutation inference (zero heavy graph dependencies, pre-flight NaN checks).

## Feature Inventory
| # | Feature | Description | Milestone | Status |
|---|---------|-------------|-----------|--------|
| 1 | Executive Strategic Roadmap | High-level synthesis of practitioner value, PR progression, and maintainer alignment | M1 | DONE |
| 2 | Expert SWE Maintainer Post-Mortem | Deep dive into why Issue #847 & #532 stalled, 5 bikeshedding traps, and maintainer circumvention playbook | M1 | DONE |
| 3 | Core Refutation Summary Specification (PR 1) | Compact standalone `refutation_summary` (<150 LOC, zero dependencies) returning Text, Markdown, and DataFrame representations | M2 | DONE |
| 4 | Interpreter & Documentation Guide Integration (PR 2) | Integration into DoWhy's `interpreters` ecosystem and end-to-end documentation tutorial resolving Issue #532 and #847 | M2 | DONE |
| 5 | Network Interference / SUTVA Diagnostic Refuter (PR 3) | Lightweight `NetworkInterferenceRefuter` testing SUTVA violations in networked / marketplace environments | M3 | DONE |
| 6 | Edge-Case Matrix & Verification Test Framework | 32 catalogued edge cases handling `original_effect == 0`, missing/none p-values, string recursion, markdown fallbacks, and verification suite | M3 | DONE |
| 7 | Upstream PR & Issue Engagement Templates | Production-grade GitHub issue and PR comment templates ready for human review before any upstream engagement | M4 | DONE |
| 8 | Quality Gate Verification & Forensic Integrity Audit | Multi-perspective review, adversarial challenge, and forensic audit (23/23 tests passing, CLEAN audit) | M5 | DONE |

## Milestones & Work Breakdown
| # | Name | Scope & Deliverable Files | Assigned Worker | Status |
|---|------|---------------------------|-----------------|--------|
| M1 | Strategic Roadmap & Maintainer Post-Mortem | `00_EXECUTIVE_SUMMARY.md`<br>`01_MAINTAINER_POST_MORTEM.md` | `worker_m1` | DONE |
| M2 | PR 1 & PR 2 Technical Blueprints & Code Specs | `02_PR1_CORE_REFUTATION_SUMMARY.md`<br>`03_PR2_INTERPRETER_AND_GUIDE.md` | `worker_m2` | DONE |
| M3 | PR 3 SUTVA Refuter & Edge Case Matrix | `04_PR3_NETWORK_INTERFERENCE_REFUTER.md`<br>`05_EDGE_CASE_MATRIX_AND_VERIFICATION.md` | `worker_m3` | DONE |
| M4 | Upstream GitHub Templates & PM Playbook | `06_UPSTREAM_GITHUB_TEMPLATES.md` | `worker_m4` | DONE |
| M5 | Quality Gate & Forensic Audit | Verification reports, challenger stress tests, and forensic integrity audit | Reviewers / Challengers / Auditor | DONE |

## Deliverable File Layout
All deliverables verified and complete in: `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\`
- `00_EXECUTIVE_SUMMARY.md`: Executive roadmap, practitioner value proposition, staged PR progression.
- `01_MAINTAINER_POST_MORTEM.md`: Forensic root-cause analysis of Issues #847 & #532, 5 bikeshedding traps, maintainer psychology.
- `02_PR1_CORE_REFUTATION_SUMMARY.md`: Complete blueprint, production code specification (143 operational LOC < 150 LOC), and unit test suite for PR 1.
- `03_PR2_INTERPRETER_AND_GUIDE.md`: Blueprint for `RefutationSummaryInterpreter`, Sphinx documentation guide, and practitioner tutorial.
- `04_PR3_NETWORK_INTERFERENCE_REFUTER.md`: Mathematical formulation, class & functional code, permutation test, and marketplace scenarios for PR 3.
- `05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`: Exhaustive 32-item edge-case matrix, numerical stability guards, and test verification commands.
- `06_UPSTREAM_GITHUB_TEMPLATES.md`: Copy-paste ready GitHub issue drafts, PR descriptions, scripted maintainer dialogue responses, and 14-day PM-with-AI roadmap.

# Dispatch: Worker 3 (PR 3 SUTVA Refuter & Edge Case Matrix)

## Mission
Deliver `04_PR3_NETWORK_INTERFERENCE_REFUTER.md` and `05_EDGE_CASE_MATRIX_AND_VERIFICATION.md` in `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\`.

## Authoritative Inputs
1. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md` (header ## 2026-09-21T23:55:53Z)
2. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_3\analysis.md` (SUTVA & Network Interference Blueprint)
3. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_1\analysis.md` & `explorer_dowhy_2\analysis.md`
4. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\teamwork_preview_orchestrator_2\PROJECT.md`

## Deliverables & Scope
1. `04_PR3_NETWORK_INTERFERENCE_REFUTER.md`:
   - Complete blueprint for PR 3: target `dowhy/causal_refuters/network_interference_refuter.py`.
   - Causal theory: SUTVA violation in marketplaces (driver cannibalization, listing displacement, peer contagion).
   - Class architecture: dual support for `NetworkInterferenceRefuter(CausalRefuter)` and functional `refute_network_interference(...)`.
   - Linear exposure mapping $G_i = (A W)_i / d_i$ and leave-one-out cluster treatment fractions.
   - Monte Carlo permutation inference (Athey-Eckles-Imbens 2018) for exact finite-sample p-values.
   - Zero foreign dependencies (pure numpy, pandas, scipy sparse; zero networkx/igraph).
   - Production code specification and unit tests (`tests/causal_refuters/test_network_interference_refuter.py`).
2. `05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`:
   - Exhaustive edge case handling matrix covering:
     - `original_effect == 0` (division-by-zero prevention).
     - Missing / `None` p-values (sensitivity bounds, overlap checks).
     - Bootstrap distribution summaries vs scalar estimates.
     - Non-numeric or categorical refuter outputs.
     - Graph sparsity, disconnected nodes, isolated clusters.
     - Sample size extremes ($N < 30$ vs $N > 1,000,000$).
   - Verification commands: `pytest`, `black`, `flake8`, `mypy`.

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Working Directory
`C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\worker_m3\`
Output: Write the final deliverables directly to `teamwork_projects\pywhy_pr_strategy\`, record your report in `analysis.md`, and complete your handoff in `handoff.md`.

## 2026-09-22T00:02:43Z
You are worker_m3.
Your working directory is: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\worker_m3
Your assigned deliverables are:
1. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\04_PR3_NETWORK_INTERFERENCE_REFUTER.md
2. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\05_EDGE_CASE_MATRIX_AND_VERIFICATION.md

You MUST read:
1. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md (header ## 2026-09-21T23:55:53Z)
2. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\worker_m3\DISPATCH.md
3. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_3\analysis.md
4. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_1\analysis.md
5. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\teamwork_preview_orchestrator_2\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Standards:
- Write `04_PR3_NETWORK_INTERFERENCE_REFUTER.md`: Technical blueprint for PR 3 (`dowhy/causal_refuters/network_interference_refuter.py`). Causal theory: SUTVA violation in marketplaces (Uber/Lyft driver cannibalization, Airbnb listing displacement, Meta/LinkedIn peer contagion, cloud multi-tenant GPU contention). Class architecture: dual support for `NetworkInterferenceRefuter(CausalRefuter)` and functional `refute_network_interference(...)`. Linear exposure mapping and cluster leave-one-out treatment fractions. Monte Carlo permutation inference (Athey-Eckles-Imbens 2018) for exact finite-sample p-values. Zero foreign dependencies (pure numpy, pandas, scipy sparse; zero networkx/igraph). Production code specification and unit tests (`tests/causal_refuters/test_network_interference_refuter.py`).
- Write `05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`: Exhaustive edge case handling matrix covering: `original_effect == 0` (division-by-zero), missing/`None` p-values, bootstrap distributions, non-numeric outputs, graph sparsity, disconnected nodes, sample size extremes. Verification commands: `pytest`, `black`, `flake8`, `mypy`.

Write your reports in `analysis.md` and `handoff.md` in your working directory, and write the two deliverables directly to `teamwork_projects\pywhy_pr_strategy\`.
When complete, send a message to parent.

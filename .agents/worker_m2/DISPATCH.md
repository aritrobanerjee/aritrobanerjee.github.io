# Dispatch: Worker 2 (PR 1 & PR 2 Technical Blueprints & Code Specifications)

## Mission
Deliver `02_PR1_CORE_REFUTATION_SUMMARY.md` and `03_PR2_INTERPRETER_AND_GUIDE.md` in `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\`.

## Authoritative Inputs
1. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md` (header ## 2026-09-21T23:55:53Z)
2. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_1\analysis.md` (Refutation & Interpreter Internals)
3. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\analysis.md` (Maintainer Post-Mortem & Bikeshedding Traps)
4. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\teamwork_preview_orchestrator_2\PROJECT.md`

## Deliverables & Scope
1. `02_PR1_CORE_REFUTATION_SUMMARY.md`:
   - Complete technical blueprint for PR 1: target file `dowhy/causal_refuters/refutation_summary.py`.
   - Strict budget compliance: OPERATIONAL CODE UNDER 150 LOC (excluding docstrings/comments). Zero foreign dependencies (pure pandas, numpy, stdlib).
   - Signatures: `refutation_summary(refutations, format="dataframe", alpha=0.05, effect_tolerance=0.10, ...)` supporting Single or List of `CausalRefutation`.
   - Output representations: `dataframe`, `markdown`, `text`.
   - Defensive ingestion: handles None p-values, original_effect == 0, tuple bounds, list unwrapping.
   - Comprehensive unit test specification (`tests/causal_refuters/test_refutation_summary.py`) with test cases and pytest verification commands.
2. `03_PR2_INTERPRETER_AND_GUIDE.md`:
   - Integration into DoWhy's `interpreters` ecosystem: `RefutationSummaryInterpreter(TextualInterpreter)` in `dowhy/interpreters/refutation_summary_interpreter.py`.
   - Dynamic registration in `dowhy/interpreters/__init__.py` and `CausalRefuter.interpret_method`.
   - Complete Sphinx documentation guide (`docs/source/user_guide/refuting_causal_estimates/refuting_effect_estimates/index.rst` or dedicated tutorial notebook/rst).
   - Resolves Issue #532 and Issue #847 with a definitive null-hypothesis reference table and interpretation guide.

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Working Directory
`C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\worker_m2\`
Output: Write the final deliverables directly to `teamwork_projects\pywhy_pr_strategy\`, record your report in `analysis.md`, and complete your handoff in `handoff.md`.

## 2026-09-22T00:02:43Z
Invocation received from parent (id: 3e12f882-1a68-4de4-b433-ac5bdd002892).
Assigned deliverables:
1. teamwork_projects\pywhy_pr_strategy\02_PR1_CORE_REFUTATION_SUMMARY.md
2. teamwork_projects\pywhy_pr_strategy\03_PR2_INTERPRETER_AND_GUIDE.md


# Dispatch: Challenger 1 (Empirical Code Execution & LOC Budget Challenger)

## Mission
Adversarially challenge and verify the code specifications, LOC budgets, and edge cases in `02_PR1_CORE_REFUTATION_SUMMARY.md` and `05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`.

## Authoritative Inputs
1. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md` (header ## 2026-09-21T23:55:53Z)
2. `teamwork_projects\pywhy_pr_strategy\02_PR1_CORE_REFUTATION_SUMMARY.md`
3. `teamwork_projects\pywhy_pr_strategy\05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`

## Challenge Tasks
- Verify LOC count of `refutation_summary` operational code: execute a python count script or line analyzer to guarantee operational lines of code < 150 lines.
- Empirically execute the code specification in a python script with synthetic `CausalRefutation` mocks:
  - Test case: Normal refutation with p-value.
  - Test case: `original_effect == 0.0` (zero division).
  - Test case: `p_value is None` or `refutation_result is None`.
  - Test case: `new_effect` is tuple `(-0.2, 0.5)` (from `AddUnobservedCommonCause`).
  - Test case: list of refutations from `DummyOutcomeRefuter`.
  - Test output formats: `dataframe`, `markdown`, `text`.
- Verify zero foreign imports (only pandas, numpy, stdlib).

## Working Directory
`C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_1\`
Output: Write `challenge.md` and `handoff.md` with empirical test results and verdict: `APPROVE` or `REQUEST_CHANGES`.

## 2026-09-22T00:05:53Z
<USER_REQUEST>
You are challenger_1.
Your working directory is: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_1
You MUST read:
1. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md (header ## 2026-09-21T23:55:53Z)
2. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_1\DISPATCH.md
3. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\02_PR1_CORE_REFUTATION_SUMMARY.md
4. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\05_EDGE_CASE_MATRIX_AND_VERIFICATION.md

Adversarially challenge and verify the code specifications and LOC budgets:
1. Count operational lines of code in PR 1 `refutation_summary` (must be < 150 LOC).
2. Empirically execute the code in python with mock refutations (including original_effect == 0, None p-values, tuple bounds, list of refutations).
3. Test DataFrame, Markdown, and Text outputs.
Write your findings to `challenge.md` and handoff to `handoff.md` in your working directory.
Your handoff MUST state an explicit verdict: APPROVE or REQUEST_CHANGES.
When done, send a message to parent.
</USER_REQUEST>


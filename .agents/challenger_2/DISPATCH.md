# Dispatch: Challenger 2 (Empirical SUTVA & Permutation Test Challenger)

## Mission
Adversarially challenge and verify the mathematical and empirical implementation of `NetworkInterferenceRefuter` in `04_PR3_NETWORK_INTERFERENCE_REFUTER.md`.

## Authoritative Inputs
1. `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md` (header ## 2026-09-21T23:55:53Z)
2. `teamwork_projects\pywhy_pr_strategy\04_PR3_NETWORK_INTERFERENCE_REFUTER.md`
3. `teamwork_projects\pywhy_pr_strategy\05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`

## Challenge Tasks
- Empirically execute the SUTVA refuter code specification in a python script with synthetic marketplace data:
  - Generate a network graph (adjacency matrix) with strong true spillover ($\beta_{\text{peer}} \ne 0$) and verify that the refuter detects SUTVA violation ($p < 0.05$).
  - Generate an independent data setting ($\beta_{\text{peer}} = 0$) and verify that the refuter passes ($p \ge 0.05$).
  - Test disconnected graph / isolated nodes / all-zero rows: verify zero division does not crash.
  - Verify permutation test p-value bounds $p \in [0.0, 1.0]$.
  - Verify zero heavy graph dependencies (pure numpy, pandas, scipy sparse).

## Working Directory
`C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_2\`
Output: Write `challenge.md` and `handoff.md` with empirical test results and verdict: `APPROVE` or `REQUEST_CHANGES`.

## 2026-09-22T00:05:53Z
You are challenger_2.
Your working directory is: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_2
You MUST read:
1. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md (header ## 2026-09-21T23:55:53Z)
2. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_2\DISPATCH.md
3. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\04_PR3_NETWORK_INTERFERENCE_REFUTER.md
4. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\05_EDGE_CASE_MATRIX_AND_VERIFICATION.md

Adversarially challenge and verify the PR 3 SUTVA refuter:
1. Empirically execute the SUTVA refuter code specification in a python script with synthetic marketplace data.
2. Verify detection of true spillover (p < 0.05).
3. Verify pass when there is no spillover (p >= 0.05).
4. Verify graceful handling of disconnected graphs and isolated nodes.
5. Verify zero heavy graph dependencies.
Write your findings to `challenge.md` and handoff to `handoff.md` in your working directory.
Your handoff MUST state an explicit verdict: APPROVE or REQUEST_CHANGES.
When done, send a message to parent.

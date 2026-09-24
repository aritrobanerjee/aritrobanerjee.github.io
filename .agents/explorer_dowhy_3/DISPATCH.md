# Dispatch: Explorer 3 (PR 3 Novel SUTVA / Network Interference Diagnostic)

## Mission
Investigate the technical formulation, causal inference methodology, and software architecture for PR 3: a lightweight `NetworkInterferenceRefuter` / SUTVA violation test for DoWhy.

## Authoritative User Request
Read: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md (specifically header ## 2026-09-21T23:55:53Z).

## Scope & Investigation Tasks
1. Causal Inference Theory for SUTVA / Network Interference:
   - What is the Stable Unit Treatment Value Assumption (SUTVA)?
   - How does spillover/interference manifest in marketplaces (e.g. Uber/Lyft driver competition, Airbnb inventory displacement, social network peer influence)?
   - How can a refuter test for SUTVA violations without requiring massive external graph libraries?
2. Architecture of DoWhy Refuters:
   - Inheriting from `dowhy.causal_refuter.CausalRefuter`.
   - Method contracts: `__init__`, `refute_estimate`, `refute_estimate_with_algo`.
   - Input expectations: data, target estimand, estimate, and optional adjacency matrix / cluster IDs / neighbor exposure vectors.
3. Test Statistic & Null Hypothesis:
   - Null hypothesis: No spillover / interference (treatment effect invariant to peer exposure).
   - Test statistic design: e.g. difference in effect when controlling for peer exposure, or permutation test over network clusters.
   - P-value calculation: empirical bootstrap or permutation inference.
4. Minimal Dependency & Maintenance Constraints:
   - Rely strictly on numpy, pandas, scipy/scikit-learn (already standard in DoWhy), zero networkx or heavy graph engine requirements.

## Working Directory
C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_3

## Output Requirements
Produce `analysis.md` and `handoff.md` in your working directory.
Include mathematical formulations, class hierarchy, method signatures, and minimal test cases.

## 2026-09-21T23:58:00Z
Received dispatch from parent:
Investigate the technical formulation, causal inference methodology, and software architecture for PR 3: a lightweight `NetworkInterferenceRefuter` / SUTVA violation test for DoWhy.
Investigate:
1. Causal Inference Theory for SUTVA / Network Interference
2. Architecture of DoWhy Refuters
3. Test Statistic & Null Hypothesis
4. Minimal Dependency & Maintenance Constraints
Write detailed analysis to `analysis.md` and complete handoff to `handoff.md`.


# Dispatch: Explorer 1 (DoWhy Refutation Framework & Issue Architecture)

## Mission
Investigate the technical internals of `py-why/dowhy` causal refuters, `CausalRefutation`, interpreters ecosystem, Issue #847, and Issue #532.

## Authoritative User Request
Read: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md (specifically header ## 2026-09-21T23:55:53Z).

## Scope & Investigation Tasks
1. Analyze DoWhy's refutation architecture:
   - Module locations: `dowhy.causal_refuter`, `CausalRefutation`, specific refuters (`random_common_cause`, `placebo_treatment_refuter`, `data_subset_refuter`, `add_unobserved_common_cause`, etc.).
   - Attributes and return types of `CausalRefutation`: `new_effect`, `original_effect`, `p_value`, `refutation_result`, etc.
   - String representation and current output formats in DoWhy.
2. Analyze DoWhy's `interpreters` ecosystem:
   - Module locations (`dowhy.interpreters.*`), base classes, registration patterns, visual vs text interpreters.
3. Investigate GitHub Issues:
   - Issue #847: Refutation summary utility / tabular presentation (opened Feb 2023).
   - Issue #532: Interpreters and refuters tracking issue (opened by Amit Sharma in 2022).
4. Identify integration points for PR 1 (core standalone `refutation_summary` utility) and PR 2 (DoWhy interpreter & docs guide).

## Working Directory
C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_1

## Output Requirements
Produce `analysis.md` and `handoff.md` in your working directory.
Provide verified evidence, exact signatures, file paths, and recommended architecture.

## 2026-09-21T23:58:00Z
You are explorer_dowhy_1.
Your working directory is: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_1
You MUST read:
1. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md (see header ## 2026-09-21T23:55:53Z)
2. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_1\DISPATCH.md

Your mission is to investigate the technical internals of `py-why/dowhy` causal refuters, `CausalRefutation`, interpreters ecosystem, Issue #847, and Issue #532.


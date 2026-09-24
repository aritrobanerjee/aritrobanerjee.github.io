# Dispatch: Explorer 2 (Maintainer Post-Mortem & Strategic Analysis)

## Mission
Conduct a deep-dive maintainer perspective analysis answering "Why Hasn't This Been Done Yet?" for DoWhy refutation summaries and diagnostics, analyzing Issue #847, Issue #532, and maintainer architectural constraints.

## Authoritative User Request
Read: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md (specifically header ## 2026-09-21T23:55:53Z).

## Scope & Investigation Tasks
1. Root-cause why Issue #847 stayed open since Feb 2023 with 4+ upvotes:
   - What blocked PR implementation? Why hasn't a community member or maintainer merged it?
2. Root-cause why Amit Sharma filed Issue #532 in 2022 and left it unbuilt:
   - What was the original vision? Where did priority shift (e.g. GCM - Graphical Causal Models, econml integration)?
3. Identify philosophical and architectural debate points (the "bikeshedding traps"):
   - Prescriptive vs descriptive p-value interpretation (does p > 0.05 mean "refutation passed" or "inconclusive"? How to prevent statistical overconfidence without making the utility useless?).
   - Multiple testing corrections: should Bonferroni / Benjamini-Hochberg be applied across refutations?
   - Threshold arbitrariness: alpha=0.05 hardcoded vs user-configurable thresholds.
   - Heterogeneous return types: some refuters test null of no change (p > 0.05 is good), some test null of no effect (placebo: new effect ~ 0), some return sensitivity bounds.
   - API compatibility: legacy `CausalModel` vs modern functional APIs.
4. Design the circumvention strategy:
   - How our staged decomposition (PR 1 < 150 LOC standalone, zero new dependencies, descriptive formatting + configurable decision thresholds) completely bypasses maintainer review friction and bikeshedding.

## Working Directory
C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2

## Output Requirements
Produce `analysis.md` and `handoff.md` in your working directory.
Include clear root causes, maintainer personas, and concrete circumvention recommendations.

## 2026-09-21T23:57:55Z
You are explorer_dowhy_2.
Your working directory is: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2
You MUST read:
1. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md (see header ## 2026-09-21T23:55:53Z)
2. C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\DISPATCH.md

Your mission is to conduct a deep-dive maintainer perspective analysis answering "Why Hasn't This Been Done Yet?" for DoWhy refutation summaries and diagnostics, analyzing Issue #847, Issue #532, and maintainer architectural constraints.
Investigate:
1. Root-cause why Issue #847 stayed open since Feb 2023 with 4+ upvotes:
   - What blocked PR implementation? Why hasn't a community member or maintainer merged it?
2. Root-cause why Amit Sharma filed Issue #532 in 2022 and left it unbuilt:
   - What was the original vision? Where did priority shift (e.g. GCM - Graphical Causal Models, econml integration)?
3. Identify philosophical and architectural debate points (the "bikeshedding traps"):
   - Prescriptive vs descriptive p-value interpretation (does p > 0.05 mean "refutation passed" or "inconclusive"? How to prevent statistical overconfidence without making the utility useless?).
   - Multiple testing corrections: should Bonferroni / Benjamini-Hochberg be applied across refutations?
   - Threshold arbitrariness: alpha=0.05 hardcoded vs user-configurable thresholds.
   - Heterogeneous return types: some refuters test null of no change (p > 0.05 is good), some test null of no effect (placebo: new effect ~ 0), some return sensitivity bounds.
   - API compatibility: legacy `CausalModel` vs modern functional APIs.
4. Design the circumvention strategy:
   - How our staged decomposition (PR 1 < 150 LOC standalone, zero new dependencies, descriptive formatting + configurable decision thresholds) completely bypasses maintainer review friction and bikeshedding.

Use search_web, read_url_content, or python commands to verify issue history, maintainer discussions, and community friction.
Write your detailed analysis to `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\analysis.md` and complete handoff to `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\handoff.md`.
When done, send a message to parent with your handoff summary.

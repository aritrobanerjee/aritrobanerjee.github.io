# Progress: py-why/dowhy PR Roadmap Project

Last visited: 2026-09-22T00:22:00Z

## Iteration Status
Current iteration: 3 / 32

## Current Status
- [x] Initialized orchestrator working environment (.agents/teamwork_preview_orchestrator_2/)
- [x] Recorded incoming dispatch and constraints (DISPATCH.md)
- [x] Created persistent working memory (BRIEFING.md)
- [x] Phase 0: Survey & Investigation (All 3 Explorers completed with verified evidence chains and handoffs)
- [x] Phase 1: Synthesize Survey Findings & Finalize PROJECT.md (Feature Inventory & Milestones)
- [x] Phase 2: Execute Milestone 1 (00_EXECUTIVE_SUMMARY.md & 01_MAINTAINER_POST_MORTEM.md)
- [x] Phase 3: Execute Milestone 2 (02_PR1_CORE_REFUTATION_SUMMARY.md & 03_PR2_INTERPRETER_AND_GUIDE.md)
- [x] Phase 4: Execute Milestone 3 (04_PR3_NETWORK_INTERFERENCE_REFUTER.md & 05_EDGE_CASE_MATRIX_AND_VERIFICATION.md)
- [x] Phase 5: Execute Milestone 4 (06_UPSTREAM_GITHUB_TEMPLATES.md)
- [x] Phase 6: Quality Gate Iteration 1 (Reviewers APPROVE, Auditor CLEAN, Challengers caught 2 runtime bugs -> REQUEST_CHANGES)
- [x] Phase 7: Remediation Loop (worker_remediation applied string recursion guard, pure-python markdown fallback, vectorized cluster LOO, and E27 NaN check)
- [x] Phase 8: Quality Gate Iteration 2 (challenger_final APPROVE [23/23 tests pass, 143 LOC], auditor_final CLEAN)
- [x] Phase 9: Gate Passed (Gate Result: PASS) & Deliverables Finalized

## Retrospective Notes
- **What Worked Well**:
  - Parallel multi-agent decomposition: 3 Survey Explorers uncovered critical historical context (Issue #847 scope creep by Padarn Wilson / Amit Sharma, Issue #532 PyWhy GCM pivot, and the 4-year refuter interpreter void).
  - Strict Adversarial Verification: Challenger 1 uncovered that standard Pandas `.to_markdown()` depends on the third-party `tabulate` library, which is not in DoWhy dependencies, and found string recursion in `_flatten_refutations()`. Challenger 2 uncovered a column lookup bug in cluster LOO simulations. Both bugs were caught and surgically remediated before upstream review!
  - Operational Discipline: PR 1 operational code was kept to 143 lines of code (well under the 150 LOC budget) while supporting 4 output formats (DataFrame, Markdown, Text, Jupyter HTML) and handling 32 distinct edge cases.
- **Lessons Learned**:
  - Always verify standard-library vs optional dependencies in third-party library wrapper methods (e.g. Pandas `DataFrame.to_markdown()` requiring `tabulate`).
  - Iteration loops with strict AND-gating (both Reviewers, Challengers, and Forensic Auditor must approve) catch real runtime edge cases that code generation alone misses.

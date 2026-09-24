## 2026-09-21T23:57:00Z

Develop a comprehensive, fact-grounded open-source PR roadmap for `py-why/dowhy` spanning PR 1 (core refutation summary utility), PR 2 (interpreter & guide integration), and PR 3 (novel SUTVA / network interference diagnostic). Deliver maximum practitioner value with minimal code footprint and zero maintenance friction, critically analyzing maintainer constraints and why this has not already been built.

Integrity mode: development
Deliverables directory: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy
Working directory: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\teamwork_preview_orchestrator_2

Requirements:
### R1. Multi-PR Staged Decomposition (PR 1, PR 2, PR 3)
Decompose the contributions into three progressive pull requests:
- PR 1 (Core Utility - Minimal Review Burden): A compact, standalone `refutation_summary` formatting function taking `List[CausalRefutation]` and returning clean Text, Markdown, and DataFrame representations with pass/fail interpretations (< 150 LOC, zero new dependencies).
- PR 2 (Interpreter & Docs Integration): Integration into DoWhy's `interpreters` ecosystem and documentation guide addressing maintainer-filed Issue #532 and community Issue #847.
- PR 3 (Novel Platform Diagnostic): A lightweight `NetworkInterferenceRefuter` / SUTVA violation test for networked / marketplace settings where unit independence breaks down.

### R2. Expert SWE / Maintainer Post-Mortem ("Why Hasn't This Been Done Yet?")
Conduct a deep-dive analysis from the perspective of an expert human software engineer and DoWhy core maintainer:
- Why has Issue #847 stayed open since Feb 2023 with 4 upvotes?
- Why did Amit Sharma file Issue #532 in 2022 and leave it unbuilt?
- What are the architectural traps, philosophical debate points (e.g. prescriptive vs descriptive p-value interpretation, multiple testing corrections, threshold arbitrariness), or bandwidth constraints that caused this to stall?
- How does our proposed design circumvent these traps so maintainers eagerly merge it instead of bikeshedding?

### R3. Fact-Based Technical Blueprint & Verification Design
For each PR, specify:
- Exact target file locations, module imports, and function/class signatures.
- API compatibility guards (supporting both legacy `CausalModel` and functional API patterns).
- Explicit edge cases (e.g. `original_effect == 0`, missing/none p-values, bootstrap distributions, non-numeric outputs).
- Unit test specification and verification commands (`pytest`, `black`, `flake8`).

Acceptance Criteria:
- Explicit post-mortem answering "why hasn't this been done yet?" for each proposed PR.
- Strict LOC and complexity budgets: PR 1 must remain under 150 lines of operational code.
- Zero foreign dependencies introduced (strictly pandas, numpy, and python standard library).
- Clear edge-case matrix handling division-by-zero, missing p-values, and heterogeneous refuter return types.
- Concrete GitHub issue and PR comment templates ready for human review before any upstream engagement.

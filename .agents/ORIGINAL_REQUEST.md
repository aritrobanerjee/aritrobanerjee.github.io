# Original User Request

## 2026-09-21T00:01:15Z

Develop actionable, customer-focused open-source Pull Request (PR) blueprints targeting existing tier-1 open-source repositories across three core product domains: Causal Measurement / Quasi-Experimentation, Non-Deterministic AI UX, and Platform Edge Primitives. Deliver concrete PR contribution packages that a Product Manager can execute using modern AI tools—prioritizing customer problem-solving, developer experience (DX), decision frameworks, and diagnostics rather than low-level SWE plumbing.

STRICT OPERATIONAL CONSTRAINT: This project is strictly to PLAN and PROPOSE changes to the user. Do NOT make any external edits, submit any actual PRs, or modify the user's existing website/portfolio code. All deliverables must be written as documentation, blueprints, and proposals in the designated working directory for the user to review.

Working directory: C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\oss_pm_strategy
Integrity mode: development

## Context & Objectives
The contributor is a Staff-track Platform Product Manager (ex-Google Ads measurement, Google Play Services). The objective is to establish high-signal, public open-source credentials by contributing meaningful, customer-centric value to major established repositories.

The 3 target domains are:
1. **Measurement**: Solving SUTVA collapse, geo-experiment power cliffs, and executive defensibility when A/B tests fail.
2. **AI UX / Design**: Guiding developers and users through failure modes, calibration, and trust in non-deterministic AI interfaces.
3. **Platform Primitives**: Developer ergonomics, contracts, and telemetry design when building APIs under uncertainty.

## Requirements

### R1. Tier-1 Repository Landscape & Maintainer Acceptance Audit
For each of the 3 domains, identify 2-3 premier open-source repositories (e.g., Meta GeoLift, Google CausalImpact, Microsoft DoWhy, Uber CausalML, LangChain/LlamaIndex eval tools, OpenTelemetry):
- Analyze open issues, community discussions, and PR history.
- Pinpoint high-friction user/customer gaps (missing diagnostic wizards, poor error explanations, lack of pre-flight experiment checks, inadequate customer-facing tutorials or benchmarks).
- Score each candidate repository on **Maintainer Welcomeness** for customer/DX contributions vs. pure C++/core engine changes.

### R2. Concrete PR Blueprints Across All 3 Domains (Pure Proposals)
Provide a detailed PR Blueprint for each domain, plus 1 flagship cross-cutting initiative:
- **Target Repository & Subsystem**: Exact repo URL, target folder, and proposed PR title.
- **Customer Problem Solved**: The pain point of the end practitioner (e.g., "Experimenters launch underpowered geo-tests because there is no pre-flight MDE profiler").
- **Contribution Scope**: Exact specification of what the PR adds (e.g., interactive CLI diagnostic, automated decision tree, customer-facing tutorial notebook, evaluation benchmark harness).
- **PR Description Draft**: A polished, compelling markdown PR description ready for the user to review and post on GitHub that clearly frames the motivation, proposed changes, and verification.

### R3. PM-with-AI Implementation & Verification Playbook
For each blueprint:
- Provide an end-to-end implementation roadmap achievable by a PM using AI pair-programming in under 2 weeks.
- Include the exact prompts and workflow needed to generate the code, tests, and documentation.
- Define a local test/verification checklist to ensure the PR passes CI before submission.

## Acceptance Criteria

### Customer Focus & Non-SWE Viability
- [ ] PR blueprints target customer experience, diagnostics, documentation benchmarks, and developer workflows—zero reliance on complex low-level engine rewrites.
- [ ] Every proposed PR can be created, tested, and validated by one person using AI code generation in 10-15 hours of work.

### Maintainer Realism & Safety
- [ ] Zero external writes, commits, or submissions: all deliverables are proposal documents stored in the working directory for user review.
- [ ] Targets established, actively maintained repositories with clear contribution guidelines.
- [ ] PR designs follow the exact conventions of each target repository (testing frameworks, doc style, licensing).
- [ ] The PR rationale is framed around solving real open user issues or documented platform friction points.

### Strategic Signal
- [ ] The contributions clearly reinforce the PM's expertise in causal systems, agentic UX, and platform APIs.
- [ ] Includes 1 flagship cross-cutting recommendation that bridges measurement and platform intelligence.

## 2026-09-21T23:55:53Z

Develop a comprehensive, fact-grounded open-source PR roadmap for `py-why/dowhy` spanning PR 1 (core refutation summary utility), PR 2 (interpreter & guide integration), and PR 3 (novel SUTVA / network interference diagnostic). Deliver maximum practitioner value with minimal code footprint and zero maintenance friction, critically analyzing maintainer constraints and why this has not already been built.

Working directory: teamwork_projects/pywhy_pr_strategy
Integrity mode: development

## Requirements

### R1. Multi-PR Staged Decomposition (PR 1, PR 2, PR 3)
Decompose the contributions into three progressive pull requests:
- **PR 1 (Core Utility - Minimal Review Burden)**: A compact, standalone `refutation_summary` formatting function taking `List[CausalRefutation]` and returning clean Text, Markdown, and DataFrame representations with pass/fail interpretations (< 150 LOC, zero new dependencies).
- **PR 2 (Interpreter & Docs Integration)**: Integration into DoWhy's `interpreters` ecosystem and documentation guide addressing maintainer-filed Issue #532 and community Issue #847.
- **PR 3 (Novel Platform Diagnostic)**: A lightweight `NetworkInterferenceRefuter` / SUTVA violation test for networked / marketplace settings where unit independence breaks down.

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

## Acceptance Criteria

### Analytical & Architectural Rigor
- [ ] Explicit post-mortem answering "why hasn't this been done yet?" for each proposed PR.
- [ ] Strict LOC and complexity budgets: PR 1 must remain under 150 lines of operational code.
- [ ] Zero foreign dependencies introduced (strictly pandas, numpy, and python standard library).
- [ ] Clear edge-case matrix handling division-by-zero, missing p-values, and heterogeneous refuter return types.
- [ ] Concrete GitHub issue and PR comment templates ready for human review before any upstream engagement.

# Project: Open-Source PM Strategy & Tier-1 PR Blueprints

## Architecture
- Target Audience: Staff-track Platform Product Manager (ex-Google Ads Measurement, Google Play Services).
- Operational Mode: Strict Plan & Propose. Zero external commits, PRs, or changes to existing portfolio codebase.
- Output Directory: `c:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\oss_pm_strategy\`
- Deliverables Structure:
  1. `00_executive_summary_and_pm_portfolio_strategy.md` — Strategic narrative, portfolio positioning, risk mitigations.
  2. `01_repository_landscape_and_maintainer_audit.md` — R1 Landscape audit across 3 domains, friction points, maintainer welcomeness scores.
  3. `02_pr_blueprint_measurement.md` — R2 Domain 1 Blueprint: PyWhy/DoWhy (`NetworkInterferenceRefuter` & `ExecutiveReportInterpreter`).
  4. `03_pr_blueprint_ai_ux.md` — R2 Domain 2 Blueprint: LangChain/LangGraph (`StreamCircuitBreaker` & `DegradedChunk` UX protocol) + Ragas explainability alternative.
  5. `04_pr_blueprint_platform_primitives.md` — R2 Domain 3 Blueprint: OpenTelemetry GenAI Semantic Conventions (`GenAI Conformance Validator & Scenario`).
  6. `05_flagship_cross_cutting_blueprint.md` — Flagship Cross-Cutting Blueprint: `semconv-causal-ai` (Adaptive Causal Evaluation & Experimentation Telemetry Contract for LLM Systems).
  7. `06_pm_with_ai_implementation_playbook.md` — R3 PM-with-AI Playbook: 10-15 hour / 2-week schedule, PCC prompts, TDD chains, CI pre-flight checklists (Python & R).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Measurement Repo Landscape Audit | In-depth audit of DoWhy, CausalPy, CausalML, GeoLift, CausalImpact with open issues & PR friction | M1 | survey_1 |
| F02 | Maintainer Welcomeness Scoring (Measurement) | Quantitative rubric (governance, review velocity, non-core receptivity) | M1 | survey_1 |
| F03 | AI UX Repo Landscape Audit | In-depth audit of LangGraph, Ragas, Outlines with failure modes, issue citations | M1 | survey_2 |
| F04 | Maintainer Welcomeness Scoring (AI UX) | Welcomeness evaluation for agentic UX & eval tooling | M1 | survey_2 |
| F05 | Platform Primitives Repo Landscape Audit | In-depth audit of OpenTelemetry (GenAI semconv), Temporal SDK, gRPC | M1 | survey_2 |
| F06 | Maintainer Welcomeness Scoring (Platform) | Welcomeness scoring for telemetry contracts and developer tooling | M1 | survey_2 |
| F07 | Domain 1 PR Blueprint (PyWhy/DoWhy) | SUTVA collapse refuter (`NetworkInterferenceRefuter`) & executive reporting interpreter | M2 | survey_1 |
| F08 | Domain 1 Alternative Blueprints | CausalPy placebo suite, CausalML uplift profiler, GeoLift spillover index | M2 | survey_1 |
| F09 | Domain 2 PR Blueprint (LangGraph) | `StreamCircuitBreaker` & `DegradedChunk` UX protocol for streaming amnesia and runaway loops | M2 | survey_2 |
| F10 | Domain 2 Alternative Blueprint (Ragas) | Explainable faithfulness metric & automated RAG triad diagnostic decision tree | M2 | survey_2 |
| F11 | Domain 3 PR Blueprint (OpenTelemetry) | GenAI semantic conventions conformance validator & agent reference scenario | M2 | survey_2 |
| F12 | Flagship Cross-Cutting Blueprint (`semconv-causal-ai`) | Adaptive Causal Evaluation & Experimentation Telemetry Contract bridging measurement & GenAI telemetry | M2 | survey_3 |
| F13 | OpenTelemetry Weaver Schema for Causal AI | YAML schema definitions for `experiment.*` and `causal.*` attributes | M2 | survey_3 |
| F14 | PM-with-AI Persona & PCC Framework | Persona-Context-Constraint architecture for hallucination-free AI generation | M3 | survey_3 |
| F15 | 4-Stage Multi-Turn TDD Prompt Chains | Multi-turn prompts (Red -> Green -> Refactor/Lint -> Fuzzing) for Python & R | M3 | survey_3 |
| F16 | 2-Week / 10-15 Hour Execution Roadmap | Granular day-by-day 13.0 hour schedule across 10 working days | M3 | survey_3 |
| F17 | Local CI Pre-Flight Automated Scripts | Shell scripts for Ruff, Mypy strict, Weaver check, Pytest coverage >=90%, R CMD check | M3 | survey_3 |
| F18 | PR Description Drafts & Maintainer Pitch | Production-ready GitHub PR markdown drafts with motivation, design, and verification | M2, M3 | survey_1,2,3 |
| F19 | Staff PM Portfolio Narrative & Executive Summary | Synthesis document positioning contributor's Google Ads/Play experience to tier-1 OSS leadership | M4 | orchestrator |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Tier-1 Repository Landscape & Maintainer Acceptance Audit | F01, F02, F03, F04, F05, F06 (`01_repository_landscape_and_maintainer_audit.md`) | Phase 0 Survey | PLANNED |
| M2 | Concrete PR Blueprints (3 Domains + 1 Flagship Cross-Cutting) | F07, F08, F09, F10, F11, F12, F13, F18 (`02`, `03`, `04`, `05` blueprints) | M1 | PLANNED |
| M3 | PM-with-AI Implementation & Verification Playbook | F14, F15, F16, F17, F18 (`06_pm_with_ai_implementation_playbook.md`) | M2 | PLANNED |
| M4 | Executive Summary, Quality Audit & Final Handoff | F19 (`00_executive_summary_and_pm_portfolio_strategy.md`), integrity review, user report | M3 | PLANNED |

## Code Layout
Target deliverable files in `c:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\oss_pm_strategy\`:
- `00_executive_summary_and_pm_portfolio_strategy.md` (M4)
- `01_repository_landscape_and_maintainer_audit.md` (M1)
- `02_pr_blueprint_measurement.md` (M2)
- `03_pr_blueprint_ai_ux.md` (M2)
- `04_pr_blueprint_platform_primitives.md` (M2)
- `05_flagship_cross_cutting_blueprint.md` (M2)
- `06_pm_with_ai_implementation_playbook.md` (M3)

## Feature Inventory Cross-Check
- Total Features: 19
- Features assigned to M1: F01, F02, F03, F04, F05, F06 (6 features)
- Features assigned to M2: F07, F08, F09, F10, F11, F12, F13, F18 (8 features)
- Features assigned to M3: F14, F15, F16, F17, F18 (5 features)
- Features assigned to M4: F19 (1 feature)
- Unassigned features: 0. Cross-check PASS.

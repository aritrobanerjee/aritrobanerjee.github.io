# Active Task & Handoff Scratchpad

> **Purpose**: This file is the primary memory bridge between Antigravity, Cline, and any other agent. When opening a new session, review this document first.

---

## 1. Executive Summary of Active Initiatives

| Initiative | Primary Directory | Current Status | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Personal Portfolio & Essays** | `/`, `src/` | **Production Ready** | Dark-mode SPA, 3 long-form essays, Cloudflare Analytics, GitHub Actions CI/CD |
| **Resume Builder CLI** | `resume/` | **Production Ready** | Harvard 1-page PDF/DOCX generator, cross-platform Chromium discovery, CLI options |
| **OSS PM Strategy Blueprints** | `teamwork_projects/oss_pm_strategy/` | **Proposal Complete** | 7 master strategy documents for DoWhy, LangGraph, OpenTelemetry, and cross-cutting standards |

---

## 2. Inventory of Completed Work & Recent Context

### A. The 3 Long-Form Essays (`src/content/essays/`)
1. **`causal-measurement.md`**:
   - Title: *Causal Measurement: Beyond the A/B Testing Power Cliff*
   - Focus: Quasi-experimentation, synthetic controls, GeoLift, overcoming SUTVA collapse, executive decision frameworks.
2. **`design-what-cant-be-imagined.md`**:
   - Title: *How to Design What Can't Be Imagined*
   - Focus: Product management for non-deterministic AI systems, calibration of user trust, graceful degradation, agent UX.
3. **`build-what-cant-be-defined.md`**:
   - Title: *How to Build What Can't Be Defined: Engineering Platform Primitives under Uncertainty*
   - Focus: Platform edge primitives, telemetry contracts, developer ergonomics (informed by Google Play Services & Ads Measurement experience).

### B. The Resume Builder Engine (`resume/`)
- Packaged as an open-source tool with MIT License.
- Generates pixel-perfect 1-page Harvard format PDF via `export.js` and DOCX via `docx-generator.js`.
- Features auto-discovery for Chrome/Brave/Edge across Windows, macOS, and Linux.

### C. The Open-Source PM Strategy Package (`teamwork_projects/oss_pm_strategy/`)
- **`00_executive_summary_and_pm_portfolio_strategy.md`**: Master playbook and positioning for a Staff-track Platform PM.
- **`01_repository_landscape_and_maintainer_audit.md`**: Deep maintainer audit of PyWhy/DoWhy, LangGraph, OpenTelemetry.
- **`02_pr_blueprint_measurement.md`**: PR Blueprint for Microsoft DoWhy (Causal Refutation Summary Wizard).
- **`03_pr_blueprint_ai_ux.md`**: PR Blueprint for LangGraph (Agent Failure Recovery & Diagnostics).
- **`04_pr_blueprint_platform_primitives.md`**: PR Blueprint for OpenTelemetry GenAI Semantic Conventions.
- **`05_flagship_cross_cutting_blueprint.md`**: `semconv-causal-ai` specification unifying causal measurement and AI agent tracing.
- **`06_pm_with_ai_implementation_playbook.md`**: 2-week execution framework with prompt playbooks and testing checklists.
- **`pr1_dowhy_refutation_summary_detailed_plan.md`**: Implementation roadmap for the first PR contribution.

---

## 3. Immediate Next Steps / Roadmap Options

Select one of the following tracks when starting your session:

- **Track 1: Execute PR 1 (DoWhy Contribution)**
  - Reference: `teamwork_projects/oss_pm_strategy/pr1_dowhy_refutation_summary_detailed_plan.md`.
  - Task: Implement the customer-facing refutation summary table and executive diagnostic report in a clean DoWhy fork.
- **Track 2: Expand Portfolio Content**
  - Reference: `src/content/essays/` & `src/data/projects.tsx`.
  - Task: Write a new essay or refine existing drafts, then run `npm run build` to verify routing.
- **Track 3: Resume Calibration & Updates**
  - Reference: `resume/resume.md`.
  - Task: Tune bullet points or metrics and export refreshed PDF/DOCX via `node resume/export.js`.

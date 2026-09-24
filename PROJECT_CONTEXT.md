# Project Context: Aritro Banerjee Portfolio & Strategy Workspace

## 1. Executive Summary
This repository houses the personal website, professional resume engine, and open-source platform strategy blueprints for **Aritro Banerjee**, a Staff-track Platform Product Manager (specializing in Causal Measurement, Non-Deterministic AI UX, and Platform Primitives).

Live Site: https://aritrobanerjee.github.io/

---

## 2. Core Initiatives & Subsystems

### A. Web Portfolio & Writing Platform (`/`)
* **Tech Stack**: React 18, TypeScript, Tailwind CSS, Vite.
* **Architecture**: Fully data-driven static single-page application deployed to GitHub Pages via GitHub Actions.
* **Key Files**:
  - `src/App.tsx`: Main layout, routing, modal states, reader toggle.
  - `src/data/profile.json`: Structured source of truth for work experience, skills, education, and links.
  - `src/data/projects.tsx`: Registry of projects, essays, and pixel-art category icons.
  - `src/content/essays/`: Markdown long-form essays and case studies rendered via `react-markdown`.
  - `src/components/`: Modular UI components (Experience timeline, EssayReader, CardDeckBackground, Header, Focus competencies).
  - `scripts/postbuild.js`: Postbuild script generating direct HTTP 200 route endpoints for GitHub Pages SPA compatibility.
* **Commands**:
  ```bash
  npm run dev      # Run local dev server on http://localhost:5173
  npm run build    # TypeScript typecheck + Vite build into dist/
  npm run preview  # Serve production dist locally
  ```

### B. Modular Resume Generator (`resume/`)
* **Purpose**: Standalone, open-source CLI resume builder capable of exporting clean HTML, PDF (via Puppeteer/headless Chrome), and DOCX formats.
* **Key Files**:
  - `resume/resume.md`: Source content formatted in standard Markdown.
  - `resume/export.js`: Headless export script supporting cross-platform browser paths.
  - `resume/docx-generator.js`: Word document export utility.
  - `resume/package.json`: Independent npm dependency manifest.

### C. Open-Source PM Strategy Blueprints (`teamwork_projects/oss_pm_strategy/`)
* **Purpose**: Customer-centric, actionable open-source contribution packages targeting tier-1 repositories (DoWhy, GeoLift, LangChain/Eval, OpenTelemetry).
* **Deliverables**:
  - `00_executive_summary_and_pm_portfolio_strategy.md`: Strategic positioning, credential architecture, domain matrix.
  - `01_repository_landscape_and_maintainer_audit.md`: Deep analysis of tier-1 repos and maintainer reception.
  - `02_pr_blueprint_measurement.md`: PR Blueprint for Microsoft DoWhy (Causal Refutation & Executive Defensibility).
  - `03_pr_blueprint_ai_ux.md`: PR Blueprint for Non-Deterministic AI UX diagnostics.
  - `04_pr_blueprint_platform_primitives.md`: PR Blueprint for Platform Edge telemetry & contracts.
  - `05_flagship_cross_cutting_blueprint.md`: Flagship unified initiative connecting causal measurement with AI agent reliability.
  - `06_pm_with_ai_implementation_playbook.md`: 2-week execution playbook for pair-programming PRs with AI.
  - `pr1_dowhy_refutation_summary_detailed_plan.md`: Step-by-step implementation plan for the DoWhy refutation PR.

---

## 3. Working Constraints
1. **Separation**: Do not modify website production code (`src/`, `public/`) when working on strategy blueprints or resume assets.
2. **Verification**: Always run `npm run build` at the root before committing code changes to verify type safety and bundle integrity.

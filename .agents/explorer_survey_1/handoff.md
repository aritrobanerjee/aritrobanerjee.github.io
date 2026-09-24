# Handoff Report — Survey Explorer 1 (Measurement Domain)

**Date**: 2026-09-21T00:04:45Z  
**Role**: Survey Explorer 1 (Measurement Domain Specialist)  
**Parent Orchestrator ID**: dcb10e8d-768e-469d-acd2-f709152e3975  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation
- **Original User Request**: Investigated `c:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\ORIGINAL_REQUEST.md`, targeting Domain 1: Causal Measurement / Quasi-Experimentation (SUTVA collapse, geo-experiment power cliffs, and executive defensibility when A/B tests fail).
- **Target Repositories Investigated**:
  1. **Microsoft / PyWhy DoWhy (`py-why/dowhy`)**:
     - Architecture: 4-stage pipeline (`Model -> Identify -> Estimate -> Refute`) across `dowhy/causal_refuters/` and `dowhy/interpreters/`.
     - Open Gaps: Has zero refuters for network interference or SUTVA spillover; `TextualEffectInterpreter` outputs basic sentences lacking business metrics or executive defensibility scorecards.
     - Welcomeness: 9.5 / 10. Independent PyWhy foundation governance, weekly commits, explicit contributor bot and Discord community.
  2. **PyMC Labs CausalPy (`pymc-labs/CausalPy`) & Google CausalImpact (`google/CausalImpact`)**:
     - Status: `google/CausalImpact` (R) is largely frozen/archival; `pymc-labs/CausalPy` is the active modern Python successor tracking CausalImpact feature parity (Issue #758).
     - Open Gaps: Lacks automated in-time and in-space (donor permutation) placebo falsification suites and RMSPE ratio test harnesses.
     - Welcomeness: 9.0 / 10. Core PyMC Labs team actively seeks diagnostic and validation contributions.
  3. **Uber CausalML (`uber/causalml`)**:
     - Architecture: Uplift modeling and meta-learners in Python (`causalml/metrics/`, `causalml/inference/`), with Cython-backed tree engines.
     - Open Gaps: No pre-flight power/MDE profiling for heterogeneous treatment effects; zero network spillover diagnostics.
     - Welcomeness: 8.0 / 10 for Python metrics/diagnostics (3.0 / 10 for Cython core undergoing tree unification).
  4. **Meta GeoLift (`facebookincubator/GeoLift`)**:
     - Architecture: R package based on Augmented Synthetic Control (`augsynth`).
     - Open Gaps: Does not model cross-border ad spillover or buffer zones; donor weights often concentrate in 1–2 markets without a fragility index.
     - Welcomeness: 6.5 / 10 (R-only stack, Meta CLA, periodic release cadence).
- **Deliverable Produced**: Full survey report and PR blueprints written to `c:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_survey_1\survey_report_measurement.md` (Total bytes ~25 KB).

---

## 2. Logic Chain
1. **Persona & Goal Alignment**: The contributor is a Staff-track Platform PM (ex-Google Ads measurement, Google Play Services). The highest-leverage positioning is to address real practitioner and customer friction points (diagnostics, pre-flight power cliffs, SUTVA violations, executive defensibility) rather than low-level SWE plumbing.
2. **Repository Screening**:
   - `google/CausalImpact` is frozen; community effort has migrated to `pymc-labs/CausalPy`.
   - `facebookincubator/GeoLift` has high domain relevance but R-only constraints and slower review velocity.
   - `uber/causalml` is actively maintained, but core tree changes are risky due to ongoing tree unification.
   - `py-why/dowhy` is uniquely positioned: it is the premier Python causal library, modular by design, enthusiastically welcomes new `CausalRefuter` and `Interpreter` classes, and directly lacks a SUTVA/interference refuter and an executive briefing generator.
3. **Blueprint Feasibility**:
   - Each proposed PR (`NetworkInterferenceRefuter` in DoWhy, `PlaceboTest` in CausalPy, `PreFlightPowerProfiler` in CausalML, and `GeoContaminationDiagnostic` in GeoLift) can be developed, tested, and documented with an AI pair-programmer in 10–12 hours.
   - None touch C++ or core solver routines, ensuring high maintainer acceptance.

---

## 3. Caveats
- **Execution Mode**: Per strict operational constraints, no external repositories were cloned, modified, or targeted with live commits/PRs. All findings, architectures, and blueprints are documented proposals.
- **R Stack vs Python Stack**: While Meta GeoLift is prominent in ad tech, it is in R. The primary recommendation focuses on PyWhy DoWhy and CausalPy to maximize applicability within standard Python data platforms (Snowflake, Databricks, BigQuery, Vertex AI).

---

## 4. Conclusion
- **Flagship Recommendation**: Propose **Blueprint 1 on PyWhy DoWhy (`py-why/dowhy`)**:
  - `feat(refuters): Add NetworkInterferenceRefuter and ExecutiveReportInterpreter for defensible platform experimentation`.
  - Target files: `dowhy/causal_refuters/network_interference_refuter.py` and `dowhy/interpreters/executive_report_interpreter.py`.
  - Solves the SUTVA collapse blind spot in networked/geo experiments and equips platform PMs with automated, CFO-ready executive defensibility reports.
- **Full Report Path**: `c:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_survey_1\survey_report_measurement.md`.

---

## 5. Verification Method
- Inspect the generated report at `c:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_survey_1\survey_report_measurement.md` using `view_file` to verify completeness of all 4 repository audits, maintainer welcomeness scores, practitioner friction analyses, and 4 complete PR blueprints with GitHub descriptions and implementation playbooks.
- Review `progress.md` and `DISPATCH.md` to confirm compliance with Teamwork Explorer protocols.

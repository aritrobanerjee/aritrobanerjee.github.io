# Flagship Cross-Cutting Specification & PM-with-AI Implementation Playbook
**Document ID**: SPEC-MINER-003-FLAGSHIP-PLAYBOOK  
**Author**: Survey Spec Miner 3 (Flagship Cross-Cutting & Playbook Architect)  
**Date**: 2026-09-21  
**Integrity Mode**: Proposal / Specification Only (Zero External Writes/Commits)  
**Target Repository Candidates**: 
- `open-telemetry/semantic-conventions` (Primary Spec Target: `model/experimentation/` & `model/genai/`)
- `Arize-ai/openinference` (Reference Telemetry Target: `python/openinference-semantic-conventions`)
- `py-why/dowhy` (Causal Telemetry Extraction Target: `dowhy/observability/`)

---

## 1. Executive Summary: The Causal-AI Platform Telemetry Thesis

Modern software engineering and product development are experiencing a severe architectural disconnect between **runtime AI observability** and **causal experimentation**.

1. **The Telemetry Status Quo**: OpenTelemetry (OTel) has established standard semantic conventions for distributed tracing, HTTP, databases, and recently Generative AI (`gen_ai.*`) and Feature Flags (`feature_flag.*`). Concurrently, OpenInference has established conventions for LLM spans and evaluations (`evaluation.score`, `evaluation.annotator_kind`).
2. **The Causal Crisis in AI**: Teams rolling out non-deterministic LLM agents, prompt updates, model routing, and RAG pipelines cannot reliably measure true business or algorithmic lift using naive randomized control trials (A/B tests). In LLM systems, **SUTVA (Stable Unit Treatment Value Assumption)** collapses due to:
   - **Shared Inference Caching**: Prefix caching and KV-cache warmups by treatment queries artificially accelerate control queries.
   - **Shared Quota / Rate-Limit Exhaustion**: Token-heavy treatment agent loops cause throttling, fallbacks, or latency spikes in control sessions.
   - **Agentic Multi-Tenant State Bleed**: Shared vector stores, persistent scratchpads, and fine-tuning data pipelines cause treatment effects to contaminate the control environment.
   - **Quasi-Experimental Realities**: For enterprise B2B tenants, platform SDK rollouts, or geo-level service changes, randomizing individual requests is impossible; teams must rely on **Synthetic Controls, Geo-Lift, or Switchback designs**.
3. **The Architectural Gap**: Today's distributed traces carry zero causal metadata. Downstream causal inference engines (`py-why/dowhy`, `uber/causalml`, `facebookincubator/GeoLift`, `google/CausalImpact`) cannot ingest OTel traces without bespoke, fragile, high-overhead data engineering pipelines that attempt to join async logs after the fact.
4. **The Flagship Cross-Cutting Solution**: A standardized OpenTelemetry Semantic Convention and Contract extension: **Adaptive Causal Experimentation & Counterfactual Evaluation Telemetry (`semconv-causal-ai`)**.
5. **The Contributor Persona Advantage**: For a Staff-track Platform Product Manager (ex-Google Ads measurement, Google Play Services), this is the optimal high-signal contribution:
   - It directly leverages deep measurement expertise (synthetic controls, causal attribution, SUTVA guardrails).
   - It directly leverages platform API craftsmanship (telemetry contracts, developer ergonomics, backward compatibility, schema validation).
   - It operates at the declarative schema and diagnostic layer (Weaver YAML, Pydantic, pytest), achieving maximum architectural leverage in **10-15 total hours** using modern AI pair-programming without low-level engine rewrites.

---

## 2. Features Discovered (Authoritative Spec Miner Inventory)

The following table documents the authoritative feature capabilities, inputs, outputs, error behaviors, and origins discovered during specification mining across OpenTelemetry, OpenFeature, OpenInference, and Causal Inference frameworks.

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Causal Telemetry | `experiment.id` & `experiment.name` | Unique identifier and human-readable name of an online experimentation unit | String (e.g. `exp-llm-routing-v2`) | Span Attribute / Event Attribute | Warns on whitespace/empty; falls back to `anonymous_experiment` | OpenTelemetry semconv registry model & OpenFeature spec |
| 2 | Causal Telemetry | `experiment.causal_unit_type` | Defines the unit of randomization or observation to prevent unit mismatch | Enum: `user`, `session`, `tenant`, `cluster`, `geo`, `time_slice`, `network_node` | Span/Event Attribute | Fails validation if string is not in enum | CausalML / DoWhy unit specification |
| 3 | Causal Telemetry | `experiment.assignment_strategy` | Strategy used to assign variants, critical for selecting valid causal estimators | Enum: `bernoulli_randomized`, `cluster_randomized`, `switchback`, `synthetic_control`, `difference_in_differences`, `instrumental_variable` | Span/Event Attribute | Reverts to `bernoulli_randomized` if omitted; logs schema warning | GeoLift / DoWhy identification protocols |
| 4 | Causal Telemetry | `experiment.interference_boundary` | Explicitly declares the isolation boundary to detect and audit SUTVA collapse | Enum: `isolated`, `shared_cache_risk`, `shared_quota_risk`, `multi_agent_feedback_risk`, `unbounded` | Span/Event Attribute | Flags telemetry span with `causal.sutva_violation_suspected = true` if risk is observed | Google Ads Measurement / Quasi-experimentation literature |
| 5 | Causal Telemetry | `causal.propensity_score` | Propensity of receiving treatment given observed covariates, used for IPW (Inverse Propensity Weighting) | Float in range `[0.0, 1.0]` | Float Span Attribute | Throws schema error if `< 0.0` or `> 1.0` | DoWhy / CausalML propensity scoring APIs |
| 6 | Causal Telemetry | `causal.synthetic_donor_pool` | Array of donor unit IDs utilized by synthetic control algorithms to generate counterfactual baselines | Array of Strings (e.g. `["geo_eu_west_1", "geo_us_east_2"]`) | Array Span Attribute | Empty array allowed; logs info if donor pool size < 3 | GeoLift / Synthetic Control literature |
| 7 | Causal Telemetry | `causal.synthetic_weight` | Normalized weighting assigned to a donor unit in a synthetic control cohort | Float in range `[0.0, 1.0]` | Float Span Attribute | Fails if weight is negative or non-numeric | GeoLift donor optimization engine |
| 8 | Causal Telemetry | `causal.sutva_violation_suspected` | Boolean flag indicating whether treatment spillover, cache bleed, or quota contention occurred during span | Boolean (`true`/`false`) | Boolean Attribute | Sets `causal.sutva_violation_reason` if `true` | SUTVA collapse diagnostic specifications |
| 9 | Causal Telemetry | `causal.sutva_violation_reason` | Specific diagnostic root cause for suspected SUTVA violation | Enum: `cache_bleed`, `quota_throttle_spillover`, `shared_state_mutation`, `temporal_overlap` | Enum Attribute | Omitted if `sutva_violation_suspected` is `false` | Platform API failure mode analysis |
| 10 | AI Observability | `gen_ai.system` & `gen_ai.request.model` | Identifies the foundation model vendor and exact model name in execution | String (e.g. `openai`, `anthropic`, `gemini-1.5-pro`) | Span Attribute | Required for all GenAI spans; missing value flags lint error | OpenTelemetry GenAI Semantic Conventions (`semconv-genai`) |
| 11 | AI Observability | `gen_ai.usage.input_tokens` / `output_tokens` | Captures token volume for cost, quota, and capacity measurement | Integer (`>= 0`) | Metric / Span Attribute | Clamped to 0; negative values rejected by schema validator | OTel GenAI Semantic Conventions |
| 12 | AI Observability | `openinference.span.kind` | Semantic span categorization for AI workflows | Enum: `LLM`, `CHAIN`, `TOOL`, `RETRIEVER`, `RERANKER`, `AGENT` | Span Attribute | Defaults to `UNKNOWN` if unrecognized | OpenInference Specification |
| 13 | Evaluation Telemetry | `evaluation.name` & `evaluation.score` | Standardized evaluation metric name and numerical grade | String (e.g. `hallucination_rate`, `relevance`), Float `[0.0, 1.0]` | Span / Trace Attribute | Schema validator enforces numeric score | OpenInference & Phoenix Evaluation Registry |
| 14 | Evaluation Telemetry | `evaluation.annotator_kind` | Source of evaluation label to differentiate offline tests from live telemetry | Enum: `LLM_JUDGE`, `HEURISTIC_CODE`, `HUMAN_FEEDBACK`, `CONSENSUS` | Span Attribute | Defaults to `HEURISTIC_CODE` | OpenInference Evaluation conventions |
| 15 | Evaluation Telemetry | `evaluation.counterfactual_delta` | Difference between actual evaluation score and counterfactual baseline score | Float (`score_treatment - score_counterfactual`) | Derived Float Attribute | Marked `NaN` if counterfactual estimate is missing | Causal Evaluation Contract Extension |
| 16 | Platform Ergonomics | Weaver Schema Registry Manifest | Declarative YAML specification defining telemetry registry, dependencies, and versioning | `manifest.yaml` file | Compiled JSON Schema, Go/Python types, Markdown docs | `weaver registry check` exits with non-zero code on syntax/type errors | OpenTelemetry Weaver CLI (`otel-weaver`) |
| 17 | Platform Ergonomics | OpenFeature Context Bridge | Extends OpenFeature `EvaluationContext` to auto-inject causal experiment attributes into active OTel tracer context | OpenFeature context map | Injected OTel Span Context & `feature_flag.evaluation` Event | Graceful no-op if OTel TracerProvider is not registered | OpenFeature / OTel Feature Flagging working group |
| 18 | Diagnostic Tooling | Pre-flight Experiment Profiler | Static/runtime validator assessing experiment power, SUTVA risk, and donor pool viability before launch | Config dictionary / pandas DataFrame of pre-period metrics | JSON Diagnostic Report with Power curves and MDE | Throws `UnderpoweredExperimentError` or `SUTVARiskWarning` | Platform PM diagnostic pattern (ex-Google Ads) |

---

## 3. Edge Cases & Boundary Conditions

| # | Feature | Input Condition | Observed / Desired Behavior |
|---|---------|-----------------|-----------------------------|
| 1 | `causal.propensity_score` | Propensity score exactly `0.0` or `1.0` (positivity assumption violation in causal inference) | Emits schema warning `PositivityViolationWarning`: IPW weighting is mathematically undefined when propensity is deterministic. Flags span attribute `causal.positivity_violation = true`. |
| 2 | `experiment.causal_unit_type` | Unit mismatch: Trace carries `user_id` but `causal_unit_type = "cluster"` while `experiment.cluster_id` is missing | Emits diagnostic error `MissingClusterIdentifierError`. Prevents corrupting cluster-level synthetic controls by setting fallback `cluster_id = hash(user_id) % N_CLUSTERS`. |
| 3 | `causal.sutva_violation_suspected` | LLM prompt cache hit on a treatment variant whose prefix was warmed by a control variant in the same tenant container | Detects cross-variant cache hit via `gen_ai.cache.hit = true` and `gen_ai.cache.origin_variant != experiment.variant`. Sets `causal.sutva_violation_suspected = true` and `causal.sutva_violation_reason = "cache_bleed"`. |
| 4 | `causal.synthetic_donor_pool` | Donor pool contains units with missing baseline telemetry during pre-experiment window | Synthetic control estimator fails silently or creates biased weights. Pre-flight profiler imputes using forward-fill or excludes incomplete donors, emitting `DonorAttritionWarning`. |
| 5 | `evaluation.score` | Multi-turn agent run where intermediate tool calls fail, but final response score is `1.0` | Evaluator span attaches to leaf span instead of root trace. Contract requires `evaluation.*` to link to root agent trace ID and record `evaluation.trace_coverage = "partial"`. |
| 6 | Weaver Schema Validation | Markdown doc generator receives custom YAML attributes without explicit `brief` and `note` fields | Weaver linter fails in CI with `SchemaValidationError: attribute causal.synthetic_weight missing required field 'brief'`. |
| 7 | High-Concurrency Switchback | Switchback experiment where time window switches from Treatment to Control during an active streaming LLM completion | Streaming completion span started under Treatment but finished under Control. Telemetry sets `experiment.variant_at_start = "treatment"` and `experiment.variant_at_end = "control"` with `causal.transition_boundary = true`. |
| 8 | Asynchronous Feedback | User thumbs-down feedback arrives 48 hours after the LLM trace completed | Uses OpenTelemetry Links API: generates an independent event span `causal.delayed_feedback` carrying a Span Link to the original LLM root trace ID with `causal.latency_seconds = 172800`. |

---

## 4. Flagship Cross-Cutting Blueprint: "Adaptive Causal Evaluation & Experimentation Telemetry Contract"

### 4.1 Target Repositories & Subsystems

| Attribute | Specification Target | Reference Implementation Target | Downstream Ingestion Target |
|-----------|----------------------|---------------------------------|-----------------------------|
| **Repository** | `open-telemetry/semantic-conventions` | `Arize-ai/openinference` | `py-why/dowhy` |
| **Subsystem / Directory** | `model/experimentation/` & `model/genai/` | `python/openinference-semantic-conventions/` | `dowhy/observability/` (new module proposal) |
| **Proposed PR Title** | `feat(semconv): add causal experimentation and adaptive evaluation telemetry conventions` | `feat(conventions): introduce CausalExperimentAttributes and SUTVA diagnostic conventions` | `feat(observability): add OpenTelemetry trace extractor for causal graph discovery and synthetic controls` |
| **Governance Body** | CNCF / OpenTelemetry Semantic Conventions WG | OpenInference / Arize AI Technical Steering | PyWhy / Linux Foundation Causal AI WG |

### 4.2 Architectural Requirements & Telemetry Schema Specification

The telemetry schema is authored in OpenTelemetry Weaver YAML format (`model/experimentation/causal-experimentation.yaml`). Below is the normative schema specification:

```yaml
# OpenTelemetry Semantic Conventions: Causal Experimentation & Evaluation
groups:
  - id: experiment.causal
    type: attribute_group
    brief: "Attributes defining causal experimentation, quasi-experimental units, and SUTVA guardrails."
    attributes:
      - id: experiment.id
        type: string
        brief: "Unique identifier for the active experiment or policy rollout."
        examples: ["exp-prompt-chain-v4", "geo-pricing-us-east"]
        requirement_level: required

      - id: experiment.causal_unit_type
        type:
          allow_custom_values: false
          members:
            - id: user
              value: "user"
              brief: "Standard independent user-level randomization (assumes SUTVA)."
            - id: session
              value: "session"
              brief: "Single interaction session randomization."
            - id: tenant
              value: "tenant"
              brief: "B2B enterprise account or workspace boundary."
            - id: cluster
              value: "cluster"
              brief: "Graph or network cluster isolated to mitigate spillover."
            - id: geo
              value: "geo"
              brief: "Geographic market or region for quasi-experiments."
            - id: time_slice
              value: "time_slice"
              brief: "Time-window block for switchback experimentation."
        requirement_level: required

      - id: experiment.assignment_strategy
        type:
          allow_custom_values: false
          members:
            - id: bernoulli_randomized
              value: "bernoulli_randomized"
            - id: cluster_randomized
              value: "cluster_randomized"
            - id: switchback
              value: "switchback"
            - id: synthetic_control
              value: "synthetic_control"
            - id: difference_in_differences
              value: "difference_in_differences"
        requirement_level: required

      - id: experiment.interference_boundary
        type:
          allow_custom_values: false
          members:
            - id: isolated
              value: "isolated"
              brief: "No shared cache, memory, or capacity across variants."
            - id: shared_cache_risk
              value: "shared_cache_risk"
              brief: "Variants share prefix/prompt KV caches (SUTVA risk)."
            - id: shared_quota_risk
              value: "shared_quota_risk"
              brief: "Variants share model rate limits or TPU/GPU concurrency."
            - id: multi_agent_feedback_risk
              value: "multi_agent_feedback_risk"
              brief: "Agents read/write shared vector memory or databases."
        requirement_level: recommended

      - id: causal.propensity_score
        type: double
        brief: "Calculated propensity score P(T=1 | X) for observational or biased assignment."
        examples: [0.485]
        requirement_level: cond_required

      - id: causal.sutva_violation_suspected
        type: boolean
        brief: "Indicates whether runtime conditions violated SUTVA (e.g., cross-variant cache pollution)."
        examples: [false, true]
        requirement_level: recommended

      - id: causal.sutva_violation_reason
        type:
          allow_custom_values: true
          members:
            - id: cache_bleed
              value: "cache_bleed"
            - id: quota_throttle_spillover
              value: "quota_throttle_spillover"
            - id: shared_state_mutation
              value: "shared_state_mutation"
            - id: temporal_overlap
              value: "temporal_overlap"
        requirement_level: opt_in
```

### 4.3 End-to-End User & Customer Journey

```
+---------------------------------------------------------------------------------------------------+
|                                  THE CAUSAL-AI TELEMETRY JOURNEY                                  |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  1. Pre-Flight Experiment Design (Platform PM & Data Scientist)                                  |
|     + PM runs Pre-Flight Profiler CLI: identifies shared prompt cache between variants.           |
|     + Decision: SUTVA violation risk detected -> selects `switchback` + `shared_cache_risk`.       |
|                                                                                                   |
|  2. Runtime Execution & Span Injection (Application Microservice)                                |
|     + OpenFeature resolves variant: `treatment_rag_hybrid`.                                       |
|     + Injects `experiment.causal_unit_type="session"`, `experiment.id="exp-rag-v2"`.              |
|     + LLM Invocation fires: OTel tracer attaches GenAI and Causal attributes to span.             |
|                                                                                                   |
|  3. Runtime SUTVA Diagnostic Guardrail (Observability Layer)                                     |
|     + LLM returns response with cached prefix from control group.                                 |
|     + Diagnostic middleware sets `causal.sutva_violation_suspected=true`, `reason="cache_bleed"`.|
|     + Emits `feature_flag.evaluation` and `gen_ai.client.operation` spans.                       |
|                                                                                                   |
|  4. Downstream Ingestion & Causal Extraction (DoWhy / CausalML / GeoLift)                         |
|     + OTel Collector exports traces directly to ClickHouse / BigQuery / Parquet.                  |
|     + DoWhy Trace Extractor filters out contaminated spans (`sutva_violation_suspected=true`).    |
|     + Fits Synthetic Control / Difference-in-Differences model using verified unpolluted units.   |
|                                                                                                   |
|  5. Executive Defensibility & ROI Verification (Executive Review)                                |
|     + PM presents executive dashboard: Causal lift (+18.4% relevance) with 95% CI.               |
|     + Defends against false positives by proving SUTVA contamination was measured and filtered.   |
+---------------------------------------------------------------------------------------------------+
```

### 4.4 Maintainer Pitch & Community Alignment Strategy

**The Problem Framing for OpenTelemetry & OpenInference Maintainers**:
- OpenTelemetry is rapidly standardizing AI observability via `open-telemetry/semantic-conventions-genai` and Feature Flagging via OpenFeature.
- However, enterprise practitioners rolling out LLM agents cannot connect their distributed traces to business experimentation or causal inference. Today, every enterprise invents incompatible custom span attributes (`custom.exp_name`, `ai.eval_group`, `sutva_flag`), leading to vendor lock-in and telemetry fragmentation.
- **Why Maintainers Will Accept This**:
  1. **Strict Adherence to Standards**: Written in Weaver YAML conforming to OTel Schema Specification v2.
  2. **Non-Breaking & Purely Additive**: Placed in an `experimental` stability namespace (`model/experimentation/`), introducing zero regressions to core HTTP or GenAI conventions.
  3. **High Strategic Alignment**: Bridges the Application Observability SIG, the GenAI SIG, and the OpenFeature community.
  4. **Empathy for Maintainer Workload**: Includes full automated validation scripts, test fixtures, schema documentation, and reference type definitions in Python and TypeScript.

### 4.5 Technical Boundaries & Non-SWE Scope Feasibility

To guarantee that a Staff Platform PM can execute, test, and verify this contribution using AI pair-programming in **10-15 hours**, the technical boundary is strictly enforced:
- **IN SCOPE**:
  - Declarative Weaver YAML schema definitions for `experiment.*` and `causal.*` attribute groups.
  - Markdown reference documentation generated via Weaver templates.
  - Python Pydantic validation schema and helper decorator (`@causal_telemetry_span`).
  - Unit tests asserting schema conformity, invalid enum rejection, and edge-case validation.
  - End-to-end tutorial notebook demonstrating telemetry generation and ingestion into `DoWhy`.
- **OUT OF SCOPE**:
  - Modifying the core OpenTelemetry C++ Collector engine or Go Collector internals.
  - Modifying low-level OpenTelemetry SDK exporters or network protocols.
  - Implementing custom database drivers or modifying existing GenAI token parsers.

---

## 5. R3 PM-with-AI Implementation & Verification Playbook

### 5.1 Persona-Context-Constraint (PCC) Prompt Architecture

When using modern AI models (Gemini 1.5 Pro, Claude 3.5 Sonnet, GPT-4o) to implement production-grade open-source contributions, naive one-shot prompts fail due to style guide violations, missing edge cases, and dependency hallucinations. 

The **PCC Framework** ensures deterministic, review-ready outputs:

```markdown
### PERSONA (Role & Calibration)
You are a Principal Software Engineer and Maintainer for [TARGET_REPO, e.g., open-telemetry/semantic-conventions].
You write concise, defensive, PEP 8 / Google-style compliant code.
You prioritize backward compatibility, strict type safety, zero unnecessary dependencies, and crystal-clear error messages.

### CONTEXT (Grounding & Environment)
- Target Repository: [REPO_URL]
- Target Subsystem: [DIRECTORY_PATH]
- Project Conventions: Using [Pydantic v2 / Weaver YAML / pytest / Flake8 / Black / mypy --strict].
- Existing Architecture: [PASTE_RELATED_INTERFACE_OR_EXISTING_YAML]
- PR Objective: [SPECIFIC_GOAL_FROM_BLUEPRINT]

### CONSTRAINTS (Hard Boundaries & Non-Negotiables)
1. ZERO low-level engine rewrites: Do NOT touch internal core engines or C/C++ native extensions.
2. ZERO external dependency additions: Use only standard library or existing pinned dependencies in pyproject.toml / requirements.txt.
3. Strict Type Safety: Every function, parameter, and return value must have explicit type annotations passing `mypy --strict`.
4. Comprehensive Error Handling: Never use bare `except:`. Define custom, informative exceptions subclassing project base errors.
5. 100% Test Coverage: Every new attribute, class, or function must have corresponding unit tests covering happy path, invalid types, boundary values, and null inputs.
```

---

### 5.2 Test-Driven Development (TDD) Multi-Turn Prompt Chains

To build the blueprint within 10-15 hours, execution follows a disciplined 4-stage TDD prompt chain:

#### Chain 1: The "Red" Prompt (Interface Contracts & Failing Tests)
```markdown
[PCC_HEADER]

TASK: Step 1 (RED Phase) - Define Interfaces & Unit Test Suite
Given the architectural specification for [FEATURE_NAME]:
1. Write the abstract interface / dataclass / Pydantic schema in [TARGET_FILE_PATH]. Include full docstrings explaining parameters and invariants.
2. Write a comprehensive pytest suite in `tests/[TEST_FILE_PATH]`.
3. The tests must exhaustively cover:
   - Happy path instantiation with all valid parameters.
   - Rejection of invalid enum values with informative ValueError.
   - Boundary tests for numeric constraints (e.g. propensity score < 0.0 or > 1.0).
   - Missing required attribute errors.
   - Serialization to standard OpenTelemetry Attribute dictionary format.
4. Do NOT implement the business logic yet—only provide the interfaces with `raise NotImplementedError` so the test suite compiles and FAILS (RED).
```

#### Chain 2: The "Green" Prompt (Minimal Correct Implementation)
```markdown
[PCC_HEADER]

TASK: Step 2 (GREEN Phase) - Minimal Correct Implementation
Here is the failing test suite and interface from Step 1:
[PASTE_STEP_1_TEST_OUTPUT_AND_CODE]

Implement the minimal production-ready logic to make 100% of these tests PASS.
Rules:
- Do not modify any assertions in the test suite.
- Ensure strict adherence to repository performance idioms (e.g. frozen dataclasses, slots, or fast dict lookups).
- Ensure all exceptions match the exact types and error messages asserted by the test suite.
```

#### Chain 3: The "Refactor & Polish" Prompt (Style, Linters, & AST Hygiene)
```markdown
[PCC_HEADER]

TASK: Step 3 (REFACTOR Phase) - Code Hygiene, Type Checking, and Linting
Here is the working implementation from Step 2:
[PASTE_STEP_2_IMPLEMENTATION]

Refactor and polish the code for maintainer review:
1. Ensure full compliance with `mypy --strict` (no `Any` types, explicit Optional handling).
2. Format all docstrings to [NumPy / Google / Sphinx] format with detailed parameter descriptions, returns, and examples.
3. Eliminate duplicate code or dictionary key lookups.
4. Verify that running `ruff check .` and `black --check .` will produce ZERO warnings or reformatting diffs.
```

#### Chain 4: The "Property-Based & Edge-Case" Prompt (Hypothesis Fuzzing)
```markdown
[PCC_HEADER]

TASK: Step 4 (HARDENING Phase) - Property-Based & Stress Testing
Write an additional test module `tests/test_causal_telemetry_properties.py` using `hypothesis`:
1. Fuzz the telemetry parser with random unicode strings, extreme floating-point numbers (Inf, -Inf, NaN), negative numbers, and deeply nested dictionaries.
2. Assert invariants:
   - Serialized telemetry must always be valid JSON.
   - Invalid propensity scores must ALWAYS raise ValidationError, never crash with unhandled exception.
   - SUTVA violation flags must NEVER mutate original input spans.
```

---

### 5.3 Diagnostic & Documentation Prompt Chains

#### Chain 5: End-to-End Tutorial & Customer DX Notebook
```markdown
[PCC_HEADER]

TASK: Step 5 - Customer-Facing Diagnostic Tutorial Notebook
Create an end-to-end Jupyter notebook at `notebooks/causal_telemetry_diagnostic_walkthrough.ipynb`.
The tutorial must guide an AI Platform PM or Data Scientist through:
1. Simulating an online LLM agent experiment with 2 prompt routing variants.
2. Demonstrating how SUTVA is violated when prompt prefix caching is enabled across variants.
3. Instrumenting the pipeline using our new `semconv-causal-ai` attributes.
4. Inspecting the emitted OpenTelemetry trace spans in memory.
5. Ingesting the telemetry into `DoWhy` to estimate true causal lift while filtering out cache-contaminated units.
6. Generating rich visual diagnostic plots (Matplotlib/Seaborn) showing causal lift vs. naive correlation.
Include clear markdown explanations framing the business problem, the technical failure mode, and the platform solution.
```

---

### 5.4 PR Description & Maintainer Empathy Prompt Template

#### Chain 6: Maintainer-Grade Pull Request Description Generator
```markdown
[PCC_HEADER]

TASK: Step 6 - Maintainer Pull Request Description Generator
Generate a polished, authoritative Pull Request markdown description for our contribution to [REPO_NAME].
Structure the PR description with:
1. **Title**: Conventional commit style (e.g. `feat(semconv): add causal experimentation and adaptive evaluation telemetry conventions`).
2. **Motivation & Problem Statement**: Frame the real pain point experienced by production users (SUTVA collapse in AI systems, lack of causal metadata in OTel traces).
3. **Proposed Changes**: Granular bullet points categorized by module/subsystem.
4. **Design Choices & Trade-offs**: Explain why this was designed as an additive experimental semantic convention rather than modifying core collector logic.
5. **Verification & Testing**: Exact local CLI commands run (`pytest`, `mypy`, `weaver`), summary of test coverage (e.g., "100% coverage across 28 unit tests"), and a copy-pasteable 5-line verification script.
6. **Backward Compatibility**: Explicit confirmation that existing schemas and traces are 100% unaffected.
7. **Maintainer Checklist**: Checkboxes for documentation, testing, license, and CLA signing.
```

---

### 5.5 2-Week Execution Schedule Mapped to 10-15 Total Hours

The roadmap is structured across 10 working days (2 calendar weeks), requiring **1.0 to 1.5 hours per day**, totaling exactly **13.0 hours**:

```
===================================================================================================
                                2-WEEK PM-WITH-AI EXECUTION SCHEDULE
===================================================================================================

WEEK 1: Specification, Scaffolding & Core Implementation (6.5 Total Hours)
---------------------------------------------------------------------------------------------------
Day 1 (1.0h) | Milestone 1: Environment Setup & Maintainer Audit
             - Fork repo, configure local venv/poetry/docker.
             - Inspect open issues and PR history for maintainer conventions and CI workflows.
             - Validate clean baseline run of existing tests (`pytest` / `weaver registry check`).

Day 2 (1.5h) | Milestone 2: Schema / Interface Contract & Red TDD Suite
             - Run Prompt Chain 1 (Red).
             - Scaffold YAML semantic convention model (`model/experimentation/causal.yaml`).
             - Generate failing test suite (`tests/test_causal_semconv.py`) asserting schema validity.

Day 3 (2.0h) | Milestone 3: Green Implementation via AI Pair-Programming
             - Run Prompt Chain 2 (Green).
             - Implement Python Pydantic models, attribute constants, and serialization helpers.
             - Achieve 100% passing tests on happy path and standard error handling.

Day 4 (1.0h) | Milestone 4: Edge-Case Hardening & Property Testing
             - Run Prompt Chain 4 (Hypothesis/Fuzzing).
             - Implement boundary condition guards (positivity assumption, unit mismatch, NaN scores).
             - Verify zero uncaught exceptions across 500 generated test cases.

Day 5 (1.0h) | Milestone 5: Local Linting, Typing & Weaver Compilation
             - Run Prompt Chain 3 (Refactor & Polish).
             - Execute `ruff check`, `black`, and `mypy --strict`.
             - Compile schema via `weaver registry check` and verify generated Markdown docs.

WEEK 2: Diagnostics, Customer DX, Documentation & Submission (6.5 Total Hours)
---------------------------------------------------------------------------------------------------
Day 6 (1.5h) | Milestone 6: Customer Diagnostic Utility / Helper Decorator
             - Implement lightweight runtime decorator `@causal_telemetry_span` / diagnostic profiler.
             - Add unit tests verifying span attribute injection and SUTVA cache bleed detection.

Day 7 (1.5h) | Milestone 7: End-to-End Tutorial Notebook
             - Run Prompt Chain 5 (Tutorial Notebook).
             - Build self-contained Jupyter notebook showing simulated LLM experiment + DoWhy ingestion.
             - Test run notebook end-to-end to ensure zero execution errors.

Day 8 (1.0h) | Milestone 8: Documentation & Reference Site Generation
             - Generate Sphinx/MkDocs documentation pages.
             - Validate that all links, attribute cross-references, and code blocks render cleanly.

Day 9 (1.5h) | Milestone 9: PR Polish, Maintainer Framing & Verification Evidence
             - Run Prompt Chain 6 (PR Description Generator).
             - Prepare reproducible verification copy-paste snippet.
             - Perform final self-review against repository `CONTRIBUTING.md` rules.

Day 10 (1.0h)| Milestone 10: Multi-Matrix CI Verification & Final Freeze
             - Run full pre-flight verification script across Python 3.10, 3.11, and 3.12.
             - Ensure zero unstaged files, clean Git history, and signed commits (`git commit -s`).
             - PR artifact package frozen and ready for user review.
===================================================================================================
Total Time Investment: 13.0 Hours (Well within 10-15 Hour Acceptance Limit)
===================================================================================================
```

---

### 5.6 Comprehensive CI Pre-Flight Checklists

To prevent embarrassing maintainer rejections or CI pipeline failures, every contribution package must pass the automated pre-flight gates locally before submission.

#### Checklist A: Python Ecosystem (OpenTelemetry, OpenInference, DoWhy, CausalML)

```bash
#!/usr/bin/env bash
# local_ci_preflight_python.sh
set -euo pipefail

echo "=== [1/6] Code Formatting (Black & isort / Ruff) ==="
ruff format --check .
ruff check .

echo "=== [2/6] Static Analysis & Linting (Flake8 / Ruff) ==="
ruff check --select E,F,W,C90,I,N,UP,B,A,COM,C4,PT,SIM .

echo "=== [3/6] Strict Type Checking (Mypy) ==="
mypy --strict --show-error-codes --pretty src/ tests/

echo "=== [4/6] Weaver Telemetry Schema Validation (if applicable) ==="
if command -v weaver &> /dev/null; then
    weaver registry check -r model/
    echo "Weaver semantic conventions validated successfully."
fi

echo "=== [5/6] Unit & Integration Testing with Coverage Thresholds ==="
pytest -v \
    --cov=src \
    --cov-report=term-missing \
    --cov-fail-under=90 \
    --durations=10 \
    tests/

echo "=== [6/6] Documentation Build Verification ==="
if [ -f "docs/conf.py" ]; then
    sphinx-build -W -b html docs/ docs/_build/html
elif [ -f "mkdocs.yml" ]; then
    mkdocs build --strict
fi

echo ">>> ALL PYTHON PRE-FLIGHT CHECKS PASSED DETERMINISTICALLY! <<<"
```

#### Checklist B: R Ecosystem (GeoLift, CausalImpact)

```R
# local_ci_preflight_r.R
# Pre-flight validation script for R packages
stopifnot(requireNamespace("devtools", quietly = TRUE))
stopifnot(requireNamespace("lintr", quietly = TRUE))
stopifnot(requireNamespace("styler", quietly = TRUE))

message("=== [1/4] Checking Code Style & Formatting ===")
style_diff <- styler::style_pkg(dry = "on")
if (any(style_diff$changed)) {
  stop("Styler detected formatting inconsistencies. Run styler::style_pkg() to resolve.")
}

message("=== [2/4] Running Static Analysis (lintr) ===")
lint_results <- lintr::lint_package()
if (length(lint_results) > 0) {
  print(lint_results)
  stop("Lint issues detected. Fix all linter warnings prior to submission.")
}

message("=== [3/4] Running Package Test Suite (testthat) ===")
test_results <- devtools::test()
df_res <- as.data.frame(test_results)
if (any(df_res$failed > 0) || any(df_res$error)) {
  stop("Unit tests failed!")
}

message("=== [4/4] Executing Comprehensive R CMD check ===")
check_results <- devtools::check(
  manual = FALSE,
  cran = TRUE,
  args = c("--no-manual", "--as-cran"),
  error_on = "warning" # Zero warnings or errors allowed on CRAN track
)

message(">>> ALL R PRE-FLIGHT CHECKS PASSED DETERMINISTICALLY! <<<")
```

#### Checklist C: Pull Request Submission & Hygiene Gate

- [ ] **Commit Hygiene**:
  - Commits follow Conventional Commits standard (`feat(semconv): ...`, `test(causal): ...`, `docs(tutorial): ...`).
  - Commits are signed with DCO (`git commit -s`) or CLA verified.
  - Commits are cleanly squashed into logical, reviewable units (no "fix typo", "oops", or "WIP" commits).
- [ ] **Issue Linking & Attribution**:
  - PR references the corresponding GitHub RFC or Issue (e.g. `Addresses #4521`, `Closes #4522`).
- [ ] **Scope Containment**:
  - PR touches strictly the target files: zero accidental modifications to unrelated files, `.gitignore`, IDE config (`.vscode`, `.idea`), or lockfiles.
- [ ] **Reproducible Verification**:
  - PR body contains a standalone, 5-line copy-pasteable bash/python snippet that any maintainer can run in an isolated terminal to verify the functionality immediately.
- [ ] **Zero Regressions**:
  - Baseline test suite for the untouched codebase runs and passes 100% identically to `main`.

---

## 6. Cross-Domain Synthesis & Strategic Positioning for Staff PM

### 6.1 Unifying the Three Domains

The Flagship Initiative (`semconv-causal-ai`) serves as the architectural connective tissue across the entire portfolio strategy:

1. **Domain 1 (Causal Measurement)**: Provides the mathematical foundation (Synthetic Controls, GeoLift, SUTVA guardrails, Propensity Scoring).
2. **Domain 2 (AI UX & Design)**: Provides the runtime observability surface (non-deterministic failure mode tracking, calibration scores, evaluation attributes).
3. **Domain 3 (Platform Primitives)**: Provides the distribution mechanism and contract design (OpenTelemetry Weaver schemas, OpenFeature context propagation, backward-compatible API ergonomics).

### 6.2 Executive Credentialing Impact for a Staff-Track Platform PM

| Contributor Asset | Traditional Approach (Low Signal) | Proposed Strategy (Elite Staff Signal) |
|---|---|---|
| **Code Contribution** | Fixing typo in documentation, tweaking CSS, or submitting trivial docstring fix. | Authoring formal OpenTelemetry Semantic Convention and diagnostic telemetry contract. |
| **Technical Depth** | Claiming knowledge of AI or causality without public artifacts. | Publishing verifiable Weaver schemas, hypothesis test suites, and an end-to-end DoWhy ingestion tutorial. |
| **Product Leadership** | Recommending features in GitHub issues without implementation details. | Delivering a turnkey, 100% CI-verified PR package with maintainer empathy and customer DX focus. |
| **Domain Authority** | Generalist PM narrative. | Domain master at the critical intersection of **Causal Ads Measurement** (Google Ads) and **Platform Telemetry Contracts** (Google Play Services). |

---
*End of Flagship Cross-Cutting & Playbook Specification Report.*

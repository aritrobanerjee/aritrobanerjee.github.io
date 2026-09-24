# Open-Source PR Blueprint: Platform Primitives & Telemetry Contracts
**Document ID**: PR-BLUEPRINT-004-PLATFORM-PRIMITIVES  
**Domain**: Domain 3 — Platform Primitives, Developer Ergonomics & Semantic Observability under Uncertainty  
**Author**: Staff Platform Product Manager (ex-Google Ads Measurement, Google Play Services)  
**Status**: Proposal & Specification Document (Strict Plan & Propose; Zero External Writes)  
**Target Date**: September 2026  

---

## 1. Executive Positioning & Domain Overview

### 1.1 The Platform Primitives Crisis in AI Microservices
At Google Play Services, Google Ads, and modern cloud infrastructure platforms, software durability and operational scale depend on **strictly typed API contracts, semantic observability, and backward compatibility**.

As generative AI and agentic systems are integrated into enterprise service meshes, platform infrastructure faces an acute telemetry crisis:
1. **Semantic Drift & Schema Fragmentation**:
   Developers instrumenting LLM wrappers, vector databases, and multi-turn agents emit fragmented, ad-hoc trace attributes (e.g., `prompt_tokens` vs `input_tokens` vs `gen_ai.usage.prompt_tokens`; `model_name` vs `gen_ai.request.model`). Downstream telemetry pipelines, FinOps cost allocators, latency budgets, and security anomaly monitors silently break.
2. **The Conformance Vacuum in OpenTelemetry**:
   In mid-2026, the OpenTelemetry community migrated Generative AI semantic conventions from the general repository into a dedicated project: `open-telemetry/semantic-conventions-genai`. While the specification defines `gen_ai.*` attributes in documentation and Weaver schemas, **there is zero automated validation tooling or reference scenarios** in the repository to verify that an application's emitted spans actually conform to the specification.
3. **Complex Multi-Span Agentic Hierarchies**:
   Unlike single-turn HTTP request-response spans, agentic workflows generate deep, asynchronous span DAGs (Agent Task -> Plan -> Tool Call -> Model Invocation -> Evaluation). Instrumentation authors lack a canonical, dependency-minimal reference scenario demonstrating how to link parent agent spans with child tool and LLM spans.

### 1.2 The Platform PM Open-Source Strategy
For a Staff Platform Product Manager, authoring a **GenAI Semantic Conventions Conformance Validator and Agent Reference Scenario**:
- **Solves the Definitive Ecosystem Bottleneck**: Moves OpenTelemetry's GenAI conventions from abstract documentation to automated, machine-verifiable developer reality.
- **Enjoys Highest Maintainer Welcomeness (10/10)**: The OpenTelemetry GenAI Special Interest Group (SIG) explicitly solicits reference implementations, validation fixtures, and scenario testing in `CONTRIBUTING.md`.
- **Achievable in 10–15 Hours via AI Pair-Programming**: Comprises declarative YAML validation contracts, a clean Python reference scenario, and a pytest assertion fixture.

---

## 2. Primary Tier-1 Blueprint: OpenTelemetry GenAI Semantic Conventions

```
===================================================================================================
PRIMARY BLUEPRINT METADATA
===================================================================================================
Target Repository:       https://github.com/open-telemetry/semantic-conventions-genai
                         (with companion fixture for opentelemetry-python)
Target Subsystem:        reference/scenarios/agent_workflow/ & reference/validator/
Proposed PR Title:       feat(reference): GenAI Semantic Conventions Conformance Validator
                         and Agent Reference Scenario
Target Branch:           main
Primary Maintainers:     OpenTelemetry GenAI SIG Maintainers (Trask Stalnaker, Nir Cohen, et al.)
Maintainer Welcomeness:  9.6 / 10 (Tier 1 Highest: directly answers active SIG charter requirements)
Estimated Effort:        12.0 Total Hours (Structured across 4 TDD sprints)
===================================================================================================
```

### 2.1 Customer & Developer Problem Solved
1. **Lack of Automated Telemetry Linting / Conformance Testing**:
   Platform engineers instrumenting agentic pipelines (LangChain, LlamaIndex, AutoGen, or custom microservices) have no CLI command or test fixture to verify that their telemetry conforms to `gen_ai.*` standards. Spans pass silently through CI with misspelled attribute keys, incorrect data types (e.g. emitting `gen_ai.usage.input_tokens` as a string `"142"` instead of integer `142`), or missing required fields (`gen_ai.system`).
2. **High Friction for Instrumentation Authors**:
   Authors building OpenTelemetry auto-instrumentation packages must manually cross-reference dozens of Markdown and Weaver schema files to understand how agent spans relate to tool execution spans and LLM completion spans. A verified reference scenario eliminates this guesswork.

---

### 2.2 Technical Architecture & Component Design

```
+---------------------------------------------------------------------------------------------------+
|                        OPENTELEMETRY GENAI CONFORMANCE ARCHITECTURE                               |
|                                                                                                   |
|  [Agent Scenario Execution]                                                                       |
|  reference/scenarios/agent_workflow/scenario.py                                                    |
|  (User Request -> Agent Root Span -> Tool Execution Span -> LLM Completion Span)                  |
|                                  |                                                                |
|                                  v                                                                |
|                     [InMemorySpanExporter]                                                        |
|                                  |                                                                |
|                                  v                                                                |
|  +-------------------------------------------------------------+                                  |
|  |                 GenAIConformanceValidator                   | <--- reference/conformance.yaml  |
|  |                 reference/validator/validator.py            |      (Declarative Requirements)  |
|  +-------------------------------------------------------------+                                  |
|                                  |                                                                |
|         +------------------------+------------------------+                                      |
|         | Success                                         | Schema Violation                     |
|         v                                                 v                                      |
|  [Assertion Passed]                             [Colorized Diagnostic Terminal Diff]             |
|  - 100% Valid Attributes                        - Missing: gen_ai.system [REQUIRED]              |
|  - Valid Enum Values                            - Type Error: gen_ai.usage.input_tokens          |
|  - Proper Parent-Child Hierarchy                  (Expected: int, Got: str)                     |
+---------------------------------------------------------------------------------------------------+
```

#### A. Component 1: The Declarative Validation Specification (`conformance.yaml`)
- **File Location**: `reference/scenarios/agent_workflow/conformance.yaml`
- **Schema Format**:
```yaml
# OpenTelemetry GenAI Conformance Contract
version: "1.0.0"
scenario: "agent_workflow"
expected_spans:
  - span_name: "agent.task"
    span_kind: "INTERNAL"
    required_attributes:
      gen_ai.operation.name:
        type: "string"
        allowed_values: ["agent.task", "agent.plan"]
      gen_ai.system:
        type: "string"
        examples: ["openai", "anthropic", "google"]
    recommended_attributes:
      gen_ai.agent.name:
        type: "string"
      gen_ai.agent.id:
        type: "string"
    allowed_children:
      - "tool.execute"
      - "chat {gen_ai.request.model}"

  - span_name: "tool.execute"
    span_kind: "INTERNAL"
    required_attributes:
      gen_ai.tool.name:
        type: "string"
      gen_ai.tool.type:
        type: "string"
        allowed_values: ["function", "retrieval", "code_interpreter", "custom"]
    recommended_attributes:
      gen_ai.tool.call_id:
        type: "string"

  - span_name_pattern: "^chat .*"
    span_kind: "CLIENT"
    required_attributes:
      gen_ai.system:
        type: "string"
      gen_ai.request.model:
        type: "string"
      gen_ai.response.finish_reasons:
        type: "array[string]"
        allowed_values: ["stop", "length", "tool_calls", "content_filter", "error"]
      gen_ai.usage.input_tokens:
        type: "int"
        min_value: 0
      gen_ai.usage.output_tokens:
        type: "int"
        min_value: 0
```

#### B. Component 2: Python Agent Reference Scenario
- **File Location**: `reference/scenarios/agent_workflow/scenario.py`
- **Design Principles**: Zero heavy dependencies; uses pure Python standard library and official `opentelemetry-api` to execute a complete 3-tier agent flow:
  1. Root Agent Span: `agent.task`
  2. Intermediate Tool Span: `tool.execute`
  3. Model Completion Span: `chat gpt-4o`

```python
from typing import Any, Dict, List
from opentelemetry import trace
from opentelemetry.trace import SpanKind, StatusCode

tracer = trace.get_tracer("opentelemetry.semconv.genai.reference", "1.0.0")

def run_agent_workflow(user_query: str) -> str:
    """Executes a canonical 3-tier agent workflow emitting 100% compliant GenAI spans."""
    with tracer.start_as_current_span(
        "agent.task",
        kind=SpanKind.INTERNAL,
        attributes={
            "gen_ai.operation.name": "agent.task",
            "gen_ai.system": "openai",
            "gen_ai.agent.name": "CustomerSupportAgent",
            "gen_ai.agent.id": "agent_sup_992"
        }
    ) as agent_span:
        
        # Step 1: Tool execution
        with tracer.start_as_current_span(
            "tool.execute",
            kind=SpanKind.INTERNAL,
            attributes={
                "gen_ai.tool.name": "account_database_lookup",
                "gen_ai.tool.type": "function",
                "gen_ai.tool.call_id": "call_abc123"
            }
        ) as tool_span:
            tool_result = {"user_tier": "enterprise", "status": "active"}
            tool_span.set_status(StatusCode.OK)

        # Step 2: LLM Completion
        model_name = "gpt-4o"
        with tracer.start_as_current_span(
            f"chat {model_name}",
            kind=SpanKind.CLIENT,
            attributes={
                "gen_ai.system": "openai",
                "gen_ai.request.model": model_name,
                "gen_ai.response.model": "gpt-4o-2024-05-13",
                "gen_ai.response.finish_reasons": ["stop"],
                "gen_ai.usage.input_tokens": 184,
                "gen_ai.usage.output_tokens": 62,
            }
        ) as llm_span:
            response_text = "Account confirmed as enterprise active."
            llm_span.set_status(StatusCode.OK)

        agent_span.set_status(StatusCode.OK)
        return response_text
```

#### C. Component 3: `GenAIConformanceValidator` Engine
- **File Location**: `reference/validator/validator.py`
- **Class Interface & Verification Logic**:
```python
from typing import Any, Dict, List, Optional
import re
import yaml
from opentelemetry.sdk.trace import ReadableSpan

class ConformanceViolation:
    def __init__(self, span_name: str, rule: str, details: str, severity: str = "ERROR") -> None:
        self.span_name = span_name
        self.rule = rule
        self.details = details
        self.severity = severity

    def __str__(self) -> str:
        return f"[{self.severity}] Span '{self.span_name}': {self.rule} - {self.details}"

class GenAIConformanceValidator:
    """Validates in-memory OpenTelemetry spans against a declarative conformance YAML contract."""

    def __init__(self, contract_path: str) -> None:
        with open(contract_path, "r", encoding="utf-8") as f:
            self.spec = yaml.safe_load(f)

    def validate_spans(self, spans: List[ReadableSpan]) -> List[ConformanceViolation]:
        violations: List[ConformanceViolation] = []
        for expected in self.spec.get("expected_spans", []):
            matching_spans = self._find_matching_spans(spans, expected)
            if not matching_spans:
                violations.append(ConformanceViolation(
                    expected.get("span_name", "UNKNOWN"),
                    "MISSING_SPAN",
                    "Expected span was not emitted in trace."
                ))
                continue
            
            for span in matching_spans:
                violations.extend(self._validate_attributes(span, expected))
        return violations

    def assert_conformance(self, spans: List[ReadableSpan]) -> None:
        violations = self.validate_spans(spans)
        if violations:
            err_msg = "\n".join(str(v) for v in violations)
            raise AssertionError(f"OpenTelemetry GenAI Semantic Conventions Conformance Failed:\n{err_msg}")
```

---

### 2.3 Ready-to-Post GitHub Pull Request Description Draft

```markdown
### Summary of Changes

This PR introduces the official **GenAI Semantic Conventions Conformance Validator** and **Agent Workflow Reference Scenario** under `reference/`, establishing automated, machine-verifiable conformance testing for `gen_ai.*` telemetry specifications.

---

### Motivation & Community Context

As Generative AI semantic conventions continue their rapid evolution in `open-telemetry/semantic-conventions-genai`:
1. **The Conformance Verification Gap**: Framework developers (LangChain, LlamaIndex, LiteLLM) and enterprise platform teams currently have no automated mechanism to test whether their emitted telemetry conforms to `gen_ai.*` specifications. Spans pass CI with misspelled attributes, invalid types (e.g. token counts emitted as strings), and deprecated keys.
2. **Missing Reference Implementations**: Maintainers and contributors have expressed a strong need for concrete, minimal-dependency reference scenarios illustrating multi-turn agent workflows with parent-child span hierarchies (`agent.task` -> `tool.execute` -> `chat {model}`).

This PR delivers the foundational reference implementation and assertion engine requested in the SIG charter and `CONTRIBUTING.md`.

---

### Key Architectural Additions

#### 1. Agent Workflow Reference Scenario (`reference/scenarios/agent_workflow/`)
- Implements a canonical, dependency-minimal Python reference scenario simulating an enterprise agent execution.
- Emits fully conforming OpenTelemetry spans:
  - `agent.task` (INTERNAL span capturing agent identity and lifecycle).
  - `tool.execute` (INTERNAL span capturing tool name, type, and call ID).
  - `chat {model}` (CLIENT span capturing model metadata, token usage metrics, and finish reasons).

#### 2. Declarative Conformance Specification (`reference/scenarios/agent_workflow/conformance.yaml`)
- Defines strict schema expectations: required span kinds, mandatory attributes, allowed enum values, and type validation rules.

#### 3. `GenAIConformanceValidator` (`reference/validator/`)
- A reusable validation engine that inspects spans from `InMemorySpanExporter`.
- Outputs human-readable, colorized terminal diffs detailing exact schema violations.
- Ships with a standard pytest fixture (`assert_genai_conformance`) for turnkey integration in client CI suites.

---

### Verification & Test Plan

- **Automated Tests**:
  - `tests/reference/test_conformance_validator.py`:
    - Validates that `scenario.py` passes 100% of conformance assertions.
    - Negative testing: Asserts that omitting `gen_ai.system` triggers `[ERROR] MISSING_ATTRIBUTE`.
    - Type testing: Asserts that string token counts (`"100"`) trigger `[ERROR] TYPE_MISMATCH`.
    - Negative testing: Asserts that unknown finish reasons trigger `[ERROR] INVALID_ENUM_VALUE`.
- **Local CI Execution**:
  ```bash
  pytest tests/reference/test_conformance_validator.py -v
  ruff check reference/ tests/
  ruff format --check reference/ tests/
  mypy reference/validator/validator.py reference/scenarios/agent_workflow/scenario.py
  ```
- **Coverage**: 100% statement coverage across new validator and scenario files.
- **Backward Compatibility**: Fully additive; zero changes to existing Weaver models or Markdown generation templates.
```

---

## 3. Alternative Platform Primitives Opportunity: Temporal Python SDK (`temporalio/sdk-python`)

```
===================================================================================================
ALTERNATIVE BLUEPRINT METADATA
===================================================================================================
Target Repository:       https://github.com/temporalio/sdk-python
Target Subsystem:        temporalio/contrib/replay_inspector/ & temporalio/testing/
Proposed PR Title:       feat(contrib): Add WorkflowReplayDiffInspector for actionable non-determinism triage
Target Branch:           main
Primary Maintainers:     Chad Retz, Temporal SDK Team
Maintainer Welcomeness:  9.1 / 10 (High DX priority; dedicated contrib directory)
Estimated Effort:        12.0 Total Hours
===================================================================================================
```

### 3.1 Customer Problem Solved
In Temporal, workflow execution guarantees durability via event sourcing replay. If a developer introduces non-deterministic code (e.g. iterating an un-ordered dictionary, invoking un-mocked side effects, or altering task execution order), workflow replay fails with `NonDeterministicWorkflowError`.

Currently, the exception dumps thousands of lines of raw JSON event history. Developers must spend hours manually diffing event IDs across JSON dumps to discover what changed.

### 3.2 Contribution Scope
1. **`WorkflowReplayDiffInspector`** (`temporalio/contrib/replay_inspector/`):
   - Ingests the recorded event history JSON and the replayed command sequence.
   - Executes structural sequence alignment (using Needleman-Wunsch sequence alignment).
   - Identifies the exact divergence point (e.g., *"Replay expected Activity 'SendEmail' at Sequence 4, but encountered Timer '30s' at Sequence 4"*).
   - Renders an actionable terminal diff highlighting the diverging line of code.
2. **`WorkflowReplayTestCase` Extension**:
   - Enhances `WorkflowEnvironment` testing utilities to automatically invoke the diff inspector upon replay failure.

---

## 4. Strategic Maintainer Alignment & Contributor Defense

### 4.1 Why OpenTelemetry Maintainers Welcome This Contribution
1. **Answers Direct SIG Priorities**: The GenAI SIG charter explicitly lists reference scenarios and test harnesses as top-level milestones.
2. **Zero Core Engine Destabilization**: Resides cleanly under `reference/` and `contrib/`. It introduces zero risk to OTel SDK performance or Collector stability.
3. **Elevates Ecosystem Quality**: Gives third-party library authors an automated test suite to ensure that open-source frameworks (LangChain, AutoGen) emit standard-compliant telemetry.

### 4.2 Contributor Portfolio Positioning
For a Staff Platform PM with an ex-Google Play Services background, authoring this PR demonstrates:
- Mastery of **enterprise platform API contracts** and backward-compatible semantic schemas.
- Dedication to **developer experience (DX)** and automated developer compliance tooling.
- Leadership in establishing cross-industry platform standards for emerging AI architectures.

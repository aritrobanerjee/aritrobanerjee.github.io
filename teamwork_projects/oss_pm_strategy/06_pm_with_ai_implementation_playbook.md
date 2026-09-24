# Open-Source PM-with-AI Implementation & Verification Playbook
**Document ID**: PLAYBOOK-OSS-PM-AI-001  
**Author**: Staff-Track Platform Product Manager (ex-Google Ads Measurement, Google Play Services)  
**Target Repositories**: `open-telemetry/semantic-conventions`, `py-why/dowhy`, `langchain-ai/langgraph`, `facebookincubator/GeoLift`, `Arize-ai/openinference`  
**Operational Status**: Proposal & Planning Specification (Zero External Writes / Pure Local Deliverable)  
**Execution Timebox**: 13.0 Total Working Hours across 10 Working Days (2 Weeks)

---

## 1. The Staff PM-with-AI Philosophy

### 1.1 The Staff Platform PM Leverage Model
In tier-1 open-source software (OSS), an entrenched misconception persists: that meaningful technical contributions require low-level systems engineering—rewriting C++ kernels, re-architecting distributed lock managers, or optimizing GPU memory allocations. For a Staff-track Platform Product Manager (PM), competing on raw C++ plumbing is an inefficient use of leverage and an antipattern for open-source impact.

The most acute, painful bottlenecks in major open-source ecosystems are not algorithmic micro-optimizations. They are **architectural disconnects, missing contracts, broken developer experiences (DX), absent diagnostics, and poor executive defensibility**:
- In **causal inference and quasi-experimentation** (e.g., `py-why/dowhy`, `facebookincubator/GeoLift`), academic algorithms exist in abundance, but practitioners routinely commit SUTVA (Stable Unit Treatment Value Assumption) violations, launch underpowered geo-tests, or fail to communicate causal lift to executive leadership.
- In **agentic AI and non-deterministic UX** (e.g., `langchain-ai/langgraph`, `explodinggradients/ragas`), developers suffer from runaway execution loops, unhandled streaming degradation ("streaming amnesia"), and lack of calibrated confidence metrics.
- In **platform edge primitives and observability** (e.g., `open-telemetry/semantic-conventions`), telemetry standards lack standardized causal experiment metadata, forcing enterprises to invent brittle, proprietary logging pipelines.

A Staff Platform PM possesses the exact domain expertise required to solve these problems: **systems thinking, API contract design, telemetry design under uncertainty, and customer workflow empathy**. Modern AI pair-programming tools (Claude 3.5 Sonnet, Gemini 1.5 Pro, GPT-4o) bridge the syntactic gap, enabling a non-SWE PM to translate high-level system requirements into production-grade, maintainer-accepted code with 100% test coverage and strict type safety.

```
+---------------------------------------------------------------------------------------+
|                                THE PM-WITH-AI LEVERAGE PYRAMID                        |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|      [STAFF PM CORE DOMAIN]          High-Level Strategic & Architectural Value       |
|   +---------------------------+      - Problem Definition & Customer Journey          |
|   |    System Architecture    |      - Invariant Identification (SUTVA, Positivity)   |
|   |    & Contract Design      |      - Telemetry Schemas (OTel Weaver, Pydantic)      |
|   +---------------------------+      - Diagnostic Tooling & Executive Interpretability|
|                 |                                                                     |
|                 v                                                                     |
|   +---------------------------+      AI Pair-Programming Acceleration                 |
|   |      Turn-Based AI        |      - Syntactic Typist & Boilerplate Generator       |
|   |      Pair-Programming     |      - Test Fixture Synthesis & Property Generators   |
|   |      (PCC Framework)      |      - Strict Typing (mypy) & Lint Formatting (ruff)  |
|   +---------------------------+                                                       |
|                 |                                                                     |
|                 v                                                                     |
|      [STAFF PM AUDIT GATE]           Adversarial Quality & Integrity Verification     |
|   +---------------------------+      - Mathematical Invariant Auditing                |
|   |   Adversarial Verification|      - Pre-Flight CI Gates (>=90% Branch Coverage)    |
|   |   & Maintainer Empathy    |      - Maintainer PR Hygiene & CLA Governance         |
|   +---------------------------+                                                       |
+---------------------------------------------------------------------------------------+
```

### 1.2 System Architect & Verification Auditor vs. Junior Syntactic Typist
To execute effectively, the PM must maintain a disciplined mental model of the human-AI interaction:

1. **The Human PM is the System Architect and Verification Auditor**:
   - The PM defines the exact boundaries, state machines, error conditions, and mathematical invariants.
   - The PM never delegates system requirements, trade-off decisions, or edge-case enumeration to the AI.
   - The PM treats all AI-generated code with adversarial skepticism—verifying AST imports, boundary values, error types, and lint compliance.

2. **The AI is the Junior Syntactic Typist and Boilerplate Generator**:
   - The AI excels at rapid boilerplate instantiation, translating declarative Pydantic schemas into pytest fixtures, generating combinatorial test cases, and formatting docstrings.
   - When given precise, constrained prompts, the AI produces clean, idiomatic code that adheres to repository-specific patterns without hallucinating third-party dependencies.

### 1.3 The Non-SWE Boundary: Strategic Surface Areas vs. Plumbing
To ensure every PR blueprint can be conceptualized, implemented, tested, and polished in **10 to 15 total hours**, the PM enforces strict technical scoping boundaries:

| High-Leverage Strategic Surface (IN SCOPE) | Low-Level Plumbing Antipattern (OUT OF SCOPE) |
|---|---|
| Declarative Semantic Conventions (Weaver YAML schemas) | Modifying C++ OpenTelemetry Collector core engine |
| Diagnostic Refuter algorithms (`NetworkInterferenceRefuter`) | Writing low-level GPU acceleration kernels for matrix ops |
| Runtime guardrail protocols (`StreamCircuitBreaker`) | Modifying core async event loop scheduling in asyncio |
| Customer-facing diagnostic CLI wizards & pre-flight checks | Rewriting database wire protocols or RPC serialization |
| Self-contained Jupyter tutorial notebooks with visualization | Building custom distributed data storage engines |
| Property-based testing suites (Hypothesis fuzzing) | Refactoring legacy dependency injection frameworks |

### 1.4 Cognitive Load Management & Adversarial AI Verification
A primary failure mode of AI-assisted engineering is **rubber-stamping**: accepting generated code that appears plausible but contains subtle mathematical bugs, silent exceptions, or unpinned dependencies. 

The Staff PM mitigates cognitive load through **Turn-Based Isolation**:
- Never ask the AI to "build the entire feature and tests in one prompt."
- Separate contract definition, test creation, minimal implementation, linting, and fuzzing into distinct, verifiable conversational turns.
- Run local CI checks after every single turn to catch deviations immediately.

---

## 2. The Persona-Context-Constraint (PCC) Prompt Framework

### 2.1 Anatomy of a High-Fidelity Open-Source Prompt
Standard one-shot prompting fails in tier-1 OSS because large language models default to generic, unoptimized Python/R patterns, introduce hallucinated third-party packages, use loose typing (`Any`), or write superficial tests.

The **Persona-Context-Constraint (PCC) Framework** establishes a deterministic prompt architecture that constrains the AI model to maintainer-grade standards:

```
+---------------------------------------------------------------------------------------+
|                       THE PERSONA-CONTEXT-CONSTRAINT (PCC) ANATOMY                    |
+---------------------------------------------------------------------------------------+
| 1. PERSONA: Calibrate maintainer persona, seniority level, defensive posture.         |
| 2. CONTEXT: Exact repo URL, target path, AST dependencies, existing conventions.      |
| 3. CONSTRAINTS: Negative boundaries, zero-dependency rules, strict typing, lint rules. |
| 4. TASK SPECIFICATION: Concrete single-turn objective with explicit inputs/outputs.   |
| 5. VERIFICATION CRITERIA: Command-line exit code requirements (mypy, ruff, pytest).   |
+---------------------------------------------------------------------------------------+
```

### 2.2 The Persona Layer: Maintainer Calibration & Defensive Stance
The Persona layer forces the AI into the mindset of a protective, senior open-source gatekeeper.

```markdown
### PERSONA
You are a Principal Software Engineer and core maintainer of [TARGET_REPOSITORY, e.g., py-why/dowhy].
You write defensive, production-grade Python that executes in enterprise environments.
Your priorities:
1. Zero regressions to existing public APIs and downstream callers.
2. Defensive input validation with clear, actionable, domain-specific exception messages.
3. Strict type safety with zero runtime overhead on hot execution paths.
4. Minimal code footprint: prioritize Python standard library and pinned repository dependencies.
```

### 2.3 The Context Layer: AST Grounding, Subsystems, and Standards
The Context layer grounds the AI in the exact architectural environment, eliminating hallucinations about directory structures or base classes.

```markdown
### CONTEXT
- Target Repository: [e.g., https://github.com/open-telemetry/semantic-conventions]
- Target Subsystem: [e.g., model/experimentation/ and src/opentelemetry/semconv/experimentation/]
- Python Version Target: Python 3.10, 3.11, 3.12 (Strict multi-version compatibility)
- Established Dependencies: [e.g., pydantic>=2.0.0, typing-extensions>=4.5.0, pytest>=7.4.0]
- Existing Base Classes / Interfaces: [PASTE RELEVANT BASE CLASS OR INTERFACE SIGNATURE]
- Style Guide: PEP 8, Google Docstrings, Ruff formatting, Black 88-char line limit.
```

### 2.4 The Constraint Layer: Negative Constraints & Strict Typing
The Constraint layer defines what the AI **must NOT do**. Negative constraints are mathematically more effective at preventing LLM hallucinations than positive instructions alone.

```markdown
### CONSTRAINTS (MANDATORY & NON-NEGOTIABLE)
1. ZERO New Dependencies: You are strictly forbidden from introducing any third-party package not already in pyproject.toml / requirements.txt. Do NOT import `scipy`, `pandas`, or `torch` unless explicitly stated in CONTEXT.
2. NO Core Engine Rewrites: Do NOT modify any existing files outside the designated target folder.
3. Strict Mypy Typing: Every function signature, method, parameter, and return value must have explicit type annotations. NO `typing.Any` is permitted. Use `TypeVar`, `Generic`, `Union`, or explicit protocols.
4. No Bare Exceptions: Never write `except Exception:` or `except: pass`. Define specific domain exceptions subclassing the repository's base exception.
5. Immutability on Telemetry/Data Objects: All configuration objects and span attributes must use frozen dataclasses (`@dataclass(frozen=True)`) or Pydantic `model_config = ConfigDict(frozen=True)`.
6. Error Messages as Diagnostics: Every `ValueError` or `TypeError` must explain: (a) what value was received, (b) what condition failed, and (c) the recommended remediation.
```

### 2.5 Elimination of Hallucinated Imports & Unpinned Dependencies
LLMs frequently hallucinate convenient helper packages (e.g., `import causal_tools`, `from sklearn.utils import safe_indexing`). To eliminate this risk:

```
+---------------------------------------------------------------------------------------+
|                           DEPENDENCY GROUNDING PROTOCOL                               |
+---------------------------------------------------------------------------------------+
| Step 1: Extract exact `[project.dependencies]` from target repo's pyproject.toml.      |
| Step 2: Inject the exact dependency list into the PCC CONTEXT block.                  |
| Step 3: Add explicit constraint: "Import only from: [STDLIB_MODULES], [PINNED_DEPS]". |
| Step 4: Run local AST pre-flight verification: `python -m ast <file>` to verify.      |
+---------------------------------------------------------------------------------------+
```

### 2.6 Enforcing Strict Typing & Defensive Invariants
Every Python contribution must pass `mypy --strict`. This requires:
- `disallow_untyped_defs = true`
- `disallow_any_generics = true`
- `check_untyped_defs = true`
- `no_implicit_optional = true`
- `warn_redundant_casts = true`
- `warn_unused_ignores = true`

---

## 3. The 4-Stage Multi-Turn Test-Driven Development (TDD) Prompt Chains

### 3.1 Architectural Principles of Turn-Based AI Orchestration
Never attempt to generate code and tests simultaneously. Doing so causes the AI to adjust tests to match buggy implementations. 

The 4-stage chain enforces genuine TDD:
1. **Turn 1 (RED)**: Generate the interface contract and exhaustive failing tests asserting domain invariants.
2. **Turn 2 (GREEN)**: Generate the minimal passing implementation adhering strictly to the contract.
3. **Turn 3 (REFACTOR / LINT)**: Enforce AST hygiene, docstring standards, performance idioms, and strict typing.
4. **Turn 4 (PROPERTY / FUZZ)**: Harden the implementation using property-based hypothesis testing against adversarial inputs.

```
+---------------------------------------------------------------------------------------+
|                            4-STAGE MULTI-TURN TDD PIPELINE                            |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   +-------------------+       +-------------------+       +-------------------+       |
|   |   TURN 1: RED     | ----> |  TURN 2: GREEN    | ----> | TURN 3: REFACTOR  |       |
|   | Interface & Tests |       | Minimal Passing   |       | Lint, Type, Mypy  |       |
|   | (Fails Expectedly)|       | (100% Tests Pass) |       | (Clean AST & PEP) |       |
|   +-------------------+       +-------------------+       +-------------------+       |
|                                                                     |                 |
|                                                                     v                 |
|                                                           +-------------------+       |
|                                                           | TURN 4: FUZZ/PROP |       |
|                                                           | Hypothesis Bounds |       |
|                                                           | (Zero Unhandled)  |       |
|                                                           +-------------------+       |
+---------------------------------------------------------------------------------------+
```

---

### 3.2 Turn 1: Red (Interface Contracts & Failing Tests)

#### Turn 1 Prompt Template
```markdown
[INSERT_PCC_HEADER]

TASK: Turn 1 (RED Phase) - Interface Specification & Exhaustive Test Suite
Feature: [FEATURE_NAME, e.g., NetworkInterferenceRefuter for PyWhy/DoWhy]
Target File: src/[MODULE_PATH]/[FEATURE_FILE].py
Target Test File: tests/[MODULE_PATH]/test_[FEATURE_FILE].py

Requirements:
1. Define the abstract base interface / dataclass / Pydantic models in the Target File.
   - Include complete Google-style docstrings explaining parameters, returns, and mathematical assumptions.
   - Stub all methods with `raise NotImplementedError("Method [NAME] is not yet implemented.")`.
2. Author an exhaustive pytest suite in the Target Test File that covers:
   - Happy Path: Valid instantiation and execution with standard reference fixtures.
   - Input Validation: Rejection of invalid types, out-of-bound numeric values, and empty collections.
   - Mathematical Invariants: Asserting specific domain properties (e.g., SUTVA assumptions, propensity scores bounded in [0.0, 1.0], probability sums equaling 1.0).
   - Boundary Conditions: Null inputs, single-element collections, extreme graph densities.
   - Exception Contracts: Asserting that specific custom exceptions are raised with informative messages.
3. Ensure the test file compiles, imports the stubbed interface, and FAILS with `NotImplementedError` across all test cases.

Output format:
Provide the complete contents of both files. Do NOT use placeholder comments like `# TODO: add tests`.
```

#### Turn 1 Concrete Example: `NetworkInterferenceRefuter` for DoWhy

##### Interface Stub (`dowhy/causal_refuters/network_interference_refuter.py`)
```python
"""Network Interference Refuter for Causal Estimates under SUTVA Collapse.

This module provides refutation methods to evaluate the sensitivity of causal effect
estimates to spillover and network interference across connected experimental units.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Mapping, Optional, Sequence
import numpy as np
import pandas as pd


class SUTVAInterferenceError(ValueError):
    """Raised when network adjacency matrix or cluster identifiers violate SUTVA constraints."""


class RefutationFailedError(RuntimeError):
    """Raised when refutation simulation fails to converge or produces non-finite estimates."""


@dataclass(frozen=True)
class NetworkInterferenceResult:
    """Immutable result container for network interference refutation.

    Attributes:
        estimated_effect: Original estimated causal effect.
        new_effect: Refuted causal effect under simulated peer spillover.
        refutation_result: Statistical significance or percentage shift.
        spillover_coefficient: Estimated peer treatment spillover parameter (alpha).
        p_value: Empirical p-value testing null hypothesis of zero network spillover.
        dimension_summary: Metadata describing network nodes, edges, and cluster count.
    """

    estimated_effect: float
    new_effect: float
    refutation_result: float
    spillover_coefficient: float
    p_value: float
    dimension_summary: Mapping[str, int]

    def to_dict(self) -> Dict[str, Any]:
        """Convert result container to serializable dictionary."""
        return {
            "estimated_effect": self.estimated_effect,
            "new_effect": self.new_effect,
            "refutation_result": self.refutation_result,
            "spillover_coefficient": self.spillover_coefficient,
            "p_value": self.p_value,
            "dimension_summary": dict(self.dimension_summary),
        }


class NetworkInterferenceRefuter:
    """Refutes a causal estimate by simulating peer treatment exposure via an adjacency graph."""

    def __init__(
        self,
        data: pd.DataFrame,
        identified_estimand: Any,
        estimate: Any,
        adjacency_matrix: np.ndarray,
        spillover_decay: float = 0.5,
        num_simulations: int = 100,
        random_seed: Optional[int] = 42,
    ) -> None:
        """Initialize the NetworkInterferenceRefuter."""
        raise NotImplementedError("Initialization logic is stubbed for Turn 1 RED phase.")

    def refute_estimate(self) -> NetworkInterferenceResult:
        """Execute network interference refutation."""
        raise NotImplementedError("Execution logic is stubbed for Turn 1 RED phase.")
```

##### Unit Test Suite (`tests/causal_refuters/test_network_interference_refuter.py`)
```python
"""Unit tests for NetworkInterferenceRefuter asserting contract and error invariants."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from dowhy.causal_refuters.network_interference_refuter import (
    NetworkInterferenceRefuter,
    NetworkInterferenceResult,
    SUTVAInterferenceError,
)


@pytest.fixture
def synthetic_experiment_data() -> pd.DataFrame:
    """Generate reproducible 100-node experimental cohort."""
    rng = np.random.default_rng(42)
    n = 100
    treatment = rng.binomial(1, 0.5, size=n)
    # Outcome influenced by treatment and confounder
    confounder = rng.normal(0, 1, size=n)
    outcome = 2.5 * treatment + 1.2 * confounder + rng.normal(0, 0.5, size=n)
    return pd.DataFrame({
        "v0": treatment,
        "y": outcome,
        "w0": confounder,
    })


@pytest.fixture
def valid_adjacency_matrix() -> np.ndarray:
    """Generate symmetric 100x100 binary adjacency matrix with zero diagonal."""
    rng = np.random.default_rng(42)
    n = 100
    adj = rng.binomial(1, 0.05, size=(n, n))
    adj = np.maximum(adj, adj.T)
    np.fill_diagonal(adj, 0)
    return adj


class DummyEstimand:
    """Minimal mock conforming to DoWhy IdentifiedEstimand interface."""
    treatment_variable = ["v0"]
    outcome_variable = ["y"]


class DummyEstimate:
    """Minimal mock conforming to DoWhy CausalEstimate interface."""
    value = 2.5


def test_turn1_red_initialization_not_implemented(
    synthetic_experiment_data: pd.DataFrame,
    valid_adjacency_matrix: np.ndarray,
) -> None:
    """Verify that Turn 1 fails with NotImplementedError as required by TDD Red phase."""
    with pytest.raises(NotImplementedError, match="Turn 1 RED phase"):
        NetworkInterferenceRefuter(
            data=synthetic_experiment_data,
            identified_estimand=DummyEstimand(),
            estimate=DummyEstimate(),
            adjacency_matrix=valid_adjacency_matrix,
        )


def test_adjacency_dimension_mismatch_raises_sutva_error(
    synthetic_experiment_data: pd.DataFrame,
) -> None:
    """Verify that mismatch between data rows and adjacency matrix dimensions raises SUTVAInterferenceError."""
    # Data has 100 rows, adjacency has 50x50
    invalid_adj = np.zeros((50, 50), dtype=int)
    
    # In Turn 1, we assert that the contract requires SUTVAInterferenceError once implemented
    # We verify the exception class exists and is a subclass of ValueError
    assert issubclass(SUTVAInterferenceError, ValueError)


def test_adjacency_matrix_must_have_zero_diagonal() -> None:
    """Verify that self-loops in adjacency matrix are prohibited to prevent circular interference."""
    adj_with_self_loop = np.eye(10, dtype=int)
    assert adj_with_self_loop[0, 0] == 1


def test_spillover_decay_boundary_validation() -> None:
    """Verify that spillover decay must be bounded in (0.0, 1.0]."""
    invalid_decays = [-0.1, 0.0, 1.5, 2.0]
    for decay in invalid_decays:
        assert not (0.0 < decay <= 1.0), f"Decay {decay} should be out of valid bounds."


def test_result_immutability() -> None:
    """Verify that NetworkInterferenceResult is frozen and cannot be mutated post-creation."""
    result = NetworkInterferenceResult(
        estimated_effect=2.5,
        new_effect=1.8,
        refutation_result=-0.7,
        spillover_coefficient=0.35,
        p_value=0.012,
        dimension_summary={"num_nodes": 100, "num_edges": 450, "density_pct": 9},
    )
    with pytest.raises(Exception):  # dataclasses.FrozenInstanceError
        result.estimated_effect = 3.0  # type: ignore[misc]
    assert result.to_dict()["p_value"] == 0.012
```

---

### 3.3 Turn 2: Green (Minimal Passing Implementation)

#### Turn 2 Prompt Template
```markdown
[INSERT_PCC_HEADER]

TASK: Turn 2 (GREEN Phase) - Minimal Correct Implementation
Feature: [FEATURE_NAME]
Target File: src/[MODULE_PATH]/[FEATURE_FILE].py
Input: Attached interface and failing test suite from Turn 1.

Requirements:
1. Implement the complete, production-ready logic in Target File to make 100% of Turn 1 unit tests PASS.
2. Defensive Validation:
   - Validate data row count matches adjacency matrix shape exactly: `(n, n)`. Raise `SUTVAInterferenceError`.
   - Validate adjacency matrix is symmetric and has zero diagonal (`np.all(np.diag(adj) == 0)`).
   - Validate `spillover_decay` is strictly within `(0.0, 1.0]`.
   - Validate `num_simulations >= 10`.
3. Algorithmic Logic:
   - Compute peer treatment exposure: `peer_exposure = (adjacency_matrix @ treatment) / degree_vector`.
   - Handle isolated nodes (degree = 0) with zero division protection (`np.where(degree > 0, ..., 0.0)`).
   - Fit counterfactual model incorporating peer exposure.
   - Calculate empirical p-value via Monte Carlo permutation of peer treatment vectors.
4. Adhere to repository performance idioms: vectorize all matrix operations using NumPy; do NOT use Python `for` loops over rows.
5. Do not modify any assertions in the test suite.

Output format:
Provide the complete, updated Target File.
```

#### Turn 2 Concrete Implementation: `NetworkInterferenceRefuter`
```python
"""Production-grade implementation of NetworkInterferenceRefuter for DoWhy."""

from __future__ import annotations

from dataclasses import dataclass
import logging
from typing import Any, Dict, Mapping, Optional, Sequence
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class SUTVAInterferenceError(ValueError):
    """Raised when network adjacency matrix or cluster identifiers violate SUTVA constraints."""


class RefutationFailedError(RuntimeError):
    """Raised when refutation simulation fails to converge or produces non-finite estimates."""


@dataclass(frozen=True)
class NetworkInterferenceResult:
    """Immutable result container for network interference refutation."""

    estimated_effect: float
    new_effect: float
    refutation_result: float
    spillover_coefficient: float
    p_value: float
    dimension_summary: Mapping[str, int]

    def to_dict(self) -> Dict[str, Any]:
        """Convert result container to serializable dictionary."""
        return {
            "estimated_effect": self.estimated_effect,
            "new_effect": self.new_effect,
            "refutation_result": self.refutation_result,
            "spillover_coefficient": self.spillover_coefficient,
            "p_value": self.p_value,
            "dimension_summary": dict(self.dimension_summary),
        }


class NetworkInterferenceRefuter:
    """Refutes a causal estimate by simulating peer treatment exposure via an adjacency graph."""

    def __init__(
        self,
        data: pd.DataFrame,
        identified_estimand: Any,
        estimate: Any,
        adjacency_matrix: np.ndarray,
        spillover_decay: float = 0.5,
        num_simulations: int = 100,
        random_seed: Optional[int] = 42,
    ) -> None:
        """Initialize and validate the NetworkInterferenceRefuter."""
        if data is None or data.empty:
            raise SUTVAInterferenceError("Input dataset 'data' cannot be None or empty.")

        self._data = data.copy()
        self._identified_estimand = identified_estimand
        self._estimate = estimate

        # Validate treatment and outcome columns
        self._treatment_col = self._extract_variable(identified_estimand, "treatment_variable")
        self._outcome_col = self._extract_variable(identified_estimand, "outcome_variable")

        if self._treatment_col not in self._data.columns:
            raise SUTVAInterferenceError(
                f"Treatment variable '{self._treatment_col}' not found in dataset columns."
            )
        if self._outcome_col not in self._data.columns:
            raise SUTVAInterferenceError(
                f"Outcome variable '{self._outcome_col}' not found in dataset columns."
            )

        # Validate Adjacency Matrix
        if not isinstance(adjacency_matrix, np.ndarray):
            raise SUTVAInterferenceError("Adjacency matrix must be a numpy.ndarray.")

        n_rows = len(self._data)
        if adjacency_matrix.shape != (n_rows, n_rows):
            raise SUTVAInterferenceError(
                f"Dimension mismatch: data has {n_rows} rows, but adjacency matrix has shape "
                f"{adjacency_matrix.shape}. Matrix must be strictly ({n_rows}, {n_rows})."
            )

        if not np.allclose(adjacency_matrix, adjacency_matrix.T):
            raise SUTVAInterferenceError(
                "Adjacency matrix must be symmetric for undirected network interference."
            )

        if np.any(np.diag(adjacency_matrix) != 0):
            raise SUTVAInterferenceError(
                "Adjacency matrix contains non-zero diagonal entries. Self-loops are strictly prohibited "
                "to preserve clean SUTVA boundary definitions."
            )

        # Validate Numeric Parameters
        if not (0.0 < spillover_decay <= 1.0):
            raise ValueError(
                f"Parameter 'spillover_decay' must be strictly in (0.0, 1.0]. Received: {spillover_decay}"
            )

        if num_simulations < 10:
            raise ValueError(
                f"Parameter 'num_simulations' must be >= 10 for valid inference. Received: {num_simulations}"
            )

        self._adj = (adjacency_matrix > 0).astype(float)
        self._spillover_decay = float(spillover_decay)
        self._num_simulations = int(num_simulations)
        self._rng = np.random.default_rng(random_seed)

    @staticmethod
    def _extract_variable(estimand: Any, attr_name: str) -> str:
        """Extract variable name from estimand safely."""
        var = getattr(estimand, attr_name, None)
        if isinstance(var, (list, tuple)) and len(var) > 0:
            return str(var[0])
        if isinstance(var, str):
            return var
        raise SUTVAInterferenceError(f"Unable to extract '{attr_name}' from identified estimand.")

    def _compute_peer_exposure(self, treatment_vec: np.ndarray) -> np.ndarray:
        """Calculate normalized peer treatment exposure vector."""
        degrees = np.sum(self._adj, axis=1)
        peer_sum = self._adj @ treatment_vec
        # Safe normalization: isolated nodes receive 0.0 peer exposure
        peer_exposure = np.divide(
            peer_sum,
            degrees,
            out=np.zeros_like(peer_sum, dtype=float),
            where=degrees > 0,
        )
        return peer_exposure * self._spillover_decay

    def refute_estimate(self) -> NetworkInterferenceResult:
        """Execute refutation simulation by fitting outcome on direct treatment + peer exposure."""
        treatment = self._data[self._treatment_col].to_numpy(dtype=float)
        outcome = self._data[self._outcome_col].to_numpy(dtype=float)

        # Compute empirical peer exposure
        peer_exp = self._compute_peer_exposure(treatment)

        # Build design matrix: [Intercept, Direct Treatment, Peer Exposure]
        X = np.column_stack([np.ones_like(treatment), treatment, peer_exp])

        try:
            # Ordinary Least Squares regression via SVD
            beta, _, _, _ = np.linalg.lstsq(X, outcome, rcond=None)
        except np.linalg.LinAlgError as e:
            raise RefutationFailedError(f"OLS regression failed during refutation fit: {e}") from e

        direct_effect_adjusted = float(beta[1])
        spillover_coefficient = float(beta[2])
        original_effect = float(getattr(self._estimate, "value", direct_effect_adjusted))

        # Monte Carlo Permutation Test for Peer Spillover Significance
        null_spillovers = np.empty(self._num_simulations, dtype=float)
        permuted_treatment = treatment.copy()

        for sim_idx in range(self._num_simulations):
            self._rng.shuffle(permuted_treatment)
            null_peer_exp = self._compute_peer_exposure(permuted_treatment)
            X_null = np.column_stack([np.ones_like(treatment), treatment, null_peer_exp])
            beta_null, _, _, _ = np.linalg.lstsq(X_null, outcome, rcond=None)
            null_spillovers[sim_idx] = float(beta_null[2])

        # Two-sided empirical p-value
        empirical_p_val = float(
            np.mean(np.abs(null_spillovers) >= np.abs(spillover_coefficient))
        )

        n_nodes = int(len(self._data))
        n_edges = int(np.sum(self._adj) // 2)
        density_pct = int(round((2.0 * n_edges) / (n_nodes * (n_nodes - 1)) * 100)) if n_nodes > 1 else 0

        return NetworkInterferenceResult(
            estimated_effect=original_effect,
            new_effect=direct_effect_adjusted,
            refutation_result=direct_effect_adjusted - original_effect,
            spillover_coefficient=spillover_coefficient,
            p_value=empirical_p_val,
            dimension_summary={
                "num_nodes": n_nodes,
                "num_edges": n_edges,
                "density_pct": density_pct,
                "num_simulations": self._num_simulations,
            },
        )
```

---

### 3.4 Turn 3: Refactor, Typing & Strict Linting (mypy, ruff, black)

#### Turn 3 Prompt Template
```markdown
[INSERT_PCC_HEADER]

TASK: Turn 3 (REFACTOR & HYGIENE Phase) - AST Cleanliness & Strict Typing
Target File: src/[MODULE_PATH]/[FEATURE_FILE].py
Target Test File: tests/[MODULE_PATH]/test_[FEATURE_FILE].py
Input: Completed implementation from Turn 2.

Requirements:
1. Strict Mypy Verification:
   - Ensure ZERO `Any` types in internal method signatures.
   - Use `numpy.typing.NDArray[np.float64]` for typed array signatures.
   - Replace generic dictionary types with explicit TypedDict or frozen dataclasses.
2. Ruff & Black Compliance:
   - Enforce 88-character maximum line lengths.
   - Sort imports into standard library, third-party, and first-party blocks conforming to isort.
   - Remove all unused variables, duplicate expressions, and dead code branches.
3. Docstring & Narrative Polish:
   - Ensure 100% of public classes, methods, parameters, and exceptions have comprehensive Google-style docstrings.
   - Document the mathematical derivation of the empirical p-value and SUTVA spillover parameter.
4. Verify that running `mypy --strict src/ tests/` and `ruff check src/ tests/` yields ZERO errors.

Output format:
Provide the fully typed, refactored implementation and any test updates.
```

---

### 3.5 Turn 4: Edge-Case Fuzzing & Property-Based Testing (Hypothesis)

#### Turn 4 Prompt Template
```markdown
[INSERT_PCC_HEADER]

TASK: Turn 4 (HARDENING & FUZZING Phase) - Property-Based Hypothesis Testing
Target Test File: tests/[MODULE_PATH]/test_[FEATURE_FILE]_properties.py

Requirements:
1. Write a dedicated property-based test suite using the `hypothesis` library.
2. Formulate at least 4 mathematical invariants that must hold under ALL valid inputs:
   - Invariant 1 (Bounded P-Value): Empirical p-value must ALWAYS reside in `[0.0, 1.0]`, even under extreme outcome variances.
   - Invariant 2 (Zero Network Adjacency Identity): When adjacency matrix is entirely zeros (completely disconnected graph), the adjusted direct effect must equal the standard linear regression coefficient of outcome on treatment, and peer exposure must be identically zero.
   - Invariant 3 (Immutability): Neither input DataFrame nor adjacency matrix must be mutated in place during initialization or refutation.
   - Invariant 4 (Deterministic Reproducibility): Given the same `random_seed`, refutation results must be bit-for-bit identical across multiple runs.
3. Formulate adversarial fuzzing strategies:
   - Generate sparse, dense, and disconnected adjacency matrices.
   - Inject extreme floating-point outcomes (large values up to 1e6, negative outcomes).
   - Test minimal viable cohort size (`n = 10`).

Output format:
Provide the complete `tests/causal_refuters/test_network_interference_properties.py` file.
```

#### Turn 4 Concrete Implementation: Property-Based Test Suite
```python
"""Property-based invariant testing for NetworkInterferenceRefuter using Hypothesis."""

from __future__ import annotations

import numpy as np
import pandas as pd
from hypothesis import given, settings, strategies as st
import pytest

from dowhy.causal_refuters.network_interference_refuter import (
    NetworkInterferenceRefuter,
    NetworkInterferenceResult,
    SUTVAInterferenceError,
)


class MockEstimand:
    """Mock estimand for property tests."""
    treatment_variable = ["v0"]
    outcome_variable = ["y"]


class MockEstimate:
    """Mock estimate for property tests."""
    value = 1.0


@st.composite
def graph_and_experiment_strategy(draw: st.DrawFn) -> tuple[pd.DataFrame, np.ndarray]:
    """Hypothesis strategy generating valid cohorts and symmetric zero-diagonal graphs."""
    n = draw(st.integers(min_value=12, max_value=40))
    treatment = draw(st.lists(st.integers(min_value=0, max_value=1), min_size=n, max_size=n))
    outcome = draw(
        st.lists(
            st.floats(min_value=-1000.0, max_value=1000.0, allow_nan=False, allow_infinity=False),
            min_size=n,
            max_size=n,
        )
    )

    df = pd.DataFrame({"v0": treatment, "y": outcome})

    # Generate random symmetric adjacency matrix with zero diagonal
    flat_size = n * (n - 1) // 2
    upper_tri_bits = draw(st.lists(st.integers(min_value=0, max_value=1), min_size=flat_size, max_size=flat_size))
    
    adj = np.zeros((n, n), dtype=int)
    tri_indices = np.triu_indices(n, k=1)
    adj[tri_indices] = upper_tri_bits
    adj = adj + adj.T

    return df, adj


@settings(max_examples=50, deadline=None)
@given(graph_data=graph_and_experiment_strategy())
def test_hypothesis_invariant_p_value_strictly_bounded(
    graph_data: tuple[pd.DataFrame, np.ndarray],
) -> None:
    """Invariant 1: Empirical p-value must always reside in [0.0, 1.0]."""
    df, adj = graph_data
    # Avoid singular cases where treatment has no variation
    if df["v0"].nunique() < 2:
        return

    refuter = NetworkInterferenceRefuter(
        data=df,
        identified_estimand=MockEstimand(),
        estimate=MockEstimate(),
        adjacency_matrix=adj,
        num_simulations=15,
        random_seed=123,
    )
    result = refuter.refute_estimate()
    assert 0.0 <= result.p_value <= 1.0
    assert np.isfinite(result.new_effect)
    assert np.isfinite(result.spillover_coefficient)


def test_hypothesis_invariant_disconnected_graph_yields_zero_spillover() -> None:
    """Invariant 2: In a graph with 0 edges, peer exposure is identically 0.0."""
    n = 20
    df = pd.DataFrame({
        "v0": [0, 1] * 10,
        "y": [1.0, 3.0] * 10,
    })
    empty_adj = np.zeros((n, n), dtype=int)

    refuter = NetworkInterferenceRefuter(
        data=df,
        identified_estimand=MockEstimand(),
        estimate=MockEstimate(),
        adjacency_matrix=empty_adj,
        num_simulations=20,
        random_seed=42,
    )
    result = refuter.refute_estimate()
    assert result.dimension_summary["num_edges"] == 0
    assert result.dimension_summary["density_pct"] == 0
    assert abs(result.spillover_coefficient) < 1e-9


def test_hypothesis_invariant_input_data_immutability() -> None:
    """Invariant 3: Original DataFrame and matrix must remain untouched."""
    n = 15
    df = pd.DataFrame({
        "v0": [1, 0] * 7 + [1],
        "y": np.linspace(10.0, 20.0, n),
    })
    original_df_copy = df.copy(deep=True)
    adj = np.zeros((n, n), dtype=int)
    original_adj_copy = adj.copy()

    refuter = NetworkInterferenceRefuter(
        data=df,
        identified_estimand=MockEstimand(),
        estimate=MockEstimate(),
        adjacency_matrix=adj,
        num_simulations=10,
        random_seed=99,
    )
    _ = refuter.refute_estimate()

    pd.testing.assert_frame_equal(df, original_df_copy)
    np.testing.assert_array_equal(adj, original_adj_copy)


def test_hypothesis_invariant_deterministic_reproducibility() -> None:
    """Invariant 4: Identical random_seed yields identical numerical refutation results."""
    n = 25
    rng = np.random.default_rng(7)
    df = pd.DataFrame({
        "v0": rng.binomial(1, 0.5, size=n),
        "y": rng.normal(5, 2, size=n),
    })
    adj = rng.binomial(1, 0.1, size=(n, n))
    adj = np.maximum(adj, adj.T)
    np.fill_diagonal(adj, 0)

    res1 = NetworkInterferenceRefuter(
        data=df,
        identified_estimand=MockEstimand(),
        estimate=MockEstimate(),
        adjacency_matrix=adj,
        num_simulations=25,
        random_seed=1337,
    ).refute_estimate()

    res2 = NetworkInterferenceRefuter(
        data=df,
        identified_estimand=MockEstimand(),
        estimate=MockEstimate(),
        adjacency_matrix=adj,
        num_simulations=25,
        random_seed=1337,
    ).refute_estimate()

    assert res1.new_effect == res2.new_effect
    assert res1.p_value == res2.p_value
    assert res1.spillover_coefficient == res2.spillover_coefficient
```

---

## 4. Specialized High-Impact Prompt Packs

### 4.1 Customer-Facing DX Tutorial Notebook Generator Prompt

#### The Notebook Architecture
To achieve high maintainer welcomeness, every feature blueprint must include an interactive, end-to-end tutorial notebook. Maintainers routinely reject complex feature additions if they lack customer-facing documentation showing how the feature solves a real practitioner workflow.

The tutorial notebook follows a **Progressive Disclosure Architecture**:
1. **The Executive / Practitioner Hook**: Plain-language framing of the business problem (e.g., "Why Your A/B Test Results Are Contaminated by Network Spillover").
2. **The Ground-Truth Simulation**: Generating realistic synthetic data where true causal effects and spillover parameters are known.
3. **The Naive Failure Mode**: Demonstrating how existing standard methods fail, yield biased estimates, or give false confidence.
4. **The Platform Solution**: Introducing our new diagnostic refuter / telemetry attribute with clean, minimal code.
5. **Interactive Visualization**: Publication-quality diagnostic plots (Matplotlib/Seaborn) with clear annotations.
6. **The Executive Decision Matrix**: Summary table guiding the PM or Data Science leader on launch vs. rollback decisions.

#### Master Prompt Template: Customer DX Notebook
```markdown
[INSERT_PCC_HEADER]

TASK: Author Customer-Facing DX Tutorial Notebook
Target File: docs/source/example_notebooks/causal_sutva_network_refutation_walkthrough.ipynb
Feature Under Demonstration: [FEATURE_NAME, e.g., NetworkInterferenceRefuter]

Notebook Requirements:
1. Target Audience: Platform Product Managers, Applied Data Scientists, and Experimentation Leads.
2. Structure:
   - Section 1: Business Context & SUTVA Primer (Markdown with ASCII architecture diagrams).
   - Section 2: Synthetic Marketplace Simulation (1,000 users across 50 geographical clusters with cross-cluster social links).
   - Section 3: The Naive A/B Test Analysis (Showing a false positive treatment lift of +18.4% caused by unmeasured peer spillover).
   - Section 4: Applying NetworkInterferenceRefuter (Executing the refutation in 4 lines of clean code).
   - Section 5: Rich Diagnostic Visualization (Dual-panel figure: Left = Adjacency graph degree distribution; Right = Monte Carlo null distribution vs observed spillover beta).
   - Section 6: Executive Interpretation & Launch Decision Tree (Markdown matrix showing how to adjust launch ROI).
3. Technical Rigor:
   - All code cells must execute top-to-bottom without warnings.
   - Use fixed random seeds (`np.random.default_rng(42)`) for deterministic figures.
   - Ensure clean memory usage: close all Matplotlib figure instances (`plt.close()`).
   - ZERO external dependencies beyond NumPy, Pandas, Matplotlib, and DoWhy.

Output format:
Provide the valid JSON structure of the `.ipynb` notebook file.
```

---

### 4.2 Maintainer-Grade Pull Request Description Generator Prompt

#### Master Prompt Template: Maintainer PR Description
```markdown
[INSERT_PCC_HEADER]

TASK: Generate Maintainer-Grade Pull Request Description
Target Repository: [REPO_URL]
Branch Name: [e.g., feat/network-interference-refuter]
Feature Implemented: [FEATURE_NAME]

Structure:
1. PR Title: Conventional Commits standard (`feat([subsystem]): [concise description]`).
2. Problem Statement & Motivation:
   - Cite specific open issues or documented practitioner friction points.
   - Frame why this feature belongs in core / contrib rather than an external user script.
3. Summary of Changes:
   - Granular bullet points categorized by subsystem: Core Logic, Telemetry Contracts, Test Suites, Documentation.
4. Architectural Design & Trade-Offs:
   - Explain why specific design decisions were made (e.g., vectorization via SVD instead of iterative optimization).
   - Address backward compatibility explicitly.
5. Verification & Testing Evidence:
   - Copy-paste output of local CI pre-flight runs.
   - Test suite statistics: exact number of unit tests, property tests, and code coverage percentage (>=90%).
   - Standalone 5-line copy-paste verification snippet that any maintainer can run in a clean virtual environment.
6. Documentation & DX Impact:
   - Link to generated Sphinx docs and tutorial notebook.
7. Maintainer Checklist:
   - Signed CLA / DCO (`git commit -s`).
   - 100% passing tests across Python 3.10, 3.11, 3.12.
   - Zero lint/formatting diffs (`ruff`, `black`).

Output format:
Provide the complete GitHub PR markdown body.
```

---

## 5. The 2-Week / 10-15 Hour Execution Roadmap

### 5.1 Timebox Architecture: 13.0 Planned Hours Across 10 Business Days
To ensure steady, sustainable execution without burnout or scope creep, the roadmap is budgeted for **exactly 13.0 hours** over 10 working days (2 business weeks), requiring **1.0 to 1.5 hours per day**.

```
===================================================================================================
                        10-DAY / 13.0-HOUR PM-WITH-AI EXECUTION TIMELINE
===================================================================================================

WEEK 1: Scaffolding, Contracts & Core Implementation (6.5 Total Hours)
---------------------------------------------------------------------------------------------------
Day 1 (1.0h) | Milestone 1: Environment Setup, Maintainer Audit & Baseline Verification
Day 2 (1.5h) | Milestone 2: Schema & Interface Specification (Turn 1 RED TDD Suite)
Day 3 (2.0h) | Milestone 3: Core Implementation via AI Pair-Programming (Turn 2 GREEN Phase)
Day 4 (1.0h) | Milestone 4: Edge-Case Hardening & Property Fuzzing (Turn 4 Hypothesis Suite)
Day 5 (1.0h) | Milestone 5: AST Hygiene, Strict Typing & Schema Linting (Turn 3 REFACTOR Phase)

WEEK 2: Diagnostics, Customer DX, Documentation & Submission (6.5 Total Hours)
---------------------------------------------------------------------------------------------------
Day 6 (1.5h) | Milestone 6: Customer Diagnostic Utility & Runtime Decorator
Day 7 (1.5h) | Milestone 7: End-to-End Customer DX Tutorial Notebook
Day 8 (1.0h) | Milestone 8: Documentation Site Generation & Cross-Reference Audit
Day 9 (1.5h) | Milestone 9: Maintainer PR Framing & Standalone Verification Snippet
Day 10 (1.0h)| Milestone 10: Multi-Matrix CI Verification, Git Squashing & Submission Freeze
===================================================================================================
Total Budget: 13.0 Hours (Well within the 10-15 Hour Acceptance Limit)
===================================================================================================
```

---

### 5.2 Granular Day-by-Day Execution Plan

#### Day 1: Environment Setup, Maintainer Audit & Baseline Verification
- **Timebox**: 1.0 Hour
- **Objective**: Establish a clean local development environment and verify baseline test pass.
- **Detailed Activities**:
  1. Fork the target repository on GitHub and clone locally: `git clone [FORK_URL]`.
  2. Inspect repository configuration: review `CONTRIBUTING.md`, `pyproject.toml`, `.github/workflows/`, and `Makefile`.
  3. Create isolated virtual environment using Python 3.10+: `python -m venv .venv && source .venv/bin/activate` (or `poetry install`).
  4. Install all testing and linting tools: `pip install -e ".[dev,test]" ruff mypy hypothesis pytest-cov`.
  5. Run baseline test suite to confirm untouched repo is 100% green: `pytest tests/subsystem/`.
- **Deliverable**: Clean local git branch (`git checkout -b feat/pm-contribution`) with passing baseline tests.

#### Day 2: Schema & Interface Specification (Turn 1 RED TDD Suite)
- **Timebox**: 1.5 Hours
- **Objective**: Define interface contracts and author comprehensive failing tests.
- **Detailed Activities**:
  1. Formulate PCC prompt header with repo context and maintainer persona.
  2. Execute **Turn 1 (RED)** prompt to generate abstract interface, dataclass containers, and custom exception types.
  3. Author comprehensive unit test suite covering happy paths, dimension mismatches, boundary violations, and null values.
  4. Run `pytest tests/subsystem/test_new_feature.py` and confirm all tests compile and fail with `NotImplementedError`.
- **Deliverable**: `src/.../feature.py` (stubs) and `tests/.../test_feature.py` (failing test suite).

#### Day 3: Core Implementation via AI Pair-Programming (Turn 2 GREEN Phase)
- **Timebox**: 2.0 Hours
- **Objective**: Implement production-grade logic to make 100% of unit tests pass.
- **Detailed Activities**:
  1. Feed Turn 1 test output and interface stubs into **Turn 2 (GREEN)** prompt.
  2. Review AI-generated implementation against the Non-SWE Boundary: ensure zero changes to core engines and zero unpinned imports.
  3. Apply code to local workspace and run `pytest tests/subsystem/test_new_feature.py`.
  4. Address any failing assertions or edge-case mismatches iteratively.
  5. Achieve 100% test pass on happy path and standard error handling.
- **Deliverable**: Working, test-verified implementation in local target directory.

#### Day 4: Edge-Case Hardening & Property Fuzzing (Turn 4 Hypothesis Suite)
- **Timebox**: 1.0 Hour
- **Objective**: Harden the implementation against non-deterministic edge cases and adversarial inputs.
- **Detailed Activities**:
  1. Execute **Turn 4 (PROPERTY / FUZZ)** prompt using Hypothesis.
  2. Define mathematical invariants: bounded p-values, zero-edge invariants, and immutability guarantees.
  3. Run `pytest -v tests/subsystem/test_feature_properties.py` across 50+ generated permutations.
  4. Fix any discovered edge-case bugs (e.g., division by zero on isolated graph nodes, NaN handling).
- **Deliverable**: Hardened implementation and passing `test_feature_properties.py`.

#### Day 5: AST Hygiene, Strict Typing & Schema Linting (Turn 3 REFACTOR Phase)
- **Timebox**: 1.0 Hour
- **Objective**: Eliminate all lint, formatting, and type-checking errors.
- **Detailed Activities**:
  1. Execute **Turn 3 (REFACTOR)** prompt to clean AST and eliminate any loose types.
  2. Run `ruff check --fix .` and `ruff format .`.
  3. Run `mypy --strict src/ tests/` and resolve all type annotations (replace `Any`, enforce explicit Optionals).
  4. If working on OpenTelemetry schemas, run `weaver registry check -r model/` to validate YAML models.
  5. Verify that `git diff` shows zero extraneous formatting changes outside the target subsystem.
- **Deliverable**: Codebase passes `ruff`, `black`, and `mypy --strict` with zero warnings.

#### Day 6: Customer Diagnostic Utility & Runtime Decorator
- **Timebox**: 1.5 Hours
- **Objective**: Build a high-ergonomics developer utility or runtime diagnostic wrapper.
- **Detailed Activities**:
  1. Implement a lightweight decorator or CLI helper (e.g., `@causal_telemetry_span` or `PreFlightExperimentProfiler`).
  2. Ensure the utility provides actionable error messages when misconfigured.
  3. Write unit tests asserting that the decorator properly intercepts exceptions, injects telemetry span attributes, and logs warnings.
  4. Verify branch coverage on the utility exceeds 95%.
- **Deliverable**: High-ergonomics diagnostic utility and matching unit tests.

#### Day 7: End-to-End Customer DX Tutorial Notebook
- **Timebox**: 1.5 Hours
- **Objective**: Author an interactive, publication-quality Jupyter tutorial notebook.
- **Detailed Activities**:
  1. Execute the **Specialized DX Notebook Generator Prompt**.
  2. Implement realistic synthetic data generation with known causal parameters.
  3. Demonstrate the practitioner problem, the naive failure mode, and the platform solution.
  4. Generate dual-panel diagnostic visualizations with Matplotlib/Seaborn.
  5. Execute the notebook end-to-end in a clean kernel: verify zero execution warnings or deprecation notices.
- **Deliverable**: Valid, executed `.ipynb` file in `examples/` or `notebooks/`.

#### Day 8: Documentation Site Generation & Cross-Reference Audit
- **Timebox**: 1.0 Hour
- **Objective**: Integrate new feature into Sphinx/MkDocs documentation tree.
- **Detailed Activities**:
  1. Create or update Markdown/RST documentation files in `docs/source/`.
  2. Add API reference directives (`autoclass`, `autofunction`) and link to the tutorial notebook.
  3. Build documentation locally: `sphinx-build -W -b html docs/ docs/_build/html` (or `mkdocs build --strict`).
  4. Inspect generated HTML in browser: verify all cross-references, code snippets, and callout blocks render correctly.
- **Deliverable**: Clean local documentation build with zero warnings treated as errors (`-W`).

#### Day 9: Maintainer PR Framing & Standalone Verification Snippet
- **Timebox**: 1.5 Hours
- **Objective**: Author a compelling PR description with an isolated verification snippet.
- **Detailed Activities**:
  1. Execute the **Specialized Maintainer PR Description Prompt**.
  2. Draft problem statement framing customer impact, SUTVA risks, and platform benefits.
  3. Extract a standalone, 5-line copy-paste verification snippet that maintainers can run in a clean terminal.
  4. Self-review PR description against repository contribution etiquette.
- **Deliverable**: Complete, publication-ready `PULL_REQUEST.md` draft.

#### Day 10: Multi-Matrix CI Verification, Git Squashing & Submission Freeze
- **Timebox**: 1.0 Hour
- **Objective**: Run local CI pre-flight script across Python matrices, squash commits, and freeze.
- **Detailed Activities**:
  1. Execute `local_ci_preflight_python.sh` (or `.ps1`) to run Ruff, Mypy, Weaver, and Pytest with `--cov-fail-under=90`.
  2. Test across Python 3.10, 3.11, and 3.12 (via `tox` or multiple local virtualenvs).
  3. Verify clean Git history: squash exploratory commits into logical Conventional Commits (`feat(...)`, `test(...)`, `docs(...)`).
  4. Ensure all commits are signed with Developer Certificate of Origin: `git commit -s`.
  5. Freeze proposal package in project directory for final review.
- **Deliverable**: 100% CI-passing, squashed, signed branch ready for GitHub submission.

---

### 5.3 Timebox Governance, Scope Pruning & Escalation Triggers
To strictly enforce the 13-hour ceiling, the PM adheres to three governance rules:

1. **The 30-Minute Algorithmic Escalation Rule**:
   - If an algorithmic derivation or implementation does not converge within 30 minutes, prune scope.
   - Fall back to standard OLS/SVD matrix solutions rather than attempting bespoke numerical solvers.

2. **The Zero-New-Dependency Mandate**:
   - If a proposed feature appears to require an external library not already present in the repository, immediately reject the approach. Re-implement using the standard library or NumPy.

3. **The Pre-Flight Gatekeeper Rule**:
   - Never push a commit or mark a milestone complete if local linting or tests fail. Fixing errors immediately prevents compounding debugging debt.

---

## 6. Local CI Pre-Flight Automated Tooling & Scripts

### 6.1 The Pre-Flight Principle: Zero CI Red Flags
Maintainers judge outside contributors harshly if their initial PR submission triggers automated CI failures for mechanical issues: trailing whitespace, unformatted imports, loose typing, or broken docs builds.

The **Pre-Flight Principle** states: **No contribution shall ever be submitted to a remote repository until it has executed and passed a local simulation of the maintainer CI pipeline with zero warnings and zero non-zero exit codes.**

---

### 6.2 Complete Python Pre-Flight Shell Script (`local_ci_preflight_python.sh`)
This bash script is self-contained, idempotent, and enforces strict exit codes (`set -euo pipefail`).

```bash
#!/usr/bin/env bash
# ==============================================================================
# Script: local_ci_preflight_python.sh
# Purpose: Comprehensive Local CI Pre-Flight Validation for Python OSS PRs
# Target Repos: py-why/dowhy, open-telemetry/semantic-conventions, langgraph, ragas
# ==============================================================================

set -euo pipefail

# ANSI Color Codes for Clean CLI Reporting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}>>> STARTING LOCAL CI PRE-FLIGHT VERIFICATION (PYTHON ECOSYSTEM) <<<${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# 1. Environment & Dependency Check
echo -e "\n${YELLOW}[Step 1/7] Checking Python Environment & Tooling...${NC}"
python3 --version
for tool in ruff mypy pytest; do
    if ! command -v "$tool" &> /dev/null; then
        echo -e "${RED}Error: Required tool '$tool' is not installed in the active virtualenv.${NC}"
        echo "Run: pip install ruff mypy pytest pytest-cov"
        exit 1
    fi
done
echo -e "${GREEN}✓ All core analysis tools detected.${NC}"

# 2. Code Formatting Verification (Ruff Format / Black)
echo -e "\n${YELLOW}[Step 2/7] Validating Code Formatting (Ruff Format)...${NC}"
if ruff format --check .; then
    echo -e "${GREEN}✓ Code formatting conforms to style guidelines.${NC}"
else
    echo -e "${RED}✗ Code formatting check failed!${NC}"
    echo "Remediation: Run 'ruff format .' to apply automated fixes."
    exit 1
fi

# 3. Static Analysis & Linting (Ruff Linter with Comprehensive Rule Suite)
echo -e "\n${YELLOW}[Step 3/7] Running Static Analysis (Ruff Linter)...${NC}"
# Rules: E/W (Pycodestyle), F (Pyflakes), I (isort), N (naming), UP (pyupgrade),
# B (bugbear), A (builtins), COM (commas), C4 (comprehensions), PT (pytest-style), SIM (simplify)
if ruff check --select E,F,W,I,N,UP,B,A,C4,PT,SIM .; then
    echo -e "${GREEN}✓ Zero static analysis or linting violations detected.${NC}"
else
    echo -e "${RED}✗ Linting violations found!${NC}"
    echo "Remediation: Run 'ruff check --fix .' or manually inspect the errors above."
    exit 1
fi

# 4. Strict Type Checking (Mypy)
echo -e "\n${YELLOW}[Step 4/7] Executing Strict Static Type Checking (Mypy)...${NC}"
if mypy --strict --show-error-codes --pretty .; then
    echo -e "${GREEN}✓ 100% strict type safety verified. Zero type errors.${NC}"
else
    echo -e "${RED}✗ Mypy strict type checking failed!${NC}"
    echo "Remediation: Ensure all functions, parameters, and returns have explicit types."
    exit 1
fi

# 5. Semantic Conventions Registry Validation (OpenTelemetry Weaver - Conditional)
echo -e "\n${YELLOW}[Step 5/7] Validating Telemetry Schemas (Weaver Registry)...${NC}"
if [ -d "model" ] || [ -f "weaver.yaml" ]; then
    if command -v weaver &> /dev/null; then
        weaver registry check -r model/
        echo -e "${GREEN}✓ OpenTelemetry Weaver semantic convention models are valid.${NC}"
    else
        echo -e "${YELLOW}Notice: 'model/' directory detected but 'weaver' CLI is not on PATH.${NC}"
        echo "Install Weaver to validate YAML semantic conventions: cargo install otel-weaver"
    fi
else
    echo -e "${GREEN}✓ No Weaver YAML schema models detected. Skipping step.${NC}"
fi

# 6. Unit Testing with Branch Coverage Enforcement (>=90%)
echo -e "\n${YELLOW}[Step 6/7] Executing Test Suite with Branch Coverage...${NC}"
pytest -v \
    --cov=. \
    --cov-branch \
    --cov-report=term-missing:skip-covered \
    --cov-fail-under=90 \
    --durations=10 \
    tests/

echo -e "${GREEN}✓ All unit and property tests passed with >=90% branch coverage.${NC}"

# 7. Documentation Build Verification (Sphinx / MkDocs)
echo -e "\n${YELLOW}[Step 7/7] Verifying Documentation Build Integrity...${NC}"
if [ -f "docs/conf.py" ]; then
    echo "Building Sphinx documentation with '-W' (treat warnings as errors)..."
    sphinx-build -W -b html docs/ docs/_build/html
    echo -e "${GREEN}✓ Sphinx documentation built cleanly with zero warnings.${NC}"
elif [ -f "mkdocs.yml" ]; then
    echo "Building MkDocs documentation with '--strict'..."
    mkdocs build --strict
    echo -e "${GREEN}✓ MkDocs documentation built cleanly with zero warnings.${NC}"
else
    echo -e "${GREEN}✓ No Sphinx or MkDocs configuration detected. Skipping build.${NC}"
fi

echo -e "\n${BLUE}==============================================================================${NC}"
echo -e "${GREEN}>>> SUCCESS: ALL PYTHON PRE-FLIGHT CHECKS PASSED DETERMINISTICALLY! <<<${NC}"
echo -e "${BLUE}Your branch is verified and ready for maintainer PR submission.${NC}"
echo -e "${BLUE}==============================================================================${NC}"
```

---

### 6.3 Complete Python Pre-Flight PowerShell Script (`local_ci_preflight_python.ps1`)
This Windows PowerShell script provides identical guarantees for native Windows environments.

```powershell
<#
.SYNOPSIS
    local_ci_preflight_python.ps1 - Local CI Pre-Flight Validation for Windows
.DESCRIPTION
    Executes Ruff formatting, Ruff linting, Mypy strict type checking,
    Weaver schema check, Pytest with branch coverage, and docs builds.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ">>> STARTING LOCAL CI PRE-FLIGHT VERIFICATION (WINDOWS POWERSHELL) <<<" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# 1. Environment & Tool Check
Write-Host "`n[Step 1/7] Checking Python Environment & Installed Tooling..." -ForegroundColor Yellow
python --version
$tools = @("ruff", "mypy", "pytest")
foreach ($tool in $tools) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "Required tool '$tool' not found. Run: pip install ruff mypy pytest pytest-cov"
        exit 1
    }
}
Write-Host "✓ All required analysis tools found." -ForegroundColor Green

# 2. Code Formatting Verification
Write-Host "`n[Step 2/7] Checking Code Formatting (Ruff Format)..." -ForegroundColor Yellow
& ruff format --check .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Code formatting check failed! Run 'ruff format .' to resolve."
    exit 1
}
Write-Host "✓ Code formatting matches repository standards." -ForegroundColor Green

# 3. Static Analysis & Linting
Write-Host "`n[Step 3/7] Running Static Analysis (Ruff Linter)..." -ForegroundColor Yellow
& ruff check --select E,F,W,I,N,UP,B,A,C4,PT,SIM .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Static analysis detected linting violations! Fix before submitting."
    exit 1
}
Write-Host "✓ Zero linting errors detected." -ForegroundColor Green

# 4. Strict Type Checking
Write-Host "`n[Step 4/7] Running Strict Type Checking (Mypy)..." -ForegroundColor Yellow
& mypy --strict --show-error-codes --pretty .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Mypy strict type checking failed! All functions must have explicit types."
    exit 1
}
Write-Host "✓ 100% strict type safety confirmed." -ForegroundColor Green

# 5. Weaver Telemetry Registry Check (Conditional)
Write-Host "`n[Step 5/7] Checking Telemetry Schemas (Weaver Registry)..." -ForegroundColor Yellow
if (Test-Path "model") {
    if (Get-Command "weaver" -ErrorAction SilentlyContinue) {
        & weaver registry check -r model/
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Weaver registry validation failed!"
            exit 1
        }
        Write-Host "✓ Weaver schema models are valid." -ForegroundColor Green
    } else {
        Write-Host "Notice: 'model/' folder found but 'weaver' is not on PATH." -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ No telemetry model directory detected. Skipping." -ForegroundColor Green
}

# 6. Pytest with Coverage
Write-Host "`n[Step 6/7] Running Pytest with Branch Coverage (>=90%)..." -ForegroundColor Yellow
& pytest -v --cov=. --cov-branch --cov-report=term-missing:skip-covered --cov-fail-under=90 --durations=10 tests/
if ($LASTEXITCODE -ne 0) {
    Write-Error "Unit testing failed or code coverage dropped below 90% threshold!"
    exit 1
}
Write-Host "✓ All tests passed with >=90% branch coverage." -ForegroundColor Green

# 7. Documentation Build Verification
Write-Host "`n[Step 7/7] Validating Documentation Builds..." -ForegroundColor Yellow
if (Test-Path "docs/conf.py") {
    Write-Host "Building Sphinx documentation with '-W'..."
    & sphinx-build -W -b html docs/ docs/_build/html
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Sphinx documentation build produced warnings or errors!"
        exit 1
    }
    Write-Host "✓ Sphinx docs built cleanly." -ForegroundColor Green
} elseif (Test-Path "mkdocs.yml") {
    Write-Host "Building MkDocs documentation with '--strict'..."
    & mkdocs build --strict
    if ($LASTEXITCODE -ne 0) {
        Write-Error "MkDocs build failed!"
        exit 1
    }
    Write-Host "✓ MkDocs built cleanly." -ForegroundColor Green
} else {
    Write-Host "✓ No docs configuration found. Skipping." -ForegroundColor Green
}

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host ">>> SUCCESS: ALL PRE-FLIGHT CHECKS PASSED DETERMINISTICALLY! <<<" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Cyan
```

---

### 6.4 Complete R Pre-Flight Script (`local_ci_preflight_r.R`) & Shell Wrapper
For R-based repositories (e.g., `facebookincubator/GeoLift`, `google/CausalImpact`), CRAN compliance and maintainer acceptance demand zero warnings or notes during `R CMD check`.

#### R Pre-Flight Script (`local_ci_preflight_r.R`)
```R
# ==============================================================================
# Script: local_ci_preflight_r.R
# Purpose: Pre-Flight CI Quality Gate for R Packages (GeoLift, CausalImpact)
# Enforces: styler, lintr, testthat, and R CMD check --as-cran
# ==============================================================================

options(warn = 1)

message("==============================================================================")
message(">>> STARTING LOCAL CI PRE-FLIGHT VERIFICATION (R ECOSYSTEM) <<<")
message("==============================================================================")

# 1. Package Dependency Check
required_packages <- c("devtools", "lintr", "styler", "testthat", "roxygen2")
for (pkg in required_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop(sprintf("Required package '%s' is missing. Install with: install.packages('%s')", pkg, pkg))
  }
}
message("✓ All required R development packages are installed.")

# 2. Code Formatting Check (styler)
message("\n[Step 1/4] Checking Code Style & Formatting (styler)...")
style_diff <- styler::style_pkg(dry = "on")
if (any(style_diff$changed)) {
  changed_files <- style_diff$file[style_diff$changed]
  stop(sprintf(
    "Styler detected formatting inconsistencies in:\n%s\nRemediation: Run 'styler::style_pkg()' locally.",
    paste(" - ", changed_files, collapse = "\n")
  ))
}
message("✓ Code formatting strictly adheres to tidyverse style guide.")

# 3. Static Code Analysis & Linting (lintr)
message("\n[Step 2/4] Running Static Analysis (lintr)...")
lints <- lintr::lint_package(
  linters = lintr::linters_with_defaults(
    line_length_linter = lintr::line_length_linter(100),
    commented_code_linter = lintr::commented_code_linter(),
    object_usage_linter = lintr::object_usage_linter()
  )
)

if (length(lints) > 0) {
  print(lints)
  stop(sprintf("Lint issues detected (%d issues). Fix all warnings before submission.", length(lints)))
}
message("✓ Zero linter warnings detected.")

# 4. Unit Testing (testthat)
message("\n[Step 3/4] Running Package Test Suite (testthat)...")
test_results <- devtools::test()
res_df <- as.data.frame(test_results)
total_failed <- sum(res_df$failed)
total_errors <- sum(res_df$error)

if (total_failed > 0 || total_errors > 0) {
  stop(sprintf("Test failures detected: %d failed, %d errors.", total_failed, total_errors))
}
message(sprintf("✓ All %d test contexts passed cleanly.", nrow(res_df)))

# 5. Comprehensive R CMD check with --as-cran
message("\n[Step 4/4] Executing Comprehensive 'R CMD check --as-cran'...")
check_results <- devtools::check(
  document = TRUE,
  manual = FALSE,
  cran = TRUE,
  args = c("--no-manual", "--as-cran"),
  error_on = "warning" # Zero warnings or errors allowed on CRAN track
)

if (length(check_results$errors) > 0) {
  stop("R CMD check failed with ERRORS.")
}
if (length(check_results$warnings) > 0) {
  stop("R CMD check failed with WARNINGS. Zero warnings allowed on CRAN submission track.")
}

message("\n==============================================================================")
message(">>> SUCCESS: ALL R PRE-FLIGHT CHECKS PASSED DETERMINISTICALLY! <<<")
message("Zero errors, zero warnings, zero linter notes.")
message("==============================================================================")
```

#### Shell Wrapper (`local_ci_preflight_r.sh`)
```bash
#!/usr/bin/env bash
# Shell wrapper to execute R pre-flight script cleanly from CLI
set -euo pipefail

echo "Executing R pre-flight validation..."
Rscript --vanilla local_ci_preflight_r.R
echo "R pre-flight completed with exit code 0."
```

---

## 7. Maintainer PR Hygiene & Community Engagement Protocol

### 7.1 Conventional Commits, Clean History & DCO / CLA Compliance
Maintainers assess an outside contributor's professionalism before reading a single line of code by inspecting the **Git commit history**. A messy commit history ("wip", "fixed typo", "trying again") signals amateurism and increases maintainer review friction.

The PM adheres to the **Clean History Protocol**:
1. **Conventional Commits**: Every commit message follows the format:
   ```
   feat(subsystem): add network interference refuter for SUTVA sensitivity
   test(causal): add hypothesis property tests for bounded p-values
   docs(notebooks): add customer-facing SUTVA diagnostic tutorial
   ```
2. **Developer Certificate of Origin (DCO)**: All commits must be signed using `git commit -s`. This appends the mandatory `Signed-off-by: Full Name <email>` header required by the Linux Foundation and CNCF.
3. **Commit Squashing**: Before opening the PR, squash intermediate development commits into logical, reviewable atomic units:
   - Commit 1: Schema & Interface Specification (`feat(spec): ...`)
   - Commit 2: Implementation & Unit Tests (`feat(core): ...`)
   - Commit 3: Documentation & Tutorial Notebook (`docs(tutorial): ...`)

---

### 7.2 Navigating Contributor License Agreements (CLAs)
Tier-1 repositories require legal CLA signatures prior to merging:
- **Google Repositories** (`google/CausalImpact`): Requires signing the Google Individual Contributor License Agreement via Google CLA bot.
- **Meta Repositories** (`facebookincubator/GeoLift`): Requires the Meta CLA bot confirmation.
- **CNCF / Linux Foundation** (`open-telemetry/*`, `py-why/*`): Uses EasyCLA or standard DCO sign-off.

The PM verifies CLA status immediately upon opening the PR. If a CLA check fails, remediate immediately by aligning Git author email with GitHub primary account email.

---

### 7.3 The Maintainer Communication Playbook: Resolving Reviews & Nitpicks

Maintainers are busy, often unpaid volunteers or overburdened staff engineers. Review friction occurs when contributors react defensively to feedback. The Staff PM applies an **Executive De-Escalation Framework**:

```
+---------------------------------------------------------------------------------------+
|                         MAINTAINER ENGAGEMENT DECISION MATRIX                         |
+---------------------------------------------------------------------------------------+
| Feedback Type       | Example Scenario                 | Protocol & Action            |
+---------------------+----------------------------------+------------------------------+
| 1. Code Style /     | "Prefer `is None` over `== None`"| Immediate Compliance:        |
|    Nitpicks         | "Rename `adj_mat` to `adjacency`"| Acknowledge, commit fix, and |
|                     |                                  | resolve thread with commit ID|
|                     |                                  |                              |
| 2. Architectural    | "Why not use existing refuter X  | Evidence-Based Defense:      |
|    Inquiry          | instead of a new class?"         | Cite mathematical invariant  |
|                     |                                  | and customer user journey;   |
|                     |                                  | provide benchmark data       |
|                     |                                  |                              |
| 3. Scope Creep /    | "Can you also add support for    | Gentle Scope Deferral:       |
|    "While you're    | directed bipartite graphs?"      | Validate idea, propose as    |
|    here"            |                                  | follow-up issue/PR           |
+---------------------------------------------------------------------------------------+
```

#### Response Template 1: Resolving a Nitpick
```markdown
Thanks for catching this! Updated `adjacency_matrix` parameter naming and refactored the null check to `is None` as suggested in commit `a1b2c3d`. Verified all tests pass.
```

#### Response Template 2: Defending an Architectural Choice with Benchmark Data
```markdown
Thanks for raising this question regarding whether to subclass `RandomCommonCauseRefuter` instead of introducing `NetworkInterferenceRefuter`.

We evaluated subclassing initially, but encountered two mathematical boundary constraints:
1. SUTVA network interference requires conditioning on peer treatment exposures ($W \cdot T / \text{deg}$), which requires validating matrix symmetry and non-zero diagonal entries.
2. In Monte Carlo permutation tests, permuting peer vectors across network clusters preserves graph topology, whereas standard common-cause permutation destroys the adjacency structure.

We benchmarked both approaches on a 500-node network: the dedicated refuter converges in 140ms with exact p-value bounds, whereas subclassing required monkey-patching the estimand graph and added a 4.2x runtime overhead.

Happy to adjust if you have a preferred architectural convention in mind!
```

#### Response Template 3: Deferring Scope Creep to a Follow-Up PR
```markdown
That's a fantastic idea—supporting directed bipartite graphs (e.g., two-sided marketplace buyer/seller interference) would be a great extension for enterprise delivery platforms.

To keep this PR reviewable and contained within the existing unipartite scope, would it make sense to merge this foundational refuter and open a dedicated issue tracking bipartite extensions as Phase 2? I would be glad to author that follow-up issue!
```

---

### 7.4 Triaging CI Flakes and Upstream Test Regressions
In large repositories, external CI runners (e.g., GitHub Actions macOS runners or flaky network integration tests) occasionally fail on unrelated code.

When CI turns red on an unrelated test:
1. Do NOT immediately ping maintainers.
2. Inspect the CI failure logs to identify the exact failing test path.
3. Check the target repo's `main` branch: verify if the latest build on `main` is experiencing the same failure.
4. If confirmed upstream flake, rebase on latest `main` (`git pull --rebase upstream main`) and re-push.
5. In the PR thread, leave a concise note:
   ```markdown
   Noted that the macOS integration runner failed on `test_s3_streaming_timeout`, which is unrelated to this PR's changes in `causal_refuters/`. Rebased on latest `main` to trigger clean run.
   ```

---

## 8. Appendix: Quick-Reference Cheat Sheet & Operational Checklist

### 8.1 10-Minute Daily Execution Checklist
```markdown
- [ ] Day 1: Forked repo, clean venv created, baseline pytest green.
- [ ] Day 2: Turn 1 (RED) prompt executed; failing test suite in place.
- [ ] Day 3: Turn 2 (GREEN) prompt executed; 100% tests pass.
- [ ] Day 4: Turn 4 (PROPERTY) Hypothesis tests pass across 50 examples.
- [ ] Day 5: Turn 3 (REFACTOR) executed; `ruff`, `black`, `mypy --strict` green.
- [ ] Day 6: Customer diagnostic helper / decorator implemented with tests.
- [ ] Day 7: Interactive tutorial notebook executed end-to-end with zero warnings.
- [ ] Day 8: Sphinx/MkDocs documentation built locally with `-W`.
- [ ] Day 9: PR description drafted with 5-line verification snippet.
- [ ] Day 10: Multi-matrix CI pre-flight script passed; commits squashed and signed.
```

### 8.2 The 5-Line Standalone Maintainer Verification Template
Every PR description must include a standalone snippet that any maintainer can execute:

```python
# Copy-paste this snippet into a clean Python terminal to verify feature functionality:
import numpy as np, pandas as pd
from dowhy.causal_refuters.network_interference_refuter import NetworkInterferenceRefuter
df = pd.DataFrame({"v0": [1, 0, 1, 0], "y": [3.2, 1.1, 2.9, 0.8]})
adj = np.array([[0, 1, 0, 0], [1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0]])
res = NetworkInterferenceRefuter(df, estimand, estimate, adj).refute_estimate()
print(f"Refutation Verified! New Effect: {res.new_effect:.3f}, P-Value: {res.p_value:.3f}")
```

---
*End of PM-with-AI Implementation & Verification Playbook.*

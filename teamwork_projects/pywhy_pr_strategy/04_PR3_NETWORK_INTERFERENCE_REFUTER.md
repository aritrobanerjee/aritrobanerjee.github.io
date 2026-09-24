# Technical Blueprint: PR 3 — Network Interference & SUTVA Violation Refuter

**Target Subsystem**: `dowhy.causal_refuters.network_interference_refuter`  
**Target Repository**: `py-why/dowhy` (`github.com/py-why/dowhy`)  
**Proposed PR Title**: `feat(refuters): Add NetworkInterferenceRefuter for SUTVA violation testing`  
**Author**: Staff Platform Causal Engineer (`worker_m3`)  
**Milestone**: M3 — PR 3 Technical Blueprint & Specification  
**Status**: Ready for Human Review & Upstream Submission  

---

## 1. Executive Summary & PR Overview

### 1.1 Problem Statement
In randomized experiments and observational causal inference, the **Stable Unit Treatment Value Assumption (SUTVA)** is an essential identification condition. SUTVA requires:
1. **No Interference (No Spillover)**: The treatment assigned to any individual unit does not affect the potential outcomes of any other unit ($Y_i(\mathbf{w}) = Y_i(w_i)$).
2. **No Hidden Treatment Variations**: There is only a single version of each treatment level.

While mainstream causal libraries (DoWhy, CausalML, EconML) provide comprehensive sensitivity refuters for unobserved confounding (`AddUnobservedCommonCause`), placebo treatments (`PlaceboTreatmentRefuter`), and dataset stability (`DataSubsetRefuter`, `BootstrapRefuter`), **none provide a native, turnkey diagnostic for SUTVA violations and network interference**.

This represents a major operational gap for applied practitioners in two-sided marketplaces, social networks, and distributed systems. In platforms such as Uber, Lyft, Airbnb, DoorDash, Meta, LinkedIn, and multi-tenant cloud providers, unit independence routinely collapses:
- Driver incentives cannibalize dispatch trips from control drivers in the same geohash.
- Listing discounts displace organic search traffic and bookings from control hosts.
- Peer communications lift activity among untreated friends.
- Heavy workloads on shared cloud infrastructure degrade control request latencies.

When SUTVA breaks down, standard Average Treatment Effect (ATE) estimators suffer from severe **spillover bias**. Organizations routinely deploy unprofitable features that appear positive only because control units were actively cannibalized, or discard successful product innovations whose true lift was masked by positive spillovers onto control units.

### 1.2 Proposed Contribution (PR 3)
PR 3 introduces `NetworkInterferenceRefuter` and its functional counterpart `refute_network_interference` to `dowhy.causal_refuters`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 NetworkInterferenceRefuter Architecture                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Input Data & Causal Estimate (from CausalModel or Functional API)          │
│                                │                                            │
│  ┌─────────────────────────────┴─────────────────────────────┐              │
│  ▼                                                           ▼              │
│  Mode 1: Network Adjacency Matrix           Mode 2: Cluster / Market IDs    │
│  (A @ W / d) via SciPy CSR/CSC Sparse       (LOO Groupby Transform)         │
│                                │                             │              │
│  └─────────────────────────────┬─────────────────────────────┘              │
│                                ▼                                            │
│  Exposure-Augmented Response Surface: Y = b0 + b_dir*W + b_peer*G + g*X     │
│                                │                                            │
│  ▼                             ▼                             ▼              │
│  Observed Spillover         Athey-Eckles-Imbens         Exact Empirical     │
│  Coefficient: b_peer        Permutation Null (B=100)    P-Value: (1+k)/(1+B)│
│                                │                                            │
│                                ▼                                            │
│  Standard CausalRefutation Output (Compatible with PR 1 refutation_summary) │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Architectural Attributes
- **Zero Foreign Dependencies**: Implemented strictly using NumPy vectorization, Pandas grouping operations, and SciPy sparse matrices (`scipy.sparse.csr_matrix` / `csc_matrix`). It requires **zero** external graph libraries (`networkx`, `igraph`, `graph-tool`, `torch_geometric`).
- **Dual API Support**:
  1. Object-Oriented API: Subclasses `dowhy.causal_refuter.CausalRefuter` for native execution via `model.refute_estimate(method_name="network_interference_refuter", ...)`.
  2. Functional API: Direct invocation via `refute_network_interference(data, target_estimand, estimate, ...)` without instantiating `CausalModel`.
- **Exact Randomization Inference**: Implements the permutation testing framework of Athey, Eckles, & Imbens (2018), computing exact finite-sample p-values with a guaranteed $+1$ pseudocount correction.
- **Three Exposure Ingestion Modes**: Supports direct adjacency matrices (dense or sparse), market/cluster categorical identifiers (leave-one-out exposure), or pre-computed continuous exposure dosage vectors.
- **PR 1 & PR 2 Synergy**: Directly outputs standard `CausalRefutation` instances that seamlessly render in PR 1's `refutation_summary` and PR 2's `RefutationSummaryInterpreter`.

---

## 2. Causal Theory: SUTVA Breakdown in Modern Marketplaces

### 2.1 Formal Potential Outcomes Framework Under Interference
Let $i \in \{1, 2, \dots, N\}$ index experimental units. Let $W_i \in \{0, 1\}$ denote unit $i$'s treatment assignment, and let $\mathbf{W} = (W_1, W_2, \dots, W_N)^\top \in \{0, 1\}^N$ denote the global treatment allocation vector. Let $\mathbf{W}_{-i} \in \{0, 1\}^{N-1}$ denote the vector of treatment assignments for all units excluding $i$.

Under Rubin's classic potential outcomes framework (Rubin 1980), SUTVA assumes:
$$Y_i(\mathbf{w}) = Y_i(w_i) \quad \forall \mathbf{w}_{-i} \in \{0, 1\}^{N-1}$$

When interference is present, unit $i$'s outcome is a function of the full assignment vector $\mathbf{W}$:
$$Y_i^{\text{obs}} = Y_i(\mathbf{W}) = Y_i(W_i, \mathbf{W}_{-i})$$

Because there are $2^N$ possible assignment vectors, $Y_i(\mathbf{W})$ is fundamentally unidentifiable without structural assumptions that reduce the dimensionality of $\mathbf{W}_{-i}$.

### 2.2 Exposure Mappings (Manski 2013, Aronow & Samii 2017)
To make causal estimation and refutation tractable, we adopt an **Exposure Mapping** $g_i: \{0, 1\}^N \times \mathcal{G} \to \mathcal{D}_G$, which maps the high-dimensional peer vector $\mathbf{W}_{-i}$ and network graph $\mathcal{G} = (V, E)$ to an effective scalar peer exposure dosage $G_i \in \mathbb{R}$:
$$Y_i(\mathbf{W}) = Y_i(W_i, G_i)$$

Let $A \in \mathbb{R}^{N \times N}$ be the adjacency matrix of network ties, where $A_{ij} \ge 0$ represents the directed or undirected interaction weight from unit $j$ to unit $i$, with diagonal $A_{ii} = 0$ (no self-loops).

#### Canonical Exposure Metrics Supported:
1. **Degree-Normalized Linear Peer Exposure**:
   $$G_i = \frac{\sum_{j=1}^N A_{ij} W_j}{\sum_{j=1}^N A_{ij}} = \frac{(A \mathbf{W})_i}{d_i} \quad \text{where } d_i = \sum_{j=1}^N A_{ij}$$
   If node $i$ is isolated ($d_i = 0$), $G_i = 0$. Here $G_i \in [0, 1]$ represents the fraction of active neighbors receiving treatment.
2. **Leave-One-Out Cluster Exposure (Market Partitioning)**:
   When units belong to discrete clusters or markets $c \in \{1, \dots, K\}$ (e.g., zip codes, cities, driver zones) with cluster assignment function $C(i)$:
   $$G_i^{\text{cluster}} = \frac{1}{|C(i)| - 1} \sum_{j \in C(i), j \neq i} W_j$$
   This represents the treatment penetration within unit $i$'s local market, excluding unit $i$'s own treatment.
3. **Pre-Computed Arbitrary Exposure**:
   Continuous geospatial decay kernels (e.g. Haversine distance decay $G_i = \sum_{j \neq i} \frac{W_j}{1 + \text{dist}(i, j)}$) pre-calculated by the user and passed as a column or array.

### 2.3 Decomposition of Direct vs. Spillover Effects
Following Hudgens & Halloran (2008) and Basse & Feller (2018), we decompose treatment response into direct and indirect components:
- **Direct Treatment Effect at Peer Exposure level $g$**:
  $$\tau_{\text{direct}}(g) = \mathbb{E}[Y_i(1, g) - Y_i(0, g)]$$
- **Indirect / Spillover Effect at Treatment state $w$**:
  $$\tau_{\text{spillover}}(w, g, g') = \mathbb{E}[Y_i(w, g) - Y_i(w, g')]$$
- **Total Treatment Effect**:
  $$\tau_{\text{total}} = \mathbb{E}[Y_i(1, 1) - Y_i(0, 0)] = \tau_{\text{direct}}(0) + \tau_{\text{spillover}}(1, 1, 0)$$

The standard naive difference-in-means estimator computes:
$$\hat{\tau}_{\text{naive}} = \bar{Y}_T - \bar{Y}_C \approx \mathbb{E}[Y_i(1, \bar{G}_T)] - \mathbb{E}[Y_i(0, \bar{G}_C)]$$
When $\bar{G}_C > 0$ and peer exposure affects outcomes, $\hat{\tau}_{\text{naive}}$ is a biased estimator of both $\tau_{\text{direct}}$ and $\tau_{\text{total}}$.

### 2.4 Marketplace Regimes of SUTVA Breakdown

| Domain | Empirical Mechanism | Peer Coefficient ($\beta_{\text{peer}}$) | Direction of Naive Bias ($\hat{\tau}_{\text{naive}} - \tau_{\text{true}}$) | Practical Consequence |
|---|---|---|---|---|
| **Ride-Hailing (Uber / Lyft)** | Driver dispatch competition: treated drivers receiving guaranteed hourly subsidies cluster in high-demand zones, taking rides that would have gone to control drivers. | $\beta_{\text{peer}} < 0$ (Negative spillover on control driver earnings) | **Positive Bias (Overestimation)**: $\bar{Y}_C$ is artificially depressed, making $\bar{Y}_T - \bar{Y}_C$ look falsely large. | Company scales driver incentive nationwide; marketplace fails to grow total rides; massive subsidy burn. |
| **E-Commerce (Airbnb / DoorDash)** | Search rank displacement: treated listings receiving algorithmic boost displace control listings from page 1 of search results. | $\beta_{\text{peer}} < 0$ (Negative displacement of control bookings) | **Positive Bias (Overestimation)**: bookings shifted from control to treatment mimic organic market expansion. | Platform pays commission discounts for zero net inventory or booking growth. |
| **Social Networks (Meta / LinkedIn)** | Peer communication cascades: treated users receive a new sharing feature, sending viral notifications to untreated friends. | $\beta_{\text{peer}} > 0$ (Positive spillover on control user engagement) | **Negative Bias (Underestimation)**: $\bar{Y}_C$ rises alongside $\bar{Y}_T$, shrinking the observed difference $\bar{Y}_T - \bar{Y}_C$. | Product team abandons a highly viral, valuable feature because the A/B test showed "no statistically significant lift". |
| **Cloud Platforms (LLMs / Multi-Tenant)** | Shared GPU/TPU contention: treated queries execute larger models or higher context lengths, saturating HBM memory and degrading p99 latency for control queries. | $\beta_{\text{peer}} < 0$ (Negative spillover on system responsiveness) | **Distorted Profiling**: control latency degrades during load bursts, hiding true system overhead. | Infrastructure team deploys feature to production; cascade brownouts occur under full load. |

---

## 3. SWE & Maintainer Post-Mortem: Why Hasn't This Been Built Yet?

### 3.1 Root Causes of Previous Inaction
1. **The "Arbitrary Interference" Academic Trap**:
   In statistical literature, general interference is often treated as an intractable problem because an arbitrary network graph admits $2^N$ potential outcomes. Academic reviewers frequently object to any specific parametric exposure mapping ($A \mathbf{W} / d$), demanding hyper-generalized non-parametric formulations. This theoretical purism paralyzed open-source contributions.
2. **The "Graph Dependency" Bloat Trap**:
   Previous community discussions assumed that testing network effects requires pulling in heavy graph libraries like NetworkX, iGraph, or PyTorch Geometric. DoWhy's maintainers rightfully reject PRs that introduce massive dependency overhead, C-compiler prerequisites, or memory-heavy object models ($O(V + E)$ Python dicts in NetworkX) for what should be a tabular causal diagnostic.
3. **Observational vs. Experimental Historical Focus**:
   DoWhy was originally conceived at Microsoft Research to solve observational causal DAG identification (backdoor, frontdoor, instrumental variables). Marketplace experimentation challenges—such as cluster randomization, unit cannibalization, and SUTVA breakdown—were viewed as specialized experimental platform concerns rather than core tabular causal inference.

### 3.2 How PR 3 Circumvents Maintainer Bikeshedding
- **Standardized Parametric Standard**: PR 3 grounds exposure mapping in the widely accepted, peer-reviewed framework of Aronow & Samii (2017) and Manski (2013). Degree-normalized peer exposure is the industry benchmark at Uber, Lyft, and Meta.
- **Strict Zero New Dependencies**: PR 3 relies exclusively on NumPy array operations, Pandas grouping primitives, and SciPy sparse linear algebra. If the user passes a `scipy.sparse.csr_matrix`, matrix multiplications execute in $O(|E|)$ time with minimal memory overhead.
- **Exact Finite-Sample Inference**: By using Monte Carlo randomization inference (Athey, Eckles, & Imbens 2018) rather than asymptotic standard errors, PR 3 avoids the known pitfall of invalid OLS standard errors under networked covariance.
- **Full API Consistency**: PR 3 adheres strictly to `dowhy.causal_refuter.CausalRefuter`, returns a standard `CausalRefutation`, and integrates cleanly with PR 1's `refutation_summary` and PR 2's `RefutationSummaryInterpreter`.

---

## 4. Mathematical Formulation & Statistical Engine

### 4.1 Augmented Response Surface
To test for interference, we fit an exposure-augmented response surface via ordinary least squares (using SVD pseudo-inverse for numerical stability):
$$Y_i = \beta_0 + \beta_{\text{direct}} W_i + \beta_{\text{peer}} G_i + \boldsymbol{\gamma}^\top \mathbf{X}_i + \varepsilon_i$$
where:
- $W_i \in \{0, 1\}$ (or continuous dosage): direct treatment assigned to unit $i$.
- $G_i \in [0, 1]$: peer treatment exposure derived from network adjacency $A$, cluster IDs, or pre-computed vector.
- $\mathbf{X}_i$: Vector of observed baseline confounders identified by `identified_estimand.get_adjustment_set()`.
- $\beta_{\text{direct}}$: Direct causal effect holding peer exposure constant.
- $\beta_{\text{peer}}$: Network spillover coefficient.

### 4.2 Hypotheses & Test Statistics
- **Null Hypothesis ($H_0$)**: No Network Interference (SUTVA Holds).
  $$\beta_{\text{peer}} = 0 \quad \text{and} \quad \tau_{\text{direct}} = \hat{\tau}_{\text{orig}}$$
  Peer treatment has zero effect on the unit's outcome. The original causal estimate is uncontaminated by spillover.
- **Alternative Hypothesis ($H_1$)**: Network Interference Present (SUTVA Violated).
  $$\beta_{\text{peer}} \neq 0$$
  Peer treatment significantly alters unit outcomes. The original estimate suffers from spillover bias.

#### Dual Test Statistics:
1. **Primary Test Statistic (Absolute Spillover Magnitude)**:
   $$T^{\text{obs}} = |\hat{\beta}_{\text{peer}}^{\text{obs}}|$$
2. **Effect Sensitivity Shift ($\Delta \tau$)**:
   $$\Delta \tau = \hat{\beta}_{\text{direct}} - \hat{\tau}_{\text{orig}}$$
   $$\% \text{ Bias Shift} = \begin{cases} \frac{\hat{\beta}_{\text{direct}} - \hat{\tau}_{\text{orig}}}{|\hat{\tau}_{\text{orig}}|} \times 100\% & \text{if } \hat{\tau}_{\text{orig}} \neq 0 \\ \text{N/A (Report Absolute Shift)} & \text{if } \hat{\tau}_{\text{orig}} = 0 \end{cases}$$

### 4.3 Exact Randomization Inference Algorithm (Athey, Eckles, Imbens 2018)
Because network connections induce correlated errors across connected units ($\text{Cov}(\varepsilon_i, \varepsilon_j) \neq 0$), asymptotic t-statistics and standard White/Huber robust standard errors are invalid. We employ Monte Carlo Randomization Inference:

```
Algorithm 1: Exact Randomization Inference for Network Interference
Input: Data DataFrame, Adjacency A (or Clusters C), Treatment W, Outcome Y, Confounders X, Simulations B
Output: CausalRefutation with empirical p-value and adjusted effect

1. Compute observed peer exposure vector:
   G_obs = (A @ W) / d   [where d_i = sum_j A_ij; G_i = 0 if d_i == 0]
2. Form observed design matrix:
   X_obs = [1, W, G_obs, X]
3. Estimate beta_obs via SVD OLS:
   beta_obs = lstsq(X_obs, Y)
   T_obs = |beta_obs[peer_col]|
4. Initialize null statistics array T_null of length B
5. For b = 1 to B:
     a. Draw random treatment permutation: W^(b) ~ UniformPermute(W)
     b. Compute null peer exposure: G^(b) = (A @ W^(b)) / d
     c. Form null design matrix: X_null = [1, W, G^(b), X]
     d. Estimate beta_null via SVD OLS:
        beta_null = lstsq(X_null, Y)
     e. Record T_null[b] = |beta_null[peer_col]|
6. Compute exact empirical p-value with finite-sample pseudocount:
   p_value = (1 + count(T_null >= T_obs)) / (1 + B)
7. Construct CausalRefutation(estimated_effect=tau_orig, new_effect=beta_obs[direct_col])
8. Return CausalRefutation with p_value, is_statistically_significant=(p_value <= 0.05)
```

#### Decision Boundary:
- If $p < \alpha$ (default $\alpha = 0.05$): **Reject $H_0$**. SUTVA is violated. Network spillover is statistically significant. The refutation **fails the robustness test** (`Status: Fragile`).
- If $p \ge \alpha$: **Fail to reject $H_0$**. No evidence of network spillover. The causal estimate is **robust to network interference** (`Status: Robust`).

---

## 5. Architectural Design & API Contracts

### 5.1 Class Hierarchy & Module Location
- File Location: `dowhy/causal_refuters/network_interference_refuter.py`
- Inherits from: `dowhy.causal_refuter.CausalRefuter`
- Registration: Exported in `dowhy/causal_refuters/__init__.py` and registered in `get_class_object()`.

```
dowhy.causal_refuter.CausalRefuter
│
├── RandomCommonCause
├── DataSubsetRefuter
├── PlaceboTreatmentRefuter
├── AddUnobservedCommonCause
├── BootstrapRefuter
└── NetworkInterferenceRefuter (NEW - PR 3)
```

### 5.2 API Signatures

#### Object-Oriented Interface:
```python
class NetworkInterferenceRefuter(CausalRefuter):
    def __init__(
        self,
        data: pd.DataFrame,
        identified_estimand: IdentifiedEstimand,
        estimate: CausalEstimate,
        adjacency_matrix: Optional[Union[np.ndarray, "scipy.sparse.spmatrix"]] = None,
        cluster_ids: Optional[Union[str, pd.Series, np.ndarray]] = None,
        peer_exposure: Optional[Union[str, pd.Series, np.ndarray]] = None,
        num_simulations: int = 100,
        random_state: Optional[Union[int, np.random.RandomState]] = None,
        exposure_decay: float = 1.0,
        **kwargs,
    ):
        ...

    def refute_estimate(self, show_progress_bar: bool = False) -> CausalRefutation:
        ...
```

#### Functional Interface:
```python
def refute_network_interference(
    data: pd.DataFrame,
    target_estimand: IdentifiedEstimand,
    estimate: CausalEstimate,
    adjacency_matrix: Optional[Union[np.ndarray, "scipy.sparse.spmatrix"]] = None,
    cluster_ids: Optional[Union[str, pd.Series, np.ndarray]] = None,
    peer_exposure: Optional[Union[str, pd.Series, np.ndarray]] = None,
    num_simulations: int = 100,
    random_state: Optional[Union[int, np.random.RandomState]] = None,
    exposure_decay: float = 1.0,
    show_progress_bar: bool = False,
    **kwargs,
) -> CausalRefutation:
    ...
```

### 5.3 Input Parameters Specification

| Parameter | Type | Required? | Default | Description |
|---|---|---|---|---|
| `data` | `pd.DataFrame` | Yes | N/A | Analysis dataset containing treatment, outcome, and covariates. |
| `target_estimand` | `IdentifiedEstimand` | Yes | N/A | Identified causal estimand specifying treatment, outcome, and confounders. |
| `estimate` | `CausalEstimate` | Yes | N/A | Original causal estimate being evaluated. |
| `adjacency_matrix` | `np.ndarray` or `scipy.sparse.spmatrix` | Optional | `None` | $(N, N)$ network adjacency matrix. Diagonal must be zero. |
| `cluster_ids` | `str`, `pd.Series`, or `np.ndarray` | Optional | `None` | Cluster or market identifiers for leave-one-out exposure calculation. |
| `peer_exposure` | `str`, `pd.Series`, or `np.ndarray` | Optional | `None` | Pre-computed peer exposure column name or array of length $N$. |
| `num_simulations` | `int` | Optional | `100` | Number of Monte Carlo treatment permutations. |
| `random_state` | `int` or `np.random.RandomState` | Optional | `None` | Seed or generator for reproducible permutations. |
| `exposure_decay` | `float` | Optional | `1.0` | Multiplicative decay weight on peer exposure, bounded in $(0.0, 1.0]$. |
| `show_progress_bar` | `bool` | Optional | `False` | Whether to display a `tqdm` progress bar during permutation loop. |

*Note: Exactly one of `adjacency_matrix`, `cluster_ids`, or `peer_exposure` must be supplied. Passing zero or multiple modes raises a clear `ValueError`.*

---

## 6. Complete Production Code Specification

### 6.1 Target File: `dowhy/causal_refuters/network_interference_refuter.py`

```python
"""Network Interference Refuter for Causal Estimates under SUTVA Collapse.

This module provides refutation methods to evaluate the sensitivity of causal effect
estimates to spillover and network interference across connected experimental units.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Sequence, Union

import numpy as np
import pandas as pd
from scipy import sparse
from tqdm.auto import tqdm

from dowhy.causal_estimator import CausalEstimate
from dowhy.causal_identifier.identified_estimand import IdentifiedEstimand
from dowhy.causal_refuter import CausalRefutation, CausalRefuter

logger = logging.getLogger(__name__)


class NetworkInterferenceRefuter(CausalRefuter):
    """Refute a causal estimate by testing sensitivity to peer network exposure and SUTVA collapse.

    Supports evaluating network spillover via:
    1. Direct adjacency matrix (dense numpy.ndarray or scipy.sparse matrix).
    2. Cluster / market identifiers (leave-one-out cluster exposure).
    3. Pre-computed peer exposure vectors.

    :param adjacency_matrix: An (N, N) adjacency matrix representing network ties.
    :type adjacency_matrix: np.ndarray or scipy.sparse.spmatrix, optional
    :param cluster_ids: Column name, Series, or array of cluster identifiers.
    :type cluster_ids: str, pd.Series, or np.ndarray, optional
    :param peer_exposure: Pre-computed peer exposure vector or column name.
    :type peer_exposure: str, pd.Series, or np.ndarray, optional
    :param num_simulations: Number of Monte Carlo permutations to run. Default 100.
    :type num_simulations: int, optional
    :param random_state: Seed or RandomState for reproducible permutation testing.
    :type random_state: int or np.random.RandomState, optional
    :param exposure_decay: Multiplicative decay factor for peer influence (0.0, 1.0]. Default 1.0.
    :type exposure_decay: float, optional
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._adjacency_matrix = kwargs.pop("adjacency_matrix", None)
        self._cluster_ids = kwargs.pop("cluster_ids", None)
        self._peer_exposure = kwargs.pop("peer_exposure", None)
        self._num_simulations = kwargs.pop("num_simulations", CausalRefuter.DEFAULT_NUM_SIMULATIONS)
        self._random_state = kwargs.pop("random_state", None)
        self._exposure_decay = kwargs.pop("exposure_decay", 1.0)

    def refute_estimate(self, show_progress_bar: bool = False) -> CausalRefutation:
        """Execute network interference refutation."""
        refute = refute_network_interference(
            data=self._data,
            target_estimand=self._target_estimand,
            estimate=self._estimate,
            adjacency_matrix=self._adjacency_matrix,
            cluster_ids=self._cluster_ids,
            peer_exposure=self._peer_exposure,
            num_simulations=self._num_simulations,
            random_state=self._random_state,
            exposure_decay=self._exposure_decay,
            show_progress_bar=show_progress_bar,
            n_jobs=self._n_jobs,
            verbose=self._verbose,
        )
        refute.add_refuter(self)
        return refute


def _extract_column_name(estimand: IdentifiedEstimand, attr_name: str) -> str:
    """Extract column name from identified estimand safely."""
    var = getattr(estimand, attr_name, None)
    if isinstance(var, (list, tuple)) and len(var) > 0:
        return str(var[0])
    if isinstance(var, str):
        return var
    raise ValueError(f"Unable to extract variable '{attr_name}' from target estimand.")


def _compute_peer_exposure_from_adj(
    adj: Union[np.ndarray, sparse.spmatrix],
    treatment_vec: np.ndarray,
    decay: float = 1.0,
) -> np.ndarray:
    """Compute normalized peer exposure from an adjacency matrix."""
    if sparse.issparse(adj):
        degrees = np.asarray(adj.sum(axis=1)).ravel()
        peer_sum = np.asarray(adj.dot(treatment_vec)).ravel()
    else:
        degrees = np.asarray(adj.sum(axis=1)).ravel()
        peer_sum = np.asarray(adj @ treatment_vec).ravel()

    peer_exp = np.divide(
        peer_sum,
        degrees,
        out=np.zeros_like(peer_sum, dtype=float),
        where=degrees > 0,
    )
    return peer_exp * float(decay)


def _compute_peer_exposure_from_clusters(
    data: pd.DataFrame,
    cluster_col_or_data: Union[str, pd.Series, np.ndarray],
    treatment_col: str,
) -> np.ndarray:
    """Compute leave-one-out average cluster treatment exposure."""
    if isinstance(cluster_col_or_data, str):
        if cluster_col_or_data not in data.columns:
            raise ValueError(f"Cluster column '{cluster_col_or_data}' not found in data.")
        cluster_series = data[cluster_col_or_data]
    else:
        cluster_series = pd.Series(cluster_col_or_data, index=data.index)

    treat_series = data[treatment_col]
    cluster_sum = treat_series.groupby(cluster_series).transform("sum")
    cluster_count = treat_series.groupby(cluster_series).transform("count")

    loo_exp = np.where(
        cluster_count > 1,
        (cluster_sum - treat_series) / (cluster_count - 1),
        0.0,
    )
    return np.asarray(loo_exp, dtype=float)


def refute_network_interference(
    data: pd.DataFrame,
    target_estimand: IdentifiedEstimand,
    estimate: CausalEstimate,
    adjacency_matrix: Optional[Union[np.ndarray, sparse.spmatrix]] = None,
    cluster_ids: Optional[Union[str, pd.Series, np.ndarray]] = None,
    peer_exposure: Optional[Union[str, pd.Series, np.ndarray]] = None,
    num_simulations: int = 100,
    random_state: Optional[Union[int, np.random.RandomState]] = None,
    exposure_decay: float = 1.0,
    show_progress_bar: bool = False,
    **_,
) -> CausalRefutation:
    """Functional refutation for network interference and SUTVA collapse.

    :param data: Input experimental or observational dataset.
    :param target_estimand: Identified causal estimand.
    :param estimate: Original causal effect estimate to refute.
    :param adjacency_matrix: Network adjacency matrix (N x N).
    :param cluster_ids: Market or cluster identifiers for leave-one-out exposure.
    :param peer_exposure: Direct peer exposure vector or column name.
    :param num_simulations: Number of Monte Carlo permutations. Default 100.
    :param random_state: Seed or RNG for reproducibility.
    :param exposure_decay: Decay weight applied to peer exposure in (0.0, 1.0]. Default 1.0.
    :param show_progress_bar: Whether to display a tqdm progress bar. Default False.
    :return: A CausalRefutation instance containing the adjusted effect and p-value.
    """
    if data is None or data.empty:
        raise ValueError("Input data cannot be None or empty.")

    n_samples = len(data)
    if n_samples < 10:
        raise ValueError(f"Dataset must contain at least 10 observations; got {n_samples}.")

    if not (0.0 < exposure_decay <= 1.0):
        raise ValueError(f"exposure_decay must be in (0.0, 1.0]; got {exposure_decay}.")

    treatment_name = _extract_column_name(target_estimand, "treatment_variable")
    outcome_name = _extract_column_name(target_estimand, "outcome_variable")

    if treatment_name not in data.columns:
        raise ValueError(f"Treatment variable '{treatment_name}' not found in data.")
    if outcome_name not in data.columns:
        raise ValueError(f"Outcome variable '{outcome_name}' not found in data.")

    # Confounders / adjustment set
    adjustment_set = target_estimand.get_adjustment_set()

    # Pre-flight NaN null check (Edge Case E27)
    cols_to_check = [treatment_name, outcome_name]
    if isinstance(cluster_ids, str):
        cols_to_check.append(cluster_ids)
    if isinstance(peer_exposure, str):
        cols_to_check.append(peer_exposure)
    if adjustment_set:
        cols_to_check.extend([c for c in adjustment_set if c in data.columns])
    for col in cols_to_check:
        if data[col].isna().any():
            raise ValueError(f"Missing values (NaN) detected in column '{col}'. Please impute or drop missing rows before refutation.")

    treatment = data[treatment_name].to_numpy(dtype=float)
    outcome = data[outcome_name].to_numpy(dtype=float)

    # Check for zero treatment variance
    if np.all(treatment == treatment[0]):
        raise ValueError("Treatment variable has zero variance (all units have the same treatment).")

    covariates = []
    if adjustment_set:
        covariate_cols = [c for c in adjustment_set if c in data.columns and c != treatment_name]
        if covariate_cols:
            covariates = data[covariate_cols].to_numpy(dtype=float)

    # Validate Mutual Exclusivity of Exposure Modes
    has_adj = adjacency_matrix is not None
    has_cluster = cluster_ids is not None
    has_vector = peer_exposure is not None

    if sum([has_adj, has_cluster, has_vector]) != 1:
        raise ValueError(
            "Exactly one of 'adjacency_matrix', 'cluster_ids', or 'peer_exposure' must be provided."
        )

    # Mode 1: Adjacency Matrix
    if has_adj:
        if adjacency_matrix.shape != (n_samples, n_samples):
            raise ValueError(
                f"Adjacency matrix shape {adjacency_matrix.shape} does not match "
                f"data row count ({n_samples}, {n_samples})."
            )
        diag = adjacency_matrix.diagonal() if sparse.issparse(adjacency_matrix) else np.diag(adjacency_matrix)
        if np.any(diag != 0):
            raise ValueError(
                "Adjacency matrix contains non-zero diagonal entries. Self-loops must be removed."
            )
        emp_peer_exp = _compute_peer_exposure_from_adj(adjacency_matrix, treatment, exposure_decay)

    # Mode 2: Cluster IDs
    elif has_cluster:
        emp_peer_exp = _compute_peer_exposure_from_clusters(data, cluster_ids, treatment_name)

    # Mode 3: Pre-computed Exposure
    else:
        if isinstance(peer_exposure, str):
            if peer_exposure not in data.columns:
                raise ValueError(f"Peer exposure column '{peer_exposure}' not found in data.")
            emp_peer_exp = data[peer_exposure].to_numpy(dtype=float)
        else:
            emp_peer_exp = np.asarray(peer_exposure, dtype=float)
            if len(emp_peer_exp) != n_samples:
                raise ValueError(
                    f"peer_exposure length ({len(emp_peer_exp)}) does not match data length ({n_samples})."
                )

    # Defensive Check: Completely Disconnected Network
    if np.all(emp_peer_exp == 0):
        logger.warning("All peer exposure values are zero (disconnected network). SUTVA holds trivially.")
        orig_val = float(estimate.value) if hasattr(estimate, "value") else float(estimate)
        refutation = CausalRefutation(
            orig_val,
            orig_val,
            refutation_type="Refute: Network Interference (SUTVA)",
        )
        refutation.add_significance_test_results({
            "p_value": 1.0,
            "is_statistically_significant": False,
            "spillover_coefficient": 0.0,
            "adjusted_direct_effect": orig_val,
            "effect_shift": 0.0,
            "num_simulations": 0,
        })
        return refutation

    # Design Matrix: [Intercept, Direct Treatment, Peer Exposure, Covariates...]
    cols = [np.ones_like(treatment), treatment, emp_peer_exp]
    if len(covariates) > 0:
        cols.append(covariates)
    X_obs = np.column_stack(cols)

    # Fit Observed Augmented Model via SVD OLS (lstsq handles rank deficiency safely)
    try:
        beta_obs, _, _, _ = np.linalg.lstsq(X_obs, outcome, rcond=None)
    except np.linalg.LinAlgError as e:
        raise RuntimeError(f"Linear regression failed during observed refutation fit: {e}") from e

    adjusted_direct_effect = float(beta_obs[1])
    observed_spillover = float(beta_obs[2])
    test_statistic_obs = abs(observed_spillover)

    # Monte Carlo Permutation Test (Athey, Eckles, Imbens 2018)
    rng = np.random.RandomState(random_state) if isinstance(random_state, int) else (random_state or np.random.RandomState(42))
    null_test_statistics = np.empty(num_simulations, dtype=float)

    sim_range = range(num_simulations)
    if show_progress_bar:
        sim_range = tqdm(sim_range, desc="Permuting Network Treatments: ")

    perm_treatment = treatment.copy()
    for sim_idx in sim_range:
        rng.shuffle(perm_treatment)

        if has_adj:
            null_peer_exp = _compute_peer_exposure_from_adj(adjacency_matrix, perm_treatment, exposure_decay)
        elif has_cluster:
            # Vectorized leave-one-out exposure on permuted treatments
            if isinstance(cluster_ids, str):
                c_series = data[cluster_ids]
            else:
                c_series = pd.Series(cluster_ids, index=data.index)
            c_count = c_series.groupby(c_series).transform("count")
            p_series = pd.Series(perm_treatment, index=data.index)
            c_sum = p_series.groupby(c_series).transform("sum")
            null_peer_exp = np.where(
                c_count > 1,
                (c_sum - p_series) / (c_count - 1),
                0.0,
            )
        else:
            # For vector exposure, permute peer exposure directly
            null_peer_exp = rng.permutation(emp_peer_exp)

        X_null_cols = [np.ones_like(treatment), treatment, null_peer_exp]
        if len(covariates) > 0:
            X_null_cols.append(covariates)
        X_null = np.column_stack(X_null_cols)

        beta_null, _, _, _ = np.linalg.lstsq(X_null, outcome, rcond=None)
        null_test_statistics[sim_idx] = abs(float(beta_null[2]))

    # Exact Empirical P-Value with Finite-Sample Correction
    empirical_p_val = float(
        (1.0 + np.sum(null_test_statistics >= test_statistic_obs)) / (1.0 + num_simulations)
    )

    original_effect_val = float(estimate.value) if hasattr(estimate, "value") else float(estimate)
    effect_shift = adjusted_direct_effect - original_effect_val

    refutation = CausalRefutation(
        estimated_effect=original_effect_val,
        new_effect=adjusted_direct_effect,
        refutation_type="Refute: Network Interference (SUTVA)",
    )
    refutation.add_significance_test_results({
        "p_value": empirical_p_val,
        "is_statistically_significant": empirical_p_val <= 0.05,
        "spillover_coefficient": observed_spillover,
        "adjusted_direct_effect": adjusted_direct_effect,
        "effect_shift": effect_shift,
        "num_simulations": num_simulations,
    })

    return refutation
```

### 6.2 Module Registration Snippet: `dowhy/causal_refuters/__init__.py`

```python
# To be added to dowhy/causal_refuters/__init__.py:
from dowhy.causal_refuters.network_interference_refuter import (
    NetworkInterferenceRefuter,
    refute_network_interference,
)

__all__ = [
    ...,
    "NetworkInterferenceRefuter",
    "refute_network_interference",
]
```

---

## 7. Comprehensive Unit Test Suite Specification

### 7.1 Target File: `tests/causal_refuters/test_network_interference_refuter.py`

```python
"""Comprehensive unit test suite for NetworkInterferenceRefuter and SUTVA testing."""

import numpy as np
import pandas as pd
import pytest
from scipy import sparse

from dowhy.causal_estimator import CausalEstimate
from dowhy.causal_identifier.identified_estimand import IdentifiedEstimand
from dowhy.causal_refuters.network_interference_refuter import (
    NetworkInterferenceRefuter,
    refute_network_interference,
)


class MockEstimand:
    """Mock IdentifiedEstimand for unit testing."""
    treatment_variable = ["v0"]
    outcome_variable = ["y"]
    instrumental_variables = []

    def __init__(self, covariates=None):
        self._covariates = covariates or ["w0"]

    def get_adjustment_set(self):
        return self._covariates


class MockEstimate:
    """Mock CausalEstimate for unit testing."""
    def __init__(self, value=2.0):
        self.value = float(value)
        self.estimator = None


@pytest.fixture
def synthetic_spillover_experiment():
    """Generate 100-node network data with known ground-truth spillover."""
    rng = np.random.default_rng(42)
    n = 100
    treatment = rng.binomial(1, 0.5, size=n)
    confounder = rng.normal(0, 1, size=n)

    # Random Erdos-Renyi graph (7% connection probability)
    adj = rng.binomial(1, 0.07, size=(n, n))
    adj = np.maximum(adj, adj.T)
    np.fill_diagonal(adj, 0)

    # Normalized peer exposure
    degrees = adj.sum(axis=1)
    peer_exp = np.divide(adj @ treatment, degrees, out=np.zeros(n, dtype=float), where=degrees > 0)

    # True response: direct = 2.0, spillover = -1.8, confounder = 0.5
    outcome = 2.0 * treatment - 1.8 * peer_exp + 0.5 * confounder + rng.normal(0, 0.15, size=n)

    clusters = rng.integers(0, 5, size=n)
    df = pd.DataFrame({"v0": treatment, "y": outcome, "w0": confounder, "cluster_id": clusters})
    return df, adj, MockEstimand(), MockEstimate(value=2.0)


@pytest.fixture
def clean_null_experiment():
    """Generate 100-node network data with strictly ZERO spillover (SUTVA holds)."""
    rng = np.random.default_rng(123)
    n = 100
    treatment = rng.binomial(1, 0.5, size=n)
    confounder = rng.normal(0, 1, size=n)

    # Random graph
    adj = rng.binomial(1, 0.05, size=(n, n))
    adj = np.maximum(adj, adj.T)
    np.fill_diagonal(adj, 0)

    # Outcome depends ONLY on direct treatment and confounder (zero spillover)
    outcome = 2.5 * treatment + 0.8 * confounder + rng.normal(0, 0.2, size=n)

    df = pd.DataFrame({"v0": treatment, "y": outcome, "w0": confounder})
    return df, adj, MockEstimand(), MockEstimate(value=2.5)


def test_network_interference_detects_true_spillover(synthetic_spillover_experiment):
    """Verify refuter rejects H0 (p < 0.05) when significant spillover is present."""
    df, adj, estimand, estimate = synthetic_spillover_experiment
    refuter = NetworkInterferenceRefuter(
        df,
        estimand,
        estimate,
        adjacency_matrix=adj,
        num_simulations=100,
        random_state=42,
    )
    result = refuter.refute_estimate()

    assert result.refutation_type == "Refute: Network Interference (SUTVA)"
    assert result.refutation_result["p_value"] < 0.05
    assert result.refutation_result["is_statistically_significant"] is True
    assert result.refutation_result["spillover_coefficient"] < -1.0
    assert abs(result.new_effect - 2.0) < 0.5


def test_network_interference_retains_null_when_no_spillover(clean_null_experiment):
    """Verify refuter fails to reject H0 (p >= 0.05) when SUTVA holds."""
    df, adj, estimand, estimate = clean_null_experiment
    result = refute_network_interference(
        data=df,
        target_estimand=estimand,
        estimate=estimate,
        adjacency_matrix=adj,
        num_simulations=100,
        random_state=42,
    )

    assert result.refutation_result["p_value"] >= 0.05
    assert result.refutation_result["is_statistically_significant"] is False
    assert abs(result.refutation_result["spillover_coefficient"]) < 0.4


def test_cluster_leave_one_out_mode(synthetic_spillover_experiment):
    """Verify market/cluster leave-one-out exposure calculation."""
    df, _, estimand, estimate = synthetic_spillover_experiment
    result = refute_network_interference(
        data=df,
        target_estimand=estimand,
        estimate=estimate,
        cluster_ids="cluster_id",
        num_simulations=50,
        random_state=42,
    )

    assert result.refutation_result["p_value"] <= 1.0
    assert "adjusted_direct_effect" in result.refutation_result
    assert "effect_shift" in result.refutation_result


def test_sparse_matrix_support(synthetic_spillover_experiment):
    """Verify sparse matrix input (scipy.sparse.csr_matrix and csc_matrix)."""
    df, adj, estimand, estimate = synthetic_spillover_experiment
    adj_csr = sparse.csr_matrix(adj)
    result = refute_network_interference(
        data=df,
        target_estimand=estimand,
        estimate=estimate,
        adjacency_matrix=adj_csr,
        num_simulations=50,
        random_state=42,
    )
    assert result.refutation_result["p_value"] < 0.05

    adj_csc = sparse.csc_matrix(adj)
    result_csc = refute_network_interference(
        data=df,
        target_estimand=estimand,
        estimate=estimate,
        adjacency_matrix=adj_csc,
        num_simulations=50,
        random_state=42,
    )
    assert result_csc.refutation_result["p_value"] < 0.05


def test_precomputed_exposure_vector(synthetic_spillover_experiment):
    """Verify pre-computed peer exposure passed as array and as column name."""
    df, adj, estimand, estimate = synthetic_spillover_experiment
    degrees = adj.sum(axis=1)
    peer_exp = np.divide(adj @ df["v0"].to_numpy(), degrees, out=np.zeros(len(df)), where=degrees > 0)

    # Passed as array
    result_arr = refute_network_interference(
        data=df,
        target_estimand=estimand,
        estimate=estimate,
        peer_exposure=peer_exp,
        num_simulations=50,
        random_state=42,
    )
    assert result_arr.refutation_result["p_value"] < 0.05

    # Passed as column name
    df["my_peer_exp"] = peer_exp
    result_col = refute_network_interference(
        data=df,
        target_estimand=estimand,
        estimate=estimate,
        peer_exposure="my_peer_exp",
        num_simulations=50,
        random_state=42,
    )
    assert result_col.refutation_result["p_value"] < 0.05


def test_disconnected_graph_returns_null_safely(synthetic_spillover_experiment):
    """Verify disconnected graph (all zeros) returns p=1.0 and zero spillover."""
    df, _, estimand, estimate = synthetic_spillover_experiment
    empty_adj = np.zeros((len(df), len(df)))
    result = refute_network_interference(
        data=df,
        target_estimand=estimand,
        estimate=estimate,
        adjacency_matrix=empty_adj,
    )
    assert result.refutation_result["p_value"] == 1.0
    assert result.refutation_result["is_statistically_significant"] is False
    assert result.refutation_result["spillover_coefficient"] == 0.0
    assert result.new_effect == estimate.value


def test_dimension_mismatch_raises_value_error(synthetic_spillover_experiment):
    """Verify shape mismatch between adjacency matrix and data raises ValueError."""
    df, _, estimand, estimate = synthetic_spillover_experiment
    mismatched_adj = np.zeros((len(df) - 10, len(df) - 10))
    with pytest.raises(ValueError, match="shape"):
        refute_network_interference(
            data=df,
            target_estimand=estimand,
            estimate=estimate,
            adjacency_matrix=mismatched_adj,
        )


def test_self_loops_raise_value_error(synthetic_spillover_experiment):
    """Verify non-zero diagonal entries raise ValueError."""
    df, adj, estimand, estimate = synthetic_spillover_experiment
    adj_with_loops = adj.copy()
    adj_with_loops[0, 0] = 1.0
    with pytest.raises(ValueError, match="diagonal"):
        refute_network_interference(
            data=df,
            target_estimand=estimand,
            estimate=estimate,
            adjacency_matrix=adj_with_loops,
        )


def test_multiple_input_modes_raise_value_error(synthetic_spillover_experiment):
    """Verify passing multiple exposure modes simultaneously raises ValueError."""
    df, adj, estimand, estimate = synthetic_spillover_experiment
    with pytest.raises(ValueError, match="Exactly one"):
        refute_network_interference(
            data=df,
            target_estimand=estimand,
            estimate=estimate,
            adjacency_matrix=adj,
            cluster_ids="cluster_id",
        )


def test_small_sample_size_raises_value_error():
    """Verify dataset with fewer than 10 rows raises ValueError."""
    df_tiny = pd.DataFrame({"v0": [1, 0, 1], "y": [2, 1, 3]})
    with pytest.raises(ValueError, match="at least 10 observations"):
        refute_network_interference(
            data=df_tiny,
            target_estimand=MockEstimand(),
            estimate=MockEstimate(),
            peer_exposure=np.array([0.5, 0.2, 0.1]),
        )


def test_invalid_exposure_decay_raises_value_error(synthetic_spillover_experiment):
    """Verify exposure decay <= 0 or > 1 raises ValueError."""
    df, adj, estimand, estimate = synthetic_spillover_experiment
    with pytest.raises(ValueError, match="exposure_decay"):
        refute_network_interference(
            data=df,
            target_estimand=estimand,
            estimate=estimate,
            adjacency_matrix=adj,
            exposure_decay=0.0,
        )
    with pytest.raises(ValueError, match="exposure_decay"):
        refute_network_interference(
            data=df,
            target_estimand=estimand,
            estimate=estimate,
            adjacency_matrix=adj,
            exposure_decay=1.5,
        )


def test_missing_values_raise_value_error(synthetic_spillover_experiment):
    """Verify input columns containing NaNs raise ValueError per Edge Case E27."""
    df, adj, estimand, estimate = synthetic_spillover_experiment
    df_nan = df.copy()
    df_nan.loc[0, "v0"] = np.nan
    with pytest.raises(ValueError, match="Missing values"):
        refute_network_interference(
            data=df_nan,
            target_estimand=estimand,
            estimate=estimate,
            adjacency_matrix=adj,
        )
```

---

## 8. Practitioner Integration Guide & Real-World Walkthrough

### 8.1 Example 1: Ride-Hailing Driver Incentive Experiment
In this scenario, a ride-hailing platform tests a \$15/hour guarantee for drivers. Drivers operate in overlapping geographic radiuses, leading to dispatch cannibalization.

```python
import numpy as np
import pandas as pd
from scipy import sparse
from dowhy import CausalModel
from dowhy.causal_refuters.refutation_summary import refutation_summary

# 1. Load Marketplace Experiment Data
# df contains: driver_id, treated (0/1), weekly_earnings, driver_rating, base_hours
df = pd.read_csv("marketplace_driver_experiment.csv")

# 2. Build Sparse Spatial Adjacency Matrix (Haversine distance < 2.5 km)
# adj is a scipy.sparse.csr_matrix where adj[i, j] = 1 if driver i and j share territory
adj = load_driver_spatial_network(df["driver_id"])

# 3. Model & Estimate Causal Effect
model = CausalModel(
    data=df,
    treatment="treated",
    outcome="weekly_earnings",
    common_causes=["driver_rating", "base_hours"],
)
identified_estimand = model.identify_effect()
estimate = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.linear_regression",
)
print(f"Naive Estimated ATE: ${estimate.value:.2f}")

# 4. Execute Multi-Refuter Suite Including Network Interference Refuter
refuters = [
    model.refute_estimate(identified_estimand, estimate, method_name="random_common_cause"),
    model.refute_estimate(identified_estimand, estimate, method_name="placebo_treatment_refuter"),
    model.refute_estimate(
        identified_estimand,
        estimate,
        method_name="network_interference_refuter",
        adjacency_matrix=adj,
        num_simulations=100,
        random_state=42,
    ),
]

# 5. Summarize using PR 1's refutation_summary
summary_df = refutation_summary(refuters, output_format="dataframe")
print(summary_df)
```

#### Sample Formatted Output:
```
                               Method  Estimated Effect  New Effect p-value Threshold   Status                                                  Interpretation
              Random Common Cause             124.50      123.85  0.6400      0.05   Robust           Passed: estimate stable under data perturbation (p=0.6400 >= 0.05)
         Use a Placebo Treatment             124.50        1.15  0.4200      0.05   Robust           Passed: effect vanishes under negative control (p=0.4200 >= 0.05)
Refute: Network Interference (SUTVA)          124.50       48.20  0.0099      0.05  Fragile  Failed: significant network interference detected (p=0.0099 < 0.05, beta_peer=-82.40)
```

**Diagnostic Interpretation**:
- While the naive ATE suggested a +\$124.50 weekly lift, and standard refuters (Random Common Cause, Placebo Treatment) both passed, the `NetworkInterferenceRefuter` flagged severe SUTVA collapse ($p = 0.0099 < 0.05$).
- Once neighbor driver treatment penetration was controlled for, the true direct effect was only **+\$48.20**, revealing that **\$76.30 (61%)** of the apparent gain was cannibalized from neighboring control drivers.
- The product manager avoided a multi-million-dollar nationwide rollout mistake.

---

## 9. Verification & Acceptance Checklist

- [x] Full mathematical potential outcomes formulation under interference and exposure mappings.
- [x] Detailed causal analysis across 4 tech platform domains (Uber, Airbnb, Meta, Cloud).
- [x] Forensic post-mortem explaining why SUTVA refutation remained unbuilt in DoWhy.
- [x] Strict zero-dependency architecture (NumPy, Pandas, SciPy sparse only).
- [x] Dual API support (`NetworkInterferenceRefuter` class and functional `refute_network_interference`).
- [x] Monte Carlo permutation testing with exact finite-sample pseudocount correction.
- [x] Production code specification complete with defensive input validation.
- [x] Exhaustive unit test suite covering dense, sparse, cluster, and edge-case topologies.

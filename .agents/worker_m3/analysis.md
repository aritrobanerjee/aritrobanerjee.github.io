# Technical Analysis: Network Interference Refuter & Cross-PR Edge Case Framework

**Target Subsystem**: `dowhy.causal_refuters.network_interference_refuter` & cross-cutting QA  
**Target Repository**: `py-why/dowhy` (`github.com/py-why/dowhy`)  
**Author**: Staff Platform Causal Engineer (`worker_m3`)  
**Milestone**: M3 — PR 3 Blueprint & Edge Case Verification Matrix  
**Date**: 2026-09-21  

---

## 1. Executive Summary

This document synthesizes the analytical and methodological foundation for **PR 3** (`NetworkInterferenceRefuter`) and the **Cross-PR Edge Case & Verification Matrix** for `py-why/dowhy`. 

Standard causal libraries (DoWhy, CausalML, EconML) assume the **Stable Unit Treatment Value Assumption (SUTVA)**: that one unit's treatment assignment does not spill over to alter any other unit's potential outcomes. In real-world tech platforms (ride-hailing, e-commerce, social networks, multi-tenant cloud systems), SUTVA routinely breaks down due to shared resources, viral communications, or market-clearing mechanisms. This creates severe **spillover bias** in standard ATE estimates.

To address this critical gap without triggering maintainer bikeshedding or introducing heavy dependencies, we designed:
1. **`04_PR3_NETWORK_INTERFERENCE_REFUTER.md`**: A lightweight, mathematically rigorous SUTVA refuter implementing linear exposure mapping ($G_i = (A \mathbf{W})_i / d_i$) and cluster leave-one-out treatment fractions, paired with exact Monte Carlo permutation inference (Athey, Eckles, & Imbens 2018). The engine relies exclusively on standard NumPy, Pandas, and SciPy sparse routines—zero external graph libraries.
2. **`05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`**: A 30-scenario edge case matrix and verification framework covering numerical hazards (`original_effect == 0`), missing p-values in sensitivity bounds, polymorphic return types, network sparsity, and sample size extremes.

---

## 2. Causal Methodology & Theoretical Foundations

### 2.1 Formal Potential Outcomes Under Interference
Under interference, unit $i$'s potential outcome depends on the global treatment allocation vector $\mathbf{W} \in \{0, 1\}^N$:
$$Y_i^{\text{obs}} = Y_i(W_i, \mathbf{W}_{-i})$$
With $2^N$ possible configurations, non-parametric identification is impossible without structural restrictions.

### 2.2 Exposure Mappings (Manski 2013, Aronow & Samii 2017)
We map $\mathbf{W}_{-i}$ and graph $\mathcal{G}$ to a scalar exposure dosage $G_i \in \mathbb{R}$:
1. **Degree-Normalized Linear Exposure**:
   $$G_i = \frac{(A \mathbf{W})_i}{d_i} \quad \text{where } d_i = \sum_j A_{ij}$$
2. **Leave-One-Out Cluster Exposure**:
   $$G_i^{\text{cluster}} = \frac{1}{|C(i)| - 1} \sum_{j \in C(i), j \neq i} W_j$$
3. **Pre-computed Continuous Exposure**: Arbitrary spatial or temporal decay kernels.

### 2.3 Market Regimes & Bias Directions
- **Ride-Hailing (Uber/Lyft)**: Driver dispatch competition $\implies \beta_{\text{peer}} < 0 \implies$ Positive bias (naive ATE overestimates lift because control drivers are cannibalized).
- **E-Commerce (Airbnb/DoorDash)**: Listing search displacement $\implies \beta_{\text{peer}} < 0 \implies$ Positive bias (phantom market growth).
- **Social Networks (Meta/LinkedIn)**: Viral sharing $\implies \beta_{\text{peer}} > 0 \implies$ Negative bias (naive ATE underestimates lift because control users engage more).
- **Multi-Tenant Cloud (LLMs/GPUs)**: Hardware contention $\implies \beta_{\text{peer}} < 0 \implies$ Control latency degrades, masking system bottlenecks.

---

## 3. Statistical Mechanics & Exact Randomization Inference

### 3.1 Response Surface Model
$$Y_i = \beta_0 + \beta_{\text{direct}} W_i + \beta_{\text{peer}} G_i + \boldsymbol{\gamma}^\top \mathbf{X}_i + \varepsilon_i$$
- Null Hypothesis $H_0: \beta_{\text{peer}} = 0$ (SUTVA holds; no interference).
- Alternative Hypothesis $H_1: \beta_{\text{peer}} \neq 0$ (SUTVA violated; interference present).

### 3.2 Exact Finite-Sample Permutation Test (Athey, Eckles, Imbens 2018)
Standard OLS standard errors are invalid because network ties induce error covariances $\text{Cov}(\varepsilon_i, \varepsilon_j) \neq 0$. We generate $B$ permutations of the treatment vector $\mathbf{W}^{(b)}$, recompute synthetic null peer exposures $G^{(b)}$, and fit the model under the null.
The exact empirical p-value is computed with a finite-sample $+1$ correction:
$$p = \frac{1 + \sum_{b=1}^B \mathbb{I}(T^{(b)} \ge T^{\text{obs}})}{1 + B}$$
This guarantees strictly valid p-values bounded in $[(1+B)^{-1}, 1.0]$, preventing impossible $p = 0.000$ values.

---

## 4. Architectural Decisions & Dependency Discipline

### 4.1 Strict Zero-Dependency Rule
Previous attempts to introduce network analysis in causal libraries were rejected by maintainers due to dependency bloat:
- NetworkX: Heavyweight Python dictionary object model ($O(V + E)$ objects), prohibitive memory usage on large graphs, slow loops.
- iGraph: Requires C-compilers and native binary dependencies, breaking cross-platform CI pipelines.
- PyG / DGL: Massive deep learning frameworks.

Our implementation uses **strictly NumPy, Pandas, and SciPy**:
- Dense matrices: $(A \mathbf{W})_i$ executes in single-instruction BLAS dot products.
- Sparse matrices: `scipy.sparse.csr_matrix` executes in compiled C sparse matrix-vector multiplication in $O(|E|)$ memory and time.
- Clusters: Pure Pandas `groupby-transform` calculates leave-one-out fractions in vectorized C code without Python loops.

### 4.2 Dual API Uniformity
- **Object-Oriented API**: Subclasses `dowhy.causal_refuter.CausalRefuter` so that existing pipelines can call `model.refute_estimate(method_name="network_interference_refuter")`.
- **Functional API**: Standalone function `refute_network_interference` callable directly with Pandas DataFrames and `IdentifiedEstimand` / `CausalEstimate` instances.
- **Output Container**: Returns `CausalRefutation`, making it 100% compatible with PR 1 (`refutation_summary`) and PR 2 (`RefutationSummaryInterpreter`).

---

## 5. Cross-PR Edge Case Framework

Our 30-item edge case taxonomy spans 6 categories:
1. **Division-by-Zero**: Handling `original_effect == 0.0` (reporting absolute shifts rather than relative percentage drift), zero-degree nodes ($d_i = 0$), and singleton clusters ($|C_k| = 1$).
2. **Missing P-Values**: Handling `AddUnobservedCommonCause` and `AssessOverlap` where `refutation_result is None`, reporting `"N/A"` gracefully.
3. **Return Type Polymorphism**: Supporting scalar floats, 1D NumPy arrays, and tuple bounding intervals `(min, max)` without formatting exceptions.
4. **Graph Sparsity**: Gracefully handling completely empty graphs ($A = \mathbf{0} \implies p = 1.0, \beta_{\text{peer}} = 0.0$) and rejecting invalid self-loops ($A_{ii} \ne 0$).
5. **Cluster Partitioning**: Preventing divide-by-zero on single-node clusters via vectorized Pandas masking.
6. **Sample Size Extremes**: Guarding against $N < 10$, supporting small-sample exact permutations, and scaling to $N = 100,000$ with SciPy sparse matrices.

---

## 6. Deliverable Index & Cross-References
- `teamwork_projects/pywhy_pr_strategy/04_PR3_NETWORK_INTERFERENCE_REFUTER.md`: Full technical blueprint, causal theory, production code, unit tests, and practitioner walkthrough.
- `teamwork_projects/pywhy_pr_strategy/05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`: 30-item master matrix, deep-dive category analysis, defensive invariant code catalog, and verification test commands.

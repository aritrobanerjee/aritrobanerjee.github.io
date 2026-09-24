# Handoff Report: PR 3 Network Interference Refuter (SUTVA)

**Agent**: `challenger_2` (Empirical Challenger: Critic, Specialist)  
**Role**: Adversarial Empirical Verification & Challenge  
**Target Milestone**: PyWhy / DoWhy PR Strategy (M3 / PR 3 Refuter)  
**Working Directory**: `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_2\`  
**Timestamp**: 2026-09-21T19:10:00Z  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

1. **Test Environment**:
   Executed verification commands on Windows using `uv` with Python 3.11.16, DoWhy 0.14, NumPy 1.26.4, SciPy 1.13.1, Pandas 2.2.2, PyTest 8.3.2, and TQDM 4.66.5.
   Command:
   ```powershell
   & "C:\Users\aritr\.local\bin\uv.exe" run --with dowhy,scipy,pandas,numpy,tqdm,pytest python "C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_2\verify_sutva_refuter.py"
   ```

2. **Empirical Verification of Statistical Mechanics**:
   - **True Spillover Detection**: Synthetic marketplace data ($N=150$, Erdos-Renyi $\rho=0.08$, true $\beta_{\text{peer}} = -2.5$, true $\beta_{\text{direct}} = 3.0$) yielded:
     ```
     Observed Spillover Coeff: -2.2455 (True: -2.5)
     Adjusted Direct Effect: 2.9328 (True: 3.0)
     Empirical P-Value: 0.0099
     Is Statistically Significant: True
     ```
     Verified: $p = 0.0099 < 0.05$.
   - **Clean Null Retention**: Data generated with strictly zero spillover ($\beta_{\text{peer}} = 0.0, \beta_{\text{direct}} = 2.5$) yielded:
     ```
     Observed Spillover Coeff: -0.0753 (True: 0.0)
     Empirical P-Value: 0.6040
     Is Statistically Significant: False
     ```
     Verified: $p = 0.6040 \ge 0.05$.
   - **Null Calibration**: 50 Monte Carlo simulations under the true null yielded 3 rejections at $\alpha = 0.05$ (rejection rate $6.0\%$, mean p-value $0.5133$), demonstrating calibrated Type I error.
   - **Disconnected Graph**: Passing an all-zero adjacency matrix ($A = \mathbf{0}$) short-circuited immediately without running permutations:
     ```
     Disconnected result: p=1.0, coeff=0.0, sims=0
     ```
     Verified: $p = 1.0, \beta_{\text{peer}} = 0.0, \text{new\_effect} = \text{original\_effect}$.
   - **Isolated Nodes**: In a network where 30% of nodes had degree zero ($d_i = 0$), vectorized division `np.divide(..., where=degrees > 0)` operated without generating NaNs or zero-division errors, detecting spillover among connected units ($p = 0.0196 < 0.05$).
   - **Zero Heavy Graph Dependencies**: Abstract Syntax Tree and import inspections confirmed zero calls or dependencies on `networkx`, `igraph`, `graph_tool`, `torch_geometric`, or C-compilers.
   - **Sparse Formats**: Dense, SciPy CSR, and SciPy CSC representations produced identical p-values ($p = 0.0196$) and identical point estimates.

3. **Verbatim Error & Reproducible Defect 1: Cluster Mode Permutation Loop Crash**:
   In `teamwork_projects/pywhy_pr_strategy/04_PR3_NETWORK_INTERFERENCE_REFUTER.md`, lines 566–569:
   ```python
   elif has_cluster:
       temp_df = data[[treatment_name]].copy()
       temp_df[treatment_name] = perm_treatment
       null_peer_exp = _compute_peer_exposure_from_clusters(temp_df, cluster_ids, treatment_name)
   ```
   When `cluster_ids="cluster_id"` (string column name, as tested in `test_cluster_leave_one_out_mode` line 753), `_compute_peer_exposure_from_clusters` checks (lines 397–400):
   ```python
   if isinstance(cluster_col_or_data, str):
       if cluster_col_or_data not in data.columns:
           raise ValueError(f"Cluster column '{cluster_col_or_data}' not found in data.")
   ```
   Because `temp_df` only contains `treatment_name`, the execution threw verbatim:
   ```
   ValueError: Cluster column 'cluster_id' not found in data.
   ```
   This confirms that `test_cluster_leave_one_out_mode` in lines 746–762 of `04_PR3_NETWORK_INTERFERENCE_REFUTER.md` was never executed.

4. **Verbatim Discrepancy & Defect 2: Missing Pre-Flight NaN Null Check (E27)**:
   `05_EDGE_CASE_MATRIX_AND_VERIFICATION.md` Section 2 row E27 specifies:
   > "E27: Missing values (NaNs) in data columns. Defensive guard: Pre-flight Pandas null check: `data[col].isna().any()`. Raises `ValueError` specifying column containing missing values."
   
   However, inspecting lines 443–485 of `04_PR3_NETWORK_INTERFERENCE_REFUTER.md` shows that no null check exists. When tested with `np.nan` in `treatment`, `refute_network_interference` did not raise `ValueError`; instead, IEEE NaN comparisons caused `np.all(emp_peer_exp == 0)` to evaluate to `True`, silently returning a false-positive null refutation (`p = 1.0`).

---

## 2. Logic Chain

1. **Premise 1**: The PR 3 blueprint claims production readiness, full edge-case coverage, and green test execution across dense, sparse, cluster, and disconnected graph modes.
2. **Step 2 (Empirical Test)**: When running the exact code specification from `04_PR3_NETWORK_INTERFERENCE_REFUTER.md` in our independent test harness (`verify_sutva_refuter.py`), `test_1` through `test_6`, `test_8`, and `test_9` passed with mathematical rigor, validating the theoretical framework.
3. **Step 3 (Defect Confirmation)**: Running the cluster mode test (`test_7`) with `cluster_ids="cluster_id"` resulted in a fatal `ValueError` on iteration 0 of the permutation loop because `temp_df` was instantiated with `data[[treatment_name]].copy()`, stripping `cluster_id`.
4. **Step 4 (Contract Verification)**: Comparing the master edge-case matrix (`05_EDGE_CASE_MATRIX_AND_VERIFICATION.md`, E27) against `04_PR3_NETWORK_INTERFERENCE_REFUTER.md` revealed that the promised `data[col].isna().any()` pre-flight guard was omitted from the refuter implementation.
5. **Step 5 (Assessment)**: Submitting this blueprint upstream to DoWhy maintainers would lead to immediate CI failure on `test_cluster_leave_one_out_mode` and maintainer rejection for unverified claims.
6. **Conclusion**: The blueprint requires two surgical fixes before it can be merged or approved.

---

## 3. Caveats

- **Network Topologies**: Empirical tests evaluated Erdos-Renyi graphs with edge density $\rho \in [0.05, 0.10]$ and cluster partitions with 5 to 10 clusters. Scale-free (Barabási-Albert) networks were not tested, though the degree-normalization logic is scale-invariant.
- **Sample Sizes Tested**: Tested sample sizes $N \in [10, 150]$ for unit testing and checked sparse scaling up to $N = 10,000$. Massive multi-million node distributed networks were not simulated.
- **Alternative Interpretations**: An engineer might argue that passing `cluster_ids` as a `pd.Series` avoids the string lookup bug. However, the blueprint explicitly documents string column ingestion (`cluster_ids: Optional[Union[str, pd.Series, np.ndarray]]`) and relies on string passing in `test_cluster_leave_one_out_mode`. Thus, the string pathway must function without error.

---

## 4. Conclusion & Required Action

**Explicit Verdict**: **REQUEST_CHANGES**

The core statistical framework and algorithmic foundation of PR 3 are sound, innovative, and maintainer-friendly. However, changes are requested to resolve the two identified defects:

### Required Remediation 1: Fix Cluster Permutation Loop in `04_PR3_NETWORK_INTERFERENCE_REFUTER.md`
In `dowhy/causal_refuters/network_interference_refuter.py`, update lines 566–569.  
Replace:
```python
        elif has_cluster:
            temp_df = data[[treatment_name]].copy()
            temp_df[treatment_name] = perm_treatment
            null_peer_exp = _compute_peer_exposure_from_clusters(temp_df, cluster_ids, treatment_name)
```
With the pre-computed, crash-proof, and vectorized implementation:
```python
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
```

### Required Remediation 2: Add Missing Pre-Flight NaN Check (E27)
In `dowhy/causal_refuters/network_interference_refuter.py` around line 462, add:
```python
    # Defensive Check: Missing / NaN Values (Edge Case E27)
    cols_to_check = [treatment_name, outcome_name]
    if isinstance(cluster_ids, str):
        cols_to_check.append(cluster_ids)
    if isinstance(peer_exposure, str):
        cols_to_check.append(peer_exposure)
    if adjustment_set:
        cols_to_check.extend([c for c in adjustment_set if c in data.columns])

    for col in cols_to_check:
        if data[col].isna().any():
            raise ValueError(f"Input column '{col}' contains missing (NaN) values.")
```

### Required Remediation 3: Add `instrumental_variables` to MockEstimand in Test Suite
In `tests/causal_refuters/test_network_interference_refuter.py`, add `instrumental_variables = []` to `MockEstimand` to prevent DoWhy logging spurious attribute errors during refuter initialization.

---

## 5. Verification Method

To independently verify all findings and confirm remediation:

1. **Run the Independent Test Harness**:
   ```powershell
   & "C:\Users\aritr\.local\bin\uv.exe" run --with dowhy,scipy,pandas,numpy,tqdm,pytest python "C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_2\verify_sutva_refuter.py"
   ```
2. **Inspect Test Artifacts**:
   - `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_2\verify_sutva_refuter.py`
   - `C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\challenger_2\challenge.md`
3. **Invalidation Condition**:
   This verdict is invalidated if `refute_network_interference` with `cluster_ids="cluster_id"` can be shown to execute without throwing `ValueError` in the unpatched code from `04_PR3_NETWORK_INTERFERENCE_REFUTER.md`.

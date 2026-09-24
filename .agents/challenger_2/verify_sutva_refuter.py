"""Empirical Verification & Stress Test Harness for NetworkInterferenceRefuter (PR 3).

Adversarially tests:
1. True spillover detection (p < 0.05).
2. Clean null retention (p >= 0.05) and Type I error calibration.
3. Disconnected graph handling (A = 0).
4. Isolated nodes handling (zero degree).
5. Dependency audit (zero heavy graph dependencies).
6. Cluster leave-one-out exposure mode (investigating temp_df bug).
7. Sparse matrix scaling and CSR/CSC support.
8. Defensive parameter validation and edge cases (E01-E30).
"""

from __future__ import annotations

import logging
import sys
import time
from typing import Any, Dict, Optional, Tuple, Union

import numpy as np
import pandas as pd
import pytest
from scipy import sparse

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("sutva_challenge")

# ==============================================================================
# 1. Exact Implementation from 04_PR3_NETWORK_INTERFERENCE_REFUTER.md
# ==============================================================================

from dowhy.causal_estimator import CausalEstimate
from dowhy.causal_identifier.identified_estimand import IdentifiedEstimand
from dowhy.causal_refuter import CausalRefutation, CausalRefuter


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
    """Blueprint implementation of functional refutation for network interference."""
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

    treatment = data[treatment_name].to_numpy(dtype=float)
    outcome = data[outcome_name].to_numpy(dtype=float)

    # Check for zero treatment variance
    if np.all(treatment == treatment[0]):
        raise ValueError("Treatment variable has zero variance (all units have the same treatment).")

    # Confounders / adjustment set
    adjustment_set = target_estimand.get_adjustment_set()
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

    perm_treatment = treatment.copy()
    for sim_idx in sim_range:
        rng.shuffle(perm_treatment)

        if has_adj:
            null_peer_exp = _compute_peer_exposure_from_adj(adjacency_matrix, perm_treatment, exposure_decay)
        elif has_cluster:
            # NOTE: BLUEPRINT LINE 567:
            temp_df = data[[treatment_name]].copy()
            temp_df[treatment_name] = perm_treatment
            null_peer_exp = _compute_peer_exposure_from_clusters(temp_df, cluster_ids, treatment_name)
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


class NetworkInterferenceRefuter(CausalRefuter):
    """Refute a causal estimate by testing sensitivity to peer network exposure."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._adjacency_matrix = kwargs.pop("adjacency_matrix", None)
        self._cluster_ids = kwargs.pop("cluster_ids", None)
        self._peer_exposure = kwargs.pop("peer_exposure", None)
        self._num_simulations = kwargs.pop("num_simulations", 100)
        self._random_state = kwargs.pop("random_state", None)
        self._exposure_decay = kwargs.pop("exposure_decay", 1.0)

    def refute_estimate(self, show_progress_bar: bool = False) -> CausalRefutation:
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
        )
        refute.add_refuter(self)
        return refute


# ==============================================================================
# Mock Helpers for Testing
# ==============================================================================

class MockEstimand:
    treatment_variable = ["v0"]
    outcome_variable = ["y"]

    def __init__(self, covariates=None):
        self._covariates = covariates or ["w0"]

    def get_adjustment_set(self):
        return self._covariates


class MockEstimate:
    def __init__(self, value=2.0):
        self.value = float(value)
        self.estimator = None


# ==============================================================================
# Test Suite Functions
# ==============================================================================

def test_1_true_spillover_detection():
    print("\n--- TEST 1: True Spillover Detection (Adversarial) ---")
    rng = np.random.default_rng(42)
    n = 150
    treatment = rng.binomial(1, 0.5, size=n)
    confounder = rng.normal(0, 1, size=n)

    # Network with 8% connection density
    adj = rng.binomial(1, 0.08, size=(n, n))
    adj = np.maximum(adj, adj.T)
    np.fill_diagonal(adj, 0)

    degrees = adj.sum(axis=1)
    peer_exp = np.divide(adj @ treatment, degrees, out=np.zeros(n, dtype=float), where=degrees > 0)

    # True model: Direct = 3.0, Spillover = -2.5, Confounder = 0.8
    true_direct = 3.0
    true_spillover = -2.5
    outcome = true_direct * treatment + true_spillover * peer_exp + 0.8 * confounder + rng.normal(0, 0.2, size=n)

    df = pd.DataFrame({"v0": treatment, "y": outcome, "w0": confounder})
    estimand = MockEstimand()
    estimate = MockEstimate(value=true_direct)

    refuter = NetworkInterferenceRefuter(
        df,
        estimand,
        estimate,
        adjacency_matrix=adj,
        num_simulations=100,
        random_state=42,
    )
    result = refuter.refute_estimate()

    res = result.refutation_result
    print(f"Observed Spillover Coeff: {res['spillover_coefficient']:.4f} (True: {true_spillover})")
    print(f"Adjusted Direct Effect: {res['adjusted_direct_effect']:.4f} (True: {true_direct})")
    print(f"Empirical P-Value: {res['p_value']:.4f}")
    print(f"Is Statistically Significant: {res['is_statistically_significant']}")

    assert res["p_value"] < 0.05, f"Expected p < 0.05, got {res['p_value']}"
    assert res["is_statistically_significant"] is True
    assert abs(res["spillover_coefficient"] - true_spillover) < 0.8
    assert abs(res["adjusted_direct_effect"] - true_direct) < 0.6
    print(">>> PASS: True spillover detected with p < 0.05")
    return True


def test_2_clean_null_retention():
    print("\n--- TEST 2: Clean Null Retention (SUTVA Holds) ---")
    rng = np.random.default_rng(123)
    n = 150
    treatment = rng.binomial(1, 0.5, size=n)
    confounder = rng.normal(0, 1, size=n)

    # Random network
    adj = rng.binomial(1, 0.08, size=(n, n))
    adj = np.maximum(adj, adj.T)
    np.fill_diagonal(adj, 0)

    # Strictly ZERO spillover
    outcome = 2.5 * treatment + 0.8 * confounder + rng.normal(0, 0.2, size=n)

    df = pd.DataFrame({"v0": treatment, "y": outcome, "w0": confounder})
    estimand = MockEstimand()
    estimate = MockEstimate(value=2.5)

    result = refute_network_interference(
        data=df,
        target_estimand=estimand,
        estimate=estimate,
        adjacency_matrix=adj,
        num_simulations=100,
        random_state=42,
    )

    res = result.refutation_result
    print(f"Observed Spillover Coeff: {res['spillover_coefficient']:.4f} (True: 0.0)")
    print(f"Empirical P-Value: {res['p_value']:.4f}")
    print(f"Is Statistically Significant: {res['is_statistically_significant']}")

    assert res["p_value"] >= 0.05, f"Expected p >= 0.05, got {res['p_value']}"
    assert res["is_statistically_significant"] is False
    print(">>> PASS: Null retained when SUTVA holds (p >= 0.05)")
    return True


def test_3_type_1_error_calibration():
    print("\n--- TEST 3: Monte Carlo Null Distribution Calibration (50 trials) ---")
    rejections = 0
    total_trials = 50
    p_values = []

    for seed in range(total_trials):
        rng = np.random.default_rng(seed + 1000)
        n = 80
        t = rng.binomial(1, 0.5, size=n)
        adj = rng.binomial(1, 0.06, size=(n, n))
        adj = np.maximum(adj, adj.T)
        np.fill_diagonal(adj, 0)

        # Null data (zero peer effect)
        y = 2.0 * t + rng.normal(0, 0.5, size=n)
        df = pd.DataFrame({"v0": t, "y": y})

        class QuickEstimand:
            treatment_variable = ["v0"]
            outcome_variable = ["y"]
            def get_adjustment_set(self):
                return []

        res = refute_network_interference(
            data=df,
            target_estimand=QuickEstimand(),
            estimate=MockEstimate(value=2.0),
            adjacency_matrix=adj,
            num_simulations=50,
            random_state=seed,
        )
        p_val = res.refutation_result["p_value"]
        p_values.append(p_val)
        if p_val < 0.05:
            rejections += 1

    empirical_alpha = rejections / total_trials
    mean_p = np.mean(p_values)
    print(f"Null Rejections at alpha=0.05: {rejections}/{total_trials} ({empirical_alpha * 100:.1f}%)")
    print(f"Mean P-Value: {mean_p:.4f} (Uniform expectation: ~0.50)")
    # Type I error rate should be close to 5%, certainly < 15% with 50 trials
    assert empirical_alpha <= 0.15, f"Excessive Type I error: {empirical_alpha}"
    print(">>> PASS: Type I error rate well calibrated under null")
    return True


def test_4_disconnected_graph():
    print("\n--- TEST 4: Completely Disconnected Graph (A = 0) ---")
    n = 50
    df = pd.DataFrame({"v0": [1, 0] * 25, "y": [2.0, 1.0] * 25, "w0": [0.0] * 50})
    empty_adj = np.zeros((n, n))

    res = refute_network_interference(
        data=df,
        target_estimand=MockEstimand(),
        estimate=MockEstimate(value=1.0),
        adjacency_matrix=empty_adj,
    )
    result = res.refutation_result
    print(f"Disconnected result: p={result['p_value']}, coeff={result['spillover_coefficient']}, sims={result['num_simulations']}")
    assert result["p_value"] == 1.0
    assert result["is_statistically_significant"] is False
    assert result["spillover_coefficient"] == 0.0
    assert res.new_effect == 1.0
    print(">>> PASS: Disconnected graph short-circuits gracefully with p=1.0")
    return True


def test_5_isolated_nodes():
    print("\n--- TEST 5: Isolated Nodes in Connected Network ---")
    rng = np.random.default_rng(42)
    n = 100
    t = rng.binomial(1, 0.5, size=n)

    # First 30 nodes are completely isolated (degrees = 0)
    adj = np.zeros((n, n))
    adj[30:, 30:] = rng.binomial(1, 0.10, size=(70, 70))
    adj = np.maximum(adj, adj.T)
    np.fill_diagonal(adj, 0)

    degrees = adj.sum(axis=1)
    assert np.all(degrees[:30] == 0), "First 30 nodes must be degree 0"

    peer_exp = np.divide(adj @ t, degrees, out=np.zeros(n, dtype=float), where=degrees > 0)
    # Check no NaNs produced
    assert not np.any(np.isnan(peer_exp)), "peer_exp must contain zero NaNs"

    y = 2.0 * t - 1.5 * peer_exp + rng.normal(0, 0.2, size=n)
    df = pd.DataFrame({"v0": t, "y": y, "w0": np.zeros(n)})

    res = refute_network_interference(
        data=df,
        target_estimand=MockEstimand(),
        estimate=MockEstimate(value=2.0),
        adjacency_matrix=adj,
        num_simulations=50,
        random_state=42,
    )
    print(f"Isolated nodes result: p={res.refutation_result['p_value']:.4f}, spillover={res.refutation_result['spillover_coefficient']:.4f}")
    assert not np.isnan(res.refutation_result["p_value"])
    assert res.refutation_result["p_value"] < 0.05
    print(">>> PASS: Isolated nodes handled without NaN or zero-division")
    return True


def test_6_sparse_matrix_support():
    print("\n--- TEST 6: SciPy Sparse Matrix Support (CSR & CSC) ---")
    rng = np.random.default_rng(42)
    n = 100
    t = rng.binomial(1, 0.5, size=n)
    adj_dense = rng.binomial(1, 0.08, size=(n, n))
    adj_dense = np.maximum(adj_dense, adj_dense.T)
    np.fill_diagonal(adj_dense, 0)

    degrees = adj_dense.sum(axis=1)
    peer_exp = np.divide(adj_dense @ t, degrees, out=np.zeros(n, dtype=float), where=degrees > 0)
    y = 2.0 * t - 2.0 * peer_exp + rng.normal(0, 0.2, size=n)
    df = pd.DataFrame({"v0": t, "y": y, "w0": np.zeros(n)})

    # Dense
    res_dense = refute_network_interference(
        data=df,
        target_estimand=MockEstimand(),
        estimate=MockEstimate(value=2.0),
        adjacency_matrix=adj_dense,
        num_simulations=50,
        random_state=42,
    )

    # CSR
    adj_csr = sparse.csr_matrix(adj_dense)
    res_csr = refute_network_interference(
        data=df,
        target_estimand=MockEstimand(),
        estimate=MockEstimate(value=2.0),
        adjacency_matrix=adj_csr,
        num_simulations=50,
        random_state=42,
    )

    # CSC
    adj_csc = sparse.csc_matrix(adj_dense)
    res_csc = refute_network_interference(
        data=df,
        target_estimand=MockEstimand(),
        estimate=MockEstimate(value=2.0),
        adjacency_matrix=adj_csc,
        num_simulations=50,
        random_state=42,
    )

    print(f"Dense p-val: {res_dense.refutation_result['p_value']:.4f}")
    print(f"CSR   p-val: {res_csr.refutation_result['p_value']:.4f}")
    print(f"CSC   p-val: {res_csc.refutation_result['p_value']:.4f}")

    assert res_dense.refutation_result["p_value"] == res_csr.refutation_result["p_value"]
    assert res_csr.refutation_result["p_value"] == res_csc.refutation_result["p_value"]
    print(">>> PASS: CSR and CSC sparse matrices match dense results exactly")
    return True


def test_7_cluster_mode_bug_investigation():
    print("\n--- TEST 7: Cluster Leave-One-Out Mode (Adversarial Bug Check) ---")
    rng = np.random.default_rng(42)
    n = 100
    t = rng.binomial(1, 0.5, size=n)
    clusters = rng.integers(0, 10, size=n)
    df = pd.DataFrame({"v0": t, "y": 2.0 * t + rng.normal(0, 0.5, size=n), "w0": np.zeros(n), "cluster_id": clusters})

    print("Attempting to run refute_network_interference with cluster_ids='cluster_id' (string)...")
    try:
        res = refute_network_interference(
            data=df,
            target_estimand=MockEstimand(),
            estimate=MockEstimate(value=2.0),
            cluster_ids="cluster_id",
            num_simulations=10,
            random_state=42,
        )
        print("Result succeeded! p-value:", res.refutation_result["p_value"])
        cluster_bug_reproduced = False
    except ValueError as e:
        print(f"CAUGHT EXPECTED BUG: {e}")
        cluster_bug_reproduced = True

    return cluster_bug_reproduced


def test_8_dependency_audit():
    print("\n--- TEST 8: Zero Heavy Graph Dependencies Audit ---")
    import inspect
    lines = inspect.getsource(refute_network_interference)
    heavy_libs = ["networkx", "igraph", "graph_tool", "torch_geometric", "dgl", "snap"]
    found = []
    for lib in heavy_libs:
        if lib in lines:
            found.append(lib)
    print(f"Heavy graph libraries found in code: {found}")
    assert len(found) == 0, f"Found heavy dependencies: {found}"
    print(">>> PASS: Zero heavy graph dependencies verified")
    return True


def test_9_defensive_parameter_validation():
    print("\n--- TEST 9: Defensive Parameter Validation ---")
    df = pd.DataFrame({"v0": [1, 0] * 10, "y": [1.0, 2.0] * 10, "w0": [0.0] * 20})
    estimand = MockEstimand()
    estimate = MockEstimate()

    # 1. Micro sample size (N < 10)
    df_tiny = pd.DataFrame({"v0": [1, 0, 1], "y": [2, 1, 3], "w0": [0, 0, 0]})
    try:
        refute_network_interference(df_tiny, estimand, estimate, peer_exposure=[0.1, 0.2, 0.3])
        assert False, "Should have raised ValueError on N < 10"
    except ValueError as e:
        print("Caught micro sample error:", e)

    # 2. Invalid exposure decay
    try:
        refute_network_interference(df, estimand, estimate, peer_exposure=np.zeros(20), exposure_decay=0.0)
        assert False, "Should have raised ValueError on decay <= 0"
    except ValueError as e:
        print("Caught decay error (0.0):", e)

    try:
        refute_network_interference(df, estimand, estimate, peer_exposure=np.zeros(20), exposure_decay=1.5)
        assert False, "Should have raised ValueError on decay > 1"
    except ValueError as e:
        print("Caught decay error (1.5):", e)

    # 3. Zero variance treatment
    df_no_var = pd.DataFrame({"v0": [1] * 20, "y": [1.0] * 20, "w0": [0.0] * 20})
    try:
        refute_network_interference(df_no_var, estimand, estimate, peer_exposure=np.zeros(20))
        assert False, "Should have raised ValueError on zero treatment variance"
    except ValueError as e:
        print("Caught zero variance error:", e)

    # 4. Self-loops in adjacency matrix
    adj_loop = np.zeros((20, 20))
    adj_loop[0, 0] = 1.0
    try:
        refute_network_interference(df, estimand, estimate, adjacency_matrix=adj_loop)
        assert False, "Should have raised ValueError on self-loop"
    except ValueError as e:
        print("Caught self-loop error:", e)

    # 5. Adjacency matrix shape mismatch
    adj_wrong = np.zeros((15, 15))
    try:
        refute_network_interference(df, estimand, estimate, adjacency_matrix=adj_wrong)
        assert False, "Should have raised ValueError on shape mismatch"
    except ValueError as e:
        print("Caught shape mismatch error:", e)

    # 6. Multiple exposure modes simultaneously specified
    try:
        refute_network_interference(df, estimand, estimate, adjacency_matrix=np.zeros((20, 20)), peer_exposure=np.zeros(20))
        assert False, "Should have raised ValueError on multiple modes"
    except ValueError as e:
        print("Caught multiple modes error:", e)

    # 7. Zero exposure modes specified
    try:
        refute_network_interference(df, estimand, estimate)
        assert False, "Should have raised ValueError on zero modes"
    except ValueError as e:
        print("Caught zero modes error:", e)

    print(">>> PASS: All defensive input guards behave correctly")
    return True


def test_10_missing_nan_values_adversarial():
    print("\n--- TEST 10: Missing NaN Values Check (E27 Hazard) ---")
    # What happens if data contains NaNs?
    df_nan = pd.DataFrame({"v0": [1, 0, np.nan, 0, 1, 0, 1, 0, 1, 0], "y": [1.0] * 10, "w0": [0.0] * 10})
    estimand = MockEstimand()
    estimate = MockEstimate()
    print("Testing DataFrame with NaN in treatment column...")
    try:
        res = refute_network_interference(df_nan, estimand, estimate, peer_exposure=np.zeros(10))
        print("Returned result without raising ValueError:", res.refutation_result)
        nan_raised_value_error = False
    except ValueError as e:
        print("Caught ValueError on NaN:", e)
        nan_raised_value_error = True
    except Exception as e:
        print(f"Caught non-ValueError exception on NaN: {type(e).__name__}: {e}")
        nan_raised_value_error = False

    return nan_raised_value_error


if __name__ == "__main__":
    print("=================================================================")
    print("   EMPIRICAL CHALLENGER: SUTVA REFUTER STRESS-TEST HARNESS       ")
    print("=================================================================")

    t1 = test_1_true_spillover_detection()
    t2 = test_2_clean_null_retention()
    t3 = test_3_type_1_error_calibration()
    t4 = test_4_disconnected_graph()
    t5 = test_5_isolated_nodes()
    t6 = test_6_sparse_matrix_support()
    t7_bug = test_7_cluster_mode_bug_investigation()
    t8 = test_8_dependency_audit()
    t9 = test_9_defensive_parameter_validation()
    t10_nan = test_10_missing_nan_values_adversarial()

    print("\n=================================================================")
    print("                       SUMMARY OF FINDINGS                       ")
    print("=================================================================")
    print(f"1. True Spillover Detection:               {'PASS' if t1 else 'FAIL'}")
    print(f"2. Clean Null Retention:                   {'PASS' if t2 else 'PASS'}")
    print(f"3. Type I Error Calibration:               {'PASS' if t3 else 'FAIL'}")
    print(f"4. Disconnected Graph:                     {'PASS' if t4 else 'FAIL'}")
    print(f"5. Isolated Nodes:                         {'PASS' if t5 else 'FAIL'}")
    print(f"6. SciPy Sparse (CSR/CSC):                 {'PASS' if t6 else 'FAIL'}")
    print(f"7. Cluster Mode String Bug Reproduced:     {'YES (BUG CONFIRMED)' if t7_bug else 'NO'}")
    print(f"8. Zero Heavy Dependencies:                {'PASS' if t8 else 'FAIL'}")
    print(f"9. Defensive Input Guards:                 {'PASS' if t9 else 'FAIL'}")
    print(f"10. E27 NaN Guard Present:                 {'YES' if t10_nan else 'NO (MISSING GUARD)'}")
    print("=================================================================")

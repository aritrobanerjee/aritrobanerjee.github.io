# Independent PR 3 Verification Test Suite
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

"""Comprehensive unit test suite for NetworkInterferenceRefuter and SUTVA testing."""

import numpy as np
import pandas as pd
import pytest
from scipy import sparse

from dowhy.causal_estimator import CausalEstimate
from dowhy.causal_identifier.identified_estimand import IdentifiedEstimand
# imported from local implementation above


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

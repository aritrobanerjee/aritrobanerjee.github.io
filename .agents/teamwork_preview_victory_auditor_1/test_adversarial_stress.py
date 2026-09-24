import sys
import os
import unittest
import numpy as np
import pandas as pd
from unittest.mock import patch

# Import PR 1 and PR 3 from our extracted test files
sys.path.insert(0, os.path.dirname(__file__))
from test_pr1_audit import (
    refutation_summary,
    RefutationSummary,
    _flatten_refutations,
    _determine_status_and_interpretation,
    _format_effect,
)
from test_pr3_audit import (
    NetworkInterferenceRefuter,
    refute_network_interference,
    MockEstimand,
    MockEstimate,
)
from dowhy.causal_refuter import CausalRefutation

class TestAdversarialStress(unittest.TestCase):

    def test_pure_python_markdown_fallback(self):
        """Simulate environment where tabulate is absent; verify pure-Python markdown table formatting."""
        ref = CausalRefutation(estimated_effect=1.0, new_effect=0.98, refutation_type="Refute: Add a random common cause")
        ref.add_significance_test_results({"p_value": 0.45})
        summary = refutation_summary([ref])

        with patch.object(pd.DataFrame, "to_markdown", side_effect=ImportError("No module named 'tabulate'")):
            md_out = summary.to_markdown()
            self.assertIn("### Causal Refutation Summary", md_out)
            self.assertIn("| Method", md_out)
            self.assertIn("| Add a random common cause", md_out)
            self.assertIn("| Robust", md_out)
            self.assertIn("*Note: Negative control", md_out)

    def test_string_and_bytes_recursion_guard(self):
        """Passing strings, bytes, and deeply nested junk must terminate without RecursionError."""
        deep_junk = ["top", b"bytes", 123, ["nested", [b"deep", ["deeper", [], (), set()]]]]
        summary = refutation_summary(deep_junk)
        self.assertTrue(summary.to_dataframe().empty)

        # Single string / bytes
        summary_str = refutation_summary("should_not_recurse")
        self.assertTrue(summary_str.to_dataframe().empty)

        summary_bytes = refutation_summary(b"bytes_data")
        self.assertTrue(summary_bytes.to_dataframe().empty)

    def test_edge_case_e01_zero_orig_effect(self):
        """original_effect == 0.0 must yield % Change == 'N/A' without ZeroDivisionError."""
        ref = CausalRefutation(estimated_effect=0.0, new_effect=0.15, refutation_type="Refute: Add a random common cause")
        ref.add_significance_test_results({"p_value": 0.50})
        summary = refutation_summary(ref)
        df = summary.to_dataframe()
        self.assertEqual(df.iloc[0]["% Change"], "N/A")
        self.assertEqual(df.iloc[0]["Original"], "0.0000")

    def test_edge_case_e02_missing_p_val(self):
        """Missing p-value on unobserved common cause must return Status='Sensitivity'."""
        ref = CausalRefutation(estimated_effect=1.2, new_effect=(0.5, 1.8), refutation_type="Refute: Add an Unobserved Common Cause")
        summary = refutation_summary(ref)
        df = summary.to_dataframe()
        self.assertEqual(df.iloc[0]["Status"], "Sensitivity")
        self.assertEqual(df.iloc[0]["p-value"], "N/A")
        self.assertIn("bounds", df.iloc[0]["Interpretation"])

    def test_edge_case_e03_tuple_bounds_formatting(self):
        """Tuple bounds must format cleanly as [min, max]."""
        self.assertEqual(_format_effect((1.23456, 7.89012)), "[1.2346, 7.8901]")
        self.assertEqual(_format_effect(None), "N/A")

    def test_edge_case_e13_disconnected_network(self):
        """All-zeros adjacency matrix must return p=1.0 and spillover=0.0 without crash."""
        n = 30
        df = pd.DataFrame({
            "v0": np.random.binomial(1, 0.5, n),
            "y": np.random.normal(0, 1, n),
        })
        adj = np.zeros((n, n))
        estimand = MockEstimand()
        estimate = MockEstimate(1.5)
        res = refute_network_interference(
            data=df,
            target_estimand=estimand,
            estimate=estimate,
            adjacency_matrix=adj,
            num_simulations=10,
        )
        self.assertEqual(res.refutation_result["p_value"], 1.0)
        self.assertEqual(res.refutation_result["spillover_coefficient"], 0.0)

    def test_edge_case_e14_isolated_nodes(self):
        """Network with isolated nodes (degree 0) must assign 0.0 exposure without NaN crash."""
        n = 30
        df = pd.DataFrame({
            "v0": np.random.binomial(1, 0.5, n),
            "y": np.random.normal(0, 1, n),
        })
        adj = np.zeros((n, n))
        # Connect only first 5 nodes
        for i in range(5):
            for j in range(5):
                if i != j:
                    adj[i, j] = 1.0
        estimand = MockEstimand()
        estimate = MockEstimate(1.5)
        res = refute_network_interference(
            data=df,
            target_estimand=estimand,
            estimate=estimate,
            adjacency_matrix=adj,
            num_simulations=10,
            random_state=42,
        )
        self.assertFalse(np.isnan(res.refutation_result["p_value"]))

    def test_edge_case_e15_self_loops_error(self):
        """Self loops (A_ii != 0) must raise ValueError."""
        n = 20
        df = pd.DataFrame({"v0": np.random.binomial(1, 0.5, n), "y": np.random.normal(0, 1, n)})
        adj = np.zeros((n, n))
        adj[2, 2] = 1.0
        with self.assertRaises(ValueError):
            refute_network_interference(
                data=df,
                target_estimand=MockEstimand(),
                estimate=MockEstimate(1.0),
                adjacency_matrix=adj,
            )

    def test_edge_case_e19_singleton_clusters(self):
        """Singleton clusters (|C_k| == 1) in cluster mode must assign 0.0 exposure without ZeroDivisionError."""
        n = 20
        # 10 clusters of size 1 (singletons) and 2 clusters of size 5
        clusters = [f"c_single_{i}" for i in range(10)] + ["c_group_1"] * 5 + ["c_group_2"] * 5
        df = pd.DataFrame({
            "v0": np.random.binomial(1, 0.5, n),
            "y": np.random.normal(0, 1, n),
            "cluster_col": clusters,
        })
        res = refute_network_interference(
            data=df,
            target_estimand=MockEstimand(),
            estimate=MockEstimate(1.0),
            cluster_ids="cluster_col",
            num_simulations=10,
            random_state=42,
        )
        self.assertFalse(np.isnan(res.refutation_result["p_value"]))
        self.assertIn("adjusted_direct_effect", res.refutation_result)

    def test_edge_case_e27_preflight_nan_check(self):
        """NaN values in treatment, outcome, or cluster columns must raise ValueError."""
        n = 20
        df = pd.DataFrame({
            "v0": [np.nan] + [1] * (n - 1),
            "y": np.random.normal(0, 1, n),
        })
        with self.assertRaises(ValueError):
            refute_network_interference(
                data=df,
                target_estimand=MockEstimand(),
                estimate=MockEstimate(1.0),
                peer_exposure=np.zeros(n),
            )

    def test_edge_case_e30_pseudocount_boundary(self):
        """Permutation p-value must obey p >= 1 / (1 + B) and never equal 0.0."""
        n = 50
        # Force massive spillover
        treatment = np.random.binomial(1, 0.5, n)
        adj = np.ones((n, n)) - np.eye(n)
        peer_exp = (adj @ treatment) / (n - 1)
        y = treatment * 2.0 + peer_exp * 50.0 + np.random.normal(0, 0.01, n)
        df = pd.DataFrame({"v0": treatment, "y": y})
        B = 20
        res = refute_network_interference(
            data=df,
            target_estimand=MockEstimand(),
            estimate=MockEstimate(2.0),
            adjacency_matrix=adj,
            num_simulations=B,
            random_state=42,
        )
        p = res.refutation_result["p_value"]
        min_p = 1.0 / (1.0 + B)
        self.assertGreaterEqual(p, min_p)
        self.assertGreater(p, 0.0)

if __name__ == "__main__":
    unittest.main()

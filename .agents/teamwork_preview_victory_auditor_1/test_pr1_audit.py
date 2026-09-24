# Independent PR 1 Verification Test Suite
"""dowhy/causal_refuters/refutation_summary.py

Standalone utility to format, interpret, and summarize single or multi-refuter outcomes in DoWhy.
Strictly adheres to < 150 LOC operational code with zero external dependencies beyond pandas/numpy.
"""
from typing import Any, Dict, Iterable, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from dowhy.causal_refuter import CausalRefutation


def _flatten_refutations(items: Any) -> Iterable[CausalRefutation]:
    """Recursively unwraps single refutations, lists, or nested iterables."""
    if isinstance(items, CausalRefutation):
        yield items
    elif isinstance(items, (str, bytes)):
        return
    elif isinstance(items, (list, tuple, set)) or hasattr(items, "__iter__"):
        for sub in items:
            yield from _flatten_refutations(sub)


def _format_effect(val: Any) -> str:
    """Safely formats scalar floats, bounds tuples, or numpy arrays into clean strings."""
    if val is None:
        return "N/A"
    if isinstance(val, (tuple, list)):
        return f"[{val[0]:.4f}, {val[1]:.4f}]" if len(val) == 2 else str(val)
    if isinstance(val, np.ndarray):
        if val.size == 1:
            return f"{float(val.item()):.4f}"
        return f"[{float(np.min(val)):.4f}, {float(np.max(val)):.4f}]"
    try:
        return f"{float(val):.4f}"
    except (TypeError, ValueError):
        return str(val)


def _determine_status_and_interpretation(
    name: str,
    orig_val: Any,
    new_val: Any,
    p_val: Optional[float],
    alpha: float,
    tolerance: float = 0.10,
) -> Tuple[str, str]:
    """Derives a descriptive robustness verdict and concise narrative interpretation."""
    name_lower = name.lower()
    if p_val is None or (isinstance(p_val, float) and np.isnan(p_val)):
        if "unobserved" in name_lower or "sensitivity" in name_lower:
            return "Sensitivity", f"Confounder sensitivity bounds: {_format_effect(new_val)}"
        return "N/A", "Diagnostic test completed without p-value"

    is_robust = p_val >= alpha
    status = "Robust" if is_robust else "Fragile"

    if "placebo" in name_lower or "dummy" in name_lower:
        if is_robust:
            return status, f"Passed: effect vanishes under negative control (p={p_val:.4f} >= {alpha})"
        return status, f"Failed: spurious effect detected under negative control (p={p_val:.4f} < {alpha})"

    # Invariant tests: Random Common Cause, Data Subset, Bootstrap
    if is_robust:
        try:
            if orig_val is not None and new_val is not None and not isinstance(new_val, (tuple, list)):
                orig_f = float(orig_val.item()) if isinstance(orig_val, np.ndarray) and orig_val.size == 1 else float(orig_val)
                new_f = float(new_val.item()) if isinstance(new_val, np.ndarray) and new_val.size == 1 else float(new_val)
                if abs(orig_f) > 1e-12:
                    rel_drift = abs(new_f - orig_f) / abs(orig_f)
                    if rel_drift > tolerance:
                        return "Fragile", f"Failed: estimate drifted by {rel_drift * 100:.1f}% exceeding tolerance ({tolerance * 100:.1f}%) despite p={p_val:.4f}"
        except (ValueError, TypeError):
            pass
        return status, f"Passed: estimate invariant to perturbation (p={p_val:.4f} >= {alpha})"
    return status, f"Failed: estimate shifted significantly under perturbation (p={p_val:.4f} < {alpha})"


class RefutationSummary:
    """Container for summarized causal refutations supporting multiple output formats."""

    def __init__(self, rows: List[Dict[str, Any]], alpha: float = 0.05):
        self.rows = rows
        self.alpha = alpha
        self._df = pd.DataFrame(rows)

    def to_dataframe(self) -> pd.DataFrame:
        """Returns the summary as a pandas DataFrame."""
        return self._df.copy()

    def to_markdown(self) -> str:
        """Returns the summary formatted as a GitHub-flavored Markdown table."""
        if self._df.empty:
            return "No refutations to summarize."
        header = f"### Causal Refutation Summary (alpha={self.alpha:.2f})\n"
        note = "\n*Note: Negative control & invariance tests pass when p >= alpha (retaining the null hypothesis).*\n"
        try:
            table = self._df.to_markdown(index=False)
        except (ImportError, ModuleNotFoundError):
            cols = list(self._df.columns)
            widths = [max(len(str(c)), max((len(str(v)) for v in self._df[c]), default=0)) for c in cols]
            h_str = "| " + " | ".join(c.ljust(w) for c, w in zip(cols, widths)) + " |"
            sep_str = "| " + " | ".join("-" * max(w, 3) for w in widths) + " |"
            rows_str = [
                "| " + " | ".join(str(val).ljust(w) for val, w in zip(row, widths)) + " |"
                for row in self._df.itertuples(index=False)
            ]
            table = "\n".join([h_str, sep_str] + rows_str)
        return header + table + note

    def to_text(self) -> str:
        """Returns the summary formatted as a clean plain-text table."""
        if self._df.empty:
            return "No refutations to summarize."
        header = f"=== Causal Refutation Summary (alpha={self.alpha:.2f}) ===\n"
        return header + self._df.to_string(index=False)

    def _repr_html_(self) -> str:
        """Jupyter notebook rich HTML display."""
        if self._df.empty:
            return "<p><em>No refutations to summarize.</em></p>"
        caption = f"<caption><strong>Causal Refutation Summary (alpha={self.alpha:.2f})</strong></caption>"
        return self._df.to_html(index=False, classes="table table-striped table-hover").replace(
            "<table", f"<table {caption}"
        )

    def __str__(self) -> str:
        return self.to_text()

    def __repr__(self) -> str:
        return self.to_text()


def refutation_summary(
    refutations: Union[CausalRefutation, Iterable[Union[CausalRefutation, Iterable[CausalRefutation]]]],
    significance_level: float = 0.05,
    effect_tolerance: float = 0.10,
    output_format: str = "container",
) -> Union[RefutationSummary, pd.DataFrame, str]:
    """Summarizes single or multiple CausalRefutation results into a structured table.

    :param refutations: A single CausalRefutation, a list of refutations, or nested lists.
    :param significance_level: Threshold alpha for evaluating statistical significance (default 0.05).
    :param effect_tolerance: Relative tolerance threshold for invariant effect drift (default 0.10).
    :param output_format: 'container' (RefutationSummary), 'dataframe' (pd.DataFrame), 'markdown' (str), or 'text' (str).
    :returns: RefutationSummary container, pd.DataFrame, or formatted string table.
    """
    flat_refs = [r for r in _flatten_refutations(refutations) if isinstance(r, CausalRefutation)]

    rows: List[Dict[str, Any]] = []
    for ref in flat_refs:
        raw_name = getattr(ref, "refutation_type", "Refutation Test")
        clean_name = raw_name[len("Refute:"):].strip() if raw_name.startswith("Refute:") else raw_name.strip()
        orig_val = getattr(ref, "estimated_effect", None)
        new_val = getattr(ref, "new_effect", None)
        res_dict = getattr(ref, "refutation_result", None)

        p_val = res_dict.get("p_value") if isinstance(res_dict, dict) else None
        if p_val is not None:
            try:
                p_val = float(p_val)
            except (ValueError, TypeError):
                p_val = np.nan

        # Percent change guard: avoid division by zero
        pct_change = "N/A"
        try:
            if orig_val is not None and new_val is not None and not isinstance(new_val, (tuple, list)):
                orig_f = float(orig_val.item()) if isinstance(orig_val, np.ndarray) and orig_val.size == 1 else float(orig_val)
                new_f = float(new_val.item()) if isinstance(new_val, np.ndarray) and new_val.size == 1 else float(new_val)
                if abs(orig_f) > 1e-12:
                    pct_change = f"{((new_f - orig_f) / abs(orig_f)) * 100:+.2f}%"
        except (ValueError, TypeError):
            pct_change = "N/A"

        status, interp = _determine_status_and_interpretation(
            clean_name, orig_val, new_val, p_val, significance_level, effect_tolerance
        )

        rows.append({
            "Method": clean_name,
            "Original": _format_effect(orig_val),
            "New Effect": _format_effect(new_val),
            "% Change": pct_change,
            "p-value": f"{p_val:.4f}" if p_val is not None and not np.isnan(p_val) else "N/A",
            "Status": status,
            "Interpretation": interp,
        })

    summary = RefutationSummary(rows, alpha=significance_level)
    if output_format == "dataframe":
        return summary.to_dataframe()
    elif output_format == "markdown":
        return summary.to_markdown()
    elif output_format == "text":
        return summary.to_text()
    return summary

"""tests/causal_refuters/test_refutation_summary.py

Unit tests for dowhy.causal_refuters.refutation_summary.
"""
import numpy as np
import pandas as pd
import pytest
from dowhy.causal_refuter import CausalRefutation
# imported from local implementation above


def _create_mock_refutation(ref_type: str, orig_eff: Any, new_eff: Any, p_val: Optional[float] = None):
    """Helper to construct synthetic CausalRefutation objects."""
    ref = CausalRefutation(estimated_effect=orig_eff, new_effect=new_eff, refutation_type=ref_type)
    if p_val is not None:
        ref.add_significance_test_results({"p_value": p_val, "is_statistically_significant": p_val < 0.05})
    return ref


class TestRefutationSummary:
    """Test suite covering ingestion, edge cases, formatting, and statistical verdicts."""

    def test_single_refutation_robust(self):
        """Invariant refuter with p >= 0.05 must be marked 'Robust'."""
        ref = _create_mock_refutation("Refute: Add a random common cause", 1.25, 1.24, 0.42)
        summary = refutation_summary(ref)

        df = summary.to_dataframe()
        assert len(df) == 1
        assert df.iloc[0]["Method"] == "Add a random common cause"
        assert df.iloc[0]["Status"] == "Robust"
        assert df.iloc[0]["p-value"] == "0.4200"
        assert "Passed" in df.iloc[0]["Interpretation"]

    def test_single_refutation_fragile(self):
        """Invariant refuter with p < 0.05 must be marked 'Fragile'."""
        ref = _create_mock_refutation("Refute: Use a subset of data", 1.50, 0.80, 0.012)
        summary = refutation_summary(ref)

        df = summary.to_dataframe()
        assert df.iloc[0]["Status"] == "Fragile"
        assert df.iloc[0]["p-value"] == "0.0120"
        assert "Failed" in df.iloc[0]["Interpretation"]

    def test_placebo_treatment_refuter(self):
        """Placebo test: p >= 0.05 indicates effect vanished (Robust); p < 0.05 indicates spurious effect (Fragile)."""
        placebo_pass = _create_mock_refutation("Refute: Use a Placebo Treatment", 2.0, 0.01, 0.85)
        placebo_fail = _create_mock_refutation("Refute: Use a Placebo Treatment", 2.0, 1.95, 0.002)

        summary = refutation_summary([placebo_pass, placebo_fail])
        df = summary.to_dataframe()

        assert df.iloc[0]["Status"] == "Robust"
        assert "Passed: effect vanishes" in df.iloc[0]["Interpretation"]
        assert df.iloc[1]["Status"] == "Fragile"
        assert "Failed: spurious effect detected" in df.iloc[1]["Interpretation"]

    def test_unobserved_common_cause_tuple_bounds(self):
        """Sensitivity test with tuple bounds and no p-value must report 'Sensitivity'."""
        ref = _create_mock_refutation("Refute: Add an Unobserved Common Cause", 1.20, (0.45, 1.85), None)
        summary = refutation_summary(ref)

        df = summary.to_dataframe()
        assert df.iloc[0]["Status"] == "Sensitivity"
        assert df.iloc[0]["p-value"] == "N/A"
        assert df.iloc[0]["New Effect"] == "[0.4500, 1.8500]"
        assert "bounds" in df.iloc[0]["Interpretation"]

    def test_nested_list_unwrapping_dummy_outcome(self):
        """Nested lists produced by DummyOutcomeRefuter must flatten cleanly."""
        ref1 = _create_mock_refutation("Refute: Use a Placebo Treatment", 1.0, 0.0, 0.90)
        ref2_sub1 = _create_mock_refutation("Refute: Use a Dummy Outcome (Permute)", 1.0, 0.02, 0.75)
        ref2_sub2 = _create_mock_refutation("Refute: Use a Dummy Outcome (Noise)", 1.0, 0.01, 0.80)
        nested_input = [ref1, [ref2_sub1, ref2_sub2]]

        summary = refutation_summary(nested_input)
        df = summary.to_dataframe()
        assert len(df) == 3
        assert list(df["Status"]) == ["Robust", "Robust", "Robust"]

    def test_original_effect_zero_division_guard(self):
        """Baseline effect equal to zero must not trigger ZeroDivisionError in % Change."""
        ref = _create_mock_refutation("Refute: Add a random common cause", 0.0, 0.05, 0.30)
        summary = refutation_summary(ref)

        df = summary.to_dataframe()
        assert df.iloc[0]["% Change"] == "N/A"
        assert df.iloc[0]["Original"] == "0.0000"

    def test_numpy_array_effects(self):
        """Single-element and multi-element numpy arrays must be formatted safely."""
        ref_scalar = _create_mock_refutation("Refute: Random Common Cause", np.array([2.5]), 2.45, 0.60)
        ref_arr = _create_mock_refutation("Refute: Bootstrap", 2.5, np.array([2.3, 2.7]), 0.40)

        summary = refutation_summary([ref_scalar, ref_arr])
        df = summary.to_dataframe()
        assert df.iloc[0]["Original"] == "2.5000"
        assert df.iloc[1]["New Effect"] == "[2.3000, 2.7000]"

    def test_output_formats(self):
        """Verifies container, dataframe, markdown, and text formats."""
        ref = _create_mock_refutation("Refute: Random Common Cause", 1.0, 1.01, 0.50)

        # Container
        res_container = refutation_summary(ref, output_format="container")
        assert isinstance(res_container, RefutationSummary)

        # DataFrame
        res_df = refutation_summary(ref, output_format="dataframe")
        assert isinstance(res_df, pd.DataFrame)
        assert not res_df.empty

        # Markdown
        res_md = refutation_summary(ref, output_format="markdown")
        assert isinstance(res_md, str)
        assert "| Method" in res_md
        assert "alpha=0.05" in res_md

        # Text
        res_text = refutation_summary(ref, output_format="text")
        assert isinstance(res_text, str)
        assert "=== Causal Refutation Summary" in res_text

    def test_custom_significance_level_alpha(self):
        """Verifies status determination with non-default alpha (e.g. 0.01)."""
        # p = 0.03 would be Fragile at alpha=0.05, but is Robust at alpha=0.01
        ref = _create_mock_refutation("Refute: Random Common Cause", 1.0, 0.95, 0.03)

        summary_05 = refutation_summary(ref, significance_level=0.05)
        assert summary_05.to_dataframe().iloc[0]["Status"] == "Fragile"

        summary_01 = refutation_summary(ref, significance_level=0.01)
        assert summary_01.to_dataframe().iloc[0]["Status"] == "Robust"

    def test_empty_and_invalid_inputs(self):
        """Empty inputs or lists of non-refutations must return clean empty structures without errors."""
        empty_summary = refutation_summary([])
        assert empty_summary.to_dataframe().empty
        assert "No refutations" in empty_summary.to_markdown()

        invalid_summary = refutation_summary(["not_a_refutation", 42])
        assert invalid_summary.to_dataframe().empty

    def test_invariant_effect_tolerance_drift(self):
        """Invariant test with p >= alpha but effect drift exceeding tolerance must be marked Fragile."""
        # Drift = |1.50 - 1.0| / 1.0 = 50% > 10% tolerance
        ref = _create_mock_refutation("Refute: Random Common Cause", 1.0, 1.50, 0.40)
        summary = refutation_summary(ref, effect_tolerance=0.10)
        df = summary.to_dataframe()
        assert df.iloc[0]["Status"] == "Fragile"
        assert "drifted" in df.iloc[0]["Interpretation"]


def test_end_to_end_synthetic_dowhy_pipeline():
    """Integration test: runs DoWhy synthetic linear data model and summarizes refutations."""
    from dowhy import CausalModel
    import dowhy.datasets

    data = dowhy.datasets.linear_dataset(
        beta=10,
        num_common_causes=4,
        num_instruments=1,
        num_samples=500,
        treatment_is_binary=True,
    )

    model = CausalModel(
        data=data["df"],
        treatment=data["treatment_name"],
        outcome=data["outcome_name"],
        graph=data["gml_graph"],
    )
    identified_estimand = model.identify_effect(proceed_when_unidentifiable=True)
    estimate = model.estimate_effect(identified_estimand, method_name="backdoor.linear_regression")

    # Run two real refutations
    ref_placebo = model.refute_estimate(
        identified_estimand, estimate, method_name="placebo_treatment_refuter", num_simulations=20
    )
    ref_random = model.refute_estimate(
        identified_estimand, estimate, method_name="random_common_cause", num_simulations=20
    )

    summary = refutation_summary([ref_placebo, ref_random])
    df = summary.to_dataframe()

    assert len(df) == 2
    assert set(df["Method"]) == {"Use a Placebo Treatment", "Add a random common cause"}
    assert all(df["Status"].isin(["Robust", "Fragile"]))
    assert "Passed" in df.iloc[0]["Interpretation"] or "Failed" in df.iloc[0]["Interpretation"]

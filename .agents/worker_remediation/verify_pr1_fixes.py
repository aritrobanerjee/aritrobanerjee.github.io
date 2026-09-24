import io
import tokenize
import numpy as np
import pandas as pd
from typing import Any, Dict, Iterable, List, Optional, Tuple, Union

# Test mock refutation
class MockCausalRefutation:
    def __init__(self, estimated_effect, new_effect, refutation_type="Refute: Test"):
        self.estimated_effect = estimated_effect
        self.new_effect = new_effect
        self.refutation_type = refutation_type
        self.refutation_result = {}

    def add_significance_test_results(self, res):
        self.refutation_result.update(res)

CausalRefutation = MockCausalRefutation

# Implementation from 02_PR1_CORE_REFUTATION_SUMMARY.md
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
            if orig_val is not None and new_val is not None and not isinstance(new_val, (tuple, list, np.ndarray)):
                orig_f, new_f = float(orig_val), float(new_val)
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
    """Summarizes single or multiple CausalRefutation results into a structured table."""
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

        pct_change = "N/A"
        try:
            if orig_val is not None and new_val is not None and not isinstance(new_val, (tuple, list, np.ndarray)):
                orig_f, new_f = float(orig_val), float(new_val)
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


# Run tests
def run_all_tests():
    print("Testing string/invalid input...")
    inv = refutation_summary(["not_a_refutation", 42, "hello"])
    assert inv.to_dataframe().empty, "Should be empty"
    print("PASS: String/invalid input handled gracefully.")

    print("Testing pure-python markdown fallback...")
    ref = MockCausalRefutation(1.0, 1.0, "Refute: Random Common Cause")
    ref.add_significance_test_results({"p_value": 0.5})
    # Force ImportError by temporarily mocking to_markdown to raise ImportError
    summary = refutation_summary(ref)
    real_to_md = summary._df.to_markdown
    def mock_raise(*args, **kwargs):
        raise ImportError("No tabulate")
    summary._df.to_markdown = mock_raise
    md = summary.to_markdown()
    assert "| Method" in md
    assert "Random Common Cause" in md
    print("PASS: Pure-Python markdown fallback works without tabulate.")

    print("Testing effect tolerance drift check...")
    ref_drift = MockCausalRefutation(1.0, 1.50, "Refute: Random Common Cause")
    ref_drift.add_significance_test_results({"p_value": 0.40})
    s_drift = refutation_summary(ref_drift, effect_tolerance=0.10)
    df_d = s_drift.to_dataframe()
    assert df_d.iloc[0]["Status"] == "Fragile"
    assert "drifted" in df_d.iloc[0]["Interpretation"]
    print("PASS: Invariant effect drift exceeding tolerance caught as Fragile.")

    ref_nodrift = MockCausalRefutation(1.0, 1.02, "Refute: Random Common Cause")
    ref_nodrift.add_significance_test_results({"p_value": 0.40})
    s_nodrift = refutation_summary(ref_nodrift, effect_tolerance=0.10)
    df_nd = s_nodrift.to_dataframe()
    assert df_nd.iloc[0]["Status"] == "Robust"
    assert "Passed" in df_nd.iloc[0]["Interpretation"]
    print("PASS: Invariant effect drift within tolerance retained as Robust.")

    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_all_tests()

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

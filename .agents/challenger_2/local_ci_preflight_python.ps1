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

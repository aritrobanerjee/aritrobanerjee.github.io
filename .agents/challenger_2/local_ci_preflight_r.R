# ==============================================================================
# Script: local_ci_preflight_r.R
# Purpose: Pre-Flight CI Quality Gate for R Packages (GeoLift, CausalImpact)
# Enforces: styler, lintr, testthat, and R CMD check --as-cran
# ==============================================================================

options(warn = 1)

message("==============================================================================")
message(">>> STARTING LOCAL CI PRE-FLIGHT VERIFICATION (R ECOSYSTEM) <<<")
message("==============================================================================")

# 1. Package Dependency Check
required_packages <- c("devtools", "lintr", "styler", "testthat", "roxygen2")
for (pkg in required_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop(sprintf("Required package '%s' is missing. Install with: install.packages('%s')", pkg, pkg))
  }
}
message("✓ All required R development packages are installed.")

# 2. Code Formatting Check (styler)
message("\n[Step 1/4] Checking Code Style & Formatting (styler)...")
style_diff <- styler::style_pkg(dry = "on")
if (any(style_diff$changed)) {
  changed_files <- style_diff$file[style_diff$changed]
  stop(sprintf(
    "Styler detected formatting inconsistencies in:\n%s\nRemediation: Run 'styler::style_pkg()' locally.",
    paste(" - ", changed_files, collapse = "\n")
  ))
}
message("✓ Code formatting strictly adheres to tidyverse style guide.")

# 3. Static Code Analysis & Linting (lintr)
message("\n[Step 2/4] Running Static Analysis (lintr)...")
lints <- lintr::lint_package(
  linters = lintr::linters_with_defaults(
    line_length_linter = lintr::line_length_linter(100),
    commented_code_linter = lintr::commented_code_linter(),
    object_usage_linter = lintr::object_usage_linter()
  )
)

if (length(lints) > 0) {
  print(lints)
  stop(sprintf("Lint issues detected (%d issues). Fix all warnings before submission.", length(lints)))
}
message("✓ Zero linter warnings detected.")

# 4. Unit Testing (testthat)
message("\n[Step 3/4] Running Package Test Suite (testthat)...")
test_results <- devtools::test()
res_df <- as.data.frame(test_results)
total_failed <- sum(res_df$failed)
total_errors <- sum(res_df$error)

if (total_failed > 0 || total_errors > 0) {
  stop(sprintf("Test failures detected: %d failed, %d errors.", total_failed, total_errors))
}
message(sprintf("✓ All %d test contexts passed cleanly.", nrow(res_df)))

# 5. Comprehensive R CMD check with --as-cran
message("\n[Step 4/4] Executing Comprehensive 'R CMD check --as-cran'...")
check_results <- devtools::check(
  document = TRUE,
  manual = FALSE,
  cran = TRUE,
  args = c("--no-manual", "--as-cran"),
  error_on = "warning" # Zero warnings or errors allowed on CRAN track
)

if (length(check_results$errors) > 0) {
  stop("R CMD check failed with ERRORS.")
}
if (length(check_results$warnings) > 0) {
  stop("R CMD check failed with WARNINGS. Zero warnings allowed on CRAN submission track.")
}

message("\n==============================================================================")
message(">>> SUCCESS: ALL R PRE-FLIGHT CHECKS PASSED DETERMINISTICALLY! <<<")
message("Zero errors, zero warnings, zero linter notes.")
message("==============================================================================")

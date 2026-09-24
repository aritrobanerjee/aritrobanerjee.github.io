import re
import ast
import tokenize
import io

md_path = r"C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\02_PR1_CORE_REFUTATION_SUMMARY.md"
with open(md_path, encoding="utf-8") as f:
    content = f.read()

# Match Section 5 code block
match = re.search(r"## 5\. Complete Production Implementation.*?```python\s*(.*?)\s*```", content, re.DOTALL)
if not match:
    print("ERROR: Section 5 code block not found")
    exit(1)

code = match.group(1)
raw_lines = code.splitlines()

# Parse AST
tree = ast.parse(code)

# Tokenize to identify comments
tokens = list(tokenize.tokenize(io.BytesIO(code.encode("utf-8")).readline))
comment_lines = set()
for tok in tokens:
    if tok.type == tokenize.COMMENT:
        comment_lines.add(tok.start[0])

# Find docstrings via AST
docstring_lines = set()
for node in ast.walk(tree):
    if isinstance(node, (ast.Module, ast.FunctionDef, ast.ClassDef, ast.AsyncFunctionDef)):
        first_body = node.body[0] if node.body else None
        if isinstance(first_body, ast.Expr) and isinstance(first_body.value, ast.Constant) and isinstance(first_body.value.value, str):
            for l in range(first_body.lineno, first_body.end_lineno + 1):
                docstring_lines.add(l)

blank_lines = set()
import_lines = set()
for i, line in enumerate(raw_lines, 1):
    if not line.strip():
        blank_lines.add(i)

for node in ast.walk(tree):
    if isinstance(node, (ast.Import, ast.ImportFrom)):
        for l in range(node.lineno, node.end_lineno + 1):
            import_lines.add(l)

operational_lines_no_import = set(range(1, len(raw_lines) + 1)) - blank_lines - comment_lines - docstring_lines - import_lines
operational_lines_with_import = set(range(1, len(raw_lines) + 1)) - blank_lines - comment_lines - docstring_lines

print(f"Total raw lines in code block: {len(raw_lines)}")
print(f"Blank lines: {len(blank_lines)}")
print(f"Comment lines: {len(comment_lines)}")
print(f"Docstring lines: {len(docstring_lines)}")
print(f"Import lines: {len(import_lines)}")
print(f"Operational lines (excl docstrings, comments, blanks, imports): {len(operational_lines_no_import)}")
print(f"Operational lines (excl docstrings, comments, blanks, incl imports): {len(operational_lines_with_import)}")

# Statement count
stmt_count = sum(1 for node in ast.walk(tree) if isinstance(node, ast.stmt) and not isinstance(node, (ast.Import, ast.ImportFrom)))
print(f"AST statement count (excl imports): {stmt_count}")

# Verify acceptance criterion: < 150 LOC
assert len(operational_lines_no_import) < 150, f"Operational LOC {len(operational_lines_no_import)} >= 150"
assert len(operational_lines_with_import) < 150, f"Operational LOC with imports {len(operational_lines_with_import)} >= 150"
print("SUCCESS: PR 1 operational code is strictly < 150 lines.")

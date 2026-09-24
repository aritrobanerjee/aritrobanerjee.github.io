import re
import ast
import io
import tokenize

with open(r"c:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy\02_PR1_CORE_REFUTATION_SUMMARY.md", "r", encoding="utf-8") as f:
    text = f.read()

# find the section
pattern = r"## 5\..*?```python\n(.*?)\n```"
match = re.search(pattern, text, re.DOTALL)
if not match:
    # try looser pattern
    pattern = r"```python\n(.*?)def refutation_summary\(.*?```"
    match = re.search(pattern, text, re.DOTALL)

if match:
    code = match.group(1)
    if "def refutation_summary" not in code:
        # find full block
        start_idx = text.find("```python\n\"\"\"dowhy/causal_refuters/refutation_summary.py")
        end_idx = text.find("\n```\n\n---", start_idx)
        code = text[start_idx + len("```python\n"):end_idx]

    raw_lines = code.split("\n")
    print(f"Total raw lines: {len(raw_lines)}")

    tree = ast.parse(code)
    docstring_lines = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.Module)):
            doc = ast.get_docstring(node, clean=False)
            if doc:
                for n in getattr(node, "body", []):
                    if isinstance(n, ast.Expr) and isinstance(n.value, ast.Constant) and n.value.value == doc:
                        for l in range(n.lineno, n.end_lineno + 1):
                            docstring_lines.add(l)

    tokens = list(tokenize.generate_tokens(io.StringIO(code).readline))
    comment_lines = set()
    code_lines = set()
    for tok in tokens:
        if tok.type == tokenize.COMMENT:
            comment_lines.add(tok.start[0])
        elif tok.type not in (tokenize.NL, tokenize.NEWLINE, tokenize.INDENT, tokenize.DEDENT, tokenize.ENDMARKER):
            if tok.start[0] not in docstring_lines:
                code_lines.add(tok.start[0])

    import_lines = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            for l in range(node.lineno, node.end_lineno + 1):
                import_lines.add(l)

    print(f"Docstring lines: {len(docstring_lines)}")
    print(f"Comment lines: {len(comment_lines)}")
    blank_lines = sum(1 for l in raw_lines if not l.strip())
    print(f"Blank lines: {blank_lines}")
    print(f"Imports lines: {len(import_lines)}")
    print(f"Operational SLOC (with imports): {len(code_lines)}")
    print(f"Operational SLOC (excluding imports): {len(code_lines - import_lines)}")
    print(f"Budget (< 150 LOC): {len(code_lines)} < 150 -> {'COMPLIANT' if len(code_lines) < 150 else 'NON-COMPLIANT'}")
else:
    print("Match failed")

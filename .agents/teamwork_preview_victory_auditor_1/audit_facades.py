import glob
import re
import ast
import os

deliverables_dir = r"C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy"
md_files = glob.glob(os.path.join(deliverables_dir, "*.md"))

facades = []
functions_checked = 0

for md in md_files:
    fname = os.path.basename(md)
    with open(md, encoding="utf-8") as f:
        content = f.read()
    
    code_blocks = re.findall(r"```python\s*(.*?)\s*```", content, re.DOTALL)
    for b_idx, b in enumerate(code_blocks):
        try:
            tree = ast.parse(b)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    functions_checked += 1
                    # Check body
                    # If body is just 'pass' or 'return <constant>' or 'raise NotImplementedError'
                    body = [stmt for stmt in node.body if not (isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant) and isinstance(stmt.value.value, str))] # ignore docstring
                    if len(body) == 1:
                        stmt = body[0]
                        if isinstance(stmt, ast.Pass):
                            facades.append((fname, node.name, "Single pass statement"))
                        elif isinstance(stmt, ast.Return) and isinstance(stmt.value, ast.Constant):
                            facades.append((fname, node.name, f"Return constant: {stmt.value.value}"))
                        elif isinstance(stmt, ast.Raise):
                            if isinstance(stmt.exc, ast.Call) and getattr(stmt.exc.func, "id", None) == "NotImplementedError":
                                facades.append((fname, node.name, "Raises NotImplementedError"))
        except SyntaxError:
            pass

print(f"Functions/methods checked: {functions_checked}")
print(f"Facades found: {len(facades)}")
for f in facades:
    print(f"  {f}")

if len(facades) > 0:
    print("WARNING/FAIL: Facade functions detected")
else:
    print("SUCCESS: Zero facade functions found.")

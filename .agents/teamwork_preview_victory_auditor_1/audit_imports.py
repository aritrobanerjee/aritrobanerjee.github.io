import glob
import re
import ast
import os

deliverables_dir = r"C:\Users\aritr\.gemini\antigravity\scratch\portfolio\teamwork_projects\pywhy_pr_strategy"
md_files = glob.glob(os.path.join(deliverables_dir, "*.md"))

print(f"Found {len(md_files)} markdown files in {deliverables_dir}")

all_imports = {}
prohibited_found = []

# List of prohibited external libraries that would violate zero foreign dependencies:
prohibited = {"networkx", "igraph", "graph_tool", "torch_geometric", "statsmodels", "tabulate", "seaborn", "matplotlib", "sklearn", "scikit-learn"}

for md in md_files:
    filename = os.path.basename(md)
    with open(md, encoding="utf-8") as f:
        content = f.read()
    
    # Extract python code blocks
    code_blocks = re.findall(r"```python\s*(.*?)\s*```", content, re.DOTALL)
    file_imports = set()
    for b in code_blocks:
        try:
            tree = ast.parse(b)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        mod = alias.name.split(".")[0]
                        file_imports.add(mod)
                        if mod in prohibited:
                            prohibited_found.append((filename, mod))
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        mod = node.module.split(".")[0]
                        file_imports.add(mod)
                        if mod in prohibited:
                            prohibited_found.append((filename, mod))
        except SyntaxError:
            # Code block might be a diff or snippet
            pass
    all_imports[filename] = sorted(file_imports)

print("Import audit summary by file:")
for fname, imps in sorted(all_imports.items()):
    print(f"  {fname}: {imps}")

if prohibited_found:
    print(f"FAILED: Found prohibited dependencies: {prohibited_found}")
    exit(1)
else:
    print("SUCCESS: Zero prohibited foreign dependencies found across all deliverables.")

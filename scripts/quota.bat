@echo off
set "PY_PATH=%USERPROFILE%\AppData\Roaming\uv\python\cpython-3.11.16-windows-x86_64-none\python.exe"
if exist "%PY_PATH%" (
    "%PY_PATH%" "%~dp0analyze_quota.py" %*
) else (
    python "%~dp0analyze_quota.py" %*
)

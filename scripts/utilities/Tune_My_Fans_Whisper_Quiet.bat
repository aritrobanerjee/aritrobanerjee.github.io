@echo off
set "PS_SCRIPT=%~dp0tune_fans.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%PS_SCRIPT%\"\"'"

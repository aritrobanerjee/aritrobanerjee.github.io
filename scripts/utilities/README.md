# System Utilities

## FanControl Tuning Scripts

Scripts to configure **FanControl** for whisper-quiet desktop operation on high-density AMD Ryzen CPUs (e.g. Ryzen 7 5800XT).

### Files
- **`tune_fans.ps1`**: PowerShell script that pairs CPU & case fans to the `Graph` fan curve, configures 3-second step-up hysteresis, enables "Start Minimized", and registers the Windows Task Scheduler auto-start task with highest privileges.
- **`Tune_My_Fans_Whisper_Quiet.bat`**: One-click elevated wrapper to execute `tune_fans.ps1` as Administrator.

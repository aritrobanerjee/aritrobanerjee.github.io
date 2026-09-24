# FanControl Whisper-Quiet Setup & Auto-Startup Script
$ErrorActionPreference = "Stop"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   Configuring FanControl Auto-Start & Minimize       " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$cachePath = 'C:\PROGRA~2\FanControl\Configurations\CACHE'
$appPath = 'C:\PROGRA~2\FanControl\FanControl.exe'

try {
    # 1. Update CACHE to StartMinimized = true
    if (Test-Path -LiteralPath $cachePath) {
        $cacheJson = Get-Content -LiteralPath $cachePath -Raw | ConvertFrom-Json
        $cacheJson.Main.StartMinimized = $true
        $newCacheText = $cacheJson | ConvertTo-Json -Depth 10
        [System.IO.File]::WriteAllText($cachePath, $newCacheText)
        Write-Host "[1/2] Configured 'Start Minimized' = TRUE in CACHE" -ForegroundColor Green
    } else {
        Write-Host "[1/2] CACHE file not found, skipping." -ForegroundColor Yellow
    }

    # 2. Register elevated Windows Scheduled Task so it starts with Windows without UAC prompts
    $taskCmd = "schtasks.exe"
    $taskArgs = @('/create', '/tn', 'FanControl', '/tr', 'C:\PROGRA~2\FanControl\FanControl.exe', '/sc', 'onlogon', '/rl', 'highest', '/f')
    & $taskCmd $taskArgs
    Write-Host "[2/2] Registered Windows Auto-Start Task (Starts on Login with Highest Privileges)" -ForegroundColor Green

    Write-Host "`n>>> SUCCESS: FanControl will now start with Windows automatically and minimized to the tray!" -ForegroundColor Cyan

} catch {
    Write-Host "`n[ERROR]: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

$headers = @{ 'User-Agent' = 'GitHubFileFetcher' }
foreach ($f in @('textual_interpreter.py', 'textual_effect_interpreter.py')) {
    $url = "https://raw.githubusercontent.com/py-why/dowhy/main/dowhy/interpreters/$f"
    $content = Invoke-RestMethod -Uri $url -Headers $headers
    $content | Out-File -FilePath "C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\$f" -Encoding utf8
    Write-Output "Downloaded $f, length: $((Get-Content "C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\$f").Length)"
}

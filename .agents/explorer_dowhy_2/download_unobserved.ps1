$headers = @{ 'User-Agent' = 'GitHubFileFetcher' }
$url = "https://raw.githubusercontent.com/py-why/dowhy/main/dowhy/causal_refuters/add_unobserved_common_cause.py"
$content = Invoke-RestMethod -Uri $url -Headers $headers
$content | Out-File -FilePath "C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\add_unobserved_common_cause.py" -Encoding utf8
Write-Output "Downloaded add_unobserved_common_cause.py, length: $((Get-Content "C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\add_unobserved_common_cause.py").Length)"

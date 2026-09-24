$headers = @{ 'User-Agent' = 'GitHubFileFetcher' }
$url = 'https://raw.githubusercontent.com/py-why/dowhy/main/dowhy/causal_refuter.py'
$content = Invoke-RestMethod -Uri $url -Headers $headers
$content | Out-File -FilePath 'C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\causal_refuter.py' -Encoding utf8
Write-Output "Downloaded causal_refuter.py successfully, line count: $((Get-Content 'C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\causal_refuter.py').Length)"

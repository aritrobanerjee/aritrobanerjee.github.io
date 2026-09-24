$headers = @{ 'User-Agent' = 'GitHubFileFetcher' }
foreach ($f in @('data_subset_refuter.py', 'dummy_outcome_refuter.py', 'bootstrap_refuter.py')) {
    $url = "https://raw.githubusercontent.com/py-why/dowhy/main/dowhy/causal_refuters/$f"
    $content = Invoke-RestMethod -Uri $url -Headers $headers
    $content | Out-File -FilePath "C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\$f" -Encoding utf8
    Write-Output "Downloaded $f, length: $((Get-Content "C:\Users\aritr\.gemini\antigravity\scratch\portfolio\.agents\explorer_dowhy_2\$f").Length)"
}

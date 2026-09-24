$headers = @{ 'User-Agent' = 'GitHubFileFetcher' }
$url = 'https://api.github.com/repos/py-why/dowhy/contents/dowhy/causal_refuters'
$items = Invoke-RestMethod -Uri $url -Headers $headers
foreach ($i in $items) {
    Write-Output "$($i.type): $($i.name)"
}

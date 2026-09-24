$headers = @{ 'User-Agent' = 'GitHubIssueFetcher' }
$comments = Invoke-RestMethod -Uri 'https://api.github.com/repos/py-why/dowhy/issues/847/comments' -Headers $headers
foreach ($c in $comments) {
    Write-Output "================== $($c.user.login) ($($c.created_at)) =================="
    Write-Output $c.body
}

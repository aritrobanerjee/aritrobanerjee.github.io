$headers = @{ 'User-Agent' = 'GitHubIssueFetcher' }
$issue = Invoke-RestMethod -Uri "https://api.github.com/repos/py-why/dowhy/issues/929" -Headers $headers
Write-Output "Title: $($issue.title)"
Write-Output "Author: $($issue.user.login)"
Write-Output "Body:"
Write-Output $issue.body
$comments = Invoke-RestMethod -Uri "https://api.github.com/repos/py-why/dowhy/issues/929/comments" -Headers $headers
foreach ($c in $comments) {
    Write-Output "=== Comment by $($c.user.login) ==="
    Write-Output $c.body
}

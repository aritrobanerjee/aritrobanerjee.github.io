$headers = @{ 'User-Agent' = 'GitHubIssueFetcher' }

foreach ($num in @(847, 532)) {
    Write-Output "=================================================="
    Write-Output "=== ISSUE $num ==="
    Write-Output "=================================================="
    try {
        $issue = Invoke-RestMethod -Uri "https://api.github.com/repos/py-why/dowhy/issues/$num" -Headers $headers
        Write-Output "Title: $($issue.title)"
        Write-Output "Author: $($issue.user.login)"
        Write-Output "Created: $($issue.created_at)"
        Write-Output "Updated: $($issue.updated_at)"
        Write-Output "State: $($issue.state)"
        Write-Output "Labels: $(($issue.labels | ForEach-Object { $_.name }) -join ', ')"
        Write-Output "`nBody:"
        Write-Output $issue.body
        
        $comments = Invoke-RestMethod -Uri "https://api.github.com/repos/py-why/dowhy/issues/$num/comments" -Headers $headers
        Write-Output "`n--- Comments count: $($comments.Count) ---"
        foreach ($c in $comments) {
            Write-Output "`n----------------------------------------"
            Write-Output "Comment by $($c.user.login) on $($c.created_at):"
            Write-Output $c.body
        }
    } catch {
        Write-Output "Error fetching issue $num : $_"
    }
}

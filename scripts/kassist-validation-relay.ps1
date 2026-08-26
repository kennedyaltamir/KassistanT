#requires -Version 5.1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoPath = "C:\Users\Kennedy Oliveira\Desktop\KassisT"
$GitHubRepo = "kennedyaltamir/KassistanT"
$IntegrationBase = "integration/kassist-final"
$ValidationRoot = Join-Path $env:LOCALAPPDATA "KassisT\ValidationRelay"
$ReportsDir = Join-Path $ValidationRoot "reports"
$EvidenceRoot = Join-Path $ValidationRoot "evidence"
$WorktreesRoot = Join-Path $ValidationRoot "worktrees"
$LogsDir = Join-Path $ValidationRoot "logs"
$StateFile = Join-Path $ValidationRoot "state.json"
$StateTempFile = Join-Path $ValidationRoot "state.tmp.json"
$PollSeconds = 30
$GateTimeoutSeconds = 900
$GlobalValidationTimeoutSeconds = 3600
$CommentExcerptMaxChars = 4000
$MutexName = "Global\KassisT_ValidationRelay"
$ValidationMarker = "<!-- KASSIST-AUTO-VALIDATION -->"

foreach ($dir in @($ValidationRoot, $ReportsDir, $EvidenceRoot, $WorktreesRoot, $LogsDir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

function Write-RelayLog {
    param(
        [Parameter(Mandatory = $true)][string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR")][string]$Level = "INFO"
    )

    $line = "[{0}][{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level, $Message
    Write-Host $line
    $logFile = Join-Path $LogsDir ("relay-" + (Get-Date -Format "yyyy-MM-dd") + ".log")
    Add-Content -LiteralPath $logFile -Value $line -Encoding utf8
}

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][int]$TimeoutSeconds,
        [string]$StdOutPath,
        [string]$StdErrPath
    )

    $stdoutOwned = [string]::IsNullOrWhiteSpace($StdOutPath)
    $stderrOwned = [string]::IsNullOrWhiteSpace($StdErrPath)

    if ($stdoutOwned) {
        $StdOutPath = Join-Path $env:TEMP ("kassist-relay-" + [guid]::NewGuid().ToString("N") + ".stdout")
    }

    if ($stderrOwned) {
        $StdErrPath = Join-Path $env:TEMP ("kassist-relay-" + [guid]::NewGuid().ToString("N") + ".stderr")
    }

    $process = $null

    try {
        $process = Start-Process `
            -FilePath $FilePath `
            -ArgumentList $Arguments `
            -WorkingDirectory $WorkingDirectory `
            -NoNewWindow `
            -PassThru `
            -RedirectStandardOutput $StdOutPath `
            -RedirectStandardError $StdErrPath

        $completed = $process.WaitForExit($TimeoutSeconds * 1000)
        $null = $completed

        if (-not $completed) {
            try {
                $kill = Start-Process `
                    -FilePath "taskkill.exe" `
                    -ArgumentList @("/PID", [string]$process.Id, "/T", "/F") `
                    -NoNewWindow `
                    -Wait `
                    -PassThru
                $null = $kill
            }
            catch {
                Write-RelayLog -Message ("Unable to terminate process tree: " + $_.Exception.Message) -Level "ERROR"
            }

            throw "Command timed out after ${TimeoutSeconds}s: $FilePath $($Arguments -join ' ')"
        }

        $stdout = ""
        $stderr = ""

        if (Test-Path -LiteralPath $StdOutPath) {
            $stdout = Get-Content -LiteralPath $StdOutPath -Raw -Encoding utf8
        }

        if (Test-Path -LiteralPath $StdErrPath) {
            $stderr = Get-Content -LiteralPath $StdErrPath -Raw -Encoding utf8
        }

        return [pscustomobject]@{
            ExitCode = $process.ExitCode
            StdOut = $stdout
            StdErr = $stderr
            StdOutPath = $StdOutPath
            StdErrPath = $StdErrPath
            TimedOut = $false
        }
    }
    finally {
        if ($stdoutOwned -and (Test-Path -LiteralPath $StdOutPath)) {
            Remove-Item -LiteralPath $StdOutPath -Force -ErrorAction SilentlyContinue
        }

        if ($stderrOwned -and (Test-Path -LiteralPath $StdErrPath)) {
            Remove-Item -LiteralPath $StdErrPath -Force -ErrorAction SilentlyContinue
        }
    }
}

function Assert-Tool {
    param([Parameter(Mandatory = $true)][string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($null -eq $cmd) {
        throw "Required tool not found: $Name"
    }
    return [string]$cmd.Source
}

function Assert-Environment {
    $null = Assert-Tool "git"
    $null = Assert-Tool "gh"
    $null = Assert-Tool "pnpm"
    $null = Assert-Tool "node"

    if (-not (Test-Path -LiteralPath $RepoPath)) {
        throw "Repository path does not exist: $RepoPath"
    }

    $root = Invoke-ExternalCommand "git" @("-C", $RepoPath, "rev-parse", "--show-toplevel") $RepoPath 60
    if ($root.ExitCode -ne 0) {
        throw "Configured path is not a valid Git repository."
    }

    $gitRoot = $root.StdOut.Trim()
    if ([System.IO.Path]::GetFullPath($gitRoot) -ne [System.IO.Path]::GetFullPath($RepoPath)) {
        throw "Git root mismatch. Expected=$RepoPath Actual=$gitRoot"
    }

    $remote = Invoke-ExternalCommand "git" @("-C", $RepoPath, "remote", "get-url", "origin") $RepoPath 60
    if ($remote.ExitCode -ne 0) {
        throw "Unable to resolve origin."
    }

    $url = $remote.StdOut.Trim()
    if ($url -notmatch "github\.com[/:]kennedyaltamir/KassistanT(?:\.git)?$") {
        throw "Unexpected origin remote: $url"
    }

    $auth = Invoke-ExternalCommand "gh" @("auth", "status") $RepoPath 60
    if ($auth.ExitCode -ne 0) {
        throw "GitHub CLI authentication failed."
    }
}

function Get-ToolVersions {
    $git = Invoke-ExternalCommand "git" @("--version") $RepoPath 30
    $node = Invoke-ExternalCommand "node" @("--version") $RepoPath 30
    $pnpm = Invoke-ExternalCommand "pnpm" @("--version") $RepoPath 30
    $gh = Invoke-ExternalCommand "gh" @("--version") $RepoPath 30

    return [pscustomobject]@{
        Git = $git.StdOut.Trim()
        Node = $node.StdOut.Trim()
        Pnpm = $pnpm.StdOut.Trim()
        Gh = $gh.StdOut.Trim()
    }
}

function New-EmptyState {
    return [pscustomobject]@{
        version = 6
        entries = @{}
    }
}

function Load-State {
    if (-not (Test-Path -LiteralPath $StateFile)) {
        return New-EmptyState
    }

    try {
        $raw = (Get-Content -LiteralPath $StateFile -Raw -Encoding utf8) | ConvertFrom-Json
        $entries = @{}

        if ($null -ne $raw.entries) {
            foreach ($p in $raw.entries.PSObject.Properties) {
                $entries[$p.Name] = $p.Value
            }
        }

        return [pscustomobject]@{
            version = if ($null -ne $raw.version) { [int]$raw.version } else { 6 }
            entries = $entries
        }
    }
    catch {
        $backup = Join-Path $ValidationRoot ("state.corrupt-" + (Get-Date -Format "yyyyMMdd-HHmmss-fff") + ".json")
        try {
            Move-Item -LiteralPath $StateFile -Destination $backup -Force
        }
        catch {
            Write-RelayLog -Message ("Unable to preserve corrupt state: " + $_.Exception.Message) -Level "ERROR"
        }

        Write-RelayLog -Message "Invalid state.json; starting fresh state." -Level "WARN"
        return New-EmptyState
    }
}

function Save-State {
    param([Parameter(Mandatory = $true)]$State)

    $payload = [ordered]@{
        version = 6
        entries = [ordered]@{}
    }

    foreach ($key in $State.entries.Keys) {
        $payload.entries[$key] = $State.entries[$key]
    }

    $json = $payload | ConvertTo-Json -Depth 40

    Set-Content -LiteralPath $StateTempFile -Value $json -Encoding utf8

    if (Test-Path -LiteralPath $StateFile) {
        try {
            [System.IO.File]::Replace($StateTempFile, $StateFile, $null, $true)
        }
        catch {
            Move-Item -LiteralPath $StateTempFile -Destination $StateFile -Force
        }
    }
    else {
        Move-Item -LiteralPath $StateTempFile -Destination $StateFile -Force
    }
}

function Get-StateKey {
    param([int]$PrNumber, [string]$Sha)
    return "PR#$PrNumber@$Sha"
}

function Get-StateEntry {
    param([int]$PrNumber, [string]$Sha)
    $key = Get-StateKey $PrNumber $Sha
    if ($State.entries.ContainsKey($key)) {
        return $State.entries[$key]
    }
    return $null
}

function Should-SkipSHA {
    param([int]$PrNumber, [string]$Sha)
    $entry = Get-StateEntry $PrNumber $Sha
    if ($null -eq $entry) {
        return $false
    }
    return @("PASS", "FAIL", "BLOCKED", "STALE_NOT_PUBLISHED") -contains ([string]$entry.result)
}

function Get-RemoteBranchSha {
    param([Parameter(Mandatory = $true)][string]$Branch)
    $r = Invoke-ExternalCommand "git" @("-C", $RepoPath, "ls-remote", "origin", "refs/heads/$Branch") $RepoPath 60
    if ($r.ExitCode -ne 0) {
        throw "Unable to inspect origin/$Branch"
    }
    $line = $r.StdOut.Trim()
    if ([string]::IsNullOrWhiteSpace($line)) {
        throw "Remote branch missing: origin/$Branch"
    }
    return ([string]($line -split "\s+")[0]).Trim()
}

function Get-CanonicalSnapshot {
    return [ordered]@{
        main = Get-RemoteBranchSha "main"
        MVP = Get-RemoteBranchSha "MVP"
        MVP2 = Get-RemoteBranchSha "MVP2"
    }
}

function Assert-CanonicalSnapshotUnchanged {
    param([Parameter(Mandatory = $true)]$Before)
    $after = Get-CanonicalSnapshot
    foreach ($branch in @("main", "MVP", "MVP2")) {
        if ([string]$Before[$branch] -ne [string]$after[$branch]) {
            throw "CRITICAL: canonical branch changed unexpectedly: $branch"
        }
    }
    return $after
}

function Get-IntegrationPRs {
    $r = Invoke-ExternalCommand "gh" @(
        "pr", "list", "--repo", $GitHubRepo,
        "--base", $IntegrationBase,
        "--state", "open",
        "--limit", "50",
        "--json", "number,title,state,headRefName,headRefOid,baseRefName"
    ) $RepoPath 120

    if ($r.ExitCode -ne 0) {
        throw "Unable to query integration PRs."
    }

    if ([string]::IsNullOrWhiteSpace($r.StdOut)) {
        return @()
    }

    return @($r.StdOut | ConvertFrom-Json)
}

function Get-CurrentPR {
    param([Parameter(Mandatory = $true)][int]$PrNumber)

    $r = Invoke-ExternalCommand "gh" @(
        "pr", "view", "$PrNumber", "--repo", $GitHubRepo,
        "--json", "number,title,state,headRefName,headRefOid,baseRefName"
    ) $RepoPath 120

    if ($r.ExitCode -ne 0) {
        throw "Unable to query PR #$PrNumber."
    }

    return ($r.StdOut | ConvertFrom-Json)
}

function Assert-PRCorrelation {
    param(
        [int]$PrNumber,
        [string]$ExpectedBranch,
        [string]$ExpectedSha
    )

    $pr = Get-CurrentPR $PrNumber

    if ([string]$pr.state -ne "OPEN") {
        throw "PR #$PrNumber is not OPEN."
    }
    if ([string]$pr.baseRefName -ne $IntegrationBase) {
        throw "PR #$PrNumber base changed unexpectedly."
    }
    if ([string]$pr.headRefName -ne $ExpectedBranch) {
        throw "PR #$PrNumber head branch changed unexpectedly."
    }
    if ([string]$pr.headRefOid -ne $ExpectedSha) {
        throw "STALE SHA: PR#$PrNumber expected=$ExpectedSha actual=$($pr.headRefOid)"
    }

    return $pr
}

function Get-WorktreePath {
    param([int]$PrNumber, [string]$Sha)
    $short = $Sha.Substring(0, [Math]::Min(12, $Sha.Length))
    return Join-Path $WorktreesRoot ("PR-{0}-{1}" -f $PrNumber, $short)
}

function Prepare-Worktree {
    param([int]$PrNumber, [string]$Sha)

    $path = Get-WorktreePath $PrNumber $Sha

    $fetch = Invoke-ExternalCommand "git" @("-C", $RepoPath, "fetch", "origin", "--prune") $RepoPath 300
    if ($fetch.ExitCode -ne 0) {
        throw "git fetch failed."
    }

    if (Test-Path -LiteralPath $path) {
        $remove = Invoke-ExternalCommand "git" @("-C", $RepoPath, "worktree", "remove", "--force", $path) $RepoPath 120
        if ($remove.ExitCode -ne 0 -or (Test-Path -LiteralPath $path)) {
            throw "Existing relay worktree could not be safely removed; path preserved: $path"
        }
    }

    $add = Invoke-ExternalCommand "git" @(
        "-C", $RepoPath,
        "worktree", "add", "--detach", $path, $Sha
    ) $RepoPath 300

    if ($add.ExitCode -ne 0) {
        throw "git worktree add failed; path preserved when created: $path"
    }

    $head = Invoke-ExternalCommand "git" @("-C", $path, "rev-parse", "HEAD") $path 60
    if ($head.ExitCode -ne 0) {
        throw "Unable to verify validation worktree HEAD."
    }

    if ($head.StdOut.Trim() -ne $Sha) {
        throw "WORKTREE SHA MISMATCH. expected=$Sha actual=$($head.StdOut.Trim())"
    }

    $status = Invoke-ExternalCommand "git" @("-C", $path, "status", "--porcelain") $path 60
    if ($status.ExitCode -ne 0) {
        throw "Unable to inspect validation worktree."
    }

    if (-not [string]::IsNullOrWhiteSpace($status.StdOut.Trim())) {
        throw "Validation worktree is not clean."
    }

    return [string]$path
}

function Remove-ValidationWorktree {
    param([Parameter(Mandatory = $true)][string]$WorktreePath)

    if (-not (Test-Path -LiteralPath $WorktreePath)) {
        return
    }

    $r = Invoke-ExternalCommand "git" @(
        "-C", $RepoPath,
        "worktree", "remove", "--force", $WorktreePath
    ) $RepoPath 120

    if ($r.ExitCode -ne 0 -or (Test-Path -LiteralPath $WorktreePath)) {
        throw "Worktree cleanup failed; path preserved: $WorktreePath"
    }

    $prune = Invoke-ExternalCommand "git" @("-C", $RepoPath, "worktree", "prune") $RepoPath 60
    if ($prune.ExitCode -ne 0) {
        Write-RelayLog "git worktree prune failed." "WARN"
    }
}

function Get-EvidenceDirectory {
    param([int]$PrNumber, [string]$Sha)
    $short = $Sha.Substring(0, [Math]::Min(12, $Sha.Length))
    $path = Join-Path $EvidenceRoot ("PR-{0}-{1}" -f $PrNumber, $short)
    New-Item -ItemType Directory -Force -Path $path | Out-Null
    return [string]$path
}

function Get-GateDefinitions {
    return @(
        [pscustomobject]@{ Name="INSTALL"; Command="pnpm"; Arguments=@("install", "--frozen-lockfile") }
        [pscustomobject]@{ Name="LINT"; Command="pnpm"; Arguments=@("lint") }
        [pscustomobject]@{ Name="TYPECHECK"; Command="pnpm"; Arguments=@("typecheck") }
        [pscustomobject]@{ Name="GATEWAY_TEST"; Command="pnpm"; Arguments=@("--filter", "@kassist/gateway", "test") }
        [pscustomobject]@{ Name="DESKTOP_TEST"; Command="pnpm"; Arguments=@("--filter", "@kassist/desktop", "test") }
        [pscustomobject]@{ Name="FULL_TEST"; Command="pnpm"; Arguments=@("test") }
        [pscustomobject]@{ Name="BUILD"; Command="pnpm"; Arguments=@("build") }
    )
}

function Run-Gate {
    param(
        [string]$Name,
        [string]$Command,
        [string[]]$Arguments,
        [string]$WorktreePath,
        [string]$EvidenceDirectory,
        [datetime]$Deadline
    )

    $remaining = [int][Math]::Floor(($Deadline - (Get-Date)).TotalSeconds)

    if ($remaining -le 0) {
        return [pscustomobject]@{
            Name=$Name; Status="SKIPPED"; ExitCode=$null; DurationMs=0
            Error="Global validation deadline exceeded."
            StdOutPath=$null; StdErrPath=$null
        }
    }

    $timeout = [Math]::Min($GateTimeoutSeconds, $remaining)
    $stdoutPath = Join-Path $EvidenceDirectory ($Name.ToLowerInvariant() + ".stdout.txt")
    $stderrPath = Join-Path $EvidenceDirectory ($Name.ToLowerInvariant() + ".stderr.txt")
    $start = Get-Date

    try {
        $r = Invoke-ExternalCommand $Command $Arguments $WorktreePath $timeout $stdoutPath $stderrPath
        $durationMs = [int](((Get-Date) - $start).TotalMilliseconds)

        if ($r.ExitCode -eq 0) {
            return [pscustomobject]@{
                Name=$Name; Status="PASS"; ExitCode=0; DurationMs=$durationMs
                Error=$null; StdOutPath=$stdoutPath; StdErrPath=$stderrPath
            }
        }

        return [pscustomobject]@{
            Name=$Name; Status="FAIL"; ExitCode=$r.ExitCode; DurationMs=$durationMs
            Error="Command exited with code $($r.ExitCode)."
            StdOutPath=$stdoutPath; StdErrPath=$stderrPath
        }
    }
    catch {
        $durationMs = [int](((Get-Date) - $start).TotalMilliseconds)
        $isTimeout = $_.Exception.Message -like "Command timed out*"
        $status = if ($isTimeout) { "TIMEOUT" } else { "BLOCKED" }

        return [pscustomobject]@{
            Name=$Name; Status=$status; ExitCode=-1; DurationMs=$durationMs
            Error=$_.Exception.Message; StdOutPath=$stdoutPath; StdErrPath=$stderrPath
        }
    }
}

function Run-Validation {
    param([string]$WorktreePath, [string]$EvidenceDirectory)

    $deadline = (Get-Date).AddSeconds($GlobalValidationTimeoutSeconds)
    $defs = @(Get-GateDefinitions)
    $results = New-Object System.Collections.Generic.List[object]

    foreach ($d in $defs) {
        $gate = Run-Gate $d.Name $d.Command $d.Arguments $WorktreePath $EvidenceDirectory $deadline
        $results.Add($gate)

        if (@("FAIL", "TIMEOUT", "BLOCKED") -contains [string]$gate.Status) {
            foreach ($remaining in ($defs | Select-Object -Skip $results.Count)) {
                $results.Add([pscustomobject]@{
                    Name=$remaining.Name; Status="SKIPPED"; ExitCode=$null; DurationMs=0
                    Error="Skipped after $($gate.Status)."; StdOutPath=$null; StdErrPath=$null
                })
            }
            break
        }
    }

    while ($results.Count -lt 7) {
        $d = $defs[$results.Count]
        $results.Add([pscustomobject]@{
            Name=$d.Name; Status="SKIPPED"; ExitCode=$null; DurationMs=0
            Error="Not executed."; StdOutPath=$null; StdErrPath=$null
        })
    }

    return $results.ToArray()
}

function Get-OverallStatus {
    param([object[]]$Results)
    $items = @($Results)

    if ($items.Count -ne 7) { return "BLOCKED" }
    if (@($items | Where-Object { [string]$_.Status -eq "FAIL" }).Count -gt 0) { return "FAIL" }
    if (@($items | Where-Object { [string]$_.Status -in @("TIMEOUT", "BLOCKED", "SKIPPED") }).Count -gt 0) { return "BLOCKED" }
    if (@($items | Where-Object { [string]$_.Status -eq "PASS" }).Count -eq 7) { return "PASS" }
    return "BLOCKED"
}

function Sanitize-EvidenceText {
    param([string]$Text)
    if ($null -eq $Text) { return "" }
    $x = [string]$Text
    $x = $x -replace "(?i)(authorization\s*[:=]\s*bearer\s+)[^\s]+", '$1[REDACTED]'
    $x = $x -replace "(?i)(password\s*[:=]\s*)\S+", '$1[REDACTED]'
    $x = $x -replace "(?i)(token\s*[:=]\s*)\S+", '$1[REDACTED]'
    $x = $x -replace "(?i)(secret\s*[:=]\s*)\S+", '$1[REDACTED]'
    if ($x.Length -gt $CommentExcerptMaxChars) { $x = $x.Substring(0, $CommentExcerptMaxChars) + "`r`n...[truncated]" }
    return $x
}

function Read-EvidenceText {
    param([string]$Path)
    if ([string]::IsNullOrWhiteSpace($Path)) { return "" }
    if (-not (Test-Path -LiteralPath $Path)) { return "" }
    return Get-Content -LiteralPath $Path -Raw -Encoding utf8
}

function Build-GateTable {
    param([object[]]$Results)
    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add("| Gate | Status | Exit Code | Duration |")
    $lines.Add("|---|---|---:|---:|")
    foreach ($r in @($Results)) {
        $exit = if ($null -eq $r.ExitCode) { "-" } else { [string]$r.ExitCode }
        $duration = if ($null -eq $r.DurationMs) { "-" } else { "{0}s" -f [Math]::Round(([double]$r.DurationMs / 1000), 2) }
        $lines.Add("| $($r.Name) | $($r.Status) | $exit | $duration |")
    }
    return $lines -join "`r`n"
}

function Build-ValidationReport {
    param(
        [int]$PrNumber,
        [string]$PrTitle,
        [string]$Branch,
        [string]$Sha,
        [object[]]$Results,
        [string]$HeadAtDiscovery,
        [string]$HeadAtValidation,
        [string]$HeadAtPublication,
        [string]$EvidenceDirectory,
        $ToolVersions
    )

    $overall = Get-OverallStatus $Results
    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add($ValidationMarker)
    $lines.Add("<!-- KASSIST-AUTO-VALIDATION-ID: PR=$PrNumber SHA=$Sha -->")
    $lines.Add("")
    $lines.Add("# KassisT Automated Windows Validation")
    $lines.Add("")
    $lines.Add("**PR:** #$PrNumber")
    $lines.Add("")
    $lines.Add("**Title:** $PrTitle")
    $lines.Add("")
    $lines.Add("**Branch:** ``$Branch``")
    $lines.Add("")
    $lines.Add("**SHA:** ``$Sha``")
    $lines.Add("")
    $lines.Add("**Overall:** **$overall**")
    $lines.Add("")
    $lines.Add("## SHA Correlation")
    $lines.Add("")
    $lines.Add("HEAD at discovery: ``$HeadAtDiscovery``")
    $lines.Add("")
    $lines.Add("HEAD validated: ``$HeadAtValidation``")
    $lines.Add("")
    $lines.Add("HEAD before publication: ``$HeadAtPublication``")
    $lines.Add("")
    $lines.Add("## Gates")
    $lines.Add("")
    $lines.Add((Build-GateTable $Results))
    $lines.Add("")
    $lines.Add("## Evidence")
    $lines.Add("")
    $lines.Add("Full stdout/stderr is stored locally under ``$EvidenceDirectory``.")

    foreach ($r in @($Results)) {
        if ([string]$r.Status -in @("PASS", "SKIPPED")) { continue }

        $stderr = Sanitize-EvidenceText (Read-EvidenceText $r.StdErrPath)
        $stdout = Sanitize-EvidenceText (Read-EvidenceText $r.StdOutPath)

        $lines.Add("")
        $lines.Add("### $($r.Name)")
        $lines.Add("")

        if ($r.Error) {
            $lines.Add("**Error:** $($r.Error)")
            $lines.Add("")
        }

        if ($stderr) {
            $lines.Add("**stderr excerpt:**")
            $lines.Add("")
            $lines.Add("````text")
            $lines.Add($stderr)
            $lines.Add("````")
        }

        if ($stdout) {
            $lines.Add("")
            $lines.Add("**stdout excerpt:**")
            $lines.Add("")
            $lines.Add("````text")
            $lines.Add($stdout)
            $lines.Add("````")
        }
    }

    $lines.Add("")
    $lines.Add("## Environment")
    $lines.Add("")
    $lines.Add("Git: ``$($ToolVersions.Git)``")
    $lines.Add("")
    $lines.Add("Node: ``$($ToolVersions.Node)``")
    $lines.Add("")
    $lines.Add("pnpm: ``$($ToolVersions.Pnpm)``")
    $lines.Add("")
    $lines.Add("gh: ``$($ToolVersions.Gh)``")
    $lines.Add("")
    $lines.Add("## Governance")
    $lines.Add("")
    $lines.Add("MERGE = NO")
    $lines.Add("")
    $lines.Add("RELEASE = NO")
    $lines.Add("")
    $lines.Add("APPROVED = NO")
    $lines.Add("")
    $lines.Add("No merge, rebase, cherry-pick, push, force-push or branch deletion is performed by the relay.")

    return $lines -join "`r`n"
}

function Build-BlockedReport {
    param(
        [int]$PrNumber,
        [string]$Branch,
        [string]$Sha,
        [string]$Reason,
        [string]$ErrorMessage
    )

    return @"
$ValidationMarker
<!-- KASSIST-AUTO-VALIDATION-ID: PR=$PrNumber SHA=$Sha -->

# KassisT Automated Windows Validation

**PR:** #$PrNumber

**Branch:** ``$Branch``

**SHA:** ``$Sha``

## Result

**$Reason**

## Error

````text
$ErrorMessage
````

## Governance

MERGE = NO

RELEASE = NO

APPROVED = NO

No merge, rebase, cherry-pick, push, force-push, release or branch deletion was performed.
"@
}

function Save-Report {
    param([int]$PrNumber,[string]$Sha,[string]$Report)
    $short = $Sha.Substring(0, [Math]::Min(12, $Sha.Length))
    $path = Join-Path $ReportsDir ("pr-{0}-{1}.md" -f $PrNumber, $short)
    Set-Content -LiteralPath $path -Value $Report -Encoding utf8
    return [string]$path
}

function New-JsonBodyFile {
    param([string]$Body)
    $path = Join-Path $env:TEMP ("kassist-relay-body-" + [guid]::NewGuid().ToString("N") + ".json")
    @{ body = $Body } | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $path -Encoding utf8
    return [string]$path
}

function Find-AutomatedComment {
    param([int]$PrNumber,[string]$Sha)
    $r = Invoke-ExternalCommand "gh" @("api","--paginate","--slurp","repos/$GitHubRepo/issues/$PrNumber/comments") $RepoPath 120
    if ($r.ExitCode -ne 0) { throw "Unable to inspect PR comments." }
    if ([string]::IsNullOrWhiteSpace($r.StdOut)) { return $null }
    $pages = $r.StdOut | ConvertFrom-Json
    $identity = "<!-- KASSIST-AUTO-VALIDATION-ID: PR=$PrNumber SHA=$Sha -->"
    foreach ($page in @($pages)) {
        foreach ($comment in @($page)) {
            $body = [string]$comment.body
            if ($body.Contains($ValidationMarker) -and $body.Contains($identity)) { return $comment }
        }
    }
    return $null
}

function Publish-Report {
    param([int]$PrNumber,[string]$Sha,[string]$Report)
    $existing = Find-AutomatedComment $PrNumber $Sha
    $jsonPath = New-JsonBodyFile $Report
    try {
        if ($null -ne $existing) {
            $endpoint = "repos/$GitHubRepo/issues/comments/$($existing.id)"
            $r = Invoke-ExternalCommand "gh" @("api",$endpoint,"--method","PATCH","--input",$jsonPath) $RepoPath 120
            if ($r.ExitCode -ne 0) { throw "PR comment PATCH failed." }
            return [pscustomobject]@{ Action="UPDATED"; CommentId=[int64]$existing.id }
        }

        $endpoint = "repos/$GitHubRepo/issues/$PrNumber/comments"
        $r = Invoke-ExternalCommand "gh" @("api",$endpoint,"--method","POST","--input",$jsonPath) $RepoPath 120
        if ($r.ExitCode -ne 0) { throw "PR comment POST failed." }
        $response = $r.StdOut | ConvertFrom-Json
        return [pscustomobject]@{ Action="CREATED"; CommentId=if($null -ne $response.id){[int64]$response.id}else{$null} }
    }
    finally {
        if (Test-Path -LiteralPath $jsonPath) { Remove-Item -LiteralPath $jsonPath -Force -ErrorAction SilentlyContinue }
    }
}

function Process-PR {
    param([Parameter(Mandatory=$true)]$PR)

    $prNumber=[int]$PR.number
    $prTitle=[string]$PR.title
    $branch=[string]$PR.headRefName
    $sha=[string]$PR.headRefOid

    if ([string]$PR.baseRefName -ne $IntegrationBase) { return }
    if ([string]::IsNullOrWhiteSpace($sha)) { return }

    $key = Get-StateKey $prNumber $sha
    $entry = Get-StateEntry $prNumber $sha

    if ($null -ne $entry -and @("PASS","FAIL","BLOCKED","STALE_NOT_PUBLISHED") -contains ([string]$entry.result)) {
        Write-RelayLog "Skipping terminal PR#$prNumber SHA=$sha"
        return
    }

    if ($null -ne $entry -and [string]$entry.result -eq "PUBLISH_FAILED") {
        $current = Assert-PRCorrelation $prNumber $branch $sha
        $reportPath=[string]$entry.report_path
        if ([string]::IsNullOrWhiteSpace($reportPath) -or -not(Test-Path -LiteralPath $reportPath)) { throw "PUBLISH_FAILED has no preserved report." }
        $report=Get-Content -LiteralPath $reportPath -Raw -Encoding utf8
        $pub=Publish-Report $prNumber $sha $report
        $State.entries[$key]=[ordered]@{pr=$prNumber;branch=$branch;sha=$sha;result=[string]$entry.validation_result;validation_result=[string]$entry.validation_result;publication_result=$pub.Action;comment_id=$pub.CommentId;report_path=$reportPath;evidence_directory=[string]$entry.evidence_directory;timestamp=(Get-Date).ToString("o")}
        Save-State $State
        return
    }

    $worktree=$null
    $canonicalBefore=$null

    try {
        $canonicalBefore=Get-CanonicalSnapshot
        $current=Assert-PRCorrelation $prNumber $branch $sha

        $State.entries[$key]=[ordered]@{pr=$prNumber;branch=$branch;sha=$sha;result="IN_PROGRESS";validation_result="IN_PROGRESS";started_at=(Get-Date).ToString("o");head_at_discovery=[string]$current.headRefOid}
        Save-State $State

        $versions=Get-ToolVersions
        $worktree=Prepare-Worktree $prNumber $sha
        $head=Invoke-ExternalCommand "git" @("-C",$worktree,"rev-parse","HEAD") $worktree 60
        if($head.ExitCode-ne 0){throw "Unable to verify validation HEAD."}
        $headAtValidation=$head.StdOut.Trim()
        if($headAtValidation-ne $sha){throw "Validation SHA mismatch."}

        $evidence=Get-EvidenceDirectory $prNumber $sha
        $results=@(Run-Validation $worktree $evidence)
        $overall=Get-OverallStatus $results

        $status=Invoke-ExternalCommand "git" @("-C",$worktree,"status","--porcelain") $worktree 60
        if($status.ExitCode-ne 0){throw "Unable to inspect final validation worktree."}
        if(-not [string]::IsNullOrWhiteSpace($status.StdOut.Trim())){throw "Validation modified the worktree."}

        $beforePub=Assert-PRCorrelation $prNumber $branch $sha
        $headAtPublication=[string]$beforePub.headRefOid

        $report=Build-ValidationReport $prNumber $prTitle $branch $sha $results $sha $headAtValidation $headAtPublication $evidence $versions
        $reportPath=Save-Report $prNumber $sha $report

        try {
            $pub=Publish-Report $prNumber $sha $report
        }
        catch {
            $State.entries[$key]=[ordered]@{pr=$prNumber;branch=$branch;sha=$sha;result="PUBLISH_FAILED";validation_result=$overall;report_path=$reportPath;evidence_directory=$evidence;timestamp=(Get-Date).ToString("o");error=$_.Exception.Message}
            Save-State $State
            throw
        }

        $State.entries[$key]=[ordered]@{pr=$prNumber;branch=$branch;sha=$sha;result=$overall;validation_result=$overall;publication_result=$pub.Action;comment_id=$pub.CommentId;report_path=$reportPath;evidence_directory=$evidence;timestamp=(Get-Date).ToString("o");head_at_discovery=$sha;head_at_validation=$headAtValidation;head_at_publication=$headAtPublication}
        Save-State $State
        Write-RelayLog "RESULT $overall PR#$prNumber SHA=$sha"
    }
    catch {
        $message=$_.Exception.Message
        $stale=$false
        try {
            $c=Get-CurrentPR $prNumber
            if([string]$c.state-ne "OPEN" -or [string]$c.baseRefName-ne $IntegrationBase -or [string]$c.headRefName-ne $branch -or [string]$c.headRefOid-ne $sha){$stale=$true}
        } catch {}

        if($stale){
            $State.entries[$key]=[ordered]@{pr=$prNumber;branch=$branch;sha=$sha;result="STALE_NOT_PUBLISHED";timestamp=(Get-Date).ToString("o");error=$message}
            Save-State $State
            return
        }

        $blocked=Build-BlockedReport $prNumber $branch $sha "BLOCKED" $message
        $reportPath=Save-Report $prNumber $sha $blocked
        $pubState="PUBLISH_FAILED"
        try { Assert-PRCorrelation $prNumber $branch $sha | Out-Null; $p=Publish-Report $prNumber $sha $blocked; $pubState=$p.Action } catch {}
        $State.entries[$key]=[ordered]@{pr=$prNumber;branch=$branch;sha=$sha;result="BLOCKED";publication_result=$pubState;report_path=$reportPath;timestamp=(Get-Date).ToString("o");error=$message}
        Save-State $State
    }
    finally {
        if($null-ne $worktree){try{Remove-ValidationWorktree $worktree}catch{Write-RelayLog ("WORKTREE CLEANUP BLOCKED: "+$_.Exception.Message) "ERROR"}}
        if($null-ne $canonicalBefore){try{Assert-CanonicalSnapshotUnchanged $canonicalBefore|Out-Null}catch{Write-RelayLog ("CRITICAL CANONICAL SAFETY FAILURE: "+$_.Exception.Message) "ERROR";throw}}
        Set-Location -LiteralPath $RepoPath
    }
}

function Enter-RelayMutex {
    param([Parameter(Mandatory=$true)][System.Threading.Mutex]$Mutex)
    try { $acquired=$Mutex.WaitOne(0) }
    catch [System.Threading.AbandonedMutexException] { $acquired=$true;Write-RelayLog "Recovered abandoned mutex." "WARN" }
    if(-not $acquired){throw "Another KassisT Validation Relay instance is already running."}
}

$State=Load-State
$mutex=New-Object System.Threading.Mutex($false,$MutexName)
try {
    Enter-RelayMutex $mutex
    Assert-Environment
    Write-RelayLog "KassisT Validation Relay v4 started."
    Write-RelayLog "Repository: $RepoPath"
    Write-RelayLog "Integration base: $IntegrationBase"
    Write-RelayLog "Poll interval: $PollSeconds seconds"
    Write-RelayLog "Merge/push/rebase/cherry-pick/release/delete: DISABLED"

    while($true){
        $loopStart=Get-Date
        try{
            Set-Location -LiteralPath $RepoPath
            $before=Get-CanonicalSnapshot
            $prs=@(Get-IntegrationPRs)
            foreach($pr in $prs){
                try { Process-PR $pr }
                catch { Write-RelayLog ("PR processing error PR#"+$pr.number+": "+$_.Exception.Message) "ERROR" }
                Assert-CanonicalSnapshotUnchanged $before | Out-Null
            }
            Assert-CanonicalSnapshotUnchanged $before | Out-Null
        }catch{Write-RelayLog ("MAIN LOOP ERROR: "+$_.Exception.Message) "ERROR"}
        $elapsed=((Get-Date)-$loopStart).TotalSeconds
        $sleep=[Math]::Max(1,$PollSeconds-[int][Math]::Floor($elapsed))
        Start-Sleep -Seconds $sleep
    }
}
finally {
    if($null-ne $mutex){try{$null=$mutex.ReleaseMutex()}catch{};$mutex.Dispose()}
}

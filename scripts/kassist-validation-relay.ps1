#requires -Version 5.1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ============================================================
# KassisT Validation Relay
# Validation and PR evidence publication only.
# ============================================================

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
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR")]
        [string]$Level = "INFO"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp][$Level] $Message"
    Write-Host $line

    $logFile = Join-Path $LogsDir ("relay-" + (Get-Date -Format "yyyy-MM-dd") + ".log")
    Add-Content -LiteralPath $logFile -Value $line -Encoding utf8
}

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,
        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory,
        [Parameter(Mandatory = $true)]
        [int]$TimeoutSeconds,
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

        $finished = $process.WaitForExit($TimeoutSeconds * 1000)

        if (-not $finished) {
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
            StdOut = if ($null -eq $stdout) { "" } else { [string]$stdout }
            StdErr = if ($null -eq $stderr) { "" } else { [string]$stderr }
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
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

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

    $root = Invoke-ExternalCommand `
        -FilePath "git" `
        -Arguments @("-C", $RepoPath, "rev-parse", "--show-toplevel") `
        -WorkingDirectory $RepoPath `
        -TimeoutSeconds 60

    if ($root.ExitCode -ne 0) {
        throw "Configured repository path is not a valid Git repository."
    }

    $gitRoot = $root.StdOut.Trim()
    if ([System.IO.Path]::GetFullPath($gitRoot) -ne [System.IO.Path]::GetFullPath($RepoPath)) {
        throw "Git root mismatch. Expected=$RepoPath Actual=$gitRoot"
    }

    $remote = Invoke-ExternalCommand `
        -FilePath "git" `
        -Arguments @("-C", $RepoPath, "remote", "get-url", "origin") `
        -WorkingDirectory $RepoPath `
        -TimeoutSeconds 60

    if ($remote.ExitCode -ne 0) {
        throw "Unable to resolve origin remote."
    }

    $url = $remote.StdOut.Trim()
    if ($url -notmatch "github\.com[/:]kennedyaltamir/KassistanT(?:\.git)?$") {
        throw "Unexpected origin remote: $url"
    }

    $auth = Invoke-ExternalCommand `
        -FilePath "gh" `
        -Arguments @("auth", "status") `
        -WorkingDirectory $RepoPath `
        -TimeoutSeconds 60

    if ($auth.ExitCode -ne 0) {
        throw "GitHub CLI authentication failed."
    }

    Write-RelayLog "Environment validation PASS."
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
        version = 1
        entries = @{}
    }
}

function Load-State {
    if (-not (Test-Path -LiteralPath $StateFile)) {
        return New-EmptyState
    }

    try {
        $json = Get-Content -LiteralPath $StateFile -Raw -Encoding utf8
        if ([string]::IsNullOrWhiteSpace($json)) {
            throw "state.json is empty."
        }

        $raw = $json | ConvertFrom-Json
        $entries = @{}

        if ($null -ne $raw.entries) {
            foreach ($p in $raw.entries.PSObject.Properties) {
                $entries[$p.Name] = $p.Value
            }
        }

        return [pscustomobject]@{
            version = if ($null -ne $raw.version) { [int]$raw.version } else { 1 }
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
    param(
        [Parameter(Mandatory = $true)]
        $State
    )

    $payload = [ordered]@{
        version = 1
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
    param(
        [int]$PrNumber,
        [string]$Sha
    )

    return "PR#$PrNumber@$Sha"
}

function Get-StateEntry {
    param(
        [int]$PrNumber,
        [string]$Sha
    )

    $key = Get-StateKey $PrNumber $Sha
    if ($State.entries.ContainsKey($key)) {
        return $State.entries[$key]
    }

    return $null
}

function Should-SkipSHA {
    param(
        [int]$PrNumber,
        [string]$Sha
    )

    $entry = Get-StateEntry $PrNumber $Sha
    if ($null -eq $entry) {
        return $false
    }

    return @(
        "PASS",
        "FAIL",
        "BLOCKED",
        "STALE_NOT_PUBLISHED"
    ) -contains ([string]$entry.result)
}

function Get-RemoteBranchSha {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Branch
    )

    $result = Invoke-ExternalCommand `
        -FilePath "git" `
        -Arguments @("-C", $RepoPath, "ls-remote", "origin", "refs/heads/$Branch") `
        -WorkingDirectory $RepoPath `
        -TimeoutSeconds 60

    if ($result.ExitCode -ne 0) {
        throw "Unable to inspect origin/$Branch."
    }

    $line = $result.StdOut.Trim()
    if ([string]::IsNullOrWhiteSpace($line)) {
        throw "Remote canonical branch missing: origin/$Branch"
    }

    return [string](($line -split "\s+")[0]).Trim()
}

function Get-CanonicalSnapshot {
    return [ordered]@{
        main = Get-RemoteBranchSha "main"
        MVP = Get-RemoteBranchSha "MVP"
        MVP2 = Get-RemoteBranchSha "MVP2"
    }
}

function Assert-CanonicalSnapshotUnchanged {
    param(
        [Parameter(Mandatory = $true)]
        $Before
    )

    $after = Get-CanonicalSnapshot

    foreach ($branch in @("main", "MVP", "MVP2")) {
        if ([string]$Before[$branch] -ne [string]$after[$branch]) {
            throw "CRITICAL: canonical branch changed unexpectedly: $branch"
        }
    }

    return $after
}

function Get-IntegrationPRs {
    $result = Invoke-ExternalCommand "gh" @(
        "pr", "list", "--repo", $GitHubRepo,
        "--base", $IntegrationBase,
        "--state", "open",
        "--limit", "50",
        "--json", "number,title,state,headRefName,headRefOid,baseRefName"
    ) $RepoPath 120

    if ($result.ExitCode -ne 0) {
        throw "Unable to query integration PRs."
    }

    if ([string]::IsNullOrWhiteSpace($result.StdOut)) {
        return @()
    }

    return @($result.StdOut | ConvertFrom-Json)
}

function Get-CurrentPR {
    param(
        [Parameter(Mandatory = $true)]
        [int]$PrNumber
    )

    $result = Invoke-ExternalCommand "gh" @(
        "pr", "view", "$PrNumber", "--repo", $GitHubRepo,
        "--json", "number,title,state,headRefName,headRefOid,baseRefName"
    ) $RepoPath 120

    if ($result.ExitCode -ne 0) {
        throw "Unable to query PR #$PrNumber."
    }

    if ([string]::IsNullOrWhiteSpace($result.StdOut)) {
        throw "PR #$PrNumber returned empty metadata."
    }

    return ($result.StdOut | ConvertFrom-Json)
}

function Assert-PRCorrelation {
    param(
        [Parameter(Mandatory = $true)]
        [int]$PrNumber,
        [Parameter(Mandatory = $true)]
        [string]$ExpectedBranch,
        [Parameter(Mandatory = $true)]
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
    param(
        [int]$PrNumber,
        [string]$Sha
    )

    $short = $Sha.Substring(0, [Math]::Min(12, $Sha.Length))
    return Join-Path $WorktreesRoot ("PR-{0}-{1}" -f $PrNumber, $short)
}

function Prepare-Worktree {
    param(
        [int]$PrNumber,
        [string]$Sha
    )

    $path = Get-WorktreePath $PrNumber $Sha

    $fetch = Invoke-ExternalCommand "git" @(
        "-C", $RepoPath, "fetch", "origin", "--prune"
    ) $RepoPath 300

    if ($fetch.ExitCode -ne 0) {
        throw "git fetch failed."
    }

    if (Test-Path -LiteralPath $path) {
        $remove = Invoke-ExternalCommand "git" @(
            "-C", $RepoPath, "worktree", "remove", "--force", $path
        ) $RepoPath 120

        if ($remove.ExitCode -ne 0 -or (Test-Path -LiteralPath $path)) {
            throw "Existing relay worktree could not be safely removed; path preserved: $path"
        }
    }

    $add = Invoke-ExternalCommand "git" @(
        "-C", $RepoPath, "worktree", "add", "--detach", $path, $Sha
    ) $RepoPath 300

    if ($add.ExitCode -ne 0) {
        throw "git worktree add failed; path preserved when created: $path"
    }

    $head = Invoke-ExternalCommand "git" @(
        "-C", $path, "rev-parse", "HEAD"
    ) $path 60

    if ($head.ExitCode -ne 0) {
        throw "Unable to verify validation worktree HEAD."
    }

    if ($head.StdOut.Trim() -ne $Sha) {
        throw "WORKTREE SHA MISMATCH. expected=$Sha actual=$($head.StdOut.Trim())"
    }

    $status = Invoke-ExternalCommand "git" @(
        "-C", $path, "status", "--porcelain"
    ) $path 60

    if ($status.ExitCode -ne 0) {
        throw "Unable to inspect validation worktree."
    }

    if (-not [string]::IsNullOrWhiteSpace($status.StdOut.Trim())) {
        throw "Validation worktree is not clean."
    }

    return [string]$path
}

function Remove-ValidationWorktree {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WorktreePath
    )

    if (-not (Test-Path -LiteralPath $WorktreePath)) {
        return
    }

    $result = Invoke-ExternalCommand "git" @(
        "-C", $RepoPath,
        "worktree", "remove", "--force", $WorktreePath
    ) $RepoPath 120

    if ($result.ExitCode -ne 0 -or (Test-Path -LiteralPath $WorktreePath)) {
        throw "Worktree cleanup failed; path preserved: $WorktreePath"
    }

    $prune = Invoke-ExternalCommand "git" @(
        "-C", $RepoPath, "worktree", "prune"
    ) $RepoPath 60

    if ($prune.ExitCode -ne 0) {
        Write-RelayLog -Message "git worktree prune failed." -Level "WARN"
    }
}

function Get-EvidenceDirectory {
    param(
        [int]$PrNumber,
        [string]$Sha
    )

    $short = $Sha.Substring(0, [Math]::Min(12, $Sha.Length))
    $path = Join-Path $EvidenceRoot ("PR-{0}-{1}" -f $PrNumber, $short)

    New-Item -ItemType Directory -Force -Path $path | Out-Null

    return [string]$path
}

function Get-GateDefinitions {
    return @(
        [pscustomobject]@{ Name = "INSTALL"; Command = "pnpm"; Arguments = @("install", "--frozen-lockfile") }
        [pscustomobject]@{ Name = "LINT"; Command = "pnpm"; Arguments = @("lint") }
        [pscustomobject]@{ Name = "TYPECHECK"; Command = "pnpm"; Arguments = @("typecheck") }
        [pscustomobject]@{ Name = "GATEWAY_TEST"; Command = "pnpm"; Arguments = @("--filter", "@kassist/gateway", "test") }
        [pscustomobject]@{ Name = "DESKTOP_TEST"; Command = "pnpm"; Arguments = @("--filter", "@kassist/desktop", "test") }
        [pscustomobject]@{ Name = "FULL_TEST"; Command = "pnpm"; Arguments = @("test") }
        [pscustomobject]@{ Name = "BUILD"; Command = "pnpm"; Arguments = @("build") }
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
            Name = $Name
            Status = "SKIPPED"
            ExitCode = $null
            DurationMs = 0
            Error = "Global validation deadline exceeded."
            StdOutPath = $null
            StdErrPath = $null
        }
    }

    $timeout = [Math]::Min($GateTimeoutSeconds, $remaining)
    $stdoutPath = Join-Path $EvidenceDirectory ($Name.ToLowerInvariant() + ".stdout.txt")
    $stderrPath = Join-Path $EvidenceDirectory ($Name.ToLowerInvariant() + ".stderr.txt")
    $start = Get-Date

    Write-RelayLog "GATE START $Name timeout=${timeout}s"

    try {
        $r = Invoke-ExternalCommand `
            -FilePath $Command `
            -Arguments $Arguments `
            -WorkingDirectory $WorktreePath `
            -TimeoutSeconds $timeout `
            -StdOutPath $stdoutPath `
            -StdErrPath $stderrPath

        $durationMs = [int](((Get-Date) - $start).TotalMilliseconds)

        if ($r.ExitCode -eq 0) {
            Write-RelayLog "GATE PASS $Name duration=${durationMs}ms"
            return [pscustomobject]@{
                Name = $Name
                Status = "PASS"
                ExitCode = 0
                DurationMs = $durationMs
                Error = $null
                StdOutPath = $stdoutPath
                StdErrPath = $stderrPath
            }
        }

        Write-RelayLog -Message "GATE FAIL $Name exit=$($r.ExitCode)" -Level "WARN"
        return [pscustomobject]@{
            Name = $Name
            Status = "FAIL"
            ExitCode = $r.ExitCode
            DurationMs = $durationMs
            Error = "Command exited with code $($r.ExitCode)."
            StdOutPath = $stdoutPath
            StdErrPath = $stderrPath
        }
    }
    catch {
        $durationMs = [int](((Get-Date) - $start).TotalMilliseconds)
        $message = $_.Exception.Message
        $status = if ($message -like "Command timed out*") { "TIMEOUT" } else { "BLOCKED" }

        Write-RelayLog -Message "GATE $status $Name :: $message" -Level "ERROR"

        return [pscustomobject]@{
            Name = $Name
            Status = $status
            ExitCode = -1
            DurationMs = $durationMs
            Error = $message
            StdOutPath = $stdoutPath
            StdErrPath = $stderrPath
        }
    }
}

function Run-Validation {
    param(
        [string]$WorktreePath,
        [string]$EvidenceDirectory
    )

    $deadline = (Get-Date).AddSeconds($GlobalValidationTimeoutSeconds)
    $defs = @(Get-GateDefinitions)
    $results = New-Object System.Collections.Generic.List[object]

    foreach ($definition in $defs) {
        $gate = Run-Gate `
            -Name $definition.Name `
            -Command $definition.Command `
            -Arguments $definition.Arguments `
            -WorktreePath $WorktreePath `
            -EvidenceDirectory $EvidenceDirectory `
            -Deadline $deadline

        $results.Add($gate)

        if (@("FAIL", "TIMEOUT", "BLOCKED", "SKIPPED") -contains [string]$gate.Status) {
            foreach ($remaining in ($defs | Select-Object -Skip $results.Count)) {
                $results.Add([pscustomobject]@{
                    Name = $remaining.Name
                    Status = "SKIPPED"
                    ExitCode = $null
                    DurationMs = $null
                    Error = "Skipped after $($gate.Status)."
                    StdOutPath = $null
                    StdErrPath = $null
                })
            }
            break
        }
    }

    while ($results.Count -lt 7) {
        $definition = $defs[$results.Count]
        $results.Add([pscustomobject]@{
            Name = $definition.Name
            Status = "SKIPPED"
            ExitCode = $null
            DurationMs = $null
            Error = "Not executed."
            StdOutPath = $null
            StdErrPath = $null
        })
    }

    return $results.ToArray()
}

function Get-OverallStatus {
    param([object[]]$Results)

    $items = @($Results)

    if ($items.Count -ne 7) {
        return "BLOCKED"
    }

    if (@($items | Where-Object { [string]$_.Status -eq "FAIL" }).Count -gt 0) {
        return "FAIL"
    }

    if (@($items | Where-Object { [string]$_.Status -in @("TIMEOUT", "BLOCKED", "SKIPPED") }).Count -gt 0) {
        return "BLOCKED"
    }

    if (@($items | Where-Object { [string]$_.Status -eq "PASS" }).Count -eq 7) {
        return "PASS"
    }

    return "BLOCKED"
}

function Sanitize-EvidenceText {
    param([string]$Text)

    if ($null -eq $Text) {
        return ""
    }

    $x = [string]$Text
    $x = $x -replace "(?i)(authorization\s*[:=]\s*bearer\s+)[^\s]+", '$1[REDACTED]'
    $x = $x -replace "(?i)(password\s*[:=]\s*)\S+", '$1[REDACTED]'
    $x = $x -replace "(?i)(token\s*[:=]\s*)\S+", '$1[REDACTED]'
    $x = $x -replace "(?i)(secret\s*[:=]\s*)\S+", '$1[REDACTED]'

    if ($x.Length -gt $CommentExcerptMaxChars) {
        $x = $x.Substring(0, $CommentExcerptMaxChars) + "`r`n...[truncated]"
    }

    return $x
}

function Read-EvidenceText {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }

    if (-not (Test-Path -LiteralPath $Path)) {
        return ""
    }

    $text = Get-Content -LiteralPath $Path -Raw -Encoding utf8 -ErrorAction SilentlyContinue
    if ($null -eq $text) {
        return ""
    }

    return [string]$text
}

function Build-GateTable {
    param([object[]]$Results)

    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add("| Gate | Status | Exit Code | Duration |")
    $lines.Add("|---|---|---:|---:|")

    foreach ($r in @($Results)) {
        $exitCode = if ($null -eq $r.ExitCode) { "-" } else { [string]$r.ExitCode }
        $duration = if ($null -eq $r.DurationMs) { "-" } else { "{0}s" -f [Math]::Round(([double]$r.DurationMs / 1000), 2) }
        $lines.Add("| $($r.Name) | $($r.Status) | $exitCode | $duration |")
    }

    return ($lines -join "`r`n")
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
    $lines.Add("SHA correlation: **VALID**")
    $lines.Add("")

    $lines.Add("## Gates")
    $lines.Add("")
    $lines.Add((Build-GateTable $Results))
    $lines.Add("")

    $lines.Add("## Failed / Blocked Evidence")
    $lines.Add("")

    foreach ($r in @($Results)) {
        if ([string]$r.Status -in @("PASS", "SKIPPED")) {
            continue
        }

        $lines.Add("### $($r.Name)")
        $lines.Add("")

        if (-not [string]::IsNullOrWhiteSpace([string]$r.Error)) {
            $lines.Add("**Error:** $($r.Error)")
            $lines.Add("")
        }

        $stderr = Sanitize-EvidenceText (Read-EvidenceText $r.StdErrPath)
        if (-not [string]::IsNullOrWhiteSpace($stderr)) {
            $lines.Add("**stderr excerpt:**")
            $lines.Add("")
            $lines.Add("````text")
            $lines.Add($stderr)
            $lines.Add("````")
            $lines.Add("")
        }

        $stdout = Sanitize-EvidenceText (Read-EvidenceText $r.StdOutPath)
        if (-not [string]::IsNullOrWhiteSpace($stdout)) {
            $lines.Add("**stdout excerpt:**")
            $lines.Add("")
            $lines.Add("````text")
            $lines.Add($stdout)
            $lines.Add("````")
            $lines.Add("")
        }
    }

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
    $lines.Add("Evidence: ``$EvidenceDirectory``")
    $lines.Add("")

    $lines.Add("## Governance")
    $lines.Add("")
    $lines.Add("MERGE = NO")
    $lines.Add("")
    $lines.Add("RELEASE = NO")
    $lines.Add("")
    $lines.Add("APPROVED = NO")
    $lines.Add("")
    $lines.Add("Validation only. No canonical branch modification or branch deletion is performed by the relay.")

    return ($lines -join "`r`n")
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

No merge, rebase, cherry-pick, push, force-push, release or branch deletion was performed by the relay.
"@
}

function Save-Report {
    param(
        [int]$PrNumber,
        [string]$Sha,
        [string]$Report
    )

    $short = $Sha.Substring(0, [Math]::Min(12, $Sha.Length))
    $path = Join-Path $ReportsDir ("pr-{0}-{1}.md" -f $PrNumber, $short)

    Set-Content -LiteralPath $path -Value $Report -Encoding utf8

    return [string]$path
}

function New-JsonBodyFile {
    param(
        [string]$Body
    )

    $path = Join-Path $env:TEMP ("kassist-relay-body-" + [guid]::NewGuid().ToString("N") + ".json")
    $payload = [ordered]@{ body = $Body }
    $json = $payload | ConvertTo-Json -Depth 10

    Set-Content -LiteralPath $path -Value $json -Encoding utf8

    return [string]$path
}

function Find-AutomatedComment {
    param(
        [int]$PrNumber,
        [string]$Sha
    )

    $endpoint = "repos/$GitHubRepo/issues/$PrNumber/comments"

    $r = Invoke-ExternalCommand "gh" @(
        "api", "--paginate", "--slurp", $endpoint
    ) $RepoPath 120

    if ($r.ExitCode -ne 0) {
        throw "Unable to inspect PR comments."
    }

    if ([string]::IsNullOrWhiteSpace($r.StdOut)) {
        return $null
    }

    $pages = $r.StdOut | ConvertFrom-Json
    $identity = "<!-- KASSIST-AUTO-VALIDATION-ID: PR=$PrNumber SHA=$Sha -->"

    foreach ($page in @($pages)) {
        foreach ($comment in @($page)) {
            $body = [string]$comment.body
            if ($body.Contains($ValidationMarker) -and $body.Contains($identity)) {
                return $comment
            }
        }
    }

    return $null
}

function Publish-Report {
    param(
        [int]$PrNumber,
        [string]$Sha,
        [string]$Report
    )

    $existing = Find-AutomatedComment $PrNumber $Sha
    $jsonPath = New-JsonBodyFile $Report

    try {
        if ($null -ne $existing) {
            $endpoint = "repos/$GitHubRepo/issues/comments/$($existing.id)"

            $r = Invoke-ExternalCommand "gh" @(
                "api", $endpoint, "--method", "PATCH", "--input", $jsonPath
            ) $RepoPath 120

            if ($r.ExitCode -ne 0) {
                throw "PR comment PATCH failed."
            }

            return [pscustomobject]@{
                Action = "UPDATED"
                CommentId = [int64]$existing.id
            }
        }

        $endpoint = "repos/$GitHubRepo/issues/$PrNumber/comments"

        $r = Invoke-ExternalCommand "gh" @(
            "api", $endpoint, "--method", "POST", "--input", $jsonPath
        ) $RepoPath 120

        if ($r.ExitCode -ne 0) {
            throw "PR comment POST failed."
        }

        $response = $r.StdOut | ConvertFrom-Json

        return [pscustomobject]@{
            Action = "CREATED"
            CommentId = if ($null -ne $response.id) { [int64]$response.id } else { $null }
        }
    }
    finally {
        if (Test-Path -LiteralPath $jsonPath) {
            Remove-Item -LiteralPath $jsonPath -Force -ErrorAction SilentlyContinue
        }
    }
}

function Process-PR {
    param(
        [Parameter(Mandatory = $true)]
        $PR
    )

    $prNumber = [int]$PR.number
    $prTitle = [string]$PR.title
    $branch = [string]$PR.headRefName
    $sha = [string]$PR.headRefOid

    if ([string]$PR.baseRefName -ne $IntegrationBase) {
        return
    }

    if ([string]::IsNullOrWhiteSpace($sha)) {
        return
    }

    $key = Get-StateKey $prNumber $sha
    $entry = Get-StateEntry $prNumber $sha

    if (Should-SkipSHA $prNumber $sha) {
        Write-RelayLog "Skipping terminal PR#$prNumber SHA=$sha"
        return
    }

    # Recover publication failure without rerunning validation.
    if ($null -ne $entry -and [string]$entry.result -eq "PUBLISH_FAILED") {
        $null = Assert-PRCorrelation $prNumber $branch $sha

        $reportPath = [string]$entry.report_path
        if ([string]::IsNullOrWhiteSpace($reportPath) -or -not (Test-Path -LiteralPath $reportPath)) {
            throw "PUBLISH_FAILED has no preserved report."
        }

        $report = Get-Content -LiteralPath $reportPath -Raw -Encoding utf8
        $publication = Publish-Report $prNumber $sha $report

        $State.entries[$key] = [ordered]@{
            pr = $prNumber
            branch = $branch
            sha = $sha
            result = [string]$entry.validation_result
            validation_result = [string]$entry.validation_result
            publication_result = $publication.Action
            comment_id = $publication.CommentId
            report_path = $reportPath
            evidence_directory = [string]$entry.evidence_directory
            timestamp = (Get-Date).ToString("o")
            recovered_publication = $true
        }

        Save-State $State
        Write-RelayLog "Publication recovery PASS PR#$prNumber SHA=$sha"
        return
    }

    $worktree = $null
    $canonicalBefore = $null

    try {
        Write-RelayLog "PROCESS START PR#$prNumber SHA=$sha branch=$branch"

        $canonicalBefore = Get-CanonicalSnapshot
        $current = Assert-PRCorrelation $prNumber $branch $sha

        $State.entries[$key] = [ordered]@{
            pr = $prNumber
            branch = $branch
            sha = $sha
            result = "IN_PROGRESS"
            validation_result = "IN_PROGRESS"
            started_at = (Get-Date).ToString("o")
            head_at_discovery = [string]$current.headRefOid
        }

        Save-State $State

        $versions = Get-ToolVersions
        $worktree = Prepare-Worktree $prNumber $sha

        $head = Invoke-ExternalCommand "git" @(
            "-C", $worktree, "rev-parse", "HEAD"
        ) $worktree 60

        if ($head.ExitCode -ne 0) {
            throw "Unable to verify validation HEAD."
        }

        $headAtValidation = $head.StdOut.Trim()
        if ($headAtValidation -ne $sha) {
            throw "Validation SHA mismatch. expected=$sha actual=$headAtValidation"
        }

        $evidence = Get-EvidenceDirectory $prNumber $sha
        $results = @(Run-Validation $worktree $evidence)
        $overall = Get-OverallStatus $results

        $status = Invoke-ExternalCommand "git" @(
            "-C", $worktree, "status", "--porcelain"
        ) $worktree 60

        if ($status.ExitCode -ne 0) {
            throw "Unable to inspect final validation worktree."
        }

        if (-not [string]::IsNullOrWhiteSpace($status.StdOut.Trim())) {
            throw "Validation modified the worktree."
        }

        $beforePublication = Assert-PRCorrelation $prNumber $branch $sha
        $headAtPublication = [string]$beforePublication.headRefOid

        $report = Build-ValidationReport `
            -PrNumber $prNumber `
            -PrTitle $prTitle `
            -Branch $branch `
            -Sha $sha `
            -Results $results `
            -HeadAtDiscovery ([string]$current.headRefOid) `
            -HeadAtValidation $headAtValidation `
            -HeadAtPublication $headAtPublication `
            -EvidenceDirectory $evidence `
            -ToolVersions $versions

        $reportPath = Save-Report $prNumber $sha $report

        try {
            $publication = Publish-Report $prNumber $sha $report
        }
        catch {
            $State.entries[$key] = [ordered]@{
                pr = $prNumber
                branch = $branch
                sha = $sha
                result = "PUBLISH_FAILED"
                validation_result = $overall
                report_path = $reportPath
                evidence_directory = $evidence
                timestamp = (Get-Date).ToString("o")
                error = $_.Exception.Message
            }

            Save-State $State
            throw
        }

        $State.entries[$key] = [ordered]@{
            pr = $prNumber
            branch = $branch
            sha = $sha
            result = $overall
            validation_result = $overall
            publication_result = $publication.Action
            comment_id = $publication.CommentId
            report_path = $reportPath
            evidence_directory = $evidence
            timestamp = (Get-Date).ToString("o")
            head_at_discovery = [string]$current.headRefOid
            head_at_validation = $headAtValidation
            head_at_publication = $headAtPublication
        }

        Save-State $State
        Write-RelayLog "PROCESS RESULT $overall PR#$prNumber SHA=$sha"
    }
    catch {
        $message = $_.Exception.Message
        Write-RelayLog -Message "PROCESS ERROR PR#$prNumber SHA=$sha :: $message" -Level "ERROR"

        $stale = $false
        try {
            $latest = Get-CurrentPR $prNumber
            if (
                [string]$latest.state -ne "OPEN" -or
                [string]$latest.baseRefName -ne $IntegrationBase -or
                [string]$latest.headRefName -ne $branch -or
                [string]$latest.headRefOid -ne $sha
            ) {
                $stale = $true
            }
        }
        catch {
            $stale = $false
        }

        if ($stale) {
            $State.entries[$key] = [ordered]@{
                pr = $prNumber
                branch = $branch
                sha = $sha
                result = "STALE_NOT_PUBLISHED"
                timestamp = (Get-Date).ToString("o")
                error = $message
            }
            Save-State $State
            Write-RelayLog -Message "STALE SHA not published. PR#$prNumber SHA=$sha" -Level "WARN"
            return
        }

        $blocked = Build-BlockedReport `
            -PrNumber $prNumber `
            -Branch $branch `
            -Sha $sha `
            -Reason "BLOCKED" `
            -ErrorMessage $message

        $reportPath = Save-Report $prNumber $sha $blocked
        $publicationState = "PUBLISH_FAILED"

        try {
            $null = Assert-PRCorrelation $prNumber $branch $sha
            $publication = Publish-Report $prNumber $sha $blocked
            $publicationState = $publication.Action
        }
        catch {
            Write-RelayLog -Message ("BLOCKED publication failed: " + $_.Exception.Message) -Level "ERROR"
        }

        $State.entries[$key] = [ordered]@{
            pr = $prNumber
            branch = $branch
            sha = $sha
            result = "BLOCKED"
            publication_result = $publicationState
            report_path = $reportPath
            timestamp = (Get-Date).ToString("o")
            error = $message
        }

        Save-State $State
    }
    finally {
        if ($null -ne $worktree) {
            try {
                Remove-ValidationWorktree $worktree
            }
            catch {
                Write-RelayLog -Message ("WORKTREE CLEANUP BLOCKED: " + $_.Exception.Message) -Level "ERROR"
            }
        }

        if ($null -ne $canonicalBefore) {
            try {
                $null = Assert-CanonicalSnapshotUnchanged $canonicalBefore
            }
            catch {
                Write-RelayLog -Message ("CRITICAL CANONICAL SAFETY FAILURE: " + $_.Exception.Message) -Level "ERROR"
                throw
            }
        }

        Set-Location -LiteralPath $RepoPath
    }
}

function Enter-RelayMutex {
    param(
        [Parameter(Mandatory = $true)]
        [System.Threading.Mutex]$Mutex
    )

    $acquired = $false

    try {
        $acquired = $Mutex.WaitOne(0)
    }
    catch [System.Threading.AbandonedMutexException] {
        $acquired = $true
        Write-RelayLog -Message "Recovered abandoned relay mutex." -Level "WARN"
    }

    if (-not $acquired) {
        throw "Another KassisT Validation Relay instance is already running."
    }
}

$State = Load-State
$mutex = New-Object System.Threading.Mutex($false, $MutexName)

try {
    Enter-RelayMutex $mutex

    Write-RelayLog "============================================================"
    Write-RelayLog "KassisT Validation Relay started."
    Write-RelayLog "Repository: $RepoPath"
    Write-RelayLog "GitHub repository: $GitHubRepo"
    Write-RelayLog "Integration base: $IntegrationBase"
    Write-RelayLog "Polling: $PollSeconds seconds"
    Write-RelayLog "Per-gate timeout: $GateTimeoutSeconds seconds"
    Write-RelayLog "Global validation timeout: $GlobalValidationTimeoutSeconds seconds"
    Write-RelayLog "Validation only: ENABLED"
    Write-RelayLog "Merge: DISABLED"
    Write-RelayLog "Push: DISABLED"
    Write-RelayLog "Rebase: DISABLED"
    Write-RelayLog "Cherry-pick: DISABLED"
    Write-RelayLog "Force-push: DISABLED"
    Write-RelayLog "Release: DISABLED"
    Write-RelayLog "Branch deletion: DISABLED"
    Write-RelayLog "Canonical branch modification: DISABLED"
    Write-RelayLog "============================================================"

    Assert-Environment

    while ($true) {
        $loopStart = Get-Date

        try {
            Set-Location -LiteralPath $RepoPath
            $canonicalBeforeLoop = Get-CanonicalSnapshot
            $prs = @(Get-IntegrationPRs)

            foreach ($pr in $prs) {
                Process-PR $pr
                $null = Assert-CanonicalSnapshotUnchanged $canonicalBeforeLoop
            }

            $null = Assert-CanonicalSnapshotUnchanged $canonicalBeforeLoop
        }
        catch {
            Write-RelayLog -Message ("MAIN LOOP ERROR: " + $_.Exception.Message) -Level "ERROR"
        }

        $elapsed = ((Get-Date) - $loopStart).TotalSeconds
        $sleepSeconds = [Math]::Max(1, $PollSeconds - [int][Math]::Floor($elapsed))
        Start-Sleep -Seconds $sleepSeconds
    }
}
finally {
    if ($null -ne $mutex) {
        try {
            $null = $mutex.ReleaseMutex()
        }
        catch {
        }
        $mutex.Dispose()
    }
}

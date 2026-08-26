#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoPath = 'C:\Users\Kennedy Oliveira\Desktop\KassisT'
$GitHubRepo = 'kennedyaltamir/KassistanT'
$IntegrationBase = 'integration/kassist-final'
$PollSeconds = 30
$GateTimeoutSeconds = 900
$GlobalValidationTimeoutSeconds = 3600
$ValidationRoot = Join-Path $env:LOCALAPPDATA 'KassisT\ValidationRelay'
$ReportsDir = Join-Path $ValidationRoot 'reports'
$EvidenceRoot = Join-Path $ValidationRoot 'evidence'
$WorktreesRoot = Join-Path $ValidationRoot 'worktrees'
$LogsDir = Join-Path $ValidationRoot 'logs'
$StateFile = Join-Path $ValidationRoot 'state.json'
$StateTempFile = Join-Path $ValidationRoot 'state.tmp.json'
$MutexName = 'Global\KassisT_ValidationRelay'
$ValidationMarker = '<!-- KASSIST-AUTO-VALIDATION -->'

foreach ($dir in @($ValidationRoot,$ReportsDir,$EvidenceRoot,$WorktreesRoot,$LogsDir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

function Write-RelayLog {
    param([string]$Message,[ValidateSet('INFO','WARN','ERROR')][string]$Level='INFO')
    $line = '[{0}][{1}] {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$Level,$Message
    Write-Host $line
    Add-Content -LiteralPath (Join-Path $LogsDir ('relay-' + (Get-Date -Format 'yyyy-MM-dd') + '.log')) -Value $line -Encoding utf8
}

function Invoke-ExternalCommand {
    param([string]$FilePath,[string[]]$Arguments,[string]$WorkingDirectory,[int]$TimeoutSeconds)
    $outFile = Join-Path $env:TEMP ('kassist-' + [guid]::NewGuid().ToString('N') + '.out')
    $errFile = Join-Path $env:TEMP ('kassist-' + [guid]::NewGuid().ToString('N') + '.err')
    $process = $null
    try {
        $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory -NoNewWindow -PassThru -RedirectStandardOutput $outFile -RedirectStandardError $errFile
        if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
            try { Start-Process -FilePath 'taskkill.exe' -ArgumentList @('/PID',[string]$process.Id,'/T','/F') -NoNewWindow -Wait | Out-Null } catch { Write-RelayLog $_.Exception.Message 'ERROR' }
            throw "Command timed out after ${TimeoutSeconds}s: $FilePath $($Arguments -join ' ')"
        }
        $stdout = if (Test-Path $outFile) { Get-Content -LiteralPath $outFile -Raw -Encoding utf8 } else { '' }
        $stderr = if (Test-Path $errFile) { Get-Content -LiteralPath $errFile -Raw -Encoding utf8 } else { '' }
        return [pscustomobject]@{ ExitCode=$process.ExitCode; StdOut=$stdout; StdErr=$stderr }
    }
    finally {
        if (Test-Path $outFile) { Remove-Item -LiteralPath $outFile -Force -ErrorAction SilentlyContinue }
        if (Test-Path $errFile) { Remove-Item -LiteralPath $errFile -Force -ErrorAction SilentlyContinue }
    }
}

function Assert-Tool { param([string]$Name) if ($null -eq (Get-Command $Name -ErrorAction SilentlyContinue)) { throw "Required tool not found: $Name" } }

function Assert-Environment {
    Assert-Tool 'git'
    Assert-Tool 'gh'
    Assert-Tool 'pnpm'
    Assert-Tool 'node'
    if (-not (Test-Path $RepoPath)) { throw "Repository path does not exist: $RepoPath" }
    $root = Invoke-ExternalCommand 'git.exe' @('-C',$RepoPath,'rev-parse','--show-toplevel') $RepoPath 60
    if ($root.ExitCode -ne 0 -or $root.StdOut.Trim() -ne (Get-Item $RepoPath).FullName) { throw 'Repository validation failed.' }
    $remote = Invoke-ExternalCommand 'git.exe' @('-C',$RepoPath,'remote','get-url','origin') $RepoPath 60
    if ($remote.ExitCode -ne 0 -or $remote.StdOut.Trim() -notmatch 'github\.com[/:]kennedyaltamir/KassistanT(?:\.git)?$') { throw "Origin validation failed: $($remote.StdOut.Trim())" }
    $auth = Invoke-ExternalCommand 'gh.exe' @('auth','status') $RepoPath 60
    if ($auth.ExitCode -ne 0) { throw 'GitHub CLI authentication failed.' }
}

function New-EmptyState { return [pscustomobject]@{ version=1; entries=@{} } }
function Load-State {
    if (-not (Test-Path $StateFile)) { return New-EmptyState }
    try {
        $raw = (Get-Content -LiteralPath $StateFile -Raw -Encoding utf8) | ConvertFrom-Json
        $entries=@{}
        if ($null -ne $raw.entries) { foreach ($p in $raw.entries.PSObject.Properties) { $entries[$p.Name]=$p.Value } }
        return [pscustomobject]@{ version=1; entries=$entries }
    } catch {
        $backup = Join-Path $ValidationRoot ('state.corrupt-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '.json')
        try { Move-Item -LiteralPath $StateFile -Destination $backup -Force } catch { }
        Write-RelayLog 'Invalid state.json; starting fresh state.' 'WARN'
        return New-EmptyState
    }
}
function Save-State {
    param($State)
    $obj=[ordered]@{ version=1; entries=[ordered]@{} }
    foreach ($k in $State.entries.Keys) { $obj.entries[$k]=$State.entries[$k] }
    $json=$obj | ConvertTo-Json -Depth 20
    Set-Content -LiteralPath $StateTempFile -Value $json -Encoding utf8
    if (Test-Path $StateFile) {
        try { [System.IO.File]::Replace($StateTempFile,$StateFile,$null,$true) } catch { Move-Item -LiteralPath $StateTempFile -Destination $StateFile -Force }
    } else { Move-Item -LiteralPath $StateTempFile -Destination $StateFile -Force }
}
function Get-StateKey { param([int]$PrNumber,[string]$Sha) return "PR#$PrNumber@$Sha" }
function Get-StateEntry { param([int]$PrNumber,[string]$Sha) $k=Get-StateKey $PrNumber $Sha; if ($State.entries.ContainsKey($k)) { return $State.entries[$k] }; return $null }
function Test-Terminal { param([string]$Result) return @('PASS','FAIL','BLOCKED','STALE') -contains $Result }

function Get-RemoteBranchSha {
    param([string]$Branch)
    $r=Invoke-ExternalCommand 'git.exe' @('-C',$RepoPath,'ls-remote','origin',"refs/heads/$Branch") $RepoPath 60
    if ($r.ExitCode -ne 0) { throw "Unable to inspect origin/$Branch" }
    $line=$r.StdOut.Trim(); if ([string]::IsNullOrWhiteSpace($line)) { throw "Missing origin/$Branch" }
    return ([string]($line -split '\s+')[0]).Trim()
}
function Get-CanonicalSnapshot { return [ordered]@{ main=(Get-RemoteBranchSha 'main'); MVP=(Get-RemoteBranchSha 'MVP'); MVP2=(Get-RemoteBranchSha 'MVP2') } }
function Assert-CanonicalUnchanged { param($Before) $after=Get-CanonicalSnapshot; foreach($b in @('main','MVP','MVP2')) { if ([string]$Before[$b] -ne [string]$after[$b]) { throw "CRITICAL canonical branch changed: $b" } }; return $after }

function Get-IntegrationPRs {
    $r=Invoke-ExternalCommand 'gh.exe' @('pr','list','--repo',$GitHubRepo,'--base',$IntegrationBase,'--state','open','--limit','50','--json','number,title,state,headRefName,headRefOid,baseRefName') $RepoPath 120
    if ($r.ExitCode -ne 0) { throw 'Unable to query integration PRs.' }
    if ([string]::IsNullOrWhiteSpace($r.StdOut)) { return @() }
    return @($r.StdOut | ConvertFrom-Json)
}
function Get-CurrentPR { param([int]$PrNumber) $r=Invoke-ExternalCommand 'gh.exe' @('pr','view',[string]$PrNumber,'--repo',$GitHubRepo,'--json','number,title,state,headRefName,headRefOid,baseRefName') $RepoPath 120; if($r.ExitCode -ne 0){throw "Unable to query PR #$PrNumber"}; return ($r.StdOut|ConvertFrom-Json) }
function Assert-PRCorrelation { param([int]$PrNumber,[string]$Branch,[string]$Sha) $p=Get-CurrentPR $PrNumber; if([string]$p.state -ne 'OPEN'){throw "PR #$PrNumber is not OPEN"}; if([string]$p.baseRefName -ne $IntegrationBase){throw 'PR base changed'}; if([string]$p.headRefName -ne $Branch){throw 'PR head branch changed'}; if([string]$p.headRefOid -ne $Sha){throw "STALE SHA for PR#$PrNumber"}; return $p }

function Get-WorktreePath { param([int]$PrNumber,[string]$Sha) $short=$Sha.Substring(0,[Math]::Min(12,$Sha.Length)); return (Join-Path $WorktreesRoot "PR-$PrNumber-$short") }
function Prepare-Worktree {
    param([int]$PrNumber,[string]$Sha)
    $path=Get-WorktreePath $PrNumber $Sha
    $fetch=Invoke-ExternalCommand 'git.exe' @('-C',$RepoPath,'fetch','origin','--prune') $RepoPath 300
    if($fetch.ExitCode -ne 0){throw 'git fetch failed'}
    if(Test-Path $path){$rm=Invoke-ExternalCommand 'git.exe' @('-C',$RepoPath,'worktree','remove','--force',$path) $RepoPath 120; if($rm.ExitCode -ne 0 -or (Test-Path $path)){throw "Existing relay worktree could not be removed: $path"}}
    $add=Invoke-ExternalCommand 'git.exe' @('-C',$RepoPath,'worktree','add','--detach',$path,$Sha) $RepoPath 300
    if($add.ExitCode -ne 0){throw "git worktree add failed for $path"}
    $head=Invoke-ExternalCommand 'git.exe' @('-C',$path,'rev-parse','HEAD') $path 60
    if($head.ExitCode -ne 0 -or $head.StdOut.Trim() -ne $Sha){throw 'Worktree SHA mismatch'}
    $status=Invoke-ExternalCommand 'git.exe' @('-C',$path,'status','--porcelain') $path 60
    if($status.ExitCode -ne 0 -or -not [string]::IsNullOrWhiteSpace($status.StdOut.Trim())){throw 'Validation worktree is not clean'}
    return [string]$path
}
function Remove-ValidationWorktree { param([string]$Path) if(-not(Test-Path $Path)){return}; $r=Invoke-ExternalCommand 'git.exe' @('-C',$RepoPath,'worktree','remove','--force',$Path) $RepoPath 120; if($r.ExitCode -ne 0 -or (Test-Path $Path)){throw "Worktree cleanup failed; path preserved: $Path"}; $null=Invoke-ExternalCommand 'git.exe' @('-C',$RepoPath,'worktree','prune') $RepoPath 60 }

function Get-EvidenceDirectory { param([int]$PrNumber,[string]$Sha) $short=$Sha.Substring(0,[Math]::Min(12,$Sha.Length)); $path=Join-Path $EvidenceRoot "PR-$PrNumber-$short"; New-Item -ItemType Directory -Force -Path $path | Out-Null; return [string]$path }
function Get-GateDefinitions { return @(
    [pscustomobject]@{Name='INSTALL';Command='pnpm.cmd';Arguments=@('install','--frozen-lockfile')},
    [pscustomobject]@{Name='LINT';Command='pnpm.cmd';Arguments=@('lint')},
    [pscustomobject]@{Name='TYPECHECK';Command='pnpm.cmd';Arguments=@('typecheck')},
    [pscustomobject]@{Name='GATEWAY_TEST';Command='pnpm.cmd';Arguments=@('--filter','@kassist/gateway','test')},
    [pscustomobject]@{Name='DESKTOP_TEST';Command='pnpm.cmd';Arguments=@('--filter','@kassist/desktop','test')},
    [pscustomobject]@{Name='FULL_TEST';Command='pnpm.cmd';Arguments=@('test')},
    [pscustomobject]@{Name='BUILD';Command='pnpm.cmd';Arguments=@('build')}
) }
function Run-Gate {
    param($Definition,[string]$Worktree,[string]$Evidence,[datetime]$Deadline)
    $now=Get-Date; if($now -ge $Deadline){return [pscustomobject]@{Name=$Definition.Name;Status='SKIPPED';ExitCode=$null;DurationMs=0;StdOutPath=$null;StdErrPath=$null;Error='Global deadline exceeded'}}
    $timeout=[Math]::Min($GateTimeoutSeconds,[Math]::Max(1,[int][Math]::Floor(($Deadline-$now).TotalSeconds)))
    $stdout=Join-Path $Evidence ($Definition.Name.ToLowerInvariant()+'.stdout.txt')
    $stderr=Join-Path $Evidence ($Definition.Name.ToLowerInvariant()+'.stderr.txt')
    Write-RelayLog "GATE START $($Definition.Name)"
    $start=Get-Date
    try {
        $r=Invoke-ExternalCommand $Definition.Command $Definition.Arguments $Worktree $timeout
        Set-Content -LiteralPath $stdout -Value $r.StdOut -Encoding utf8
        Set-Content -LiteralPath $stderr -Value $r.StdErr -Encoding utf8
        $ms=[int](((Get-Date)-$start).TotalMilliseconds)
        if($r.ExitCode -eq 0){Write-RelayLog "GATE PASS $($Definition.Name)"; return [pscustomobject]@{Name=$Definition.Name;Status='PASS';ExitCode=0;DurationMs=$ms;StdOutPath=$stdout;StdErrPath=$stderr;Error=$null}}
        return [pscustomobject]@{Name=$Definition.Name;Status='FAIL';ExitCode=$r.ExitCode;DurationMs=$ms;StdOutPath=$stdout;StdErrPath=$stderr;Error="Exit code $($r.ExitCode)"}
    } catch {
        $ms=[int](((Get-Date)-$start).TotalMilliseconds); $status=if($_.Exception.Message -like 'Command timed out*'){'TIMEOUT'}else{'BLOCKED'}; return [pscustomobject]@{Name=$Definition.Name;Status=$status;ExitCode=-1;DurationMs=$ms;StdOutPath=$stdout;StdErrPath=$stderr;Error=$_.Exception.Message}
    }
}
function Run-Validation {
    param([string]$Worktree,[string]$Evidence)
    $deadline=(Get-Date).AddSeconds($GlobalValidationTimeoutSeconds); $defs=@(Get-GateDefinitions); $results=New-Object System.Collections.Generic.List[object]
    foreach($d in $defs){$g=Run-Gate $d $Worktree $Evidence $deadline; $results.Add($g); if(@('FAIL','TIMEOUT','BLOCKED') -contains [string]$g.Status){foreach($r in ($defs|Select-Object -Skip $results.Count)){$results.Add([pscustomobject]@{Name=$r.Name;Status='SKIPPED';ExitCode=$null;DurationMs=0;StdOutPath=$null;StdErrPath=$null;Error="Skipped after $($g.Status)"})}; break}}
    while($results.Count -lt 7){$d=$defs[$results.Count];$results.Add([pscustomobject]@{Name=$d.Name;Status='SKIPPED';ExitCode=$null;DurationMs=0;StdOutPath=$null;StdErrPath=$null;Error='Not executed'})}
    return $results.ToArray()
}
function Get-OverallStatus { param([object[]]$Results) $r=@($Results); if($r.Count -ne 7){return 'BLOCKED'}; if(@($r|Where-Object{$_.Status -eq 'FAIL'}).Count -gt 0){return 'FAIL'}; if(@($r|Where-Object{$_.Status -in @('TIMEOUT','BLOCKED','SKIPPED')}).Count -gt 0){return 'BLOCKED'}; return 'PASS' }

function Build-Report { param([int]$PrNumber,[string]$Title,[string]$Branch,[string]$Sha,[object[]]$Results,[string]$Evidence)
    $overall=Get-OverallStatus $Results; $lines=New-Object System.Collections.Generic.List[string]; $lines.Add($ValidationMarker); $lines.Add("<!-- PR=$PrNumber SHA=$Sha -->"); $lines.Add(''); $lines.Add('# KassisT Automated Windows Validation'); $lines.Add(''); $lines.Add("**PR:** #$PrNumber"); $lines.Add(''); $lines.Add("**Title:** $Title"); $lines.Add(''); $lines.Add("**Branch:** ``$Branch``"); $lines.Add(''); $lines.Add("**SHA:** ``$Sha``"); $lines.Add(''); $lines.Add("**Overall:** **$overall**"); $lines.Add(''); $lines.Add('## Gates'); $lines.Add(''); $lines.Add('| Gate | Status | Exit Code | Duration |'); $lines.Add('|---|---|---:|---:|'); foreach($r in $Results){$ec=if($null -eq $r.ExitCode){'-'}else{$r.ExitCode};$du=if($null -eq $r.DurationMs){'-'}else{"$([math]::Round($r.DurationMs/1000,2))s"};$lines.Add("| $($r.Name) | $($r.Status) | $ec | $du |")}; $lines.Add(''); $lines.Add('## Evidence'); $lines.Add(''); $lines.Add("Full stdout/stderr: ``$Evidence``"); $lines.Add(''); $lines.Add('## Governance'); $lines.Add(''); $lines.Add('MERGE = NO'); $lines.Add(''); $lines.Add('RELEASE = NO'); $lines.Add(''); $lines.Add('APPROVED = NO'); return ($lines -join "`r`n") }
function Save-Report { param([int]$PrNumber,[string]$Sha,[string]$Report) $short=$Sha.Substring(0,[Math]::Min(12,$Sha.Length));$p=Join-Path $ReportsDir "pr-$PrNumber-$short.md";Set-Content -LiteralPath $p -Value $Report -Encoding utf8;return [string]$p }
function Find-AutomatedComment { param([int]$PrNumber,[string]$Sha) $r=Invoke-ExternalCommand 'gh.exe' @('api','--paginate','--slurp',"repos/$GitHubRepo/issues/$PrNumber/comments") $RepoPath 120; if($r.ExitCode -ne 0){throw 'Unable to query comments'}; if([string]::IsNullOrWhiteSpace($r.StdOut)){return $null};$pages=$r.StdOut|ConvertFrom-Json;$id="<!-- PR=$PrNumber SHA=$Sha -->";foreach($page in @($pages)){foreach($c in @($page)){if(([string]$c.body).Contains($ValidationMarker)-and([string]$c.body).Contains($id)){return $c}}};return $null }
function Publish-Report { param([int]$PrNumber,[string]$Sha,[string]$Report) $json=Join-Path $env:TEMP ('kassist-report-'+[guid]::NewGuid().ToString('N')+'.json'); @{body=$Report}|ConvertTo-Json -Depth 10|Set-Content -LiteralPath $json -Encoding utf8; try{$existing=Find-AutomatedComment $PrNumber $Sha; if($null -ne $existing){$r=Invoke-ExternalCommand 'gh.exe' @('api',"repos/$GitHubRepo/issues/comments/$($existing.id)",'--method','PATCH','--input',$json) $RepoPath 120; if($r.ExitCode -ne 0){throw 'PATCH failed'};return [pscustomobject]@{Action='UPDATED';CommentId=[int64]$existing.id}};$r=Invoke-ExternalCommand 'gh.exe' @('api',"repos/$GitHubRepo/issues/$PrNumber/comments",'--method','POST','--input',$json) $RepoPath 120;if($r.ExitCode -ne 0){throw 'POST failed'};$resp=$r.StdOut|ConvertFrom-Json;return [pscustomobject]@{Action='CREATED';CommentId=[int64]$resp.id}}finally{if(Test-Path $json){Remove-Item $json -Force -ErrorAction SilentlyContinue}} }

function Process-PR { param($PR)
    $pr=[int]$PR.number;$branch=[string]$PR.headRefName;$sha=[string]$PR.headRefOid;$title=[string]$PR.title;if([string]$PR.baseRefName -ne $IntegrationBase){return};$key=Get-StateKey $pr $sha;$entry=Get-StateEntry $pr $sha;if($null-ne $entry -and (Test-Terminal ([string]$entry.result))){return};$worktree=$null;$canonicalBefore=$null;try{$canonicalBefore=Get-CanonicalSnapshot;$current=Assert-PRCorrelation $pr $branch $sha;$State.entries[$key]=[ordered]@{pr=$pr;branch=$branch;sha=$sha;result='IN_PROGRESS';started_at=(Get-Date).ToString('o')};Save-State $State;$worktree=Prepare-Worktree $pr $sha;$headAtValidation=(Invoke-ExternalCommand 'git.exe' @('-C',$worktree,'rev-parse','HEAD') $worktree 60).StdOut.Trim();if($headAtValidation-ne $sha){throw 'Validation SHA mismatch'};$evidence=Get-EvidenceDirectory $pr $sha;$results=@(Run-Validation $worktree $evidence);$overall=Get-OverallStatus $results;$beforePub=Assert-PRCorrelation $pr $branch $sha;$report=Build-Report $pr $title $branch $sha $results $evidence;$reportPath=Save-Report $pr $sha $report;try{$pub=Publish-Report $pr $sha $report}catch{$State.entries[$key]=[ordered]@{pr=$pr;branch=$branch;sha=$sha;result='PUBLISH_FAILED';validation_result=$overall;report_path=$reportPath;timestamp=(Get-Date).ToString('o')};Save-State $State;throw};$State.entries[$key]=[ordered]@{pr=$pr;branch=$branch;sha=$sha;result=$overall;validation_result=$overall;publication_result=$pub.Action;comment_id=$pub.CommentId;report_path=$reportPath;evidence_directory=$evidence;head_at_discovery=[string]$current.headRefOid;head_at_validation=$headAtValidation;head_at_publication=[string]$beforePub.headRefOid;timestamp=(Get-Date).ToString('o')};Save-State $State;Write-RelayLog "RESULT $overall PR#$pr SHA=$sha"}catch{$msg=$_.Exception.Message;try{$c=Get-CurrentPR $pr;$stale=([string]$c.state -ne 'OPEN' -or [string]$c.baseRefName-ne $IntegrationBase -or [string]$c.headRefName-ne $branch -or [string]$c.headRefOid-ne $sha)}catch{$stale=$false};if($stale){$State.entries[$key]=[ordered]@{pr=$pr;branch=$branch;sha=$sha;result='STALE';timestamp=(Get-Date).ToString('o');error=$msg};Save-State $State}else{$State.entries[$key]=[ordered]@{pr=$pr;branch=$branch;sha=$sha;result='BLOCKED';timestamp=(Get-Date).ToString('o');error=$msg};Save-State $State}}finally{if($null-ne $worktree){try{Remove-ValidationWorktree $worktree}catch{Write-RelayLog $_.Exception.Message 'ERROR'}};if($null-ne $canonicalBefore){Assert-CanonicalUnchanged $canonicalBefore|Out-Null};Set-Location $RepoPath}}

$State=Load-State
$mutex=New-Object System.Threading.Mutex($false,$MutexName)
try{try{$ok=$mutex.WaitOne(0)}catch [System.Threading.AbandonedMutexException]{$ok=$true};if(-not $ok){throw 'Another KassisT Validation Relay instance is already running.'};Assert-Environment;Write-RelayLog 'KassisT Validation Relay started.';Write-RelayLog "Repository: $RepoPath";Write-RelayLog "Integration base: $IntegrationBase";while($true){try{$before=Get-CanonicalSnapshot;$prs=@(Get-IntegrationPRs);foreach($pr in $prs){Process-PR $pr;Assert-CanonicalUnchanged $before|Out-Null};Assert-CanonicalUnchanged $before|Out-Null}catch{Write-RelayLog $_.Exception.Message 'ERROR'};Start-Sleep -Seconds $PollSeconds}}finally{try{$mutex.ReleaseMutex()|Out-Null}catch{};$mutex.Dispose()}

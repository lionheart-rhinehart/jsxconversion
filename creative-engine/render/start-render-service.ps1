# CreativeEngine render service — keeps the approval render poller running.
#
# Self-restarting: if the node poller ever exits (crash, transient error), this
# relaunches it after a short delay, so an approved creative always renders
# (within ~15s) as long as the computer is on. Started automatically at logon by
# the launcher in the Windows Startup folder (start-render-service.vbs), and also
# startable by hand for testing.
#
# Logs:
#   _out/render-service.log  — service start/stop/restart events
#   _out/render-poller.log   — the poller's own live output (rendered/skipped/errors)
#   _out/render-poller.err   — the poller's stderr

$ErrorActionPreference = 'Continue'
$repo = 'D:\Claude CODE\jsxconversion'
$node = 'C:\Program Files\nodejs\node.exe'
$logDir = Join-Path $repo 'creative-engine\render\_out'
$svcLog = Join-Path $logDir 'render-service.log'
$outLog = Join-Path $logDir 'render-poller.log'
$errLog = Join-Path $logDir 'render-poller.err'

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
Set-Location $repo

while ($true) {
    "$(Get-Date -Format o)  [service] starting render poller" | Out-File -Append -Encoding utf8 $svcLog
    try {
        # Use the call operator (&), NOT Start-Process -NoNewWindow: the service is
        # launched by a window-less (hidden) host at logon, where -NoNewWindow has no
        # console to attach and throws. `&` runs node as a child with no console needed;
        # `*>` redirects all streams to a fresh, single-encoding log (readable by Get-Content).
        & $node 'creative-engine/render/cli.mjs' 'poll' '--interval' '15000' *> $outLog
        "$(Get-Date -Format o)  [service] poller exited (code $LASTEXITCODE) — restart in 10s" | Out-File -Append -Encoding utf8 $svcLog
    } catch {
        "$(Get-Date -Format o)  [service] launch threw: $($_.Exception.Message) — restart in 10s" | Out-File -Append -Encoding utf8 $svcLog
    }
    Start-Sleep -Seconds 10
}

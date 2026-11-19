$ErrorActionPreference = 'Stop'
$started = [DateTime]::UtcNow
$deadline = $started.AddSeconds(75)
$out = Join-Path $PSScriptRoot 'host-load.jsonl'
$stopMarker = Join-Path $PSScriptRoot 'sampler-stop'
$samples = 0
[pscustomobject]@{pid=$PID;started=$started.ToString('o');deadline=$deadline.ToString('o');intervalSeconds=1;method='CIM formatted total CPU and available memory; no process inventory'} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'sampler-identity.json')
while ([DateTime]::UtcNow -lt $deadline -and !(Test-Path -LiteralPath $stopMarker)) {
  $at = [DateTime]::UtcNow
  $timer = [Diagnostics.Stopwatch]::StartNew()
  try {
    $cpu = Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor -Filter "Name='_Total'" -OperationTimeoutSec 3
    $memory = Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory -OperationTimeoutSec 3
    $timer.Stop()
    [pscustomobject]@{at=$at.ToString('o');completed=[DateTime]::UtcNow.ToString('o');queryDurationMs=$timer.Elapsed.TotalMilliseconds;cpuPercent=$cpu.PercentProcessorTime;availableMB=$memory.AvailableMBytes} | ConvertTo-Json -Compress | Add-Content -LiteralPath $out
    $samples++
  } catch {
    [pscustomobject]@{at=$at.ToString('o');error=$_.Exception.Message} | ConvertTo-Json -Compress | Add-Content -LiteralPath $out
  }
  Start-Sleep -Seconds 1
}
[pscustomobject]@{pid=$PID;finished=[DateTime]::UtcNow.ToString('o');samples=$samples;stopMarker=(Test-Path -LiteralPath $stopMarker);deadline=$deadline.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'sampler-finished.json')

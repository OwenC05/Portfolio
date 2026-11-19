$ErrorActionPreference='Stop'
$output=Join-Path $PSScriptRoot 'host-load.jsonl'
$stopMarker=Join-Path $PSScriptRoot 'monitor-stop'
$until=(Get-Date).AddMinutes(5)
while((Get-Date) -lt $until -and !(Test-Path -LiteralPath $stopMarker)) {
  try {
    $cpu=Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor -Filter "Name='_Total'"
    $memory=Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory
    $busy=Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object {$_.Name -notin @('_Total','Idle') -and $_.PercentProcessorTime -gt 0} | Sort-Object PercentProcessorTime -Descending | Select-Object -First 6 Name,IDProcess,PercentProcessorTime
    [pscustomobject]@{at=(Get-Date).ToUniversalTime().ToString('o');cpuPercent=$cpu.PercentProcessorTime;availableMB=$memory.AvailableMBytes;topProcesses=$busy} | ConvertTo-Json -Compress -Depth 4 | Add-Content -LiteralPath $output
  } catch { [pscustomobject]@{at=(Get-Date).ToUniversalTime().ToString('o');error=$_.Exception.Message} | ConvertTo-Json -Compress | Add-Content -LiteralPath $output }
  Start-Sleep -Seconds 2
}
Write-Output 'Owned host sampler finished'

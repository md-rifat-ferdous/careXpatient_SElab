Write-Host "=== Starting Backend (port 5000) ==="
$backend = Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory "E:\8th trimester\careXpatient\careXpatient\backend" -PassThru -RedirectStandardOutput "E:\8th trimester\careXpatient\careXpatient\backend.log" -RedirectStandardError "E:\8th trimester\careXpatient\careXpatient\backend.err"
Write-Host "Backend PID: $($backend.Id)"

Start-Sleep -Seconds 2

Write-Host "=== Starting Frontend (port 3000) ==="
$frontend = Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory "E:\8th trimester\careXpatient\careXpatient\apps\web" -PassThru -RedirectStandardOutput "E:\8th trimester\careXpatient\careXpatient\frontend.log" -RedirectStandardError "E:\8th trimester\careXpatient\careXpatient\frontend.err"
Write-Host "Frontend PID: $($frontend.Id)"

Write-Host "`nWaiting for servers to start..."
Start-Sleep -Seconds 15

Write-Host "`n=== Checking Backend ==="
try {
    $r = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Backend: $($r.StatusCode) OK"
} catch {
    Write-Host "Backend check: $_"
}

Write-Host "`n=== Checking Frontend ==="
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/login" -TimeoutSec 10 -UseBasicParsing
    Write-Host "Frontend: $($r.StatusCode) OK ($($r.Content.Length) bytes)"
} catch {
    Write-Host "Frontend check: $_"
}

Write-Host "`n=== Backend Log ==="
Get-Content -LiteralPath "E:\8th trimester\careXpatient\careXpatient\backend.log" -Tail 20 -ErrorAction SilentlyContinue

Write-Host "`n=== Frontend Log ==="
Get-Content -LiteralPath "E:\8th trimester\careXpatient\careXpatient\frontend.log" -Tail 20 -ErrorAction SilentlyContinue

Write-Host "`n=== Both servers running ==="
Write-Host "Backend PID: $($backend.Id) | Frontend PID: $($frontend.Id)"
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "`nPress Ctrl+C to stop both servers."
Read-Host "Press Enter to stop servers"

Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "E:\8th trimester\careXpatient\careXpatient\backend.log" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "E:\8th trimester\careXpatient\careXpatient\backend.err" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "E:\8th trimester\careXpatient\careXpatient\frontend.log" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "E:\8th trimester\careXpatient\careXpatient\frontend.err" -Force -ErrorAction SilentlyContinue

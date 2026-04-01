# Windows DNS Fix for MongoDB Atlas
# Run this script in PowerShell as Administrator

Write-Host "=== Windows DNS Fix for MongoDB Atlas ===" -ForegroundColor Green
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "ERROR: Please run this script as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Setting Google DNS servers..." -ForegroundColor Cyan
# Set Google DNS for all network adapters
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
foreach ($adapter in $adapters) {
    Write-Host "  Configuring adapter: $($adapter.Name)"
    Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses ("8.8.8.8", "8.8.4.4") -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Step 2: Flushing DNS cache..." -ForegroundColor Cyan
Clear-DnsClientCache
ipconfig /flushdns | Out-Null

Write-Host ""
Write-Host "Step 3: Resetting network stack..." -ForegroundColor Cyan
# Reset Winsock
netsh winsock reset | Out-Null
# Reset TCP/IP
netsh int ip reset | Out-Null

Write-Host ""
Write-Host "Step 4: Testing DNS resolution..." -ForegroundColor Cyan
# Test if SRV records can be resolved
try {
    $result = Resolve-DnsName -Name "_mongodb._tcp.cluster0.vbsavc2.mongodb.net" -Type SRV -ErrorAction Stop
    Write-Host "  SUCCESS: SRV record resolved!" -ForegroundColor Green
    Write-Host "  Target: $($result[0].NameTarget)" -ForegroundColor Gray
} catch {
    Write-Host "  WARNING: SRV record still not resolving" -ForegroundColor Yellow
    Write-Host "  This may be a firewall or network issue" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== DNS Fix Complete ===" -ForegroundColor Green
Write-Host "Please RESTART YOUR COMPUTER for changes to take effect." -ForegroundColor Yellow
Write-Host ""
Write-Host "After restart, test MongoDB connection:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Gray

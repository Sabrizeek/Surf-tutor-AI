# PowerShell script to enable Windows Long Path Support
# Run as Administrator

Write-Host "Enabling Windows Long Path Support..." -ForegroundColor Yellow

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Enable long paths
try {
    $registryPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
    $propertyName = "LongPathsEnabled"
    
    # Check current value
    $currentValue = Get-ItemProperty -Path $registryPath -Name $propertyName -ErrorAction SilentlyContinue
    
    if ($currentValue.LongPathsEnabled -eq 1) {
        Write-Host "Long paths are already enabled!" -ForegroundColor Green
    } else {
        # Set the value
        New-ItemProperty -Path $registryPath -Name $propertyName -Value 1 -PropertyType DWORD -Force | Out-Null
        Write-Host "Long paths enabled successfully!" -ForegroundColor Green
        Write-Host "`nIMPORTANT: You must restart your computer for this to take effect." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error enabling long paths: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nTo verify after restart, run:" -ForegroundColor Cyan
Write-Host "  Get-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled'" -ForegroundColor White


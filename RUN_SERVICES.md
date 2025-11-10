# How to Run Services

## Quick Solution

If you get an error running `.\start_all_services.ps1`, try one of these:

### Option 1: Run with Full Path
```powershell
# From anywhere
& "C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\start_all_services.ps1"
```

### Option 2: Navigate First
```powershell
# Navigate to where the script is
cd C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project
.\start_all_services.ps1
```

### Option 3: Use PowerShell Execution
```powershell
# Explicitly run with PowerShell
powershell -ExecutionPolicy Bypass -File .\start_all_services.ps1
```

### Option 4: Manual Start (Recommended for Troubleshooting)

**Terminal 1 - Model Server:**
```powershell
cd C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\backend
python start_model_server.py
```

**Terminal 2 - Backend Server:**
```powershell
cd C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\backend
npm start
```

**Terminal 3 - Frontend Metro:**
```powershell
cd C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\SurfTutorApp
npm start
```

**Terminal 4 - Run App:**
```powershell
cd C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\SurfTutorApp
npm run android  # or npm run ios
```

## For New Consolidated Location

Once you move everything to `C:\dev\SurfTutorApp\`:

```powershell
cd C:\dev\SurfTutorApp
.\start_all_services.ps1
```

## Common Issues

### "Script not recognized"
- Make sure you're in the correct directory
- Use full path: `& "C:\path\to\start_all_services.ps1"`
- Or navigate first: `cd C:\path\to\project` then `.\start_all_services.ps1`

### "Execution Policy Error"
```powershell
# Check current policy
Get-ExecutionPolicy

# If needed, allow scripts (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "File not found"
- Verify the script exists: `Test-Path .\start_all_services.ps1`
- Check you're in the right directory: `Get-Location`


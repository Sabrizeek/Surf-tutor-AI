# Fix Path Length Issue

## Problem
Windows has a 260-character path limit. Your current path is too long:
```
C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\SurfTutorApp\...
```

## Solutions

### Solution 1: Enable Windows Long Path Support (Quick Fix)

1. **Enable via Registry (Requires Admin):**
   ```powershell
   # Run PowerShell as Administrator
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

2. **Or via Group Policy:**
   - Press `Win + R`, type `gpedit.msc`
   - Navigate to: `Computer Configuration > Administrative Templates > System > Filesystem`
   - Enable: "Enable Win32 long paths"
   - Restart computer

3. **Or via Settings:**
   - Windows 10/11: Settings > System > About > Advanced system settings
   - Under "System Properties" > Advanced tab > Performance Settings
   - Enable long paths (if available)

**After enabling, restart your computer.**

### Solution 2: Move to Shorter Path (Recommended)

Move everything to `C:\dev\SurfTutorApp\`:

1. **Create the new directory:**
   ```powershell
   mkdir C:\dev\SurfTutorApp
   ```

2. **Copy all files:**
   ```powershell
   # Copy everything from old location
   robocopy "C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project" "C:\dev\SurfTutorApp" /E /COPYALL
   ```

3. **Or manually move:**
   - Copy `backend` folder
   - Copy `ai_training` folder  
   - Copy `SurfTutorApp` folder contents to root
   - Copy all other files

4. **Update paths:**
   - All relative paths will work automatically
   - Scripts will use the new location

### Solution 3: Use Shorter Path Structure

If you can't move, restructure:
```
C:\RP\SurfApp\
├── backend\
├── ai_training\
└── app\  (instead of SurfTutorApp)
```

## Verify Fix

After enabling long paths or moving:
```powershell
cd C:\dev\SurfTutorApp  # or your new location
npm run android
```

## For Physical Device Setup

See `PHYSICAL_DEVICE_SETUP.md`


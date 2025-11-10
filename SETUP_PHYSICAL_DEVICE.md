# Setup for Physical Device (USB Connection)

## Your Configuration

- **Your Computer IP:** `172.28.18.132`
- **Backend Port:** `3000`
- **API URL:** `http://172.28.18.132:3000`

## Step-by-Step Setup

### 1. Fix Path Length Issue

**Option A: Enable Long Paths (Quick)**
```powershell
# Run PowerShell as Administrator
.\enable_long_paths.ps1
# Then restart your computer
```

**Option B: Move to Shorter Path (Recommended)**
```powershell
# Create new location
mkdir C:\dev\SurfTutorApp

# Copy everything
robocopy "C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\backend" "C:\dev\SurfTutorApp\backend" /E
robocopy "C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\ai_training" "C:\dev\SurfTutorApp\ai_training" /E
robocopy "C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\SurfTutorApp" "C:\dev\SurfTutorApp" /E /XD node_modules

# Then work from new location
cd C:\dev\SurfTutorApp
```

### 2. Update API Configuration

The API URL has been updated to use your IP: `172.28.18.132`

If you need to change it, edit `SurfTutorApp/src/services/api.ts`:
```typescript
return 'http://172.28.18.132:3000'; // Your IP
```

### 3. Enable USB Debugging on Phone

1. Go to **Settings > About Phone**
2. Tap **"Build Number"** 7 times
3. Go to **Settings > Developer Options**
4. Enable **"USB Debugging"**
5. Enable **"Install via USB"** (if available)

### 4. Connect Phone and Verify

```powershell
# Connect phone via USB
# On phone, select "File Transfer" or "MTP" mode

# Verify connection
adb devices
```

Should show your device. If not:
```powershell
adb kill-server
adb start-server
adb devices
```

### 5. Start Backend Server

```powershell
# From old location
cd C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\backend

# Or from new location
cd C:\dev\SurfTutorApp\backend

npm start
```

Keep this terminal open - backend should run on port 3000.

### 6. Test Backend from Phone

On your phone:
1. Open browser
2. Go to: `http://172.28.18.132:3000/health`
3. Should see: `{"status":"ok"}`

If it doesn't work:
- Check Windows Firewall (allow Node.js)
- Make sure phone and computer are on same Wi-Fi network
- Verify backend is running

### 7. Start Metro Bundler

**New Terminal:**
```powershell
# From old location
cd C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\SurfTutorApp

# Or from new location
cd C:\dev\SurfTutorApp

npm start
```

Keep this terminal open.

### 8. Run App on Device

**New Terminal:**
```powershell
# From old location
cd C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\SurfTutorApp

# Or from new location
cd C:\dev\SurfTutorApp

npm run android
```

The app should install and launch on your phone!

## Troubleshooting

### "Path too long" error
- Enable long paths: `.\enable_long_paths.ps1` (as Admin, then restart)
- OR move to `C:\dev\SurfTutorApp\`

### "Device not found"
```powershell
adb kill-server
adb start-server
adb devices
```

### "Cannot connect to backend"
- Verify backend is running: `http://localhost:3000/health`
- Test from phone browser: `http://172.28.18.132:3000/health`
- Check Windows Firewall
- Ensure phone and computer on same Wi-Fi

### "Installation failed"
- Enable "Install via USB" in Developer Options
- Try: `adb install -r app-debug.apk`

## Quick Commands

```powershell
# Check device
adb devices

# Check IP
ipconfig | Select-String "IPv4"

# Test backend from phone
# Open browser: http://172.28.18.132:3000/health

# Run app
npm run android
```

## Summary

1. ✅ Fix path length (enable long paths OR move to C:\dev\SurfTutorApp)
2. ✅ API URL updated to: `http://172.28.18.132:3000`
3. ✅ Enable USB Debugging on phone
4. ✅ Connect phone and verify (`adb devices`)
5. ✅ Start backend (`cd backend && npm start`)
6. ✅ Test backend from phone browser
7. ✅ Start Metro (`npm start`)
8. ✅ Run app (`npm run android`)

Good luck! 🚀


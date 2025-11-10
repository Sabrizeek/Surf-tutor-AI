# Physical Device Setup (USB Connection)

## Prerequisites

1. **Enable USB Debugging on your phone:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings > Developer Options
   - Enable "USB Debugging"
   - Enable "Install via USB" (if available)

2. **Connect via USB:**
   - Connect phone to computer via USB cable
   - On phone, select "File Transfer" or "MTP" mode (not "Charge only")
   - Allow USB debugging when prompted on phone

3. **Verify Connection:**
   ```powershell
   adb devices
   ```
   Should show your device listed.

## Configure API URL for Physical Device

When using a physical device, you need to use your computer's IP address instead of `localhost` or `10.0.2.2`.

### Step 1: Find Your Computer's IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually Wi-Fi or Ethernet).

Example: `192.168.1.100`

### Step 2: Update API Configuration

Edit `SurfTutorApp/src/services/api.ts`:

```typescript
const getBaseURL = () => {
  // @ts-ignore - __DEV__ is a global variable in React Native
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (Platform.OS === 'android') {
      // For physical device, use your computer's IP
      // Replace with your actual IP address
      return 'http://192.168.1.100:3000';  // <-- CHANGE THIS
    }
    return 'http://localhost:3000'; // iOS simulator
  }
  return 'https://your-production-api.com';
};
```

**Replace `192.168.1.100` with your actual IP address.**

### Step 3: Ensure Backend is Accessible

1. **Check Windows Firewall:**
   - Allow Node.js through firewall
   - Or temporarily disable firewall for testing

2. **Verify Backend is Running:**
   ```powershell
   # Test from your computer
   curl http://localhost:3000/health
   ```

3. **Test from Phone Browser:**
   - On your phone, open browser
   - Go to: `http://YOUR_IP:3000/health`
   - Should return: `{"status":"ok"}`

## Running the App

### Option 1: Via USB (Recommended)
```powershell
cd C:\dev\SurfTutorApp  # or your project location
npm run android
```

### Option 2: Via ADB
```powershell
# Build APK first
cd android
.\gradlew assembleDebug

# Install on device
adb install app\build\outputs\apk\debug\app-debug.apk
```

## Troubleshooting

### "Device not found"
```powershell
# Restart ADB
adb kill-server
adb start-server
adb devices
```

### "Cannot connect to backend"
- Verify phone and computer are on same Wi-Fi network
- Check firewall settings
- Verify IP address is correct
- Test from phone browser first

### "Installation failed"
- Enable "Install via USB" in Developer Options
- Try: `adb install -r app-debug.apk` (reinstall)

### "Metro bundler not connecting"
- Make sure Metro is running: `npm start`
- Check Metro is accessible from network
- Try: `npx react-native start --host 0.0.0.0`

## Quick Checklist

- [ ] USB Debugging enabled on phone
- [ ] Device connected and recognized (`adb devices`)
- [ ] Computer and phone on same Wi-Fi network
- [ ] API URL updated with computer's IP address
- [ ] Backend server running on port 3000
- [ ] Windows Firewall allows Node.js
- [ ] Can access backend from phone browser


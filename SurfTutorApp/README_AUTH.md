React Native auth screens and API client

Files added:
- `src/auth/ApiClient.js` - token storage and auth API helpers (uses AsyncStorage)
- `src/auth/AuthContext.js` - context/provider for auth state
- `src/screens/LoginScreen.js`, `RegisterScreen.js`, `ProfileScreen.js` - JavaScript UI screens
- `src/navigation/AppNavigator.js` - navigation stack wiring
- `App.js` - app entry that wraps `AuthProvider` and `AppNavigator`

Notes:
- This uses `@react-native-async-storage/async-storage` and `@react-navigation/native` + `@react-navigation/native-stack`.
- Install dependencies in your RN project (in SurfTutorApp):
  ```powershell
  cd SurfTutorApp
  npm install @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
  ```
- Expo: run `expo install` for native dependencies.
- Set API base: `process.env.API_BASE` or change `ApiClient.API_BASE` to your backend URL (e.g., `https://api.example.com`).

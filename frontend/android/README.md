# FinTrack AI Android Application

This is the production-ready Android application for FinTrack AI, built using Capacitor and Next.js.

## Features
- **Native Look & Feel**: Preserves the exact UI/UX of the FinTrack AI web dashboard.
- **Biometric Authentication**: Supports Fingerprint and Face Unlock for secure login.
- **Push Notifications**: Integrated with Firebase Cloud Messaging (FCM).
- **Deep Linking**: Supports `fintrack://` URL schemes.
- **Offline Support**: Bundled assets for instant loading and offline UI access.
- **Safe Area Support**: Optimized for notches and edge-to-edge displays.

## Development Setup

1. **Prerequisites**:
   - Android Studio Arctic Fox or newer.
   - Node.js & npm.
   - Capacitor CLI (`npm install -g @capacitor/cli`).

2. **Build the Web App**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Sync with Android**:
   ```bash
   npx cap sync android
   ```

4. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

## Release Configuration

### Signing
To generate a signed APK/AAB:
1. Open the project in Android Studio.
2. Go to `Build > Generate Signed Bundle / APK`.
3. Follow the wizard to create a new keystore or use an existing one.

### ProGuard/R8
Obfuscation and minification are enabled in `app/build.gradle` for release builds to optimize performance and security.

## Push Notifications Setup
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Add an Android App with package name `com.fintrack.ai`.
3. Download `google-services.json` and place it in `frontend/android/app/`.
4. Rebuild the project.

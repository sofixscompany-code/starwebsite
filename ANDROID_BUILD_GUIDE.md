# Star Coaching Institute - Android App Build Guide

## Overview

The Android app is built using **Capacitor** which wraps the React web app in a native Android shell. This gives you a native APK that shows the exact same dashboards as the website.

## Prerequisites

### 1. Install Java JDK 17+

```bash
# Download from https://adoptium.net/temurin/releases/?version=17
# Or use: winget install EclipseAdoptium.Temurin.17.JDK
```

### 2. Install Android Studio

```bash
# Download from https://developer.android.com/studio
# During installation, make sure to install:
# - Android SDK (API 34+)
# - Android SDK Build-Tools
# - Android SDK Platform-Tools
# - Android Virtual Device (AVD)
```

### 3. Set Environment Variables

```bash
# Add to system PATH:
# C:\Users\<your-user>\AppData\Local\Android\Sdk\platform-tools
# C:\Users\<your-user>\AppData\Local\Android\Sdk\tools

# Set ANDROID_HOME:
# C:\Users\<your-user>\AppData\Local\Android\Sdk
```

## Build Commands

### Development Build (Debug APK)

```bash
cd starweb

# Step 1: Build the web app
npm run build

# Step 2: Sync to Android
npx cap sync android

# Step 3: Open in Android Studio
npx cap open android
```

### Release Build (Signed APK)

```bash
# Step 1: Build web app
cd starweb
npm run build

# Step 2: Sync
npx cap sync android

# Step 3: Open Android Studio
npx cap open android

# Step 4: In Android Studio:
# Build → Generate Signed Bundle/APK → APK
# Create/use a keystore file
# Select release build type
# Click Finish
```

### Command Line Build (without Android Studio)

```bash
cd starweb/android

# Debug APK
./gradlew assembleDebug

# Release APK (unsigned)
./gradlew assembleRelease

# APK location: app/build/outputs/apk/debug/app-debug.apk
```

## Quick Start (Automated)

```bash
cd starweb

# One-command build + sync
npm run android:build

# Open in Android Studio
npm run android:open
```

## App Configuration

### App Details

- **App Name**: Star Coaching Institute
- **Package**: com.starcoaching.institute
- **Min SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 16 (API 36)

### Branding

- **Primary Color**: Navy Blue (#1E3A8A)
- **Accent Color**: Gold (#D4AF37)
- **Splash Screen**: Navy blue background with gold star logo

### Permissions

- Internet access
- Camera (for profile photos)
- Storage (for file uploads)
- Push Notifications
- Vibration
- Network state

## Features

### All 5 Role Dashboards

1. **Super Admin** - Full institute management
2. **Teacher** - Classes, attendance, assignments
3. **Student** - Courses, homework, results
4. **Parent** - Child progress monitoring
5. **Accountant** - Financial tracking

### Native Features

- Push notifications for notices and alerts
- Camera access for profile photos
- Offline support
- Splash screen with branding
- Status bar theming
- Keyboard handling

## Firebase Setup (for Push Notifications)

1. Go to Firebase Console
2. Add Android app with package name `com.starcoaching.institute`
3. Download `google-services.json`
4. Place it in `starweb/android/app/`
5. Rebuild the app

## Troubleshooting

### "SDK not found" error

```bash
# Make sure ANDROID_HOME is set
echo $ANDROID_HOME

# Or create local.properties
echo "sdk.dir=C:\\Users\\<your-user>\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

### Build fails

```bash
# Clean and rebuild
cd starweb/android
./gradlew clean
cd ..
npm run build
npx cap sync android
```

### APK not installing

- Make sure "Install from Unknown Sources" is enabled
- Check minimum SDK version (Android 7.0+)

## APK Output

After building, find your APK at:

```
starweb/android/app/build/outputs/apk/debug/app-debug.apk
starweb/android/app/build/outputs/apk/release/app-release.apk
```

## Deploy to Play Store

1. Build a signed release APK/AAB
2. Go to https://play.google.com/console
3. Create new app listing
4. Upload the AAB file
5. Fill in store listing details
6. Submit for review

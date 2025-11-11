# راهنمای Build محلی

## Build محلی Android APK

### ۱. نصب dependencies
```bash
npm install
```

### ۲. Prebuild (ایجاد فایل‌های native)
```bash
npx expo prebuild --clean
```

### ۳. Build APK
```bash
cd android
./gradlew assembleRelease
```

### ۴. پیدا کردن APK
APK در مسیر زیر قرار می‌گیرد:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Build برای Debug (تست)
```bash
cd android
./gradlew assembleDebug
```
APK Debug در مسیر زیر قرار می‌گیرد:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## مشکلات رایج

### خطای Gradle
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### خطای NDK
- مطمئن شوید Android SDK و NDK نصب شده‌اند
- در Android Studio: Tools > SDK Manager > SDK Tools > NDK

## نصب APK روی گوشی
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```


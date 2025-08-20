# 🏗️ Production Build Configuration

## Version Management

Update your version numbers for launch:

### package.json

```json
{
  "version": "1.0.0" // Change from "0.0.1"
}
```

### iOS (in Xcode)

- Marketing Version: 1.0.0
- Current Project Version: 1

### Android (build.gradle)

```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
}
```

## Environment Variables

Secure your API keys for production:

### .env.production

```bash
TMDB_API_KEY=your_production_api_key_here
```

### Webpack/Metro Config

Ensure environment variables are properly handled in production builds.

## Build Scripts

Add production build commands to package.json:

```json
{
  "scripts": {
    "build:ios": "react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/bundle.js",
    "build:android": "cd android && ./gradlew assembleRelease",
    "build:android-bundle": "cd android && ./gradlew bundleRelease"
  }
}
```

## Code Signing

### iOS

- Set up production certificates in Xcode
- Configure App Store distribution profile
- Archive and validate app before submission

### Android

- Generate production keystore
- Configure signing in build.gradle
- Build signed APK/AAB for Play Store

## Performance Optimization

- Enable Hermes JavaScript engine (check metro.config.js)
- Optimize images in app bundle
- Remove development dependencies from production build
- Test app performance on older devices

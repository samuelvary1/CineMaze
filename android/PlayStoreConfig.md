# Android Google Play Configuration for CineMaze

## Required Setup Steps

### 1. Google Play Console Configuration

1. **Create App**:
   - Log into Google Play Console
   - Create new app
   - App name: "CineMaze"
   - Package name: `com.cinemaze.app` (must match your app)

2. **Create Subscription Products**:
   - Go to Monetize → Products → Subscriptions
   - Create subscription product
   - Product ID: `premium_monthly`
   - Price: $0.99/month
   - Billing period: 1 month
   - Grace period: 3 days (recommended)

### 2. Android Project Configuration

1. **Package Name**: Must match Google Play Console
2. **Permissions**: Already included via react-native-iap
3. **Billing Library**: Handled by react-native-iap
4. **ProGuard**: May need rules for react-native-iap (if using)

### 3. Required Permissions (already included)

The following permissions are automatically added by react-native-iap:
```xml
<uses-permission android:name="com.android.vending.BILLING" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 4. Testing Configuration

1. **Internal Testing**:
   - Upload signed APK/AAB to Internal Testing track
   - Add test accounts to internal testing list
   - Test subscriptions with real Google accounts

2. **License Testing**:
   - Add test accounts in Play Console → Settings → License testing
   - These accounts can make test purchases without being charged

## Product Configuration Details

### Subscription Product:
- **Product ID**: `premium_monthly`
- **Price**: $0.99 USD
- **Billing Period**: P1M (1 month)
- **Free Trial**: Optional 7-day trial
- **Grace Period**: 3 days
- **Account Hold**: Enabled

### Subscription Benefits:
- **Title**: CineMaze Premium Monthly
- **Description**: Unlimited movie connection games and watchlist access

## Testing Notes

1. **Internal Testing** is required before subscriptions work
2. **Test accounts** must be added to your testing track
3. **Real payments** are processed in testing (but can be refunded)
4. **Subscription states** (active, expired, cancelled) can be tested
5. **Receipt validation** should be implemented for production

## Build Configuration

Add to `android/app/build.gradle` if needed:
```gradle
android {
    defaultConfig {
        // Ensure these match your Play Console app
        applicationId "com.cinemaze.app"
        versionCode 1
        versionName "1.0.0"
    }
}
```

## ProGuard Rules (if using ProGuard)

Add to `android/app/proguard-rules.pro`:
```
-keep class com.amazon.** { *; }
-keep class org.apache.http.** { *; }
-keep class com.android.vending.billing.** { *; }
```

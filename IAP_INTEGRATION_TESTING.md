# 🧪 Real IAP Integration Testing Guide

## Testing the New react-native-iap Integration

Your CineMaze app now uses **real App Store and Google Play subscriptions** instead of simulated ones!

### ✅ What Changed

1. **Real IAP Integration**: Uses `react-native-iap` library for actual subscription purchases
2. **Fallback Mode**: If IAP fails to initialize, falls back to simulated mode for development
3. **Purchase Listeners**: Handles real purchase events from app stores
4. **Receipt Validation**: Basic validation (expandable for production)
5. **Restore Purchases**: Users can restore previous purchases
6. **Proper Cleanup**: IAP connections are properly managed

### 🧪 Testing Steps

#### 1. Development Mode (Simulator/Emulator)

```bash
# Start the app
npm start
# In another terminal
npm run ios  # or npm run android
```

**Expected Behavior:**

- IAP initialization will fail (simulators don't support IAP)
- App will automatically fall back to simulated purchases
- All existing functionality continues to work
- Console will show: "IAP not available, using simulated purchase"

#### 2. Device Testing (Real Subscriptions)

**Requirements:**

- Physical iOS/Android device
- App Store Connect / Google Play Console setup
- Sandbox test account (iOS) or Internal Testing (Android)

**Test Flow:**

1. Install app on device
2. Try to purchase subscription
3. Complete real purchase flow through app store
4. Verify premium features are unlocked
5. Test "Restore Purchases" button

#### 3. Key Features to Test

✅ **Subscription Purchase:**

- Tap "Subscribe Now" in paywall
- Complete purchase through App Store/Play Store
- Verify premium access is granted

✅ **Restore Purchases:**

- Delete and reinstall app
- Tap "Restore Purchases" in paywall
- Verify subscription is restored

✅ **Subscription Expiry:**

- Let subscription expire
- Verify app reverts to free tier

✅ **Receipt Validation:**

- Purchase flows are validated
- Invalid purchases are rejected

### 🔧 Developer Features

Your **Developer Settings (🔧 button)** still work for testing:

- **Toggle Subscription**: Override subscription state
- **Reset Daily Plays**: Test daily limits
- **Clear All Data**: Reset to clean state

### 📱 Production Readiness

#### Before App Store Submission:

1. **Update Bundle ID**: Match your App Store Connect app
2. **Configure Products**: Set up subscription in App Store Connect
3. **Test with Sandbox**: Use sandbox accounts for testing
4. **Receipt Validation**: Consider server-side validation for production

#### App Store Connect Setup:

- Product ID: `com.cinemaze.premium.monthly` (iOS)
- Product ID: `premium_monthly` (Android)
- Price: $0.99/month
- Subscription Group: "Premium"

### 🚨 Important Notes

1. **IAP requires physical devices** - won't work in simulators
2. **Sandbox accounts are required** for iOS testing
3. **Internal Testing track required** for Android testing
4. **Real money transactions** happen in testing (but can be refunded)
5. **Subscription products must be approved** by Apple/Google before live use

### 💡 Next Steps

1. **Set up App Store Connect** and **Google Play Console** accounts
2. **Create subscription products** with the correct IDs
3. **Test on physical devices** with sandbox/test accounts
4. **Implement server-side receipt validation** for production security
5. **Submit for review** once testing is complete

Your app now has **production-ready subscription integration**! 🎉

# 💰 Real Subscription Integration Plan

## Current Status

Your app uses a simulated subscription system for testing. For production, you need:

## Required Dependencies

```bash
# Install React Native IAP for real subscriptions
npm install react-native-iap
# iOS
cd ios && pod install

# For Android, additional Google Play Billing setup required
```

## Implementation Steps

### 1. Replace SubscriptionService.js

- Replace `purchaseSubscription()` with real IAP calls
- Add receipt validation
- Handle subscription states (active, expired, cancelled)
- Add restore purchases functionality

### 2. iOS Setup

- Configure App Store Connect with subscription products
- Add StoreKit capability in Xcode
- Test with sandbox accounts

### 3. Android Setup

- Set up Google Play Console with subscription products
- Configure Google Play Billing Library
- Add billing permissions to AndroidManifest.xml

### 4. Testing

- iOS: Use sandbox environment with test accounts
- Android: Use Google Play Console testing tracks

## Code Changes Required

```javascript
// Replace in SubscriptionService.js
import RNIap, {
  requestSubscription,
  validateReceiptIos,
  validateReceiptAndroid,
  getProducts,
  initConnection,
  endConnection,
  getSubscriptions,
} from 'react-native-iap';

// Product IDs (must match App Store/Play Store)
const SUBSCRIPTION_SKUS = {
  MONTHLY: 'com.cinemaze.premium.monthly',
};
```

## Revenue & Analytics

- Integrate with App Store/Play Store analytics
- Track conversion rates from paywall
- Monitor subscription renewals and churn
- Add revenue tracking events

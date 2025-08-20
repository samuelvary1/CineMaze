# iOS App Store Configuration for CineMaze

## Required Setup Steps

### 1. App Store Connect Configuration

1. **Create App Record**:
   - Log into App Store Connect
   - Create new app with Bundle ID: `com.cinemaze.app` (or your chosen ID)
   - Set app name: "CineMaze"

2. **Create In-App Purchase Products**:
   - Go to Features → In-App Purchases
   - Create Auto-Renewable Subscription
   - Product ID: `com.cinemaze.premium.monthly`
   - Price: $0.99/month
   - Subscription Group: Create "Premium" group
   - Add localized titles and descriptions

### 2. Xcode Project Configuration

1. **Bundle Identifier**: Update in project settings to match App Store Connect
2. **Capabilities**: Add "In-App Purchase" capability in project settings
3. **Code Signing**: Set up development and distribution certificates

### 3. Testing Configuration

1. **Sandbox Testing**:
   - Create sandbox test accounts in App Store Connect
   - Use these accounts for testing purchases
   - Test on physical devices (not simulator)

2. **StoreKit Configuration File** (Optional for local testing):
   - Create StoreKit Configuration in Xcode
   - Add subscription products matching your App Store Connect setup

## Product Configuration Details

### Subscription Product:
- **Product ID**: `com.cinemaze.premium.monthly`
- **Type**: Auto-Renewable Subscription
- **Duration**: 1 Month
- **Price**: $0.99 USD
- **Family Sharing**: Enabled (recommended)

### Subscription Group:
- **Name**: Premium
- **Subscription Level**: 1 (Base level)

### Localized Information:
- **Display Name**: CineMaze Premium
- **Description**: Unlimited plays and watchlist access for the ultimate movie connection experience

## Important Notes

1. **Subscription products must be approved** by Apple before they can be purchased by real users
2. **Sandbox testing** works immediately after creation
3. **Receipt validation** should be implemented server-side for production
4. **Family Sharing** allows family members to share the subscription
5. **Grace period** and **renewal settings** can be configured in App Store Connect

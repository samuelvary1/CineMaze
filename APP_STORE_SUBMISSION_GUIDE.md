# 🚀 CineMaze App Store Submission Guide

## Current Status ✅

- ✅ Real IAP integration with react-native-iap
- ✅ Legal documents (Privacy Policy & Terms of Service) live at:
  - Privacy: https://samuelvary1.github.io/CineMaze/web-legal/privacy.html
  - Terms: https://samuelvary1.github.io/CineMaze/web-legal/terms.html
- ✅ Subscription product IDs defined in code
- ✅ Clean development environment

## Next Steps for App Store Submission

### 1. 📱 iOS App Store Connect Setup

#### Step 1: Create Apple Developer Account

1. Visit [developer.apple.com](https://developer.apple.com)
2. Enroll in Apple Developer Program ($99/year)
3. Wait for approval (usually 24-48 hours)

#### Step 2: App Store Connect Configuration

1. **Create App Record**:

   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click "+" to create new app
   - **Platform**: iOS
   - **Name**: "CineMaze"
   - **Primary Language**: English (US)
   - **Bundle ID**: `com.cinemaze.app` (register this first in Certificates)
   - **SKU**: `cinemaze-ios-001`

2. **App Information**:
   - **Name**: CineMaze
   - **Subtitle**: Movie Connection Puzzle Game
   - **Category**: Games > Puzzle
   - **Secondary Category**: Entertainment
   - **Content Rights**: You own or have licensed all rights

#### Step 3: Set Up In-App Purchases

1. **Go to Features → In-App Purchases**
2. **Create Auto-Renewable Subscription**:

   - **Reference Name**: Premium Monthly Subscription
   - **Product ID**: `com.cinemaze.premium.monthly`
   - **Subscription Group**: Create "Premium Subscriptions"
   - **Subscription Duration**: 1 Month
   - **Price**: $0.99 USD (Tier 1)

3. **Subscription Details**:
   - **Display Name**: CineMaze Premium
   - **Description**: "Unlimited movie connection games, expanded watchlist, and exclusive features. Connect actors, movies, and discover new cinema experiences!"

#### Step 4: App Store Listing

1. **App Description**:

```
Test your movie knowledge with CineMaze - the ultimate movie connection puzzle game!

🎬 CONNECT THE DOTS
Link actors through their movies in challenging puzzles. Start with one actor, end with another, and find the shortest path through cinema history!

🌟 FEATURES
• Thousands of actors and movies from classic to contemporary
• Multiple difficulty levels
• Personal watchlist to track discovered movies
• Daily challenges and achievements
• Clean, intuitive interface

🎯 PREMIUM FEATURES
• Unlimited gameplay (free version has daily limits)
• Advanced difficulty modes
• Expanded movie database
• Priority access to new features

Perfect for movie buffs, trivia lovers, and anyone who enjoys a good mental challenge!

Download CineMaze today and start your cinematic journey!
```

2. **Keywords**: movie,game,puzzle,trivia,actor,cinema,entertainment,quiz,challenge,film

3. **Required URLs**:
   - **Privacy Policy**: https://samuelvary1.github.io/CineMaze/web-legal/privacy.html
   - **Terms of Service**: https://samuelvary1.github.io/CineMaze/web-legal/terms.html

### 2. 🤖 Google Play Console Setup

#### Step 1: Create Google Play Developer Account

1. Visit [play.google.com/console](https://play.google.com/console)
2. Pay one-time $25 registration fee
3. Complete identity verification

#### Step 2: Create App

1. **Create App**:

   - **App Name**: CineMaze
   - **Default Language**: English (US)
   - **App or Game**: Game
   - **Free or Paid**: Free with in-app purchases

2. **Store Listing**:
   - **Short Description**: Movie connection puzzle game - link actors through films!
   - **Full Description**: (Use similar content as iOS but formatted for Play Store)
   - **App Category**: Puzzle
   - **Content Rating**: Everyone

#### Step 3: Set Up Subscriptions

1. **Go to Monetization → Products → Subscriptions**
2. **Create Subscription**:
   - **Product ID**: `premium_monthly`
   - **Name**: CineMaze Premium Monthly
   - **Description**: Unlimited gameplay and premium features
   - **Billing Period**: 1 month (P1M)
   - **Price**: $0.99 USD
   - **Grace Period**: 3 days
   - **Free Trial**: 7 days (optional)

### 3. 📸 Assets Needed for Submission

#### Screenshots Required:

Create screenshots showing:

1. **Game Interface**: Main movie connection puzzle
2. **Watchlist**: Personal movie watchlist feature
3. **Premium Features**: Subscription benefits
4. **Stats/Progress**: User achievements or stats

#### iOS Screenshot Sizes:

- iPhone 6.7" (iPhone 15 Pro Max): 2796 x 1290 px
- iPhone 6.5" (iPhone 14 Plus): 2688 x 1242 px
- iPad Pro 12.9": 2732 x 2048 px

#### Android Screenshot Sizes:

- Phone: 2960 x 1440 px (16:9 ratio)
- Tablet (7"): 2048 x 1536 px
- Tablet (10"): 2560 x 1800 px

#### Feature Graphic (Google Play):

- Size: 1024 x 500 px
- Show app name, key features, movie theme

### 4. 🔧 Technical Preparation

#### Update Bundle Identifier (iOS)

1. Open Xcode project
2. Select CineMaze target
3. Set Bundle Identifier to `com.cinemaze.app`
4. Enable "In-App Purchase" capability

#### Update Package Name (Android)

1. Update `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.cinemaze.app"
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### Build Configuration

- **iOS**: Archive and upload to App Store Connect
- **Android**: Generate signed AAB for Play Console

### 5. 🧪 Testing Strategy

#### iOS Testing:

1. **Sandbox Testing**: Use Apple's sandbox environment
2. **TestFlight**: Internal testing before public release
3. **Test Accounts**: Create test users in App Store Connect

#### Android Testing:

1. **Internal Testing**: Upload to Play Console internal track
2. **Closed Testing**: Add specific testers via email
3. **License Testing**: Configure test accounts for free purchases

### 6. 📋 Pre-Submission Checklist

#### Required for Both Stores:

- [ ] App icons (1024x1024 for store, various sizes in app)
- [ ] Screenshots for all required device sizes
- [ ] App description and keywords
- [ ] Privacy Policy URL working
- [ ] Terms of Service URL working
- [ ] Age rating/content rating completed
- [ ] In-app purchase products configured
- [ ] Test subscription flow on physical devices

#### iOS Specific:

- [ ] Apple Developer account active
- [ ] Bundle ID registered and configured
- [ ] In-App Purchase capability enabled
- [ ] Archive uploaded to App Store Connect
- [ ] Subscription products submitted for review

#### Android Specific:

- [ ] Google Play Developer account verified
- [ ] Signed AAB uploaded to Play Console
- [ ] Subscription products configured
- [ ] Content rating questionnaire completed

### 7. 🚀 Submission Process

#### iOS Submission:

1. **Upload Build**: Use Xcode or Application Loader
2. **Complete Metadata**: Fill all required fields in App Store Connect
3. **Submit for Review**: Apple review takes 1-7 days
4. **Release**: Manual or automatic after approval

#### Android Submission:

1. **Upload AAB**: To Play Console
2. **Complete Store Listing**: All metadata and assets
3. **Submit for Review**: Google review takes 1-3 days
4. **Release**: Choose rollout percentage

## 🎯 Success Metrics to Track

1. **Downloads**: Track organic vs. featured traffic
2. **Subscription Conversion**: Free to premium conversion rate
3. **Retention**: Day 1, 7, 30 retention rates
4. **User Reviews**: Monitor feedback for improvements
5. **Revenue**: Track subscription revenue and trends

## 📞 Support Resources

- **Apple Developer Support**: [developer.apple.com/support](https://developer.apple.com/support)
- **Google Play Support**: [support.google.com/googleplay](https://support.google.com/googleplay)
- **React Native IAP Docs**: [react-native-iap.github.io](https://react-native-iap.github.io)

---

**Ready to submit? Start with creating your developer accounts and setting up the app records!**

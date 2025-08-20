# 🎯 CineMaze App Store Configuration - Action Items

## Immediate Next Steps (Priority Order)

### 1. 🍎 Apple Developer Account Setup

**Action Required**: Create Apple Developer Account

- [ ] Visit [developer.apple.com](https://developer.apple.com)
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Complete identity verification
- [ ] Wait for approval (24-48 hours)

### 2. 🤖 Google Play Developer Account Setup

**Action Required**: Create Google Play Developer Account

- [ ] Visit [play.google.com/console](https://play.google.com/console)
- [ ] Pay one-time $25 registration fee
- [ ] Complete identity verification
- [ ] Account activation (usually immediate)

### 3. 📱 Configure iOS Project

**Status**: ⚠️ Needs Bundle ID Update

#### Required Changes:

1. **Update Bundle Identifier**:

   - Open Xcode project: `/Users/samuelvary/Development/CineMaze/ios/CineMaze.xcworkspace`
   - Select CineMaze target → Signing & Capabilities
   - Change Bundle Identifier from current to: `com.cinemaze.app`
   - Add "In-App Purchase" capability

2. **Update Info.plist** (if needed):
   - Verify app name displays correctly
   - Ensure privacy descriptions are present

### 4. 🤖 Configure Android Project

**Status**: ✅ Updated (com.cinemaze.app)

#### Completed:

- ✅ Package name updated to `com.cinemaze.app`
- ✅ Version set to `1.0.0`
- ✅ react-native-iap permissions already included

#### Next Steps:

- [ ] Generate signed AAB for Play Store
- [ ] Test on physical Android device

### 5. 🎨 Create App Store Assets

#### Screenshots Needed:

Create screenshots showing these key features:

1. **Main Game Screen**: Movie connection puzzle interface
2. **Watchlist Screen**: Personal movie collection
3. **Premium Features**: Subscription benefits overview
4. **Stats/Progress**: Achievement or progress screen

#### Required Sizes:

**iOS Screenshots:**

- iPhone 6.7" (2796 x 1290): iPhone 15 Pro Max
- iPhone 6.5" (2688 x 1242): iPhone 14 Plus
- iPad Pro 12.9" (2732 x 2048): Latest iPad Pro

**Android Screenshots:**

- Phone (2960 x 1440): Samsung Galaxy S series format
- Tablet 7" (2048 x 1536): Standard Android tablet
- Tablet 10" (2560 x 1800): Large Android tablet

**Additional Assets:**

- App Icon: 1024x1024 (store listing)
- Feature Graphic (Android): 1024 x 500

### 6. 📝 Prepare Store Listings

#### App Descriptions Ready:

- [x] Privacy Policy: https://samuelvary1.github.io/CineMaze/web-legal/privacy.html
- [x] Terms of Service: https://samuelvary1.github.io/CineMaze/web-legal/terms.html

#### Store Description Draft:

```
CineMaze - Movie Connection Puzzle Game

Test your movie knowledge with the ultimate cinema puzzle! Connect actors through their movies in challenging brain teasers.

🎬 HOW TO PLAY
Start with one actor, end with another, find the shortest path through movies they've appeared in together.

🌟 FEATURES
• Thousands of actors & movies from classic to contemporary
• Multiple difficulty levels
• Personal watchlist for discovered movies
• Daily challenges and achievements
• Clean, intuitive interface

🎯 PREMIUM SUBSCRIPTION ($0.99/month)
• Unlimited gameplay (free has daily limits)
• Advanced difficulty modes
• Expanded movie database
• Early access to new features

Perfect for movie buffs, trivia enthusiasts, and puzzle lovers!

Keywords: movie, game, puzzle, trivia, actor, cinema, entertainment, quiz, challenge, film
```

### 7. 🔧 Set Up In-App Purchases

#### iOS App Store Connect:

**After developer account approval:**

- [ ] Create app record with Bundle ID: `com.cinemaze.app`
- [ ] Set up Auto-Renewable Subscription:
  - Product ID: `com.cinemaze.premium.monthly`
  - Price: $0.99/month
  - Subscription Group: "Premium Subscriptions"

#### Google Play Console:

**After developer account approval:**

- [ ] Create app with Package Name: `com.cinemaze.app`
- [ ] Set up Subscription:
  - Product ID: `premium_monthly`
  - Price: $0.99/month
  - Billing Period: 1 month (P1M)

### 8. 🧪 Testing Strategy

#### Required Testing:

- [ ] **iOS**: Test on physical iPhone with sandbox account
- [ ] **Android**: Test on physical Android device with test account
- [ ] **Subscription Flow**: Verify purchase, restore, cancellation
- [ ] **Offline Mode**: Test app functionality without internet
- [ ] **Different Screen Sizes**: iPhone, iPad, Android phones/tablets

#### Test Accounts Needed:

- [ ] Apple sandbox test users (2-3 accounts)
- [ ] Google Play test accounts (2-3 accounts)

### 9. 📊 Build for Production

#### iOS Build:

```bash
# Clean and rebuild
cd ios
rm -rf build
cd ..
npx react-native run-ios --configuration Release

# Create archive in Xcode
# Product → Archive → Upload to App Store Connect
```

#### Android Build:

```bash
# Generate signed AAB
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 10. 📈 Launch Preparation

#### Pre-Launch Checklist:

- [ ] All store assets ready and approved
- [ ] Subscription products configured and approved
- [ ] App tested on multiple devices
- [ ] Legal documents accessible
- [ ] Support contact information ready
- [ ] Marketing materials prepared

#### Launch Day Tasks:

- [ ] Submit iOS app for review (1-7 days)
- [ ] Submit Android app for review (1-3 days)
- [ ] Monitor reviews and ratings
- [ ] Prepare for user feedback and support

---

## 🚨 Critical Dependencies

**Cannot proceed without:**

1. ✅ Apple Developer Account ($99/year)
2. ✅ Google Play Developer Account ($25 one-time)
3. 📱 Physical iOS device for testing
4. 📱 Physical Android device for testing

**Development Priority:**

1. **Week 1**: Create developer accounts, configure projects
2. **Week 2**: Create screenshots and store assets
3. **Week 3**: Test subscription flows, finalize listings
4. **Week 4**: Submit for review and launch

---

## 📞 Need Help?

**Stuck on any step?**

- Apple: [developer.apple.com/support](https://developer.apple.com/support)
- Google: [support.google.com/googleplay](https://support.google.com/googleplay)
- React Native IAP: [react-native-iap.github.io](https://react-native-iap.github.io)

**Ready to start?** Begin with creating your developer accounts!

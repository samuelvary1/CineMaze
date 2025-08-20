# 🍎 iOS App Store - Priority Setup (Apple Developer Account Ready)

## ✅ Status: Apple Developer Account Active

Since you already have your Apple Developer account, let's fast-track your iOS submission!

## 🎯 Immediate iOS Tasks (Priority Order)

### 1. 📱 Configure iOS Project in Xcode

**Action Required Now:**

1. **Open Xcode Project:**

   ```bash
   open ios/CineMaze.xcworkspace
   ```

2. **Update Bundle Identifier:**

   - Select "CineMaze" target in project navigator
   - Go to "Signing & Capabilities" tab
   - Change Bundle Identifier to: `com.cinemaze.app`
   - Make sure your Apple Developer team is selected

3. **Add In-App Purchase Capability:**

   - In "Signing & Capabilities" tab
   - Click "+ Capability"
   - Add "In-App Purchase"

4. **Verify Signing:**
   - Ensure "Automatically manage signing" is checked
   - Your developer team should be selected
   - No signing errors should be present

### 2. 🏪 App Store Connect Setup

**Next Step: Create Your App Record**

1. **Go to App Store Connect:**

   - Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Sign in with your Apple Developer account

2. **Create New App:**

   - Click "+" button → "New App"
   - **Platform:** iOS
   - **Name:** CineMaze
   - **Primary Language:** English (US)
   - **Bundle ID:** Register `com.cinemaze.app` first (if not already done)
   - **SKU:** `cinemaze-ios-001`

3. **Register Bundle ID (if needed):**
   - Go to [developer.apple.com](https://developer.apple.com) → Certificates, Identifiers & Profiles
   - Click "Identifiers" → "+"
   - Choose "App IDs" → "App"
   - Description: "CineMaze App"
   - Bundle ID: `com.cinemaze.app`
   - Capabilities: Check "In-App Purchase"

### 3. 💰 Set Up In-App Purchases

**Critical for Subscription Revenue:**

1. **In App Store Connect:**

   - Go to your app → Features → In-App Purchases
   - Click "+" → "Auto-Renewable Subscription"

2. **Create Subscription Group:**

   - Reference Name: "Premium Subscriptions"
   - App Name: "CineMaze"

3. **Create Subscription Product:**

   - **Reference Name:** Premium Monthly Subscription
   - **Product ID:** `com.cinemaze.premium.monthly`
   - **Subscription Group:** Premium Subscriptions
   - **Subscription Duration:** 1 Month
   - **Price:** $0.99 USD (Tier 1)

4. **Subscription Localization:**
   - **Display Name:** CineMaze Premium
   - **Description:** "Unlimited movie connection games, expanded watchlist, and exclusive features. Connect actors, movies, and discover new cinema experiences!"

### 4. 📝 Complete App Information

**Store Listing Details:**

1. **App Information:**

   - **Name:** CineMaze
   - **Subtitle:** Movie Connection Puzzle Game
   - **Category:** Games
   - **Secondary Category:** Entertainment

2. **Pricing & Availability:**

   - **Price:** Free (with In-App Purchases)
   - **Availability:** All countries
   - **Age Rating:** 4+ (No Objectionable Content)

3. **App Privacy:**
   - **Privacy Policy URL:** https://samuelvary1.github.io/CineMaze/web-legal/privacy.html
   - **Terms of Service URL:** https://samuelvary1.github.io/CineMaze/web-legal/terms.html

### 5. 📸 iOS Screenshots Needed

**Required Sizes for Submission:**

Create screenshots showing these features:

1. **Main Game Screen** - Movie connection puzzle
2. **Watchlist Feature** - Personal movie collection
3. **Premium Benefits** - Subscription features
4. **Stats/Progress** - User achievements

**Required iPhone Sizes:**

- **iPhone 6.7"** (iPhone 15 Pro Max): 2796 x 1290 pixels
- **iPhone 6.5"** (iPhone 14 Plus): 2688 x 1242 pixels

**Required iPad Sizes:**

- **iPad Pro 12.9"** (6th gen): 2732 x 2048 pixels

**Pro Tip:** Take screenshots on the largest devices first, then resize down for smaller requirements.

### 6. 🔨 Build and Test

**Ready to Build:**

1. **Test on Physical Device:**

   ```bash
   npx react-native run-ios --device
   ```

2. **Create Archive for App Store:**

   - In Xcode: Product → Archive
   - This will create a build for App Store submission

3. **Test Subscription Flow:**
   - Use sandbox testing with your developer account
   - Test purchase, restore, and cancellation flows

### 7. 📤 Submit for Review

**Final Steps:**

1. **Upload Build:**

   - From Xcode Organizer after archiving
   - Or use Application Loader

2. **Complete Metadata:**

   - App description, keywords, screenshots
   - Subscription product review submission

3. **Submit for Review:**
   - Review takes 1-7 days typically
   - Apple will test your app and IAP functionality

## 🤖 Google Play Developer Account

**For Google Play (when ready):**

Since you're not sure about your Google Play account:

1. **Check if you have one:**

   - Visit [play.google.com/console](https://play.google.com/console)
   - Try signing in with your Google account

2. **If you need to create one:**

   - One-time $25 registration fee
   - Identity verification required
   - Usually approved within 24 hours

3. **Benefits of having both stores:**
   - Reach both iOS and Android users
   - Diversified revenue streams
   - Better market coverage

## ⚡ Quick Start Commands

**Test your current iOS setup:**

```bash
# Check if iOS builds properly
npx react-native run-ios --configuration Release

# Run our build preparation script
./build-production.sh
```

**Open required tools:**

```bash
# Open Xcode workspace
open ios/CineMaze.xcworkspace

# Check project configuration
open ios/CineMaze.xcodeproj
```

## 🎯 This Week's iOS Goals

**Day 1-2:** Configure Xcode project and App Store Connect
**Day 3-4:** Set up In-App Purchases and test on device  
**Day 5-6:** Create screenshots and complete store listing
**Day 7:** Submit for Apple review

## 📞 Apple-Specific Resources

- **App Store Connect:** [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- **Developer Portal:** [developer.apple.com](https://developer.apple.com)
- **IAP Guide:** [developer.apple.com/in-app-purchase/](https://developer.apple.com/in-app-purchase/)
- **Review Guidelines:** [developer.apple.com/app-store/review/guidelines/](https://developer.apple.com/app-store/review/guidelines/)

---

**Ready to start?** Let's begin with configuring your Xcode project! Run `open ios/CineMaze.xcworkspace` to get started.

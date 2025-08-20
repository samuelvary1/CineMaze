# 🚀 Dual Platform Launch Strategy (iOS + Android)

## ✅ Status: Both Developer Accounts Ready!

- ✅ Apple Developer Account: Active
- ✅ Google Play Developer Account: Just Registered

## 🎯 Optimized Launch Plan (Both Platforms)

### **Week 1: Project Configuration**

**Monday-Tuesday: Configure Both Platforms**

#### iOS Configuration (Xcode):

```bash
# Should already be open, if not:
open ios/CineMaze.xcworkspace
```

**In Xcode:**

- [ ] Bundle Identifier: `com.cinemaze.app`
- [ ] Add "In-App Purchase" capability
- [ ] Select your Apple Developer team
- [ ] Test build: `npx react-native run-ios --configuration Release`

#### Android Configuration:

✅ **Already Updated:** Package name set to `com.cinemaze.app`

**Test Android Build:**

```bash
cd android
./gradlew clean
./gradlew bundleRelease
cd ..
```

### **Week 1: Store Setup**

**Wednesday-Thursday: Create App Records**

#### App Store Connect:

1. **Create App Record:**

   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - New App → iOS → "CineMaze"
   - Bundle ID: `com.cinemaze.app`
   - SKU: `cinemaze-ios-001`

2. **Set Up In-App Purchase:**
   - Product ID: `com.cinemaze.premium.monthly`
   - Price: $0.99/month
   - Auto-renewable subscription

#### Google Play Console:

1. **Create App:**

   - Go to [play.google.com/console](https://play.google.com/console)
   - Create app → "CineMaze"
   - Package: `com.cinemaze.app`
   - Category: Games → Puzzle

2. **Set Up Subscription:**
   - Product ID: `premium_monthly`
   - Price: $0.99/month
   - Billing period: 1 month (P1M)

### **Week 2: Assets & Testing**

**Create Screenshots & Test Functionality**

#### Screenshot Requirements:

**iOS:**

- iPhone 6.7" (2796 x 1290) - iPhone 15 Pro Max
- iPhone 6.5" (2688 x 1242) - iPhone 14 Plus
- iPad Pro 12.9" (2732 x 2048)

**Android:**

- Phone (2960 x 1440) - 16:9 ratio
- Tablet 7" (2048 x 1536)
- Tablet 10" (2560 x 1800)
- Feature Graphic (1024 x 500)

#### Content for Screenshots:

1. **Main Game Screen** - Movie connection puzzle
2. **Watchlist Feature** - Personal collection
3. **Premium Benefits** - Subscription overview
4. **Stats/Progress** - User achievements

### **Week 3: Store Listings**

**Complete Metadata & Descriptions**

#### Store Description (Both Platforms):

```
CineMaze - Movie Connection Puzzle Game

🎬 Test your movie knowledge with the ultimate cinema puzzle! Connect actors through their movies in challenging brain teasers.

🌟 HOW TO PLAY
Start with one actor, end with another, and find the shortest path through movies they've appeared in together.

✨ FEATURES
• Thousands of actors & movies from classic to contemporary
• Multiple difficulty levels for all skill levels
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

#### Required Information:

- **Privacy Policy:** https://samuelvary1.github.io/CineMaze/web-legal/privacy.html
- **Terms of Service:** https://samuelvary1.github.io/CineMaze/web-legal/terms.html
- **Support Email:** (you'll need to provide this)
- **App Icon:** 1024x1024 for store listings

### **Week 4: Testing & Submission**

#### Testing Phase:

**iOS:**

- TestFlight internal testing
- Sandbox subscription testing
- Test on iPhone & iPad

**Android:**

- Internal testing track
- License testing for subscriptions
- Test on various Android devices

#### Submission:

**iOS:**

- Upload archive to App Store Connect
- Submit for review (1-7 days)

**Android:**

- Upload AAB to Play Console
- Submit for review (1-3 days)

## 🛠️ Immediate Action Items

### **Today (Priority 1):**

1. **Configure iOS in Xcode:**

   ```bash
   open ios/CineMaze.xcworkspace
   ```

   - Update Bundle ID to `com.cinemaze.app`
   - Add In-App Purchase capability

2. **Test Both Platforms:**

   ```bash
   # Test iOS
   npx react-native run-ios --configuration Release

   # Test Android
   ./build-production.sh
   # Choose option 2 for Android build
   ```

3. **Create App Records:**
   - iOS: [App Store Connect](https://appstoreconnect.apple.com)
   - Android: [Google Play Console](https://play.google.com/console)

### **This Week (Priority 2):**

4. **Set Up In-App Purchases** on both platforms
5. **Create screenshots** for required device sizes
6. **Write store descriptions** using template above

## 🎯 Competitive Advantage

**Launching on Both Platforms Simultaneously:**

- ✅ Maximum market reach from day one
- ✅ Diversified revenue streams
- ✅ Better app store algorithm performance
- ✅ Cross-platform user acquisition

## 📊 Expected Timeline

- **Week 1:** Platform setup and testing
- **Week 2:** Asset creation and store configuration
- **Week 3:** Submission preparation
- **Week 4:** Review and launch
- **Total:** ~30 days to live on both stores

## 🚨 Critical Success Factors

1. **Test on Physical Devices:** Both iOS and Android
2. **Subscription Flow Testing:** Purchase, restore, cancel
3. **Store Asset Quality:** High-quality screenshots
4. **Legal Compliance:** Privacy/Terms documents (✅ Done)

---

**Ready to start? Let's configure both platforms today!**

Run this to test your current setup:

```bash
./build-production.sh
```

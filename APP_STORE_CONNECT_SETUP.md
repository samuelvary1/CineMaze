# App Store Connect Setup Guide - Complete Launch Checklist

## 🎯 **CRITICAL PATH TO LAUNCH**

### Prerequisites

1. ✅ Apple Developer Account ($99/year) - [Sign up here](https://developer.apple.com/programs/)
2. ✅ Valid payment method
3. ✅ Your app built and ready to archive

---

## 📱 Create New App Record

### Step 1: Access App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Click "My Apps"
4. Click the "+" button and select "New App"

### Step 2: App Information

Fill out the required information:

**Platforms**: ✅ iOS

**Name**: `CineMaze`

**Primary Language**: English (U.S.)

**Bundle ID**: `com.cinemaze.app`
_(This should appear in your dropdown since we configured it in Xcode)_

**SKU**: `cinemaze-ios-2025`
_(Unique identifier for your app)_

**User Access**: Full Access

### Step 3: App Store Information

#### App Information Tab

- **Name**: CineMaze
- **Subtitle**: Movie Discovery Game
- **Category**:
  - Primary: Games
  - Secondary: Entertainment
- **Content Rights**: Check if you own or have licensed all content

#### Pricing and Availability

- **Price**: Free (since it's subscription-based)
- **Availability**: All countries/regions
- **App Store Distribution**: Available on the App Store

## 🔄 In-App Purchases Configuration - **THIS IS CRITICAL**

⚠️ **IMPORTANT**: Your code expects `com.cinemaze.premium.monthly` - make sure this matches exactly!

### Step 1: Create Subscription Group

1. Go to "Features" → "In-App Purchases"
2. Click "+" → "Auto-Renewable Subscriptions"
3. Create new subscription group:
   - **Reference Name**: `CineMaze Premium Subscriptions`
   - **App Store Display Name**: `CineMaze Premium`

### Step 2: Create Monthly Subscription (REQUIRED)

1. Inside the subscription group, click "Create Subscription"
2. **Product ID**: `com.cinemaze.premium.monthly` ⚠️ **MUST MATCH YOUR CODE**
3. **Reference Name**: `CineMaze Premium Monthly`

#### Subscription Details

- **Subscription Duration**: 1 Month
- **Price**: $0.99 (Tier 1) or your preferred price
- **Display Name**: `Premium Monthly`
- **Description**: `Unlimited daily plays and watchlist access`

#### Required for Subscriptions

- **Privacy Policy URL**: You'll need to create and host this
- **Terms of Use URL**: Optional but recommended

### Step 3: Subscription Review Information

**Screenshot for Review**: Upload screenshot showing premium features
**Review Notes**:

```
This subscription unlocks:
- Unlimited daily movie game plays
- Ability to save movies to watchlist
- Access to favorite actors feature
- No ads or play limits

Test with sandbox account provided.
```

## 📝 App Store Listing Content

### App Store Screenshots (Required)

**iPhone Screenshots** (6.7" Display - iPhone 14 Pro Max):

- Screenshot 1: Main discovery screen with movie cards
- Screenshot 2: Paywall modal showing subscription options
- Screenshot 3: Game rewards and player stats
- Screenshot 4: Movie details screen
- Screenshot 5: Settings/profile screen

### App Preview Video (Optional but Recommended)

- 30-second video showing core gameplay
- Demonstrate movie discovery mechanism
- Show premium features briefly

### App Description

```
Discover your next favorite movie with CineMaze - the engaging movie discovery game that makes finding great films fun and rewarding!

🎬 HOW IT WORKS
• Swipe through curated movie recommendations
• Build your personal watchlist
• Earn rewards for discovering new genres
• Challenge yourself with movie trivia

✨ PREMIUM FEATURES
• Unlimited movie discoveries
• Ad-free experience
• Exclusive premium movie collections
• Advanced filtering options
• Priority customer support

🎯 PERFECT FOR
• Movie enthusiasts seeking new films
• Casual viewers wanting curated recommendations
• Anyone who loves discovery games
• Film buffs looking for hidden gems

🚀 START YOUR MOVIE JOURNEY
Download CineMaze today and turn movie discovery into an adventure!

Premium subscription auto-renews monthly or yearly. Cancel anytime in Settings.
```

### Keywords

```
movie, film, discovery, recommendation, cinema, entertainment, game, swipe, watchlist, streaming
```

### App Store Categories

- **Primary**: Games
- **Secondary**: Entertainment

## 🔒 App Privacy

### Privacy Policy URL

`https://samuelvary1.github.io/CineMaze/web-legal/privacy.html`

### Data Collection Practices

Based on our app implementation:

**Data Types Collected**:

- User Preferences (for movie recommendations)
- App Usage Data (for analytics)
- Purchase History (for subscription management)

**Data Uses**:

- App Functionality
- Analytics
- Product Personalization

## 📋 Review Information

### App Review Information

- **Sign-in Required**: No
- **Demo Account**: Not needed (app works without account)
- **Contact Information**: Your developer contact details
- **Notes**:

```
CineMaze is a movie discovery game with optional premium subscriptions.
All core functionality works without purchase. Premium features include
unlimited discoveries and ad removal. Real IAP integration implemented
with react-native-iap library.
```

## 🎯 Age Rating

### Age Rating Questionnaire

Answer based on movie content:

- **Cartoon or Fantasy Violence**: None
- **Realistic Violence**: None (movie descriptions only)
- **Sexual Content or Nudity**: None
- **Profanity or Crude Humor**: Infrequent/Mild (movie descriptions)
- **Alcohol, Tobacco, or Drug Use**: None
- **Simulated Gambling**: None
- **Horror/Fear Themes**: Infrequent/Mild (horror movie descriptions)
- **Mature/Suggestive Themes**: Infrequent/Mild (movie themes)

Expected Rating: **4+** or **9+** depending on movie content level

## ✅ Pre-Submission Checklist

Before submitting for review:

- [ ] App builds successfully on device
- [ ] All subscription products are configured
- [ ] Privacy policy is accessible
- [ ] Terms of service are accessible
- [ ] Screenshots uploaded for all required sizes
- [ ] App description is complete and accurate
- [ ] Age rating questionnaire completed
- [ ] Test subscription flow on TestFlight
- [ ] Verify restore purchases functionality

## 🚀 **IMMEDIATE ACTION STEPS**

### Today (Day 1):

1. **Sign up for Apple Developer Program** if not done ($99/year)
2. **Create app in App Store Connect** using info above
3. **Set up the subscription product** with exact Product ID: `com.cinemaze.premium.monthly`

### Tomorrow (Day 2):

1. **Archive your app in Xcode**:

   ```bash
   # In Xcode:
   1. Select "Any iOS Device" target
   2. Product → Archive
   3. Upload to App Store Connect
   ```

2. **Upload screenshots** (take from your device/simulator)

### Day 3:

1. **Test with TestFlight** - verify subscription works
2. **Submit for App Store Review**

### Timeline:

- **Setup**: 1-2 days
- **Review**: 24-48 hours typically
- **Launch**: Within 1 week! 🎉

## 🔧 **Critical Verification**

Before submitting, verify this matches your code:

```javascript
// In your SubscriptionService.js:
const SUBSCRIPTION_SKUS = {
  MONTHLY: Platform.OS === 'ios' ? 'com.cinemaze.premium.monthly' : 'premium_monthly',
};
```

**App Store Connect Product ID must be exactly**: `com.cinemaze.premium.monthly`

## 📞 **If You Get Stuck**

- **Apple Support**: https://developer.apple.com/support/
- **IAP Documentation**: https://developer.apple.com/in-app-purchase/
- **Common issues**: Usually product ID mismatches or missing privacy policy

**You're very close to launch!** 🚀 The hard development work is done - this is just configuration.

---

_Need help with any specific step? The subscription setup is the most critical part for your app to work correctly._

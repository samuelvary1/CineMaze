# App Store Connect Setup Guide

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

## 🔄 In-App Purchases Configuration

### Step 1: Create Subscription Group

1. Go to "Features" → "In-App Purchases"
2. Click "Manage" next to "Subscription Groups"
3. Click "Create Subscription Group"
4. **Reference Name**: `CineMaze Premium Subscriptions`
5. **App Store Display Name**: `CineMaze Premium`

### Step 2: Create Monthly Subscription

1. Click "Create In-App Purchase"
2. Select "Auto-Renewable Subscription"
3. **Product ID**: `com.cinemaze.premium.monthly`
4. **Reference Name**: `CineMaze Premium Monthly`
5. **Subscription Group**: Select the group created above

#### Subscription Details

- **Subscription Duration**: 1 Month
- **Price**: Select your desired price tier (e.g., $4.99/month)
- **App Store Display Name**: `Premium Monthly`
- **Description**: `Unlock unlimited movie discoveries, remove ads, and access exclusive features with CineMaze Premium.`

#### Subscription Localizations

Add the same information for other languages if needed.

### Step 3: Create Annual Subscription

1. Click "Create In-App Purchase"
2. Select "Auto-Renewable Subscription"
3. **Product ID**: `com.cinemaze.premium.yearly`
4. **Reference Name**: `CineMaze Premium Yearly`
5. **Subscription Group**: Select the same group

#### Subscription Details

- **Subscription Duration**: 1 Year
- **Price**: Select annual price tier (e.g., $39.99/year)
- **App Store Display Name**: `Premium Yearly`
- **Description**: `Get a full year of CineMaze Premium at a discounted rate. Unlock unlimited discoveries and exclusive features.`

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

## 🚀 Next Steps

1. **Complete this setup** in App Store Connect
2. **Upload a build** via Xcode or Transporter
3. **Submit for review** once everything is configured
4. **Monitor review status** (typically 24-48 hours)

The app is ready for App Store submission with real IAP integration and proper legal compliance!

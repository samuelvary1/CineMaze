# Google Play Console Setup Guide

## 🤖 Create New App

### Step 1: Access Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google Play Developer account
3. Click "Create app"

### Step 2: App Details

Fill out the required information:

**App name**: `CineMaze`

**Default language**: English (United States)

**App or game**: Game

**Free or paid**: Free

### Step 3: Declarations

- [ ] **App content**: Check if your app complies with Google Play policies
- [ ] **Target audience**: Select appropriate age groups
- [ ] **Content guidelines**: Confirm compliance

## 📱 App Bundle Upload

### Step 1: Generate Signed AAB

We already have this configured! Use our build script:

```bash
cd /Users/samuelvary/Development/CineMaze
./build-production.sh
```

This generates: `android/app/build/outputs/bundle/playStoreRelease/app-playStore-release.aab`

### Step 2: Upload to Internal Testing

1. Go to "Testing" → "Internal testing"
2. Click "Create new release"
3. Upload the `.aab` file
4. **Release name**: `1.0.0 (1)`
5. **Release notes**:

```
Initial release of CineMaze - Movie Discovery Game
• Interactive movie discovery gameplay
• Premium subscription features
• Comprehensive movie database
• Reward system and player stats
```

## 🔄 In-App Products Configuration

### Step 1: Set Up Subscription Products

1. Go to "Monetize" → "Products" → "Subscriptions"
2. Click "Create subscription"

### Monthly Subscription

**Product ID**: `com.cinemaze.premium.monthly`

**Name**: `CineMaze Premium Monthly`

**Description**: `Unlock unlimited movie discoveries, remove ads, and access exclusive features with CineMaze Premium.`

**Pricing**:

- Set base price (e.g., $4.99 USD)
- Google Play will auto-convert to local currencies

**Billing period**: Monthly

**Free trial**: 7 days (optional but recommended)

**Grace period**: 3 days

### Annual Subscription

**Product ID**: `com.cinemaze.premium.yearly`

**Name**: `CineMaze Premium Yearly`

**Description**: `Get a full year of CineMaze Premium at a discounted rate. Unlock unlimited discoveries and exclusive features.`

**Pricing**:

- Set annual price (e.g., $39.99 USD)
- Ensure significant discount vs monthly

**Billing period**: Yearly

**Free trial**: 7 days

**Grace period**: 3 days

### Step 2: Activate Subscriptions

1. Review all subscription details
2. Click "Activate" for each subscription
3. Ensure they're set to "Active" status

## 🏪 Store Listing

### Main Store Listing

#### App Details

**App name**: CineMaze

**Short description**:
`Discover movies through engaging gameplay! Swipe, explore, and build your perfect watchlist.`

**Full description**:

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

Premium subscription auto-renews monthly or yearly. Cancel anytime in Google Play Settings.

Privacy Policy: https://samuelvary1.github.io/CineMaze/web-legal/privacy.html
Terms of Service: https://samuelvary1.github.io/CineMaze/web-legal/terms.html
```

#### Graphics

**App icon**: 512 x 512 px (high-res version of your app icon)

**Feature graphic**: 1024 x 500 px

- Eye-catching banner showing app concept
- Include app name and key visual elements

**Phone screenshots**:
Upload 2-8 screenshots (16:9 or 9:16 aspect ratio):

- Screenshot 1: Main movie discovery screen
- Screenshot 2: Paywall showing subscription options
- Screenshot 3: Player stats and rewards
- Screenshot 4: Movie details view
- Screenshot 5: Settings screen

**Tablet screenshots** (optional but recommended):
Same content optimized for tablet layout

#### Categorization

**Category**: Games

**Tags**:

- Movie
- Entertainment
- Discovery
- Casual
- Single Player

## 🎯 Content Rating

### Content Rating Questionnaire

1. Go to "Policy" → "App content" → "Content rating"
2. Click "Start questionnaire"

**Category**: Games

**Violence**:

- Does your app contain violence? No
- Does your app contain blood? No

**Sexual Content**:

- Does your app contain sexual themes? No
- Does your app contain nudity? No

**Language**:

- Does your app contain profanity? No
- Does your app contain crude humor? No

**Controlled Substances**:

- Does your app contain drug use? No
- Does your app contain alcohol or tobacco use? No

**Gambling**:

- Does your app contain simulated gambling? No
- Does your app allow users to gamble? No

**Interactive Elements**:

- Can users communicate with each other? No
- Can users share personal information? No
- Does your app contain ads? Yes (for non-premium users)

Expected Rating: **Everyone** or **Teen** depending on movie content

## 🔒 Privacy & Security

### Privacy Policy

**Privacy Policy URL**: `https://samuelvary1.github.io/CineMaze/web-legal/privacy.html`

### Data Safety Section

**Data Collection**:

- App activity (movie preferences, usage analytics)
- App info and performance (crash logs, diagnostics)

**Data Sharing**: None with third parties

**Data Security**:

- Data is encrypted in transit
- Users can request data deletion
- Data collection is optional for core functionality

### Permissions

Based on our Android manifest:

- INTERNET (for movie data)
- BILLING (for in-app purchases)
- No sensitive permissions required

## 🎮 Game Services (Optional)

If you want to add achievements later:

1. Go to "Grow" → "Play Games Services"
2. Set up achievements for movie discovery milestones
3. Add leaderboards for discovery stats

## 📝 Release Management

### Release Timeline

1. **Internal Testing** (1-2 days)

   - Upload AAB file
   - Test subscription flow
   - Verify core functionality

2. **Closed Testing** (Optional, 1-2 days)

   - Invite beta testers
   - Gather feedback
   - Fix any critical issues

3. **Open Testing** (Optional, 1-2 days)

   - Public beta for wider feedback
   - Stress test subscription system
   - Final polish

4. **Production Release** (2-3 days review)
   - Submit for Google Play review
   - Monitor for approval
   - Launch to all users

### Version Management

**Version name**: `1.0.0`
**Version code**: `1`

For future updates:

- Version name: `1.0.1`, `1.1.0`, etc.
- Version code: Increment by 1 each release

## ✅ Pre-Release Checklist

Before submitting to production:

- [ ] AAB file uploaded and tested
- [ ] All subscription products active
- [ ] Store listing complete with screenshots
- [ ] Content rating questionnaire completed
- [ ] Privacy policy accessible and compliant
- [ ] Data safety section completed
- [ ] App bundle tested on multiple devices
- [ ] Subscription flow tested end-to-end
- [ ] Restore purchases functionality verified

## 🚀 Launch Strategy

### Soft Launch (Recommended)

1. **Phase 1**: Release in 1-2 countries first
2. **Monitor**: User feedback, crash reports, subscription conversion
3. **Iterate**: Fix issues, optimize onboarding
4. **Phase 2**: Expand to all target markets

### Full Launch

1. **Day 1**: Monitor closely for issues
2. **Week 1**: Gather user feedback and reviews
3. **Month 1**: Analyze subscription metrics and optimize

## 📊 Success Metrics to Track

- **Downloads**: Total installs
- **Retention**: Day 1, 7, 30 retention rates
- **Conversion**: Free to premium subscription rate
- **Revenue**: Monthly/yearly subscription revenue
- **Rating**: Play Store rating and reviews
- **Engagement**: Session length, daily active users

The Android app is ready for Google Play Store submission with proper billing integration and compliance!

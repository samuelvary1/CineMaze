# 🎬 CineMaze Paywall Testing Guide

## 🔧 Developer Settings

I've added a developer settings panel to help you test the paywall system. Look for the **🔧** button in the top-right corner of the RandomMoviesScreen.

### Developer Settings Features:

- **Toggle Subscription**: Switch between Free and Premium instantly
- **Reset Daily Plays**: Reset your play count to test daily limits
- **Simulate Play Usage**: Increment play count to test limits
- **Clear All Data**: Reset everything (subscription, plays, watchlist)

## 🧪 Testing Scenarios

### 1. Free User Experience

**Setup:**

1. Open Developer Settings (🔧 button)
2. Make sure you're on "Free" tier
3. Reset daily plays

**Test Cases:**

- ✅ Should see "Free" status in SubscriptionStatus component
- ✅ Should show "1" play remaining
- ✅ Can start 1 game successfully
- ✅ After 1 game, "Start Game" button should trigger paywall
- ✅ Watchlist buttons should show premium upgrade prompt
- ✅ PaywallModal should appear with "Daily plays remaining: 0"

### 2. Premium User Experience

**Setup:**

1. Open Developer Settings (🔧 button)
2. Switch to "Premium" tier

**Test Cases:**

- ✅ Should see "Premium" status with expiry date
- ✅ Should show "Unlimited" plays remaining
- ✅ Can start unlimited games without paywall
- ✅ Watchlist buttons should work normally
- ✅ No paywall prompts should appear

### 3. Subscription Flow Testing

**Setup:**

1. Start as Free user
2. Use up your daily play

**Test Cases:**

- ✅ PaywallModal appears when trying to start game
- ✅ Can close paywall and try again later
- ✅ Purchasing subscription should upgrade to Premium
- ✅ After upgrade, should have unlimited access

### 4. Daily Reset Testing

**Setup:**

1. Use Developer Settings to simulate scenarios

**Test Cases:**

- ✅ Reset daily plays should give 1 play back to free users
- ✅ Premium users unaffected by daily resets
- ✅ Play count persists between app launches

## 🎮 How to Test

### Quick Test Flow:

1. **Fresh Start**: Open Developer Settings → Clear All Data
2. **Free User Test**:
   - Try to start 2 games (second should show paywall)
   - Try to add movie to watchlist (should show upgrade prompt)
3. **Premium Test**:
   - Open Developer Settings → Switch to Premium
   - Start multiple games (should work unlimited)
   - Add movies to watchlist (should work)
4. **Edge Cases**:
   - Switch back to Free after being Premium
   - Reset plays and test again

### Real-world Simulation:

1. **Day 1**: Play 1 game as free user
2. **Try Day 2**: Reset daily plays to simulate next day
3. **Play Again**: Should get 1 more free play
4. **Upgrade Flow**: Hit limit, see paywall, upgrade to premium

## 🐛 What to Look For

### Expected Behaviors:

- **Free Users**: 1 play per day, no watchlist, paywall after limit
- **Premium Users**: Unlimited plays, full watchlist access
- **Smooth Transitions**: No crashes when switching states
- **Persistent Data**: Settings survive app reloads

### Common Issues to Check:

- ❗ PaywallModal not appearing when expected
- ❗ Play count not incrementing properly
- ❗ Subscription status not updating in UI
- ❗ Watchlist prompts not working
- ❗ Navigation breaking after paywall interactions

## 🔄 Reset Commands

If you get stuck, use these Developer Settings options:

- **Reset Daily Plays**: Get fresh plays without changing subscription
- **Switch Subscription**: Toggle between Free/Premium instantly
- **Clear All Data**: Nuclear option - resets everything to defaults

## 📱 Production Notes

In a real app, you would:

- Replace `SubscriptionService.purchaseSubscription()` with actual App Store/Play Store integration
- Add proper receipt validation
- Implement server-side subscription verification
- Add analytics tracking for paywall conversions
- Handle subscription renewals and cancellations

The current implementation uses local storage and simulated purchases for testing purposes.

## 🎯 Success Criteria

Your paywall is working correctly if:

1. ✅ Free users see exactly 1 play per day
2. ✅ Premium users have unlimited access
3. ✅ Paywall appears at the right moments
4. ✅ Subscription upgrades work smoothly
5. ✅ All states persist between app sessions
6. ✅ Developer settings make testing easy

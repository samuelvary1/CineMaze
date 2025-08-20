# 🍎 iOS Xcode Configuration Guide

## Step-by-Step Xcode Configuration

**Xcode should already be open with CineMaze.xcworkspace**

If not, run: `open ios/CineMaze.xcworkspace`

### Step 1: Select the CineMaze Target

1. In the **Project Navigator** (left panel), click on the **"CineMaze"** project (blue icon at the top)
2. Under **TARGETS**, select **"CineMaze"** (not the project, but the target below it)

### Step 2: Configure Signing & Capabilities

1. Click on the **"Signing & Capabilities"** tab (top of the main panel)

2. **Update Bundle Identifier:**

   - Change the Bundle Identifier from current to: `com.cinemaze.app`
   - Make sure your Apple Developer team is selected in the "Team" dropdown

3. **Verify Signing:**

   - Ensure "Automatically manage signing" is ✅ checked
   - Your Apple Developer team should be selected
   - No red errors should appear

4. **Add In-App Purchase Capability:**
   - Click the **"+ Capability"** button (top left of capabilities section)
   - Search for **"In-App Purchase"**
   - Click to add it to your project

### Step 3: Verify General Settings

1. Click on the **"General"** tab
2. Verify these settings:
   - **Display Name:** CineMaze
   - **Bundle Identifier:** com.cinemaze.app
   - **Version:** 1.0.0
   - **Build:** 1
   - **Deployment Target:** iOS 13.0 (or higher)

### Step 4: Build and Test

After configuration, test the build:

1. **Select a Device/Simulator:**

   - In the scheme selector (top left), choose either:
     - A physical iOS device (if connected)
     - iPhone 15 Pro simulator

2. **Build the Project:**

   - Press **Cmd+B** to build
   - Or Product → Build from menu

3. **Run the App:**
   - Press **Cmd+R** to run
   - Or Product → Run from menu

## 🚨 Common Issues & Solutions

### Issue 1: "Bundle ID not available"

**Solution:** Try a variation like:

- `com.samuelvary.cinemaze.app`
- `com.cinemaze.movieapp`

### Issue 2: "Apple Developer team not found"

**Solution:**

1. Go to Xcode → Preferences → Accounts
2. Make sure you're signed in with your Apple Developer account
3. Refresh the account if needed

### Issue 3: "Provisioning profile errors"

**Solution:**

1. Make sure "Automatically manage signing" is checked
2. Try toggling it off and on again
3. Clean build folder: Product → Clean Build Folder

### Issue 4: "In-App Purchase capability can't be added"

**Solution:**

1. The Bundle ID might not be registered yet
2. We'll register it in App Store Connect after this

## Next Steps After Xcode Configuration

Once Xcode is configured successfully:

1. **Test iOS Build:**

   ```bash
   npx react-native run-ios --mode Release
   ```

2. **Create App Store Connect Record:**

   - Register Bundle ID: `com.cinemaze.app`
   - Create app record
   - Set up In-App Purchase products

3. **Archive for App Store:**
   - Product → Archive (when ready for submission)

## ✅ Configuration Checklist

- [ ] Bundle Identifier set to `com.cinemaze.app`
- [ ] Apple Developer team selected
- [ ] "Automatically manage signing" enabled
- [ ] No signing errors
- [ ] In-App Purchase capability added
- [ ] Build succeeds (Cmd+B)
- [ ] App runs on simulator/device (Cmd+R)

## 🎯 What This Achieves

- ✅ Proper Bundle ID for App Store submission
- ✅ Code signing configured for your developer account
- ✅ In-App Purchase capability enabled for subscriptions
- ✅ Ready for App Store Connect setup
- ✅ Ready for TestFlight and App Store submission

---

**Need Help?** Let me know if you encounter any issues during the configuration!

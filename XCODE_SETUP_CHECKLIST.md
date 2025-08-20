# 🍎 Xcode Configuration Checklist

## In Xcode (Now Open):

### 1. Select CineMaze Target

- In the project navigator (left panel), click on "CineMaze" (blue icon at top)
- Select the "CineMaze" target (under TARGETS)

### 2. Configure Signing & Capabilities

**Go to "Signing & Capabilities" tab:**

#### Bundle Identifier:

- [ ] Change from current to: `com.cinemaze.app`
- [ ] Make sure your Apple Developer team is selected
- [ ] "Automatically manage signing" should be checked ✅

#### Add In-App Purchase Capability:

- [ ] Click "+ Capability" button
- [ ] Search for "In-App Purchase"
- [ ] Add it to your project

### 3. Verify General Settings

**Go to "General" tab:**

- [ ] Display Name: "CineMaze"
- [ ] Bundle Identifier: `com.cinemaze.app`
- [ ] Version: 1.0.0
- [ ] Build: 1
- [ ] Deployment Target: iOS 13.0 or higher

### 4. Check Info Tab

**Optional verification:**

- Bundle name should be "CineMaze"
- Privacy descriptions should be present

---

## Next: App Store Connect Setup

Once Xcode is configured, go to:
[App Store Connect](https://appstoreconnect.apple.com)

### Create New App:

1. Click "+" → "New App"
2. **Platform:** iOS
3. **Name:** CineMaze
4. **Bundle ID:** com.cinemaze.app (register first if needed)
5. **SKU:** cinemaze-ios-001

### Register Bundle ID (if needed):

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Certificates, Identifiers & Profiles
3. Identifiers → "+"
4. **Bundle ID:** com.cinemaze.app
5. **Capabilities:** In-App Purchase ✅

---

## 🚨 Common Issues & Solutions:

**"Bundle ID not available":**

- Try: com.yourlastname.cinemaze.app
- Or: com.cinemaze.movieapp

**"Team not found":**

- Make sure you're signed into Xcode with your Apple Developer account
- Xcode → Preferences → Accounts

**"Capability can't be added":**

- Make sure Bundle ID is registered with In-App Purchase capability
- Refresh provisioning profiles

---

**Once configured, test with:**

```bash
npx react-native run-ios --configuration Release
```

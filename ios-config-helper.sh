#!/bin/bash

# iOS Xcode Configuration Helper Script
# This script helps verify and guide through Xcode configuration

set -e

echo "🍎 CineMaze iOS Configuration Helper"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "ios/CineMaze.xcodeproj/project.pbxproj" ]; then
    print_error "Please run this script from the CineMaze project root directory"
    exit 1
fi

echo ""
print_status "Checking current iOS project configuration..."

# Check current bundle identifier
CURRENT_BUNDLE_ID=$(grep -A 5 -B 5 "PRODUCT_BUNDLE_IDENTIFIER" ios/CineMaze.xcodeproj/project.pbxproj | head -1 | sed 's/.*PRODUCT_BUNDLE_IDENTIFIER = "\(.*\)";.*/\1/')

echo ""
print_status "Current Configuration:"
echo "  Bundle ID: $CURRENT_BUNDLE_ID"

if [[ "$CURRENT_BUNDLE_ID" == *"org.reactjs.native.example"* ]]; then
    print_warning "Bundle ID is still set to default React Native template"
    echo "  ❌ Needs to be changed to: com.cinemaze.app"
else
    print_success "Bundle ID appears to be customized"
fi

# Check if Xcode workspace exists
if [ -f "ios/CineMaze.xcworkspace/contents.xcworkspacedata" ]; then
    print_success "Xcode workspace found"
else
    print_error "Xcode workspace not found - run 'pod install' first"
fi

# Check if Info.plist exists
if [ -f "ios/CineMaze/Info.plist" ]; then
    print_success "Info.plist found"
    
    # Check app name in Info.plist
    APP_NAME=$(grep -A 1 "CFBundleDisplayName" ios/CineMaze/Info.plist | grep -o "<string>.*</string>" | sed 's/<string>//g; s/<\/string>//g' 2>/dev/null || echo "Not found")
    echo "  App Display Name: $APP_NAME"
else
    print_error "Info.plist not found"
fi

echo ""
print_status "Next Steps in Xcode:"
echo ""
echo "1. 📱 Open Xcode Workspace:"
echo "   open ios/CineMaze.xcworkspace"
echo ""
echo "2. 🎯 Select CineMaze Target:"
echo "   - Click 'CineMaze' project in navigator (blue icon)"
echo "   - Select 'CineMaze' under TARGETS"
echo ""
echo "3. ⚙️  Configure Signing & Capabilities:"
echo "   - Click 'Signing & Capabilities' tab"
echo "   - Change Bundle Identifier to: com.cinemaze.app"
echo "   - Select your Apple Developer team"
echo "   - Add 'In-App Purchase' capability"
echo ""
echo "4. ✅ Verify General Settings:"
echo "   - Display Name: CineMaze"
echo "   - Version: 1.0.0"
echo "   - Build: 1"
echo ""
echo "5. 🔨 Test Build:"
echo "   - Press Cmd+B to build"
echo "   - Press Cmd+R to run"
echo ""

# Check if Xcode is running
if pgrep -x "Xcode" > /dev/null; then
    print_success "Xcode is currently running"
else
    print_warning "Xcode is not running"
    echo ""
    echo "🚀 Start Xcode configuration now:"
    echo "   open ios/CineMaze.xcworkspace"
fi

echo ""
print_status "After Xcode configuration, test with:"
echo "   npx react-native run-ios --mode Release"
echo ""
print_status "Configuration guide available in: ios_xcode_configuration.md"

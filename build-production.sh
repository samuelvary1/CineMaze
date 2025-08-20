#!/bin/bash

# CineMaze Production Build Script
# This script helps build production versions for app store submission

set -e

echo "🚀 CineMaze Production Build Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
if [ ! -f "package.json" ] || [ ! -d "ios" ] || [ ! -d "android" ]; then
    print_error "Please run this script from the CineMaze project root directory"
    exit 1
fi

# Function to build iOS
build_ios() {
    print_status "Building iOS app for App Store..."
    
    print_status "Installing iOS dependencies..."
    cd ios
    pod install
    cd ..
    
    print_status "Cleaning previous builds..."
    cd ios
    rm -rf build
    cd ..
    
    print_status "Building release version..."
    npx react-native run-ios --mode Release
    
    print_success "iOS build complete!"
    print_warning "Next steps:"
    echo "1. Open Xcode: open ios/CineMaze.xcworkspace"
    echo "2. Select 'Any iOS Device' as target"
    echo "3. Go to Product → Archive"
    echo "4. Upload to App Store Connect"
}

# Function to build Android
build_android() {
    print_status "Building Android AAB for Play Store..."
    
    print_status "Cleaning previous builds..."
    cd android
    ./gradlew clean
    
    print_status "Building release AAB..."
    ./gradlew bundlePlayRelease
    
    cd ..
    
    if [ -f "android/app/build/outputs/bundle/playRelease/app-play-release.aab" ]; then
        print_success "Android AAB build complete!"
        print_status "File location: android/app/build/outputs/bundle/playRelease/app-play-release.aab"
        print_warning "Next steps:"
        echo "1. Go to Google Play Console"
        echo "2. Upload the AAB file to your app"
        echo "3. Complete store listing and submit for review"
    else
        print_error "AAB build failed!"
        exit 1
    fi
}

# Function to prepare for submission
prepare_submission() {
    print_status "Preparing for App Store submission..."
    
    # Check if legal documents are accessible
    print_status "Checking legal documents..."
    if curl -s --head "https://samuelvary1.github.io/CineMaze/web-legal/privacy.html" | head -n 1 | grep -q "200 OK"; then
        print_success "Privacy Policy is accessible"
    else
        print_error "Privacy Policy URL is not accessible!"
    fi
    
    if curl -s --head "https://samuelvary1.github.io/CineMaze/web-legal/terms.html" | head -n 1 | grep -q "200 OK"; then
        print_success "Terms of Service is accessible"
    else
        print_error "Terms of Service URL is not accessible!"
    fi
    
    # Check version consistency
    PACKAGE_VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
    ANDROID_VERSION=$(grep 'versionName' android/app/build.gradle | cut -d'"' -f2)
    
    print_status "Version Check:"
    echo "  Package.json: $PACKAGE_VERSION"
    echo "  Android: $ANDROID_VERSION"
    
    if [ "$PACKAGE_VERSION" = "$ANDROID_VERSION" ]; then
        print_success "Version numbers match!"
    else
        print_warning "Version numbers don't match - consider updating"
    fi
    
    print_status "Submission Checklist:"
    echo "□ Developer accounts created (Apple & Google)"
    echo "□ Bundle ID configured: com.cinemaze.app"
    echo "□ In-App Purchase products set up"
    echo "□ Screenshots taken for all required sizes"
    echo "□ App tested on physical devices"
    echo "□ Subscription flow tested"
    echo "□ Store descriptions written"
    echo "□ Legal documents verified (✓)"
}

# Main menu
echo ""
echo "What would you like to do?"
echo "1) Build iOS for App Store"
echo "2) Build Android for Play Store"
echo "3) Build both platforms"
echo "4) Prepare submission checklist"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        build_ios
        ;;
    2)
        build_android
        ;;
    3)
        build_ios
        echo ""
        build_android
        ;;
    4)
        prepare_submission
        ;;
    5)
        print_status "Goodbye!"
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_success "Build script completed!"
print_status "Good luck with your app store submission! 🚀"

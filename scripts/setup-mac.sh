#!/bin/bash
set -e

#############################################################################
# RepairIQ iOS Setup Script for macOS
#
# This script automates everything that can be automated for getting
# RepairIQ onto the iOS App Store. Run it on a Mac with Xcode installed.
#
# Prerequisites:
#   - macOS with Xcode 15+ installed (App Store or xcode-select)
#   - Node.js 18+ installed (brew install node)
#   - An Apple Developer account ($99/yr at developer.apple.com)
#   - A Vercel account (free at vercel.com)
#
# Usage:
#   chmod +x scripts/setup-mac.sh
#   ./scripts/setup-mac.sh
#############################################################################

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

step=0
total_steps=8

print_step() {
  step=$((step + 1))
  echo ""
  echo -e "${BOLD}${GREEN}[$step/$total_steps] $1${NC}"
  echo "─────────────────────────────────────────"
}

print_warn() {
  echo -e "${YELLOW}⚠  $1${NC}"
}

print_error() {
  echo -e "${RED}✖  $1${NC}"
}

print_success() {
  echo -e "${GREEN}✔  $1${NC}"
}

wait_for_user() {
  echo ""
  echo -e "${YELLOW}Press Enter when ready to continue...${NC}"
  read -r
}

#############################################################################
# Pre-flight checks
#############################################################################
echo ""
echo -e "${BOLD}RepairIQ iOS App Store Setup${NC}"
echo "════════════════════════════════════════════"
echo ""

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
  print_error "Xcode is not installed. Install it from the Mac App Store."
  echo "  After installing, run: sudo xcode-select --switch /Applications/Xcode.app"
  exit 1
fi
print_success "Xcode found: $(xcodebuild -version | head -1)"

# Check for Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed. Install with: brew install node"
  exit 1
fi
print_success "Node.js found: $(node -v)"

# Check for CocoaPods (needed by some Capacitor plugins)
if ! command -v pod &> /dev/null; then
  print_warn "CocoaPods not found. Installing..."
  sudo gem install cocoapods
fi
print_success "CocoaPods found: $(pod --version)"

# Check we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
  print_error "Run this script from the RepairIQ project root (where capacitor.config.ts is)."
  exit 1
fi

#############################################################################
# Step 1: Install dependencies
#############################################################################
print_step "Installing dependencies"
npm install
print_success "Dependencies installed"

#############################################################################
# Step 2: Generate app icons (if not already generated)
#############################################################################
print_step "Generating app icons"
if [ -f "public/icon-1024.png" ]; then
  print_success "Icons already generated — skipping"
else
  node scripts/generate-icons.js
  print_success "All icons generated"
fi

#############################################################################
# Step 3: Deploy API backend to Vercel
#############################################################################
print_step "Deploying API backend to Vercel"

if ! command -v vercel &> /dev/null; then
  print_warn "Vercel CLI not found. Installing globally..."
  npm install -g vercel
fi

echo ""
echo "We need to deploy the API backend so the iOS app can call it."
echo "This will deploy the Next.js app to Vercel as a serverless API."
echo ""
echo "You'll need your API keys ready. The Vercel CLI will walk you through"
echo "linking to your account and setting up the project."
echo ""
echo -e "${BOLD}Required environment variables to set in Vercel:${NC}"
echo "  ANTHROPIC_API_KEY     - Your Claude API key (required)"
echo "  NEXTAUTH_SECRET       - A random string for auth (required)"
echo "  NEXTAUTH_URL          - Will be your Vercel URL (set after first deploy)"
echo "  YOUTUBE_API_KEY       - For repair videos (optional)"
echo "  GOOGLE_PLACES_API_KEY - For finding professionals (optional)"
echo ""

wait_for_user

echo "Deploying to Vercel..."
vercel --prod

VERCEL_URL=$(vercel inspect --json 2>/dev/null | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -z "$VERCEL_URL" ]; then
  echo ""
  echo "Enter your Vercel deployment URL (e.g., repairiq-api.vercel.app):"
  read -r VERCEL_URL
fi

echo ""
echo "Setting environment variables on Vercel..."
echo "Go to your Vercel dashboard > Project Settings > Environment Variables"
echo "and add all required API keys listed above."
echo ""
echo -e "Your API URL is: ${BOLD}https://${VERCEL_URL}${NC}"

# Save for later use
echo "https://${VERCEL_URL}" > .api-url

wait_for_user
print_success "API backend deployed"

#############################################################################
# Step 4: Build static frontend for Capacitor
#############################################################################
print_step "Building static frontend for iOS"

API_URL=$(cat .api-url 2>/dev/null || echo "https://your-api.vercel.app")
echo "Using API URL: $API_URL"

NEXT_PUBLIC_API_URL="$API_URL" NEXT_BUILD_MODE=static npx next build

print_success "Static build complete (output in 'out/' directory)"

#############################################################################
# Step 5: Sync Capacitor and open Xcode
#############################################################################
print_step "Syncing Capacitor iOS project"

npx cap sync ios

print_success "Capacitor synced"

#############################################################################
# Step 6: Configure Xcode signing
#############################################################################
print_step "Opening Xcode — configure signing"

echo ""
echo -e "${BOLD}When Xcode opens, you need to do the following:${NC}"
echo ""
echo "  1. In the left sidebar, click on 'App' (the root project)"
echo "  2. Click on the 'App' target under TARGETS"
echo "  3. Go to the 'Signing & Capabilities' tab"
echo "  4. Check 'Automatically manage signing'"
echo "  5. Select your Team (your Apple Developer account)"
echo "     - If you don't see a team, go to Xcode > Settings > Accounts"
echo "       and add your Apple ID"
echo "  6. The Bundle Identifier should be: com.repairiq.app"
echo "  7. Set the Deployment Target to iOS 16.0"
echo ""
echo "  Then close Xcode and come back here."
echo ""

npx cap open ios

wait_for_user
print_success "Xcode signing configured"

#############################################################################
# Step 7: Build and upload to TestFlight
#############################################################################
print_step "Building for TestFlight"

echo ""
echo -e "${BOLD}To build and upload to TestFlight:${NC}"
echo ""
echo "  1. Open Xcode (it should still be open)"
echo "  2. In the top bar, select a real device or 'Any iOS Device (arm64)'"
echo "     (NOT a simulator)"
echo "  3. Go to Product > Archive"
echo "     - This builds the release version of your app"
echo "     - Wait for it to complete (may take a few minutes)"
echo "  4. When the Organizer window appears:"
echo "     a. Select your new archive"
echo "     b. Click 'Distribute App'"
echo "     c. Choose 'App Store Connect'"
echo "     d. Click 'Upload' (NOT 'Export')"
echo "     e. Follow the prompts (keep defaults)"
echo "  5. Wait for the upload to complete"
echo ""
echo -e "${YELLOW}Note: If you get a 'No accounts with App Store Connect access' error,${NC}"
echo -e "${YELLOW}make sure your Apple Developer Program enrollment is complete.${NC}"
echo ""

wait_for_user

echo ""
echo "Taking screenshots for the App Store listing..."
echo ""
echo "  1. In Xcode, select an iPhone 15 Pro Max simulator"
echo "     (this covers the 6.7\" requirement)"
echo "  2. Run the app (Product > Run or Cmd+R)"
echo "  3. Take screenshots using Cmd+S in the simulator"
echo "     Recommended screenshots:"
echo "     - Home page (showing the two main options)"
echo "     - Diagnosis chat in progress"
echo "     - Diagnosis results page"
echo "     - Toolkit page"
echo "     - Parts list or cost comparison"
echo "  4. Also run on an iPhone SE (3rd gen) simulator for 5.5\" screenshots"
echo "  5. Screenshots are saved to your Desktop"
echo ""

wait_for_user
print_success "Build and screenshots complete"

#############################################################################
# Step 8: Submit to App Store Connect
#############################################################################
print_step "Submit to App Store Connect"

echo ""
echo -e "${BOLD}Final step! Go to https://appstoreconnect.apple.com${NC}"
echo ""
echo "  1. Click 'My Apps' > '+' > 'New App'"
echo "  2. Fill in:"
echo "     - Platform: iOS"
echo "     - Name: RepairIQ"
echo "     - Primary Language: English (U.S.)"
echo "     - Bundle ID: com.repairiq.app (should appear in dropdown)"
echo "     - SKU: repairiq-001"
echo ""
echo "  3. In the app page, fill in:"
echo "     - Subtitle: Smart Home Repair Diagnostics"
echo "     - Description:"
echo "       RepairIQ uses AI to diagnose and help you fix broken household"
echo "       items. Describe your problem using text, voice, or photos, and"
echo "       get step-by-step repair instructions, parts lists with pricing,"
echo "       video tutorials, and safety guidance. Find local professionals"
echo "       when you need expert help."
echo ""
echo "     - Keywords: home repair,DIY,appliance repair,diagnostics,AI,fix,"
echo "       plumbing,electrical,handyman,maintenance"
echo ""
echo "     - Support URL: https://${VERCEL_URL:-your-domain.com}"
echo "     - Privacy Policy URL: https://${VERCEL_URL:-your-domain.com}/privacy"
echo ""
echo "  4. Upload your screenshots (from Step 7)"
echo "     - 6.7\" Display (iPhone 15 Pro Max)"
echo "     - 6.5\" Display (iPhone 14 Plus/15 Plus) — same screenshots work"
echo "     - 5.5\" Display (iPhone SE) — from SE simulator"
echo ""
echo "  5. App Review Information:"
echo "     - Sign-in: Not required (app uses guest mode)"
echo "     - Notes: 'This app uses AI (Claude by Anthropic) to provide"
echo "       home repair diagnostics. No account is required. All data is"
echo "       stored locally on the device.'"
echo ""
echo "  6. Age Rating: 4+ (no objectionable content)"
echo ""
echo "  7. Pricing: Set your price (or Free)"
echo ""
echo "  8. Click 'Add for Review' then 'Submit to App Review'"
echo ""
echo -e "${YELLOW}Review typically takes 24-48 hours.${NC}"
echo ""

wait_for_user

echo ""
echo "═══════════════════════════════════════════════════"
echo -e "${BOLD}${GREEN}Setup complete!${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Your app has been submitted to the App Store."
echo ""
echo "What to expect:"
echo "  - Apple review takes 24-48 hours"
echo "  - You may get feedback requesting changes"
echo "  - Once approved, the app goes live automatically"
echo "    (unless you set a manual release date)"
echo ""
echo "Useful links:"
echo "  - App Store Connect: https://appstoreconnect.apple.com"
echo "  - Vercel Dashboard:  https://vercel.com/dashboard"
echo "  - TestFlight:        Check on your iOS device"
echo ""

# RepairIQ — iOS App Store Setup Guide

This guide walks you through deploying RepairIQ to the iOS App Store.
An automation script handles most of the work. You just need a Mac with
Xcode and a few accounts set up beforehand.

---

## Before You Start (Checklist)

Complete these **before** running the setup script:

- [ ] **Mac with Xcode 15+** installed from the Mac App Store
  - After install, open Terminal and run: `sudo xcode-select --switch /Applications/Xcode.app`
  - Then: `xcode-select --install` (installs command line tools)

- [ ] **Node.js 18+** installed
  - Install with Homebrew: `brew install node`
  - Or download from https://nodejs.org

- [ ] **Apple Developer Program** enrollment ($99/year)
  - Sign up at https://developer.apple.com/programs/
  - Takes up to 48 hours to process
  - You need this to submit to the App Store

- [ ] **Vercel account** (free)
  - Sign up at https://vercel.com
  - This hosts the API backend (handles AI calls, YouTube, etc.)

- [ ] **API keys ready** (have these in a text file):
  - `ANTHROPIC_API_KEY` — **Required**. Get from https://console.anthropic.com
  - `NEXTAUTH_SECRET` — **Required**. Generate with: `openssl rand -base64 32`
  - `YOUTUBE_API_KEY` — Optional. Google Cloud Console > APIs > YouTube Data API v3
  - `GOOGLE_PLACES_API_KEY` — Optional. Google Cloud Console > APIs > Places API

---

## Running the Setup

```bash
# 1. Clone or copy the project to your Mac
git clone <repo-url> repairiq
cd repairiq

# 2. Run the setup script
chmod +x scripts/setup-mac.sh
./scripts/setup-mac.sh
```

The script walks you through 8 steps interactively. It pauses at each step
that needs your input and tells you exactly what to do.

---

## What the Script Does (Overview)

| Step | What happens | Your input needed |
|------|-------------|-------------------|
| 1 | Installs npm dependencies | None |
| 2 | Generates app icons (all sizes) | None |
| 3 | Deploys API backend to Vercel | Vercel login, paste API keys |
| 4 | Builds the static frontend | None |
| 5 | Syncs Capacitor iOS project | None |
| 6 | Opens Xcode for signing | Select your Apple Developer team |
| 7 | Guides you through archiving + TestFlight | Follow Xcode prompts, take screenshots |
| 8 | Guides you through App Store Connect submission | Fill in app metadata, upload screenshots |

---

## Xcode Signing (Step 6 Detail)

When Xcode opens:

1. Click **App** in the left sidebar (the project root)
2. Click the **App** target under TARGETS
3. Go to **Signing & Capabilities** tab
4. Check **Automatically manage signing**
5. Select your **Team** from the dropdown
   - If no team appears: Xcode menu > **Settings** > **Accounts** > add your Apple ID
6. Bundle Identifier should already be: `com.repairiq.app`
7. Set Deployment Target to **iOS 16.0**

---

## Taking Screenshots (Step 7 Detail)

Apple requires screenshots for these device sizes:

| Size | Simulator to use |
|------|-----------------|
| 6.7" | iPhone 15 Pro Max |
| 6.5" | iPhone 14 Plus (or reuse 6.7") |
| 5.5" | iPhone SE (3rd generation) |

**Recommended screenshots** (5-8 per size):

1. **Home page** — the two hero cards ("Don't Know What's Wrong" / "Help Me Fix It")
2. **Diagnosis chat** — a conversation in progress with the AI
3. **Diagnosis results** — showing issues, confidence scores, and toolkit
4. **Toolkit page** — the 8-tool grid
5. **Parts list** — the smart parts list with store links
6. **Cost comparison** — DIY vs professional vs replacement
7. **Safety checklist** — safety guard with warnings
8. **Find professionals** — local professionals map/list

To capture: **Cmd+S** in the iOS Simulator. Screenshots save to Desktop.

---

## App Store Connect Metadata (Step 8 Detail)

### App Information
- **Name:** RepairIQ
- **Subtitle:** Smart Home Repair Diagnostics
- **Bundle ID:** com.repairiq.app
- **SKU:** repairiq-001
- **Primary Language:** English (U.S.)
- **Category:** Utilities
- **Secondary Category:** Lifestyle

### Description
```
RepairIQ uses AI to diagnose and help you fix broken household items.
Describe your problem using text, voice, or photos, and get step-by-step
repair instructions, parts lists with pricing, video tutorials, and safety
guidance.

Features:
• AI-powered diagnosis — describe your issue and get expert analysis
• Voice input — speak your problem hands-free
• Photo analysis — snap a picture for visual diagnosis
• Step-by-step repairs — guided instructions with difficulty ratings
• Smart parts list — find parts at Amazon, Home Depot, Lowe's
• Video tutorials — curated YouTube repair guides
• Safety alerts — context-aware warnings for electrical, gas, and water
• Cost comparison — DIY vs professional vs replacement analysis
• Skill assessment — 5-question quiz to gauge your repair ability
• Find professionals — locate local repair services near you
• Repair tracking — save progress with timers and notes
```

### Keywords
```
home repair,DIY,appliance repair,diagnostics,AI,fix,plumbing,electrical,handyman,maintenance
```

### Privacy Policy URL
```
https://your-vercel-url.vercel.app/privacy
```

### App Review Notes
```
This app uses AI (Claude by Anthropic) to provide home repair diagnostics.
No account is required — the app uses guest mode by default.
All user data (repair history, appliance inventory) is stored locally on
the device. The app communicates with our API backend for AI processing,
YouTube video search, and professional finder features.
```

### Age Rating
- **4+** — No objectionable content

### Privacy Labels (App Store)
| Data type | Collected | Linked to user | Used for tracking |
|-----------|-----------|---------------|-------------------|
| Photos | Yes (optional, for diagnosis) | No | No |
| Location | Yes (optional, for finding pros) | No | No |
| Diagnostics | No | No | No |

---

## After Submission

- Apple review takes **24-48 hours** (sometimes faster)
- If rejected, you'll get specific feedback — common issues:
  - **4.2 Minimum Functionality** — unlikely since we have native camera, haptics, and share
  - **Metadata Rejected** — fix description/screenshots and resubmit
  - **Crashes** — test thoroughly in TestFlight first
- Once approved, the app goes live (unless you set a manual release date)

---

## Updating the App Later

```bash
# After making code changes:
cd repairiq

# 1. Deploy updated API backend
vercel --prod

# 2. Rebuild iOS app
NEXT_PUBLIC_API_URL=https://your-api.vercel.app NEXT_BUILD_MODE=static npx next build
npx cap sync ios

# 3. Open Xcode, bump version number, archive, and upload
npx cap open ios
# In Xcode: increment Build Number, then Product > Archive > Distribute
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No provisioning profiles" in Xcode | Make sure Automatically Manage Signing is checked and team is selected |
| Build fails with Swift errors | Run `npx cap sync ios` again, then clean build (Cmd+Shift+K in Xcode) |
| App crashes on launch | Check that `NEXT_PUBLIC_API_URL` was set correctly during build |
| API calls fail from app | Verify Vercel deployment is live and env vars are set in Vercel dashboard |
| "App uses non-public API" rejection | Run `npx cap sync ios` to get latest Capacitor patches |
| CocoaPods errors | Run `cd ios/App && pod install --repo-update && cd ../..` |

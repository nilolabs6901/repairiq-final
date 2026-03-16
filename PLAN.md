# Plan: Deploy RepairIQ to the iOS App Store

## Strategy Overview

**Approach: Capacitor + Static Frontend + Hosted API Backend**

The app's pages are all client components (`'use client'`), but 6 API routes require server-side execution (secrets, third-party APIs). The plan splits the app into:

- **iOS shell** — Capacitor wraps a statically-exported Next.js frontend
- **API backend** — Existing API routes stay deployed on Vercel as a standalone service
- **Native plugins** — Camera, haptics, push notifications to satisfy Apple's minimum native functionality requirement (Guideline 4.2)

> Apple rejects pure web-wrapper apps. We must integrate native device features.

---

## Phase 1: Fix Blocking Issues (Pre-Requisites)

### 1.1 Remove hardcoded Windows path from `tsconfig.json`
- **File:** `tsconfig.json` line 35
- Remove `C:\Users\kenne\AppData\Local\Temp\repairiq-next/types/**/*.ts`

### 1.2 Fix hardcoded auth secret
- **File:** `src/lib/auth.ts` line 44
- Remove fallback `'development-secret-key'` — throw an error if `NEXTAUTH_SECRET` is unset

### 1.3 Create `public/` directory with required assets
- `public/favicon.ico`
- `public/icon-192.png`, `public/icon-512.png` (app icons for manifest)
- `public/apple-touch-icon.png` (180x180)

### 1.4 Fix `.env.example` to include ALL env vars the code actually uses
- Add `GOOGLE_PLACES_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `WEBHOOK_URL`, `SENDGRID_API_KEY`, `LEAD_NOTIFICATION_EMAIL`

---

## Phase 2: Separate Frontend from API Backend

### 2.1 Extract API base URL to a config constant
- **New file:** `src/lib/config.ts`
- Define `API_BASE_URL` from `NEXT_PUBLIC_API_URL` env var (falls back to `''` for local dev)
- Update all `fetch('/api/...')` calls across the app to use `${API_BASE_URL}/api/...`

**Files to update:**
- `src/hooks/useDiagnosis.ts` — `/api/chat`
- `src/components/diagnosis/RepairVideoHub.tsx` — `/api/youtube`
- `src/components/diagnosis/LocalProfessionals.tsx` — `/api/professionals`
- `src/components/diagnosis/GetQuoteModal.tsx` — `/api/leads`
- `src/components/diagnosis/VoiceGuidedRepair.tsx` — `/api/elevenlabs`
- `src/components/diagnosis/RepairAssistant.tsx` — `/api/chat`

### 2.2 Add CORS headers to all API routes
- Allow requests from the Capacitor origin (`capacitor://localhost`, `http://localhost`)
- Create shared CORS utility in `src/lib/cors.ts`
- Apply to all 6 API route handlers

### 2.3 Configure `next.config.js` for static export
- Add `output: 'export'` for the Capacitor build target
- Keep the existing SSR config for the API backend deployment
- Use an env flag: `NEXT_BUILD_MODE=static` triggers export mode

### 2.4 Move API routes to a deployable backend
- The API routes stay in the same repo but get deployed separately to Vercel
- Frontend static export excludes `/api` routes
- Backend deployment includes only `/api` routes
- Two Vercel projects: `repairiq-app` (static) and `repairiq-api` (serverless)

---

## Phase 3: Add Capacitor

### 3.1 Install Capacitor
```
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios
npx cap init RepairIQ com.repairiq.app --web-dir=out
npx cap add ios
```

### 3.2 Create `capacitor.config.ts`
```ts
const config: CapacitorConfig = {
  appId: 'com.repairiq.app',
  appName: 'RepairIQ',
  webDir: 'out',           // Next.js static export directory
  server: {
    // In production, load from local files (static export)
    // No remote URL needed — API calls go to NEXT_PUBLIC_API_URL
  },
  ios: {
    scheme: 'RepairIQ',
    contentInset: 'automatic',
  },
  plugins: {
    SplashScreen: { launchAutoHide: true, showSpinner: false },
    StatusBar: { style: 'dark' },
    Keyboard: { resize: 'body', style: 'dark' },
  }
};
```

### 3.3 Add native plugins for App Store compliance
```
npm install @capacitor/camera @capacitor/haptics @capacitor/push-notifications
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard
npm install @capacitor/share @capacitor/app
```

### 3.4 Add build scripts to `package.json`
```json
{
  "build:ios": "NEXT_BUILD_MODE=static next build && npx cap sync ios",
  "open:ios": "npx cap open ios"
}
```

---

## Phase 4: Native Feature Integration

### 4.1 Replace Web Speech API with Capacitor speech plugin
- Install `@capacitor-community/speech-recognition`
- Create `src/lib/speech.ts` that detects platform and uses native API on iOS, Web Speech API on browser
- Update `ChatInput.tsx` to use the abstraction

### 4.2 Replace `react-dropzone` with Capacitor Camera
- On iOS: use `@capacitor/camera` for photo capture + gallery selection
- On web: keep existing `react-dropzone`
- Create `src/lib/imagePicker.ts` platform abstraction
- Update `ChatInput.tsx`

### 4.3 Add haptic feedback
- Light haptic on button taps, message send, diagnosis complete
- Use `@capacitor/haptics` with web fallback (no-op)

### 4.4 Add push notifications (maintenance reminders)
- Use `@capacitor/push-notifications` for iOS APNs
- Connect to existing `MaintenanceReminders.tsx` component
- Schedule local notifications for upcoming maintenance

### 4.5 Add share functionality
- Use `@capacitor/share` for sharing diagnosis results
- Add "Share" button to `DiagnosisResults.tsx`

### 4.6 Handle safe areas and iOS navigation
- The app already has safe-area CSS (`env(safe-area-inset-*)`)
- Add `@capacitor/status-bar` to control status bar appearance
- Handle iOS back gesture / swipe navigation

---

## Phase 5: iOS App Store Preparation

### 5.1 App icons and splash screens
- Generate full iOS icon set (20x20 through 1024x1024) from app logo
- Create splash screen assets for all device sizes
- Configure in Xcode project (auto-generated by `npx cap add ios`)

### 5.2 Xcode project configuration
- Set deployment target: iOS 15.0+
- Configure signing with Apple Developer account
- Add required `Info.plist` entries:
  - `NSCameraUsageDescription` — "RepairIQ uses your camera to photograph broken items for diagnosis"
  - `NSMicrophoneUsageDescription` — "RepairIQ uses your microphone for voice-guided diagnosis"
  - `NSLocationWhenInUseUsageDescription` — "RepairIQ uses your location to find nearby repair professionals"
  - `NSSpeechRecognitionUsageDescription` — "RepairIQ uses speech recognition for voice input"

### 5.3 App Store metadata
- App name, subtitle, description, keywords
- Screenshots for iPhone 6.7", 6.5", 5.5" and iPad
- Privacy policy URL (required)
- Support URL
- Age rating: 4+

### 5.4 App Store privacy labels
- Data collected: Location (for finding professionals), Photos (for diagnosis)
- Data not linked to user (no account system currently)

### 5.5 TestFlight beta testing
- Archive build in Xcode
- Upload to App Store Connect
- Distribute via TestFlight for testing before submission

---

## Phase 6: Security & Quality Hardening

### 6.1 Secure localStorage with encryption
- Install `capacitor-secure-storage-plugin`
- Migrate sensitive data (sessions, repairs) to secure storage on iOS
- Keep localStorage fallback for web

### 6.2 Add certificate pinning for API calls
- Pin the Vercel API backend certificate
- Prevents MITM attacks on the API connection

### 6.3 Rate limiting
- Add rate limiting to API routes (prevent abuse)
- Use Vercel's built-in rate limiting or add middleware

### 6.4 Error monitoring
- Add Sentry for crash reporting on iOS
- Captures JavaScript errors inside WebView + native crashes

---

## Implementation Order & Estimates

| Phase | Description | Complexity |
|-------|-------------|------------|
| **1** | Fix blocking issues | Low |
| **2** | Separate frontend/backend | Medium |
| **3** | Add Capacitor | Medium |
| **4** | Native feature integration | Medium-High |
| **5** | App Store preparation | Medium (mostly config/assets) |
| **6** | Security hardening | Medium |

**Critical path:** Phase 1 → 2 → 3 → 5 (minimum viable App Store submission)
**Phases 4 & 6** significantly improve approval odds and user experience but can be iterated on.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Apple rejects as web wrapper (4.2) | Blocks launch | Phase 4 adds genuine native features |
| Web Speech API not available in WKWebView | Voice input broken | Phase 4.1 replaces with native plugin |
| API latency from separate backend | Slower UX | Capacitor loads UI instantly from local files; only API calls go remote |
| localStorage size limits on iOS | Data loss | Phase 6.1 migrates to secure native storage |
| App review delay | Launch delay | Submit to TestFlight early, iterate on feedback |

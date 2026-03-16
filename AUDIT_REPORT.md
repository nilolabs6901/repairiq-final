# RepairIQ — Project Review & App Store Readiness Report

**Date:** March 16, 2026
**Auditor:** Claude (Automated Audit)
**Project:** RepairIQ — AI-Powered Home Repair Diagnostic App
**Stack:** Next.js 14.2.18, TypeScript, Tailwind CSS 3.4, Framer Motion, Claude API
**Deployment:** Vercel (https://repairiq-v2.vercel.app)

---

## 1. Codebase Inventory

### src/app/ (Pages & API Routes)

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `layout.tsx` | Root layout with metadata, fonts, viewport | Complete | SEO metadata, Open Graph tags present |
| `page.tsx` | Homepage — two-path hero (Diagnose/Toolkit), features, testimonials | Complete | Hardcoded testimonials (acceptable for MVP) |
| `error.tsx` | Error boundary with retry/home buttons | Complete | Uses `console.error` (appropriate) |
| `loading.tsx` | Global loading skeleton with animated wrench | Complete | — |
| `not-found.tsx` | Custom 404 page | Complete | — |
| `diagnose/page.tsx` | AI diagnosis chat interface | Complete | Uses `alert()` for clipboard copy (minor UX issue) |
| `toolkit/page.tsx` | 8-tool self-repair grid + quick context form | Complete | Hardcoded JustAnswer URL for Live Tech Support |
| `history/page.tsx` | Saved repairs & sessions with search/delete | Complete | — |
| `community/page.tsx` | Success stories + Q&A forum tabs | Complete | Hardcoded stats (1,247 stories, $234K saved) |
| `inventory/page.tsx` | Appliance inventory + maintenance tabs | Complete | — |
| `professionals/page.tsx` | Find local professionals | Partial | **100% mock data** — does NOT call `/api/professionals`. "Coming Soon" banner. Hardcoded JustAnswer URL |
| `api/chat/route.ts` | Claude AI diagnosis endpoint | Complete | API key fallback to empty string. YouTube fetch logic duplicated from `/api/youtube`. Console logs: 4 |
| `api/youtube/route.ts` | YouTube Data API v3 search | Complete | `parseDuration()` duplicated from chat route |
| `api/professionals/route.ts` | Google Places API + mock fallback | Complete | Falls back to mock data with fake phone numbers. Default coords = US center |
| `api/leads/route.ts` | Lead capture + webhook/email delivery | Complete | **In-memory storage** (lost on restart). GET endpoint unprotected |
| `api/elevenlabs/route.ts` | Text-to-speech via ElevenLabs | Complete | Hardcoded default voice ID |
| `api/auth/[...nextauth]/route.ts` | NextAuth handler | Minimal | Just imports and re-exports |

### src/components/diagnosis/ (21 components)

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `ChatInput.tsx` | Multi-modal input (text/voice/image) | Complete | Web Speech API with dedup |
| `MessageBubble.tsx` | Chat message rendering with MC options | Complete | — |
| `ConversationPanel.tsx` | Scrollable message list + typing indicator | Complete | — |
| `DiagnosisResults.tsx` | Full results display (~930 lines) | Complete | Integrates all 8 tools |
| `ProgressIndicator.tsx` | Diagnostic stage progress bar | Complete | Responsive |
| `RepairAssistant.tsx` | Floating AI chat widget | Complete | Properly uses user message context (not system) |
| `SmartPartsList.tsx` | Parts checklist + store links | Complete | Amazon/HD/Lowes/eBay affiliate links |
| `RepairVideoHub.tsx` | YouTube video browser + bookmarks | Complete | — |
| `SafetyGuard.tsx` | Safety alerts + emergency contacts | Complete | Excellent 3-tier severity system |
| `SkillAssessment.tsx` | 5-question skill quiz | Complete | — |
| `RepairCheckpoint.tsx` | Step tracker + timer + notes | Complete | localStorage persistence |
| `CostComparison.tsx` | DIY vs Pro vs Replace analysis | Complete | Hardcoded cost data by appliance type |
| `LocalProfessionals.tsx` | Service provider cards + geolocation | Complete | Calls `/api/professionals` properly |
| `VirtualTechConnect.tsx` | Mock technician connection flow | Complete | Mock only — ready for real integration |
| `VoiceGuidedRepair.tsx` | Voice-controlled step-by-step guide | Complete | ElevenLabs + browser TTS fallback |
| `VoiceGuidedDiagnosis.tsx` | Voice-based diagnosis conversation | Complete | Multiple console.logs for debugging |
| `RateApp.tsx` | 3-step rating flow | Complete | — |
| `GetQuoteModal.tsx` | Lead capture form | Complete | Posts to `/api/leads` |
| `OutcomeFeedback.tsx` | Repair outcome reporting | Complete | — |
| `ErrorCodeLookup.tsx` | Error code search + filter | Complete | Uses error code database |
| `SoundAnalysis.tsx` | Audio recording + sound analysis | Complete | 7 sound types, frequency visualization |
| `index.ts` | Barrel exports | Complete | Exports all 21 components |

### src/components/community/

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `QAForum.tsx` | Q&A forum with voting, expert badges | Complete | Mock data (3 sample questions) |
| `SuccessStories.tsx` | User repair success stories | Complete | Mock data |
| `index.ts` | Barrel exports | Complete | — |

### src/components/inventory/

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `ApplianceInventory.tsx` | Full CRUD appliance tracker | Complete | 12 types, 13 brands, warranty tracking |
| `MaintenanceReminders.tsx` | Maintenance schedule alerts | Complete | — |
| `index.ts` | Barrel exports | Complete | — |

### src/components/layout/

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `Header.tsx` | Fixed nav with mobile hamburger | Complete | Active route highlighting |
| `Footer.tsx` | 4-column footer with social links | Complete | Social links are stubs |
| `index.ts` | Barrel exports | Complete | — |

### src/components/ui/

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `Button.tsx` | 5 variants, 4 sizes, loading state | Complete | forwardRef, Framer Motion |
| `Card.tsx` | 4 variants + hover, subcomponents | Complete | onClick bug fix applied correctly |
| `Badge.tsx` | Status badges | Complete | — |
| `Input.tsx` | Form input | Complete | — |
| `Skeleton.tsx` | Loading skeletons | Complete | — |
| `index.ts` | Barrel exports | Complete | — |

### src/lib/

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `prompts.ts` | Claude system prompts, stage logic, diagnosis extraction | Complete | Well-structured prompt engineering |
| `cache.ts` | Semantic caching with Jaccard similarity | Complete | localStorage, 30-day TTL, 100-entry limit |
| `storage.ts` | Session/repair/outcome/rating CRUD | Complete | All localStorage-based |
| `utils.ts` | cn(), formatDate/Time/RelativeTime, helpers | Complete | — |
| `auth.ts` | NextAuth config | Minimal | Guest-only auth. Hardcoded dev secret fallback. Google OAuth configured but no client ID in .env.example |
| `errorCodes.ts` | Appliance error code database | Complete | Comprehensive multi-brand coverage |
| `applianceStorage.ts` | Appliance inventory data layer | Complete | Default maintenance schedules by type |

### src/hooks/

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `useDiagnosis.ts` | Main diagnosis state management | Complete | Cache integration, session persistence. 2 console.logs |
| `useLocation.ts` | Geolocation + zip code detection | Complete | Nominatim geocoding, 24h location cache |

### src/types/

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `index.ts` | All TypeScript interfaces (579 lines) | Complete | Comprehensive: 30+ interfaces covering all features |

### src/styles/

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `globals.css` | Tailwind directives + custom CSS | Complete | — |

### Config & Root Files

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `package.json` | Dependencies (v1.0.0) | Complete | 12 deps, 8 devDeps. No test framework. No Capacitor. No database client |
| `next.config.js` | Next.js config | Minimal | `reactStrictMode: true`, image domains only. **No `output: 'export'`** for static generation |
| `tailwind.config.ts` | Full custom theme | Complete | Brand colors, custom animations, shadows |
| `tsconfig.json` | TypeScript config | Complete | Strict mode, path aliases |
| `postcss.config.js` | PostCSS with Tailwind | Complete | — |
| `.env.example` | Environment template | Partial | Missing: `GOOGLE_PLACES_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SENDGRID_API_KEY`, `LEAD_WEBHOOK_URL` |
| `CLAUDE.md` | Project documentation | Complete | Excellent and thorough |
| `public/` | Static assets | **Empty** | No favicon, no app icons, no manifest, no images |

---

## 2. Feature Completeness Matrix

### Core Features

| Feature | Status | Notes |
|---------|--------|-------|
| Landing page with CTA to start diagnosis | ✅ Complete | Two-path hero design |
| AI-powered conversational diagnosis (Claude API) | ✅ Complete | Multi-turn, vision support |
| Diagnostic progress stages | ✅ Complete | 5 stages with visual indicator |
| Photo/image upload during diagnosis | ✅ Complete | Up to 4 images, drag-and-drop |
| Voice input for diagnosis | ✅ Complete | Web Speech API + voice-guided mode |
| Diagnosis results display | ✅ Complete | Issues, steps, parts, cost, confidence |
| YouTube video links in results | ✅ Complete | YouTube Data API v3 integration |
| DIY vs Professional cost comparison | ✅ Complete | 3-way comparison with recommendation |
| PDF/print export of repair guides | ❌ Missing | Not implemented |
| Email/SMS sharing of results | ❌ Missing | Not implemented |
| Copy to clipboard | ⚠️ Partial | Uses `navigator.share()` with clipboard fallback, but uses `alert()` |

### User Accounts & Persistence

| Feature | Status | Notes |
|---------|--------|-------|
| User registration (email/password and/or OAuth) | ❌ Missing | Auth configured but only has "Guest" mode |
| User login/logout | ❌ Missing | No sign-in page exists (`/auth/signin` referenced but not created) |
| User profile page | ❌ Missing | Not implemented |
| Session management (NextAuth.js) | ⚠️ Partial | NextAuth configured with JWT strategy but no real providers working |
| Repair history saved to user account | ❌ Missing | **All data is localStorage only** — lost on device/browser change |
| Home appliance inventory | ⚠️ Partial | Functional but localStorage only |
| Dashboard with repair stats | ⚠️ Partial | Basic stats on inventory page, no dedicated dashboard |

### Service Provider Marketplace

| Feature | Status | Notes |
|---------|--------|-------|
| Service provider sign-up/registration | ❌ Missing | Not implemented |
| Service provider profile pages | ❌ Missing | Not implemented |
| Service provider dashboard | ❌ Missing | Not implemented |
| Post-diagnosis recommended providers | ⚠️ Partial | Shows mock data or Google Places results |
| Lead capture form | ✅ Complete | Full form with urgency, contact prefs |
| Lead delivery (email/webhook/in-app) | ⚠️ Partial | Code exists for webhook + SendGrid but **in-memory storage only** |
| Service provider directory | ⚠️ Partial | `/professionals` page exists but uses hardcoded mock data |
| Ratings and reviews | ❌ Missing | Not implemented |
| Google Places API integration | ✅ Complete | API route works, but `/professionals` page doesn't use it |

### Skill Assessment

| Feature | Status | Notes |
|---------|--------|-------|
| DIY skill assessment quiz | ✅ Complete | 5-question quiz with scoring |
| Personalized recommendations | ✅ Complete | Skill level mapped to difficulty thresholds |

### Infrastructure & Config

| Feature | Status | Notes |
|---------|--------|-------|
| Database setup | ❌ Missing | **Everything is localStorage** — no database whatsoever |
| API routes with auth/authz | ❌ Missing | All API routes are completely unprotected |
| Environment variables configured | ⚠️ Partial | `.env.example` missing several keys used in code |
| Error boundaries | ✅ Complete | Global error.tsx with retry |
| Loading states | ⚠️ Partial | Global loading.tsx exists; individual pages lack page-level loading |
| SEO metadata | ⚠️ Partial | Root layout only — no per-page metadata |
| Responsive design | ✅ Complete | Works across breakpoints |

---

## 3. App Store Readiness Checklist

### Technical Requirements

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Static export capability | ❌ Not configured | `next.config.js` lacks `output: 'export'`. API routes prevent static export — need rearchitecting for Capacitor |
| Capacitor installed | ❌ Not installed | Not in `package.json` |
| iOS project generated | ❌ Not started | Requires Capacitor setup + Mac for final build |
| Android project generated | ❌ Not started | Requires Capacitor setup |
| Native camera access | ❌ Not configured | Currently uses web file input; needs Capacitor Camera plugin |
| Push notifications | ❌ Not implemented | No notification system at all |
| Deep linking configured | ❌ Not configured | — |
| App icon (1024x1024) | ❌ Missing | `public/` directory is empty |
| Splash screen | ❌ Missing | — |
| Offline capability | ❌ Missing | No service worker, no offline handling |

### App Store Submission Requirements

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Apple Developer Account | ❌ Unknown | User needs $99/year account |
| Privacy Policy URL | ❌ Missing | Needs to be created and hosted |
| Terms of Service URL | ❌ Missing | Needs to be created and hosted |
| App description | ❌ Not written | — |
| Screenshots for required sizes | ❌ Not created | Need 6.7", 6.1", 5.5" iPhone screenshots |
| App category selected | ❌ Not done | Recommended: Utilities or Lifestyle |
| Age rating questionnaire | ❌ Not done | — |
| Data collection disclosure | ❌ Not done | App Privacy labels needed |
| Sign in with Apple | ❌ Not implemented | **Required** if offering any social sign-in |

### Code Quality for App Store

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| No console.log in production | ⚠️ ~20 statements | Scattered across API routes and hooks. All are warn/error level, but should be gated or removed |
| No hardcoded secrets in client code | ✅ Pass | All API keys in env vars |
| HTTPS enforcement | ✅ Pass | Vercel handles this |
| Input validation on all forms | ⚠️ Partial | Lead capture validates; some forms lack validation |
| Rate limiting on API routes | ❌ Missing | No rate limiting whatsoever — **Claude API abuse risk** |
| CSRF protection | ⚠️ Partial | NextAuth provides some; custom routes unprotected |

---

## 4. Database & Backend Architecture

### Current State

**Everything is localStorage.** This means:
- Data is per-browser, per-device only
- No data survives clearing browser storage
- No data sync across devices
- No backend persistence for leads (in-memory array on serverless = lost per cold start)
- No user accounts possible without a database
- No service provider marketplace possible

### Recommended Stack

**Supabase** is the recommended choice for rapid development:
- Built-in auth (email, OAuth, magic link, phone)
- PostgreSQL database with auto-generated APIs
- Row-level security (RLS) for multi-tenant data
- Real-time subscriptions (useful for lead notifications)
- File storage (for user photos, provider logos)
- Edge Functions (for webhooks, cron jobs)
- Generous free tier for MVP

### Required Data Models

```
users
├── id (uuid, PK)
├── email (text, unique)
├── name (text)
├── role (enum: 'homeowner' | 'provider' | 'admin')
├── avatar_url (text)
├── created_at (timestamp)
└── updated_at (timestamp)

service_providers
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── business_name (text)
├── description (text)
├── specialties (text[])
├── service_area_zip_codes (text[])
├── phone (text)
├── website (text)
├── address (text)
├── city (text)
├── state (text)
├── zip_code (text)
├── certifications (text[])
├── years_experience (int)
├── logo_url (text)
├── photos (text[])
├── is_verified (boolean)
├── is_featured (boolean)
├── subscription_tier (enum: 'free' | 'basic' | 'premium')
├── created_at (timestamp)
└── updated_at (timestamp)

diagnoses
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── session_data (jsonb) — full RepairSession
├── result_data (jsonb) — full DiagnosisResult
├── item_type (text)
├── item_description (text)
├── status (enum: 'in_progress' | 'complete')
├── created_at (timestamp)
└── updated_at (timestamp)

leads
├── id (uuid, PK)
├── homeowner_id (uuid, FK → users)
├── provider_id (uuid, FK → service_providers, nullable)
├── diagnosis_id (uuid, FK → diagnoses, nullable)
├── name (text)
├── phone (text)
├── email (text)
├── address (text)
├── zip_code (text)
├── problem_description (text)
├── urgency (enum: 'emergency' | 'soon' | 'flexible')
├── status (enum: 'new' | 'contacted' | 'quoted' | 'accepted' | 'completed' | 'declined')
├── created_at (timestamp)
└── updated_at (timestamp)

reviews
├── id (uuid, PK)
├── reviewer_id (uuid, FK → users)
├── provider_id (uuid, FK → service_providers)
├── lead_id (uuid, FK → leads, nullable)
├── rating (int, 1-5)
├── title (text)
├── content (text)
├── response (text, nullable) — provider's response
├── created_at (timestamp)
└── updated_at (timestamp)

appliances
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── appliance_data (jsonb) — full SavedAppliance
├── created_at (timestamp)
└── updated_at (timestamp)

subscriptions
├── id (uuid, PK)
├── provider_id (uuid, FK → service_providers)
├── plan (enum: 'free' | 'basic' | 'premium')
├── status (enum: 'active' | 'cancelled' | 'past_due')
├── stripe_subscription_id (text)
├── current_period_start (timestamp)
├── current_period_end (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Migration Path from localStorage to Database

1. **Phase 1:** Set up Supabase, create tables, add Supabase client
2. **Phase 2:** Create server-side API helpers for each data model (replacing localStorage calls)
3. **Phase 3:** Update `src/lib/storage.ts` and `src/lib/applianceStorage.ts` to use Supabase when authenticated, localStorage as offline fallback
4. **Phase 4:** Add sync functionality — when user logs in, merge any localStorage data into their account
5. **Phase 5:** Remove localStorage dependency for authenticated users

### Authentication Flow for Two User Types

Recommended: **Single auth system with role-based routing**

1. Shared sign-up page with role selector (Homeowner / Service Provider)
2. After auth, redirect based on role:
   - Homeowners → `/dashboard` (repair history, appliances)
   - Providers → `/provider/dashboard` (leads, profile, analytics)
3. Middleware checks role and protects routes:
   - `/provider/*` routes require `role === 'provider'`
   - `/dashboard` routes require `role === 'homeowner'`
   - `/diagnose`, `/toolkit` remain public or homeowner-only

---

## 5. Prioritized Action Plan

### Phase A — MVP Foundation (Week 1-2)

**Goal:** User accounts + database persistence + core auth flow

**Dependencies to install:**
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

**Environment variables to add:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

| Task | Files to Create/Modify | Complexity |
|------|----------------------|------------|
| Set up Supabase project + create tables | Supabase dashboard, SQL migrations | Moderate |
| Create Supabase client utility | `src/lib/supabase.ts` (new) | Simple |
| Implement auth pages (sign up, sign in, forgot password) | `src/app/auth/signin/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/auth/forgot-password/page.tsx` (new) | Moderate |
| Replace NextAuth with Supabase Auth (or integrate) | `src/lib/auth.ts`, middleware | Moderate |
| Create auth middleware for protected routes | `src/middleware.ts` (new) | Simple |
| Add auth context/provider | `src/components/providers/AuthProvider.tsx` (new), `src/app/layout.tsx` | Simple |
| Migrate storage.ts to Supabase | `src/lib/storage.ts` | Moderate |
| Migrate applianceStorage.ts to Supabase | `src/lib/applianceStorage.ts` | Moderate |
| Create user profile page | `src/app/profile/page.tsx` (new) | Simple |
| Create homeowner dashboard | `src/app/dashboard/page.tsx` (new) | Moderate |
| Add rate limiting to API routes | `src/lib/rateLimit.ts` (new), all `route.ts` files | Moderate |
| Fix `/api/leads` persistence | `src/app/api/leads/route.ts` | Simple |
| Update `.env.example` with all variables | `.env.example` | Simple |
| Add favicon and basic app icons | `public/` directory | Simple |

### Phase B — Marketplace Core (Week 3-4)

**Goal:** Service providers can sign up, get leads, manage their profile

**Additional dependencies:**
```bash
npm install stripe @stripe/stripe-js  # if doing payments
npm install nodemailer                  # for email notifications
npm install zod                         # for form validation
```

**Environment variables to add:**
```env
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

| Task | Files to Create/Modify | Complexity |
|------|----------------------|------------|
| Service provider registration flow | `src/app/provider/register/page.tsx` (new) | Moderate |
| Service provider profile editor | `src/app/provider/profile/page.tsx` (new) | Moderate |
| Service provider dashboard (leads, stats) | `src/app/provider/dashboard/page.tsx` (new) | Complex |
| Provider lead view + contact management | `src/app/provider/leads/page.tsx` (new) | Moderate |
| Public provider profile page | `src/app/providers/[id]/page.tsx` (new) | Moderate |
| Provider search/directory page | Modify `src/app/professionals/page.tsx` to use real data | Moderate |
| Lead notification system (email + in-app) | `src/lib/notifications.ts` (new), `src/app/api/notifications/route.ts` (new) | Complex |
| Connect diagnosis results to provider recommendations | Modify `src/components/diagnosis/LocalProfessionals.tsx` | Moderate |
| Lead status tracking (new → contacted → quoted → completed) | `src/app/api/leads/[id]/route.ts` (new) | Simple |
| Form validation with Zod | `src/lib/validations.ts` (new) | Moderate |

### Phase C — App Store Preparation (Week 5-6)

**Goal:** Capacitor wrapper, native features, submission assets

**Dependencies to install:**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init RepairIQ com.repairiq.app
npm install @capacitor/camera @capacitor/push-notifications @capacitor/app @capacitor/haptics
npx cap add ios
npx cap add android
```

| Task | Files to Create/Modify | Complexity |
|------|----------------------|------------|
| Configure Capacitor | `capacitor.config.ts` (new) | Simple |
| Rearchitect for hybrid: API calls to hosted backend, not local routes | Multiple API call sites | Complex |
| Create native camera integration | Modify `src/components/diagnosis/ChatInput.tsx` | Moderate |
| Add offline detection + graceful degradation | `src/components/providers/OfflineProvider.tsx` (new) | Moderate |
| Create app icon set (all sizes) | `public/` + native projects | Simple |
| Create splash screen | Native project assets | Simple |
| Write Privacy Policy | `src/app/privacy/page.tsx` (new) or hosted URL | Simple |
| Write Terms of Service | `src/app/terms/page.tsx` (new) or hosted URL | Simple |
| Add Sign in with Apple | Auth configuration | Moderate |
| Remove/gate all console.log statements | All files with console statements | Simple |
| Create App Store screenshots | Design tool + device frames | Moderate |
| Write App Store description + metadata | App Store Connect | Simple |
| Test on real iOS device via TestFlight | Xcode build pipeline | Complex |

### Phase D — Growth Features (Week 7+)

**Goal:** Reviews, payments, analytics, advanced features

| Task | Files to Create/Modify | Complexity |
|------|----------------------|------------|
| Review/rating system for providers | `src/app/providers/[id]/review/page.tsx` (new) | Moderate |
| Stripe integration for provider subscriptions | `src/app/api/stripe/` routes (new) | Complex |
| Provider featured placement (paid tier) | Search ranking logic | Moderate |
| Push notification service | Capacitor Push + backend triggers | Complex |
| Analytics dashboard (Posthog/Mixpanel) | `src/lib/analytics.ts` (new) | Moderate |
| PDF export of repair guides | `src/lib/pdfExport.ts` (new) | Moderate |
| Email/SMS sharing of results | `src/app/api/share/route.ts` (new) | Moderate |
| Community backend (real data, not mock) | Migrate forum data to Supabase | Complex |
| Advanced provider-homeowner matching | Algorithm based on specialty, distance, rating, availability | Complex |
| A/B testing framework | Feature flags system | Moderate |
| Error monitoring (Sentry) | `src/lib/sentry.ts` (new) | Simple |
| SEO per-page metadata | All page files | Simple |
| PWA manifest + service worker | `public/manifest.json` (new), service worker | Moderate |

---

## 6. Critical Issues (Blockers)

### 🔴 P0 — Must Fix Before Any Launch

1. **No database at all.** Everything is localStorage. Leads stored in-memory are lost on every Vercel cold start (which can happen every few minutes). This means the lead capture feature — the core monetization path — is fundamentally broken in production.

2. **No authentication.** The auth system only allows "Guest" login with random IDs. No real user accounts, no sign-in page exists (referenced `/auth/signin` is a 404). Google OAuth is configured but with empty client IDs.

3. **No rate limiting on `/api/chat`.** Anyone can spam the Claude API endpoint with no throttling. At ~$0.003-0.015 per call, this is a real cost risk. A malicious actor could rack up significant API bills.

4. **No API route protection.** All API routes accept requests from anyone. No auth checks, no CORS restrictions beyond Next.js defaults.

5. **`/professionals` page doesn't use the API.** The page has 100% hardcoded mock data and doesn't call the functional `/api/professionals` route that actually queries Google Places.

6. **`public/` directory is empty.** No favicon, no app icons, no Open Graph images, no manifest. The site shows a default Next.js favicon and has no social sharing preview.

### 🟡 P1 — Must Fix Before App Store

7. **No `output: 'export'` in next.config.js.** Capacitor requires a static build, but the app uses API routes that can't be statically exported. Architecture needs rethinking — API routes must be hosted separately or the app needs to call a hosted API URL.

8. **Hardcoded development secret** in `src/lib/auth.ts` line 44: `secret: process.env.NEXTAUTH_SECRET || 'development-secret-key'`. If NEXTAUTH_SECRET isn't set, auth uses a known secret.

9. **`.env.example` is incomplete.** Missing 5+ environment variables that the code actually uses.

---

## 7. Quick Wins (< 1 Hour Each)

| # | Quick Win | Impact | Effort |
|---|-----------|--------|--------|
| 1 | Add favicon + basic OG image to `public/` | Professional appearance, social sharing | 15 min |
| 2 | Fix `.env.example` to include all env vars | Developer onboarding | 10 min |
| 3 | Remove hardcoded auth secret fallback | Security | 5 min |
| 4 | Replace `alert()` with toast notification in diagnose page | UX polish | 20 min |
| 5 | Wire `/professionals` page to use `/api/professionals` route | Feature works instead of showing mock data | 30 min |
| 6 | Add per-page SEO metadata (title, description) | SEO improvement | 30 min |
| 7 | Add a basic rate limiter to `/api/chat` (IP-based, in-memory) | API cost protection | 30 min |
| 8 | Extract `parseDuration()` to shared util (DRY fix) | Code quality | 15 min |
| 9 | Add page-level `loading.tsx` for `/diagnose` and `/toolkit` | Better perceived performance | 20 min |
| 10 | Gate console.log with `process.env.NODE_ENV !== 'production'` | Cleaner production logs | 20 min |

---

## Summary

RepairIQ has a **solid, well-built frontend** with impressive feature depth (21 diagnosis components, voice I/O, sound analysis, error code lookup, etc.). The TypeScript types are comprehensive, the UI is polished with consistent animations, and the code quality is good.

However, the app is fundamentally a **frontend prototype** — it has no database, no real auth, no API protection, and no infrastructure for the two critical business features (user accounts and service provider marketplace). The gap between "impressive demo" and "App Store-ready product" is significant but well-defined.

**The single most impactful next step is setting up Supabase** — this unlocks user accounts, persistent data, real lead capture, and the service provider marketplace, all in one integration.

**Estimated total effort to App Store submission:** 6-8 weeks for a solo developer, 3-4 weeks for a small team.

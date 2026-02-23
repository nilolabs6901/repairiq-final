# RepairIQ - Project Context for Claude

## Overview
RepairIQ is a Next.js 14 home repair diagnostic web application that uses Claude AI to help users diagnose and fix broken household items. Users describe their problem (via text, voice, or images), answer guided questions, and receive a comprehensive diagnosis with step-by-step repair instructions. The app also provides a standalone self-repair toolkit accessible from the homepage.

## Tech Stack
- **Framework:** Next.js 14.2.18 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4 with custom design system (brand-500 = green #22c55e)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk@^0.30.1`, model: `claude-sonnet-4-20250514`)
- **Auth:** NextAuth.js (configured but minimal use)
- **File uploads:** react-dropzone
- **Deployment:** Vercel

## Getting Started
```bash
npm install
cp .env.example .env.local   # Fill in API keys
npm run dev                   # http://localhost:3000
npm run build                 # Production build
```

## Environment Variables
```env
ANTHROPIC_API_KEY=sk-ant-...          # Required - Claude API
NEXTAUTH_SECRET=...                   # Required - Auth secret
NEXTAUTH_URL=http://localhost:3000    # Required - Auth URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Required - Base URL
YOUTUBE_API_KEY=AIza...               # Optional - YouTube Data API v3
ELEVENLABS_API_KEY=...                # Optional - Premium text-to-speech
ELEVENLABS_VOICE_ID=...              # Optional - Custom voice ID
```

## Known Issue: OneDrive & .next Cache
The project lives on OneDrive. File syncing can corrupt the `.next` build cache, causing CSS to stop loading (page renders unstyled). **Fix**: Delete the `.next` folder and restart the dev server. For a permanent fix, move the project outside OneDrive.

## Project Structure
```
src/
├── app/
│   ├── page.tsx                      # Homepage - two-path hero design
│   ├── layout.tsx                    # Root layout (fonts, metadata)
│   ├── error.tsx                     # Error boundary
│   ├── loading.tsx                   # Loading skeleton
│   ├── not-found.tsx                 # 404 page
│   ├── diagnose/page.tsx             # AI diagnosis chat interface
│   ├── toolkit/page.tsx              # Self-repair toolkit (8 tools + quick issue input)
│   ├── history/page.tsx              # Saved repair history
│   ├── community/page.tsx            # Q&A forum & success stories
│   ├── inventory/page.tsx            # Appliance inventory tracker
│   ├── professionals/page.tsx        # Find local service providers
│   └── api/
│       ├── chat/route.ts             # Claude AI diagnosis endpoint (main API)
│       ├── youtube/route.ts          # YouTube video search
│       ├── professionals/route.ts    # Google Places API
│       ├── leads/route.ts            # Lead capture for monetization
│       ├── elevenlabs/route.ts       # Text-to-speech
│       └── auth/[...nextauth]/route.ts
│
├── components/
│   ├── diagnosis/                    # Core diagnosis components (20 files)
│   │   ├── ChatInput.tsx             # Text/voice/image input with Web Speech API
│   │   ├── MessageBubble.tsx         # Chat messages with multiple-choice options
│   │   ├── ConversationPanel.tsx     # Scrollable message history
│   │   ├── DiagnosisResults.tsx      # Full results display with toolkit grid
│   │   ├── RepairAssistant.tsx       # Floating AI chat widget for during-repair help
│   │   ├── SmartPartsList.tsx        # Parts checklist with qty, store links, clipboard
│   │   ├── RepairVideoHub.tsx        # YouTube video browser with categories & bookmarks
│   │   ├── SafetyGuard.tsx           # Context-aware safety alerts & emergency contacts
│   │   ├── SkillAssessment.tsx       # 5-question quiz -> skill level & recommendation
│   │   ├── RepairCheckpoint.tsx      # Step tracker with timer & notes (localStorage)
│   │   ├── CostComparison.tsx        # DIY vs professional vs replacement analysis
│   │   ├── LocalProfessionals.tsx    # Service provider listings
│   │   ├── VirtualTechConnect.tsx    # Video/phone/chat with technicians
│   │   ├── GetQuoteModal.tsx         # Lead capture form
│   │   ├── OutcomeFeedback.tsx       # Repair outcome reporting
│   │   ├── ProgressIndicator.tsx     # Diagnosis stage progress bar
│   │   ├── RateApp.tsx               # App rating form
│   │   ├── SoundAnalysis.tsx         # Audio analysis for diagnosis
│   │   ├── VoiceGuidedDiagnosis.tsx  # Voice-guided diagnosis workflow
│   │   ├── VoiceGuidedRepair.tsx     # Voice-guided step-by-step repair
│   │   └── index.ts
│   │
│   ├── community/
│   │   ├── QAForum.tsx               # Q&A forum
│   │   ├── SuccessStories.tsx        # User repair stories
│   │   └── index.ts
│   │
│   ├── inventory/
│   │   ├── ApplianceInventory.tsx    # Add/edit appliances
│   │   ├── MaintenanceReminders.tsx  # Maintenance schedule alerts
│   │   └── index.ts
│   │
│   ├── layout/
│   │   ├── Header.tsx                # Nav: Start Diagnosis, Toolkit, My Repairs, Find Pros
│   │   ├── Footer.tsx                # Footer with product/support/legal links
│   │   └── index.ts
│   │
│   └── ui/                           # Base UI components
│       ├── Avatar.tsx
│       ├── Badge.tsx                 # Status badges (success, warning, info, etc.)
│       ├── Button.tsx                # Primary/secondary/ghost variants
│       ├── Card.tsx                  # Card with hover animation (see bug fix note below)
│       ├── Input.tsx
│       ├── Skeleton.tsx              # Loading skeletons
│       └── index.ts
│
├── hooks/
│   ├── useDiagnosis.ts               # Main diagnosis state management hook
│   └── useLocation.ts               # Geolocation & zip code detection
│
├── lib/
│   ├── prompts.ts                    # Claude system prompts per diagnostic stage
│   ├── cache.ts                      # Semantic caching (localStorage)
│   ├── storage.ts                    # Session/repair storage (localStorage)
│   ├── utils.ts                      # cn(), generateId(), formatting helpers
│   ├── auth.ts                       # NextAuth configuration
│   ├── errorCodes.ts                 # Appliance error code database
│   └── applianceStorage.ts           # Appliance inventory data layer
│
├── styles/
│   └── globals.css                   # Tailwind directives & custom CSS
│
└── types/
    └── index.ts                      # All TypeScript interfaces
```

## Key Architecture Details

### Homepage Design (`src/app/page.tsx`)
Two large gradient cards in the hero section:
- **"Don't Know What's Wrong"** (green gradient) -> `/diagnose` (AI diagnosis)
- **"Help Me Fix It"** (indigo/violet gradient) -> `/toolkit` (self-repair tools)

Remaining sections: Features grid, Category cards, How It Works, Testimonials, CTA.

### Toolkit Page (`src/app/toolkit/page.tsx`)
- 8 tool cards in a responsive grid (AI Chat, Parts & Shopping, Video Tutorials, Safety Checklist, Skill Assessment, Track Progress, Cost Comparison, Live Tech Support)
- "What are you trying to fix?" input form with appliance type dropdown + issue description
- `createQuickContext()` generates a minimal `DiagnosisResult` from user input so tools work without a full AI diagnosis
- Loads most recent saved diagnosis from localStorage on mount
- Tools that require diagnosis show "Needs Diagnosis" badge when no context exists
- All tools open as modal overlays

### Diagnosis Flow (`src/app/diagnose/page.tsx`)
1. User describes problem via text, voice, or photo
2. Claude AI asks clarifying questions (stages: initial -> understanding -> narrowing -> solutions -> complete)
3. AI returns structured `DiagnosisResult` JSON embedded in response
4. Results page shows issues, steps, parts, videos, and full toolkit

### Data Persistence
- **All data stored in localStorage** (no database)
- `getSavedRepairs()` / `saveRepair()` in `src/lib/storage.ts`
- Repair checkpoint progress keyed by diagnosis ID
- Appliance inventory in separate storage via `src/lib/applianceStorage.ts`

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | Main AI diagnosis - sends messages to Claude, extracts diagnosis JSON |
| `/api/youtube` | GET | Searches YouTube for repair tutorial videos |
| `/api/professionals` | GET | Searches Google Places for local service providers |
| `/api/leads` | POST | Captures lead data for monetization |
| `/api/elevenlabs` | POST | Text-to-speech conversion |

## Important Bug Fixes & Gotchas

### Card Component onClick (FIXED)
**File:** `src/components/ui/Card.tsx`
When `hover={true}`, the Card renders a Framer Motion `motion.div`. The `onClick` handler must be explicitly destructured and passed - NOT spread via `{...props}` - because spreading `HTMLAttributes<HTMLDivElement>` onto `motion.div` causes TypeScript type conflicts with animation-related event handlers. The non-hover path can use `{...props}` safely since it's a regular `<div>`.

### RepairAssistant API Integration (FIXED)
**File:** `src/components/diagnosis/RepairAssistant.tsx`
The repair context (diagnosis info, current step, parts, etc.) must be embedded as a **user message prefix**, NOT as a `role: 'system'` message. The `/api/chat` endpoint builds its own system prompt via `buildPrompt()`, and the Anthropic API only accepts `user`/`assistant` roles in the messages array. Sending `role: 'system'` causes the API call to fail silently.

### OneDrive .next Cache Corruption
The `.next` build cache gets corrupted by OneDrive file syncing, causing CSS to stop loading. Symptoms: page renders with no styling (plain HTML). Fix: `rm -rf .next && npm run dev`. Consider moving the project outside OneDrive for a permanent fix.

## Core Types (`src/types/index.ts`)

```typescript
type DiagnosticStage = 'initial' | 'understanding' | 'narrowing' | 'solutions' | 'complete';
type Difficulty = 'easy' | 'medium' | 'hard' | 'professional';

interface DiagnosisResult {
  id: string;
  itemType: string;
  itemDescription: string;
  summary: string;
  likelyIssues: LikelyIssue[];          // title, probability, description, difficulty, confidenceScore
  troubleshootingSteps: TroubleshootingStep[];  // stepNumber, title, description, estimatedTime, difficulty
  partsNeeded: Part[];                    // name, partNumber?, estimatedCost, where_to_buy, required
  estimatedTotalTime: string;
  estimatedTotalCost: string;
  shouldCallProfessional: boolean;
  overallConfidence: number;
  confidenceFactors: { informationQuality: number; symptomClarity: number; patternMatch: number };
  youtubeVideos?: YouTubeVideo[];
  createdAt: Date;
}
```

## Tailwind Theme (`tailwind.config.ts`)
- **Brand colors:** Green scale (`brand-50` through `brand-950`, primary `brand-500: #22c55e`)
- **Surface colors:** Neutral gray scale for backgrounds/text
- **Accent colors:** `accent-blue`, `accent-amber`, `accent-rose`, `accent-violet`, `accent-cyan`
- **Custom shadows:** `shadow-glow`, `shadow-glow-lg`, `shadow-card`, `shadow-card-hover`, `shadow-inner-glow`
- **Custom animations:** `fade-in`, `fade-in-up`, `fade-in-down`, `slide-in-right`, `slide-in-left`, `scale-in`, `pulse-soft`, `shimmer`, `bounce-soft`, `typing`
- **Background patterns:** `bg-mesh-gradient`, `bg-hero-pattern`

## Key Files to Know

### `src/lib/prompts.ts`
- `SYSTEM_PROMPT` - Claude's personality and diagnostic approach
- `VOICE_SYSTEM_PROMPT` - Shorter prompt for the repair assistant chat
- `INITIAL_GREETING` - First message with category options
- `parseMultipleChoiceOptions()` - Extracts A/B/C/D/E from messages
- `extractDiagnosis()` - Parses JSON diagnosis block from Claude's response
- `buildPrompt()` - Builds stage-appropriate system prompt

### `src/hooks/useDiagnosis.ts`
- Main state management for the diagnosis flow
- Handles caching, API calls, session persistence
- Manages diagnostic stage transitions

### `src/app/api/chat/route.ts`
- Claude API integration with vision support (base64 images)
- Extracts structured diagnosis JSON from responses
- Fetches YouTube videos when diagnosis completes
- Uses `claude-sonnet-4-20250514` model

## Implemented Features

1. **AI-Powered Diagnosis** - Claude Vision analyzes photos, multi-turn guided questions, confidence scoring
2. **Multiple Choice Questions** - AI asks one question at a time with clickable A/B/C/D/E options
3. **Voice Input** - Web Speech API with ref-based deduplication, visual feedback
4. **Image Upload** - Drag-and-drop, up to 4 images per message, base64 to Claude Vision
5. **Self-Repair Toolkit** - 8 tools accessible from homepage without requiring diagnosis
6. **AI Repair Chat** - Floating assistant widget with repair context during repairs
7. **Smart Parts List** - Quantity controls, store links (Amazon/Home Depot/Lowe's/eBay), clipboard copy
8. **Video Tutorials** - YouTube integration with categories and bookmarks
9. **Safety Guard** - Context-aware alerts (electrical/water/gas), emergency contacts, completion checklist
10. **Skill Assessment** - 5-question quiz mapping to difficulty thresholds
11. **Repair Checkpoint** - Step tracker with built-in timer, notes, localStorage persistence
12. **Cost Comparison** - DIY vs professional vs replacement analysis
13. **YouTube Tutorials** - Fetched via YouTube Data API v3
14. **Local Professionals** - Google Places API integration with lead capture
15. **Virtual Tech Connect** - Video/phone/chat interface (mock, ready for real integration)
16. **Semantic Caching** - Keyword-based with Jaccard similarity, localStorage
17. **Repair History** - Save/load diagnoses from localStorage
18. **Community** - Q&A forum and success stories
19. **Appliance Inventory** - Track appliances with maintenance reminders

## Common Tasks

### Adding a New Feature to Diagnosis Results
1. Create component in `src/components/diagnosis/`
2. Export from `src/components/diagnosis/index.ts`
3. Import and add to `DiagnosisResults.tsx`

### Adding a Tool to the Toolkit Page
1. Add entry to `TOOLS` array in `src/app/toolkit/page.tsx`
2. Add state variable for modal: `const [showNewTool, setShowNewTool] = useState(false)`
3. Add case to `handleToolClick` switch
4. Add modal component render at bottom of JSX

### Modifying AI Behavior
- Edit `SYSTEM_PROMPT` in `src/lib/prompts.ts`
- Diagnosis JSON schema is embedded in the prompt

### Adding New API Routes
- Create in `src/app/api/[name]/route.ts`
- Use `NextResponse.json()` for responses

## Potential Improvements
- Database backend (replace localStorage with PostgreSQL/Supabase)
- User authentication enforcement
- Real parts supplier APIs (Amazon, Home Depot affiliates)
- Push notifications for maintenance reminders
- PWA support for offline access
- Error monitoring (Sentry)
- Analytics (Posthog/Mixpanel)
- SEO optimization
- AR overlay for repair guidance

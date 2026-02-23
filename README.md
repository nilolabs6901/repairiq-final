# RepairIQ - AI-Powered Home Repair Diagnostics

RepairIQ is a beautiful, consumer-facing web application that helps homeowners diagnose and repair broken household and commercial items using AI.

## Features

### 🔧 Smart Diagnostics
- Conversational AI interface for describing problems
- Intelligent follow-up questions to pinpoint issues
- Photo upload capability for visual diagnosis

### 📋 Comprehensive Results
- Ranked likely issues with probability scores
- Step-by-step troubleshooting guides
- Time and cost estimates
- Parts lists with pricing
- Clear indicators for when to call a professional

### 💾 History & Saved Repairs
- Persistent conversation history
- Save diagnoses for later reference
- Search through past repairs

### 👥 Professional Directory
- Find local repair professionals (coming soon)
- Ratings and reviews
- Availability status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Claude API (Anthropic)
- **Auth**: NextAuth.js
- **Icons**: Lucide React
- **Storage**: localStorage (upgradeable to database)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/repairiq.git
cd repairiq
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
repairiq/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # NextAuth endpoints
│   │   │   └── chat/         # Claude AI chat endpoint
│   │   ├── diagnose/         # Main diagnosis page
│   │   ├── history/          # Repair history page
│   │   ├── professionals/    # Find professionals page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── diagnosis/        # Diagnosis-specific components
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ConversationPanel.tsx
│   │   │   ├── DiagnosisResults.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ProgressIndicator.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/               # Reusable UI components
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Skeleton.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── useDiagnosis.ts
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prompts.ts        # AI prompt templates
│   │   ├── storage.ts        # localStorage utilities
│   │   └── utils.ts          # Helper functions
│   ├── styles/
│   │   └── globals.css       # Global styles & Tailwind
│   └── types/
│       └── index.ts          # TypeScript types
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Key Components

### DiagnosisResults
Displays the complete diagnosis with:
- Summary card with quick stats
- Likely issues with probability bars
- Step-by-step troubleshooting guide
- Parts needed with pricing
- Video tutorial links

### ChatInput
Smart input component with:
- Auto-resizing textarea
- Image upload via drag & drop
- Keyboard shortcuts

### ProgressIndicator
Visual progress through diagnosis stages:
1. Understanding Problem
2. Narrowing Issues
3. Solutions
4. Complete

## Customization

### Colors
Edit `tailwind.config.ts` to customize the color palette:
```ts
colors: {
  brand: { ... },    // Primary green
  surface: { ... },  // Neutral grays
  accent: { ... },   // Accent colors
}
```

### AI Behavior
Modify the system prompt in `src/lib/prompts.ts` to adjust:
- Diagnostic approach
- Response format
- Safety guidelines
- Solution hierarchy

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User accounts with cloud sync
- [ ] Real professional directory with booking
- [ ] Parts ordering integration
- [ ] Community repair guides
- [ ] Mobile app (React Native)

## License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ using Claude AI and Next.js

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SnapRetro is a free, real-time retrospective meeting tool built with Next.js, Supabase, and Tailwind CSS. It's an alternative to Parabol, featuring encrypted messaging, AI-powered summaries, and collaborative session management.

## Development Commands

### Core Commands
- `pnpm run dev` - Start development server at http://localhost:3000
- `pnpm run build` - Build for production (includes Prisma generation)
- `pnpm start` - Start production server
- `pnpm run lint` - Run ESLint

### Database Migrations
- `pnpm run migrate:development --name <migration_name>` - Run Prisma migration for development
- `pnpm run migrate:production --name <migration_name>` - Run Prisma migration for production

### Testing
- `npx playwright test` - Run all E2E tests
- `npx playwright test --ui` - Run tests in UI mode
- `npx playwright test tests/create-retro.spec.ts` - Run specific test file
- `npx playwright show-report` - Show test report

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router) with React 19
- **Backend**: Supabase for realtime and authentication
- **Database**: PostgreSQL via Prisma ORM
- **State Management**: Zustand
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Encryption**: TweetNaCl (XChaCha20-Poly1305)
- **AI**: Google Gemini (via Vercel AI SDK) for retrospective summaries

### Project Structure
```
src/
├── app/
│   ├── api/                    # API routes
│   │   └── summarize/         # AI summary generation endpoint
│   ├── create-retro/          # Retro creation flow
│   ├── retro/[id]/            # Dynamic retro session pages
│   ├── actions.ts             # Server Actions for data mutations
│   ├── cryptoClient.ts        # Encryption/decryption utilities
│   └── utils.ts               # General utilities
├── components/                 # React components
│   └── ui/                    # shadcn/ui components
├── hooks/                     # Custom React hooks
│   ├── useRealtimeSubscription.ts  # Supabase Realtime setup
│   └── useRealtimeActions.ts       # Realtime broadcast helpers
├── stores/                    # Zustand state stores
│   ├── usePresenceStore.ts    # User presence & admin state
│   ├── useAdminStore.ts       # Admin controls (timer, settings)
│   └── useRetroSummaryStore.ts # Summary display state
├── types/                     # TypeScript type definitions
├── constants/                 # App constants
│   └── realtimeEventKeys.ts   # Realtime event constants
└── lib/
    └── prisma.ts              # Prisma client singleton

prisma/
└── schema.prisma              # Database schema
```

### Database Schema
The app uses three main models:
- **Retrospective**: Main retro session (admin, timer, settings, password)
- **RetrospectiveSection**: Columns in a retro (e.g., "Start Doing", "Stop Doing")
- **RetrospectivePost**: Individual cards/posts with encrypted content and vote tracking

### Key Architectural Patterns

#### Server Actions Pattern
All database mutations use Next.js Server Actions (defined in `src/app/actions.ts`):
- `createRetro()` - Creates new retrospective with sections
- `createPost()` - Adds encrypted post to a section
- `destroyPost()` - Deletes a post
- `editRetroSectionTitle()` - Updates section titles
- `editRetroSettings()` - Updates retro settings (voting, messaging)
- `addVoteToPost()` / `removeVoteFromPost()` - Voting logic
- `endRetrospective()` - Finalizes retro session

Always call `revalidate()` after mutations to refresh UI across all connected clients.

#### Realtime System (Supabase)
The app uses Supabase Realtime for:
1. **Presence tracking**: Who's online, who's the admin/host
2. **Broadcast events**: Admin changes, timer controls, user kicks, etc.

**Key files:**
- `useRealtimeSubscription.ts` - Sets up channel subscriptions and event listeners
- `useRealtimeActions.ts` - Helper functions to broadcast events
- `realtimeEventKeys.ts` - Event name constants

**Realtime flow:**
1. Each retro has a channel: `retrospective:{retroId}`
2. Users join via Presence API with their user info
3. Broadcast events propagate actions (timer, admin changes, etc.)
4. Admin reassignment happens automatically if admin leaves

#### End-to-End Encryption
All post content is encrypted client-side using TweetNaCl:
1. **Key generation**: Admin generates symmetric key on retro creation
2. **Key distribution**: Distributed via Supabase broadcast to joining users
3. **Encryption/Decryption**: Posts encrypted before DB write, decrypted on read
4. **Utilities**: `cryptoClient.ts` - `encryptMessage()`, `decryptMessage()`, `generateSymmetricKey()`

The symmetric key is stored in Zustand (`usePresenceStore`) and never sent to the server except during AI summary generation (passed via headers).

#### State Management (Zustand)
Three main stores:
- **usePresenceStore**: Online users, admin ID, symmetric key, participant history
- **useAdminStore**: Timer state, time remaining, admin controls
- **useRetroSummaryStore**: AI summary display content

#### AI Summary Generation
- Endpoint: `POST /api/summarize`
- Uses Vercel AI SDK with Google Gemini (gemini-2.5-flash-lite)
- Decrypts all posts server-side using symmetric key from request headers
- Generates markdown summary prioritizing posts by vote count
- Only admin can trigger summary generation
- Legacy endpoint (`/api/summarize-legacy`) uses older Google Generative AI SDK

### Local Development Setup

**Prerequisites:**
1. Supabase running locally via Docker (see README.md)
2. Environment variables in `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
   GOOGLE_GENERATIVE_AI_API_KEY=<your_key>
   DATABASE_URL=<pooled_connection>
   DIRECT_URL=<direct_connection>
   ```

**First-time setup:**
1. Install dependencies: `pnpm install`
2. Run migration: `pnpm run migrate:development --name init`
3. Start dev server: `pnpm run dev`

### Path Aliases
The project uses `@/*` to reference `src/*`:
```typescript
import { useToast } from '@/hooks/useToast';
import { prisma } from '@/lib/prisma';
```

### Important Conventions
- **Server Actions**: Always marked with `'use server'` directive
- **Client Components**: Marked with `'use client'` when using hooks or browser APIs
- **Revalidation**: Call `revalidate()` or `revalidatePath()` after data mutations
- **Encryption**: All user-generated content (posts) must be encrypted before DB write
- **Admin Role**: Dynamically assigned - first user becomes admin, reassigns if admin leaves

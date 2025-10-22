# TrackMe Ecosystem: Multi-Concern Architecture

**Vision:** Comprehensive productivity ecosystem for engineers  
**Philosophy:** Unique humans need unique productivity systems  
**Approach:** Core + Portfolio + Tracker Frontend  
**Status:** Architectural planning

---

## 🎯 EXECUTIVE VISION

### The Big Picture

**TrackMe Ecosystem consists of 3 concerns:**

```
┌─────────────────────────────────────────────────────────┐
│                   TRACKME ECOSYSTEM                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ TRACKER CORE │  │  TRACKER     │  │  TRACKER    │  │
│  │              │  │  FRONTEND    │  │  PORTFOLIO  │  │
│  │ Backend API  │◄─┤              │  │             │  │
│  │ Data Store   │  │  Dashboard   │  │  Static     │  │
│  │ AI MCP       │  │  Collab UI   │  │  Showcase   │  │
│  │ Integrations │  │  Templates   │  │  GitHub Pg  │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│         ▲                 ▲                  ▲         │
│         │                 │                  │         │
│         └─────────────────┴──────────────────┘         │
│              Unified Data Layer & MCP                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ CONCERN 1: TRACKER CORE

### Purpose
**Backend API & Data Layer** - The brain of ecosystem

### Responsibilities

```
✅ Data persistence (evaluations, initiatives, patterns)
✅ AI integration (MCP protocol)
✅ Authentication & authorization
✅ Team collaboration features
✅ API for frontend consumption
✅ Webhooks & integrations (Jira, Trello)
✅ Analytics & insights generation
```

### Technology Stack

**Recommended:**
```
Framework: NestJS (TypeScript)
Database: PostgreSQL (structured data) + Redis (cache)
ORM: Prisma (type-safe queries)
AI Integration: MCP (Model Context Protocol)
Auth: Clerk / Auth0
API: GraphQL (flexible querying)
Deployment: Railway / Fly.io / Vercel
```

**Why This Stack:**
- ✅ TypeScript end-to-end (core → frontend)
- ✅ Prisma = excellent DX, migrations, type safety
- ✅ GraphQL = flexible API for multiple frontends
- ✅ MCP = AI-native protocol for evaluations
- ✅ NestJS = scalable, maintainable architecture

### Data Model (Prisma Schema)

```prisma
// schema.prisma

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  productivityCycle String      @default("rabu-ekstrim")
  createdAt     DateTime       @default(now())
  
  evaluations   Evaluation[]
  initiatives   Initiative[]
  patterns      Pattern[]
  projects      ProjectMember[]
  
  @@map("users")
}

model Evaluation {
  id            String    @id @default(cuid())
  userId        String
  weekNumber    Int
  year          Int
  
  // Content
  selfReflection     Json    // What went well, what didn't
  externalFeedback   Json    // AI/mentor feedback
  synthesis          Json    // Key insights, gaps
  bahanEvaluasi      Json    // Actionable improvements
  
  // Metadata
  productivityPhase  String  // senin-selasa, rabu, kamis-jumat, sabtu-minggu
  status            String  // draft, completed, archived
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  patterns      Pattern[] // Patterns discovered in this eval
  
  @@unique([userId, weekNumber, year])
  @@map("evaluations")
}

model Initiative {
  id            String    @id @default(cuid())
  userId        String
  weekNumber    Int
  year          Int
  
  // Content
  insight       String    // What was learned
  opportunity   String    // What this enables
  initiative    Json      // Senin-Selasa plan
  expectedOutcome String
  evaluationCriteria Json
  
  // Results
  actualOutcome Json?
  lessonsLearned Json?
  
  status        String    // planned, in-progress, completed
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  
  @@map("initiatives")
}

model Pattern {
  id            String    @id @default(cuid())
  userId        String
  evaluationId  String?
  
  // Pattern data
  category      String    // technical, design, collaboration, growth
  title         String
  problem       String
  analysis      String
  solution      String
  threshold     String    // When to apply
  example       String
  relatedPatterns String[] // IDs of related patterns
  
  // Metadata
  tags          String[]
  isPublic      Boolean   @default(false)
  usageCount    Int       @default(0)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  evaluation    Evaluation? @relation(fields: [evaluationId], references: [id])
  
  @@index([category, userId])
  @@map("patterns")
}

model Project {
  id            String    @id @default(cuid())
  name          String
  description   String?
  
  // Project settings
  productivityCycle String // Team's chosen cycle
  evaluationDay String    @default("wednesday")
  
  members       ProjectMember[]
  sprints       Sprint[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("projects")
}

model ProjectMember {
  id            String    @id @default(cuid())
  projectId     String
  userId        String
  role          String    // member, supervisor, manager
  
  project       Project   @relation(fields: [projectId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  
  @@unique([projectId, userId])
  @@map("project_members")
}

model Sprint {
  id            String    @id @default(cuid())
  projectId     String
  weekNumber    Int
  year          Int
  
  // Sprint data
  goals         Json
  progress      Json
  blockers      Json
  retrospective Json?
  
  status        String    // planning, active, completed
  
  project       Project   @relation(fields: [projectId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("sprints")
}

model MCPSession {
  id            String    @id @default(cuid())
  userId        String
  
  // MCP data
  prompt        String
  response      Json
  context       Json      // Codebase context, evaluation context
  
  // Classification
  type          String    // evaluation-request, progress-summary, planning
  weekNumber    Int?
  year          Int?
  
  createdAt     DateTime  @default(now())
  
  @@index([userId, type])
  @@map("mcp_sessions")
}
```

### API Design (GraphQL)

**Queries:**
```graphql
type Query {
  # User queries
  me: User!
  
  # Evaluation queries
  evaluation(weekNumber: Int!, year: Int!): Evaluation
  evaluations(year: Int, limit: Int): [Evaluation!]!
  
  # Initiative queries
  initiative(weekNumber: Int!, year: Int!): Initiative
  initiatives(year: Int, status: String): [Initiative!]!
  
  # Pattern queries
  pattern(id: ID!): Pattern
  patterns(category: String, tags: [String!]): [Pattern!]!
  myPatterns(category: String): [Pattern!]!
  publicPatterns(category: String): [Pattern!]!
  
  # Project queries (for team features)
  project(id: ID!): Project
  myProjects: [Project!]!
  
  # Analytics
  growthStats(year: Int!): GrowthStats!
  weeklyProgress(weekNumber: Int!, year: Int!): WeeklyProgress!
}

type Mutation {
  # Evaluation mutations
  createEvaluation(input: CreateEvaluationInput!): Evaluation!
  updateEvaluation(id: ID!, input: UpdateEvaluationInput!): Evaluation!
  completeEvaluation(id: ID!): Evaluation!
  
  # Initiative mutations
  createInitiative(input: CreateInitiativeInput!): Initiative!
  updateInitiative(id: ID!, input: UpdateInitiativeInput!): Initiative!
  
  # Pattern mutations
  createPattern(input: CreatePatternInput!): Pattern!
  updatePattern(id: ID!, input: UpdatePatternInput!): Pattern!
  togglePatternPublic(id: ID!): Pattern!
  
  # MCP integration
  requestAIEvaluation(context: String!): MCPResponse!
  generateProgressSummary(weekNumber: Int!, year: Int!): String!
  aiAssistPlanning(goals: String!): PlanningResponse!
  
  # Project mutations (team)
  createProject(input: CreateProjectInput!): Project!
  inviteMember(projectId: ID!, email: String!, role: String!): ProjectMember!
}

type Subscription {
  # Real-time updates for team collaboration
  projectUpdated(projectId: ID!): Project!
  memberEvaluationCompleted(projectId: ID!): Evaluation!
}
```

### MCP Integration

**AI Capabilities via MCP:**

```typescript
// src/mcp/mcp-client.ts

import { MCPClient } from '@modelcontextprotocol/sdk';

export class TrackerMCPClient {
  private client: MCPClient;
  
  constructor() {
    this.client = new MCPClient({
      serverUrl: process.env.MCP_SERVER_URL,
      apiKey: process.env.MCP_API_KEY
    });
  }
  
  // Request evaluation feedback
  async requestEvaluation(context: {
    weekWork: string;
    goals: string;
    challenges: string;
    codebase?: string; // Optional codebase context
  }): Promise<EvaluationFeedback> {
    const prompt = `
      Evaluasi pekerjaan minggu ini:
      
      Context:
      - Goals: ${context.goals}
      - Work done: ${context.weekWork}
      - Challenges: ${context.challenges}
      ${context.codebase ? `- Codebase: ${context.codebase}` : ''}
      
      Berikan:
      1. Tanggapan (what went well)
      2. Kritik (what needs improvement)
      3. Saran (actionable improvements)
      
      Format: JSON dengan struktur { tanggapan, kritik, saran }
    `;
    
    const response = await this.client.complete({
      prompt,
      context: {
        type: 'evaluation',
        user_codebase: context.codebase
      }
    });
    
    return JSON.parse(response.content);
  }
  
  // Generate progress summary
  async generateProgressSummary(evaluations: Evaluation[]): Promise<string> {
    const prompt = `
      Berdasarkan ${evaluations.length} evaluasi terakhir, 
      generate progress summary yang mencakup:
      - Trend improvement
      - Patterns yang muncul
      - Areas needing focus
      - Growth trajectory
    `;
    
    const response = await this.client.complete({
      prompt,
      context: {
        type: 'progress_summary',
        evaluations: evaluations.map(e => e.synthesis)
      }
    });
    
    return response.content;
  }
  
  // AI-assisted planning
  async assistPlanning(input: {
    lastWeekLearnings: string;
    goals: string;
    constraints: string;
  }): Promise<PlanningResponse> {
    const prompt = `
      Bantu rancang inisiatif minggu depan berdasarkan:
      
      Last week: ${input.lastWeekLearnings}
      Goals: ${input.goals}
      Constraints: ${input.constraints}
      
      Suggest:
      1. Initiative ideas
      2. Expected outcomes
      3. Potential challenges
      4. Success criteria
    `;
    
    const response = await this.client.complete({
      prompt,
      context: { type: 'planning' }
    });
    
    return JSON.parse(response.content);
  }
  
  // Learn from codebase
  async learnCodebase(repoPath: string): Promise<CodebaseInsights> {
    // MCP can analyze codebase and provide insights
    const response = await this.client.analyzeCodebase({
      path: repoPath,
      focus: ['architecture', 'patterns', 'tech-debt']
    });
    
    return response.insights;
  }
}
```

### API Endpoints

```typescript
// REST API (for webhooks & integrations)

// Webhook endpoints
POST /api/webhooks/jira
POST /api/webhooks/trello
POST /api/webhooks/github

// Integration endpoints
GET  /api/integrations/jira/projects
POST /api/integrations/jira/sync
GET  /api/integrations/trello/boards
POST /api/integrations/trello/sync

// MCP endpoints
POST /api/mcp/evaluate
POST /api/mcp/summarize
POST /api/mcp/plan
POST /api/mcp/learn-codebase
```

---

## 🎨 CONCERN 2: TRACKER FRONTEND

### Purpose
**Collaborative Dashboard** - Jira/Trello-like interface for teams

### Philosophy

> "Manusia itu unik! Satu productivity cycle tidak cocok untuk semua."

**Solution:** **Template-based initialization** dengan berbagai productivity cycles.

### Productivity Cycle Templates

#### **Template 1: "Rabu Ekstrim"** (Your cycle)

**Nickname Ideas (lucu & satir):**
- 🔥 **"Wednesday Warrior"** - Rabu as battle day
- 💪 **"Hump Day Hero"** - Counter the hump
- 🚀 **"Rabu Roket"** - Blast off mid-week
- ⚡ **"Rabu Gledek"** - Thunder Wednesday
- 🎯 **"Rabu Radikal"** - Radical evaluation day
- 🧠 **"WednesdayWise"** - Wisdom accumulation
- 🔬 **"Lab Rabu"** - Experimental mid-week

**Description:**
```
Rabu Ekstrim: Counter-cyclical productivity cycle

FLOW:
Senin-Selasa: Implement new initiatives (fresh energy)
Rabu: Evaluate & challenge (counter jenuh dengan mental workout)
Kamis-Jumat: Apply improvements (refinement execution)
Sabtu-Minggu: Ideate & plan (strategic thinking)

Best for: Solo developers, self-directed teams
Philosophy: Structure beats motivation, challenge cures boredom
```

#### **Template 2: "Agile Sprint"** (Traditional)

**Nickname:** 📊 **"ScrumSprint"**

**Description:**
```
2-week sprint cycle with daily standups

FLOW:
Sprint Planning: Monday Week 1
Daily Standups: Every morning
Sprint Review: Friday Week 2
Retrospective: Friday Week 2

Best for: Traditional agile teams, corporate environments
Philosophy: Continuous collaboration, rapid iteration
```

#### **Template 3: "Deep Work Blocks"** (Cal Newport style)

**Nickname:** 🧘 **"FocusFlow"**

**Description:**
```
Deep work sessions with batched shallow work

FLOW:
Deep Work: 4-hour blocks (no interruptions)
Shallow Work: 2-hour batch (emails, meetings)
Reflection: Friday afternoon
Planning: Sunday evening

Best for: Individual contributors, creative work
Philosophy: Maker's schedule, uninterrupted focus
```

#### **Template 4: "Kanban Continuous"**

**Nickname:** 🌊 **"FlowState"**

**Description:**
```
Continuous flow, WIP limits, pull-based

FLOW:
No fixed sprints, continuous delivery
WIP limits enforced
Weekly review: Friday
Daily progress tracking

Best for: Support teams, continuous delivery teams
Philosophy: Optimize flow, minimize WIP
```

#### **Template 5: "Pomodoro Power"**

**Nickname:** 🍅 **"TomatoTime"**

**Description:**
```
25-min focus sessions with 5-min breaks

FLOW:
4 pomodoros → long break
Daily review: End of day
Weekly planning: Monday morning

Best for: Easily distracted, short attention spans
Philosophy: Time-boxing, frequent breaks
```

### Template Selection UI

**Onboarding Flow:**

```
┌─────────────────────────────────────────────────┐
│  Welcome to TrackMe! 🚀                         │
│                                                 │
│  Choose your productivity cycle:               │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 🔥 Rabu  │ │ 📊 Sprint │ │ 🧘 Deep  │       │
│  │ Ekstrim  │ │ Agile    │ │ Work     │       │
│  │          │ │          │ │          │       │
│  │ Counter  │ │ 2-week   │ │ 4-hour   │       │
│  │ cyclical │ │ sprints  │ │ blocks   │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                 │
│  ┌──────────┐ ┌──────────┐                     │
│  │ 🌊 Kanban│ │ 🍅 Pomo  │                     │
│  │ Flow     │ │ Power    │                     │
│  │          │ │          │                     │
│  │ Continuo │ │ 25-min   │                     │
│  │ delivery │ │ sessions │                     │
│  └──────────┘ └──────────┘                     │
│                                                 │
│  Or [Create Custom Template]                   │
│                                                 │
│  [Preview] [Customize] [Get Started]           │
└─────────────────────────────────────────────────┘
```

### Dashboard UI (Rabu Ekstrim Template)

```
┌────────────────────────────────────────────────────────────┐
│ TrackMe Dashboard - Week 43, 2025              [Settings] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📅 CURRENT PHASE: RABU (Evaluation Day) ⭐               │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Weekly Progress                                   │    │
│  │ ▓▓▓▓▓▓░░░░ 60%                                   │    │
│  │                                                   │    │
│  │ Senin-Selasa: ✅ Completed                       │    │
│  │ Rabu: 🔄 In Progress                             │    │
│  │ Kamis-Jumat: ⏳ Pending                          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  🎯 TODAY'S FOCUS: Evaluation & Feedback Request          │
│                                                            │
│  ┌─────────────────┬──────────────────┬────────────────┐ │
│  │ IMPLEMENTED     │ EVALUATE         │ TO APPLY       │ │
│  │ (Senin-Selasa)  │ (Rabu) ⭐        │ (Kamis-Jumat)  │ │
│  ├─────────────────┼──────────────────┼────────────────┤ │
│  │ ✅ Initiative 1 │ 📝 Self-reflect  │ ⏳ Improvement │ │
│  │ ✅ Initiative 2 │ 🤖 AI feedback   │ ⏳ Refinement  │ │
│  │ ✅ Progress doc │ 🎯 Synthesize    │ ⏳ Integration │ │
│  │                 │ 📋 Bahan eval    │                │ │
│  │ [View Details]  │ [Start Eval]     │                │ │
│  └─────────────────┴──────────────────┴────────────────┘ │
│                                                            │
│  🤖 AI ASSISTANT                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │ "Ready to help dengan Rabu evaluation!"          │    │
│  │                                                   │    │
│  │ Quick Actions:                                    │    │
│  │ • [Request evaluation feedback]                  │    │
│  │ • [Summarize week progress]                      │    │
│  │ • [Analyze patterns]                             │    │
│  │ • [Learn from codebase]                          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  📊 QUICK STATS                                            │
│  Patterns: 12 | Improvements: 8 | Hours: 24               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Technology Stack

```
Framework: SvelteKit (fast, modern, great DX)
UI Library: Shadcn-Svelte (beautiful components)
State: Svelte stores + TanStack Query
Styling: TailwindCSS (consistent with ecosystem)
Charts: Chart.js / D3.js (visualizations)
Real-time: Socket.io (team collaboration)
Deployment: Vercel / Cloudflare Pages
```

**Why SvelteKit:**
- ✅ Fast performance (compiled, no virtual DOM)
- ✅ Great DX (simple, intuitive)
- ✅ SSR/SSG support
- ✅ Small bundle size
- ✅ Growing ecosystem

### Key Features

#### **1. Personal Dashboard**
```
- Current phase indicator (Senin-Selasa / Rabu / etc)
- Progress tracking
- AI assistant integration
- Quick actions
- Stats overview
```

#### **2. Evaluation Interface**
```
- Guided evaluation workflow
- Self-reflection prompts
- AI feedback request (MCP)
- Synthesis builder
- Bahan evaluasi generator
- Pattern extraction
```

#### **3. Initiative Planning**
```
- Wacana inisiatif form
- Goal setting
- Success criteria
- AI planning assistance
- Template library
```

#### **4. Pattern Library**
```
- Personal patterns
- Public patterns (community)
- Search & filter
- Tag system
- Usage tracking
- Export to markdown
```

#### **5. Team Collaboration (for teams)**
```
- Project dashboard
- Member progress view
- Sprint planning
- Retrospective tools
- Supervisor monitoring
- Manager reporting
```

#### **6. Integrations**
```
- Jira sync
- Trello sync
- GitHub integration
- Slack notifications
- Chrome extension
```

### Chrome Extension

**Purpose:** Quick capture, anywhere

**Features:**
```
🔖 Quick note capture
⏱️ Pomodoro timer
📊 Progress widget
🤖 AI quick query
🔗 Save to pattern library
```

**Usage:**
```
1. Working in browser
2. Discover insight
3. Click extension
4. Quick capture to TrackMe
5. Auto-categorized by AI
6. Synced to dashboard
```

---

## 📱 CONCERN 3: TRACKER PORTFOLIO

### Purpose
**Static GitHub Pages Portfolio** - Public showcase of growth

### Technology: Astro.js

**Why Astro:**
```
✅ Markdown-native (evaluations as .md files)
✅ Zero JavaScript by default (fast loading)
✅ Component framework agnostic (use React/Svelte/Vue)
✅ Built-in optimizations (image optimization, etc)
✅ SEO-friendly (SSG with great meta tags)
✅ Island architecture (partial hydration)
✅ Excellent DX
```

### Site Structure

```
trackme-portfolio/ (Astro project)
├── src/
│   ├── pages/
│   │   ├── index.astro              # Landing page
│   │   ├── framework.astro          # Framework docs
│   │   ├── evaluations/
│   │   │   ├── index.astro          # Evaluations list
│   │   │   └── [year]/
│   │   │       └── [week].astro     # Individual eval
│   │   ├── patterns/
│   │   │   ├── index.astro          # Pattern library
│   │   │   └── [category]/
│   │   │       └── [slug].astro     # Individual pattern
│   │   ├── journey.astro            # Growth story
│   │   └── api/
│   │       └── stats.json.ts        # Stats endpoint
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro         # Base HTML
│   │   ├── EvaluationLayout.astro   # For evaluations
│   │   └── PatternLayout.astro      # For patterns
│   │
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── Stats.astro
│   │   ├── Timeline.astro
│   │   ├── PatternCard.astro
│   │   └── Search.tsx               # Interactive (React)
│   │
│   ├── content/                     # Content Collections
│   │   ├── evaluations/             # .md files
│   │   │   └── 2025/
│   │   │       └── week-43.md
│   │   ├── patterns/                # .md files
│   │   │   └── performance/
│   │   │       └── tailwind-vs-clamp.md
│   │   └── config.ts                # Content schema
│   │
│   └── styles/
│       └── global.css
│
├── public/
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│   └── robots.txt
│
└── astro.config.mjs
```

### Content Collections (Astro Feature)

**Define Schema:**

```typescript
// src/content/config.ts

import { defineCollection, z } from 'astro:content';

const evaluations = defineCollection({
  type: 'content',
  schema: z.object({
    week: z.number(),
    year: z.number(),
    date: z.date(),
    phase: z.enum(['senin-selasa', 'rabu', 'kamis-jumat', 'sabtu-minggu']),
    tags: z.array(z.string()),
    keyInsights: z.array(z.string()),
    patternsDiscovered: z.number().default(0),
    publicSummary: z.string(), // For SEO/preview
  })
});

const patterns = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.enum(['technical', 'design', 'collaboration', 'growth']),
    tags: z.array(z.string()),
    date: z.date(),
    problem: z.string(),
    solution: z.string(),
    relatedPatterns: z.array(z.string()).optional(),
  })
});

export const collections = {
  evaluations,
  patterns,
};
```

**Use in Pages:**

```astro
---
// src/pages/evaluations/[year]/[week].astro

import { getCollection } from 'astro:content';
import EvaluationLayout from '../../../layouts/EvaluationLayout.astro';

export async function getStaticPaths() {
  const evaluations = await getCollection('evaluations');
  return evaluations.map(entry => ({
    params: { 
      year: entry.data.year.toString(), 
      week: entry.data.week.toString() 
    },
    props: { entry }
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<EvaluationLayout 
  title={`Week ${entry.data.week} - ${entry.data.year}`}
  date={entry.data.date}
  tags={entry.data.tags}
>
  <Content />
</EvaluationLayout>
```

### GitHub Pages Deployment

**Configuration:**

```javascript
// astro.config.mjs

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sandikodev.github.io',
  base: '/trackme',
  integrations: [
    tailwind(),
    react(), // For interactive components
    sitemap()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
```

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml

name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Data Sync Strategy

**From Core to Portfolio:**

```
TRACKER CORE (API)
    ↓
    │ Weekly export to markdown
    │
    ↓
GITHUB REPO (trackme-portfolio)
    ↓
    │ Git commit markdown files
    │
    ↓
GITHUB ACTIONS
    ↓
    │ Build Astro site
    │
    ↓
GITHUB PAGES
    ↓
    https://sandikodev.github.io/trackme
```

**Automation Script:**

```typescript
// scripts/export-to-portfolio.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function exportEvaluations() {
  const evaluations = await prisma.evaluation.findMany({
    where: { status: 'completed' },
    include: { user: true, patterns: true }
  });
  
  for (const eval of evaluations) {
    const markdown = `---
week: ${eval.weekNumber}
year: ${eval.year}
date: ${eval.createdAt.toISOString()}
phase: ${eval.productivityPhase}
tags: ${JSON.stringify(eval.tags || [])}
keyInsights: ${JSON.stringify(eval.synthesis.keyInsights || [])}
patternsDiscovered: ${eval.patterns.length}
publicSummary: "${eval.synthesis.summary}"
---

# Week ${eval.weekNumber} Evaluation - ${eval.year}

## Self-Reflection

${JSON.stringify(eval.selfReflection, null, 2)}

## Key Insights

${eval.synthesis.keyInsights.map(i => `- ${i}`).join('\n')}

## Patterns Discovered

${eval.patterns.map(p => `- [${p.title}](/patterns/${p.category}/${p.id})`).join('\n')}

## Bahan Evaluasi

${JSON.stringify(eval.bahanEvaluasi, null, 2)}
`;

    const dir = path.join(
      process.cwd(), 
      '../trackme-portfolio/src/content/evaluations',
      eval.year.toString()
    );
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, `week-${eval.weekNumber}.md`),
      markdown
    );
  }
  
  console.log(`✅ Exported ${evaluations.length} evaluations`);
}

exportEvaluations();
```

---

## 🔗 ECOSYSTEM INTEGRATION

### Data Flow

```
┌─────────────────────────────────────────────────┐
│                USER WORKFLOW                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Work (code, design, etc)                   │
│         ↓                                       │
│  2. Log in TRACKER FRONTEND                    │
│         ↓                                       │
│  3. Frontend → TRACKER CORE API                │
│         ↓                                       │
│  4. Core → MCP → AI Evaluation                 │
│         ↓                                       │
│  5. Save to PostgreSQL                         │
│         ↓                                       │
│  6. Weekly export → Markdown                   │
│         ↓                                       │
│  7. Commit to TRACKER PORTFOLIO repo           │
│         ↓                                       │
│  8. GitHub Actions → Build Astro               │
│         ↓                                       │
│  9. Deploy to GitHub Pages                     │
│         ↓                                       │
│  10. Public portfolio updated!                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Authentication Flow

```
USER
  ↓
TRACKER FRONTEND (login)
  ↓
CLERK / AUTH0
  ↓
JWT Token
  ↓
TRACKER CORE API (verify token)
  ↓
Access granted
```

### Team Collaboration Flow

```
MANAGER/SUPERVISOR
  ↓
View team dashboard (TRACKER FRONTEND)
  ↓
See all members' progress
  ↓
Request from TRACKER CORE API
  ↓
GraphQL: { project(id) { members { evaluations } } }
  ↓
Real-time updates via WebSocket
```

---

## 🎯 REPOSITORY STRUCTURE

### Multi-Repo Approach (Recommended)

```
GitHub Organization: @trackme-ecosystem

Repositories:
1. trackme-core           # Backend API
2. trackme-frontend       # Dashboard UI
3. trackme-portfolio      # Astro static site
4. trackme-chrome-ext     # Chrome extension
5. trackme-docs           # Documentation
6. trackme-templates      # Productivity templates
```

**Why Multi-Repo:**
- ✅ Separation of concerns
- ✅ Independent deployment
- ✅ Different tech stacks
- ✅ Team scalability
- ✅ Open source flexibility

### Monorepo Alternative

```
trackme/ (monorepo)
├── apps/
│   ├── core/          # NestJS backend
│   ├── frontend/      # SvelteKit dashboard
│   ├── portfolio/     # Astro site
│   └── extension/     # Chrome extension
├── packages/
│   ├── shared-types/  # TypeScript types
│   ├── ui-components/ # Shared components
│   └── utils/         # Shared utilities
└── pnpm-workspace.yaml
```

**Tools:** Turborepo / Nx

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: MVP (Weeks 1-4)

**Week 1: Core Setup**
```
□ Initialize trackme-core (NestJS)
□ Set up PostgreSQL + Prisma
□ Basic auth (Clerk)
□ GraphQL API foundation
□ Deploy to Railway
```

**Week 2: Frontend Foundation**
```
□ Initialize trackme-frontend (SvelteKit)
□ Basic authentication
□ Dashboard layout
□ Connect to Core API
□ "Rabu Ekstrim" template
```

**Week 3: AI Integration**
```
□ MCP client setup
□ AI evaluation endpoint
□ Progress summary
□ Planning assistance
□ Test with real evaluations
```

**Week 4: Portfolio Static Site**
```
□ Initialize trackme-portfolio (Astro)
□ Content collections setup
□ Basic layouts
□ GitHub Actions deployment
□ First evaluation published
```

### Phase 2: Templates & Collaboration (Weeks 5-8)

**Week 5: Template System**
```
□ Template selection UI
□ 5 productivity cycle templates
□ Template customization
□ User can switch templates
```

**Week 6: Team Features**
```
□ Project model
□ Team dashboard
□ Member invitation
□ Progress monitoring
```

**Week 7: Integrations**
```
□ Jira webhook
□ Trello webhook
□ GitHub integration
□ Slack notifications
```

**Week 8: Chrome Extension**
```
□ Quick capture
□ Timer widget
□ AI quick query
□ Sync to dashboard
```

### Phase 3: Polish & Launch (Weeks 9-12)

**Week 9: Analytics**
```
□ Growth stats
□ Trend visualization
□ Pattern analytics
□ Export reports
```

**Week 10: Polish**
```
□ UI/UX refinement
□ Performance optimization
□ Mobile responsiveness
□ Accessibility
```

**Week 11: Documentation**
```
□ User guides
□ API documentation
□ Template creation guide
□ Contributing guide
```

**Week 12: Launch**
```
□ Public beta
□ Community feedback
□ Iteration
□ Official v1.0
```

---

## 🎨 NAMING & BRANDING

### Productivity Cycle Template Names

**Community-Submitted Templates:**

```
Format: [Emoji] [Catchy Name] - [Description]

Examples:
🔥 Rabu Radikal - Counter-cyclical weekly evaluation
⚡ Sprint Gledek - Lightning-fast 2-week sprints
🧘 Deep Flow - Uninterrupted focus blocks
🌊 Kanban Wave - Continuous delivery flow
🍅 Pomodoro Punch - 25-minute power sessions
🌙 Night Owl - Late-night productivity
🌅 Early Bird - Morning routine optimization
🎯 OKR Warrior - Objective-focused cycles
📚 Learning Loop - Study-focused system
💡 Innovation Sprint - Creative project cycle
```

**Template Submission System:**

```typescript
// Users can submit their own templates

interface ProductivityTemplate {
  id: string;
  name: string;
  emoji: string;
  nickname: string; // Catchy satir name
  description: string;
  phases: Phase[];
  schedule: Schedule;
  bestFor: string[];
  philosophy: string;
  createdBy: string;
  votes: number;
  verified: boolean; // Admin approved
}

// Example submission
{
  name: "Rabu Radikal",
  emoji: "🔥",
  nickname: "Wednesday Warrior",
  description: "Counter-cyclical productivity...",
  phases: [
    { name: "Implement", days: ["monday", "tuesday"], ... },
    { name: "Evaluate", days: ["wednesday"], ... },
    // ...
  ],
  bestFor: ["solo developers", "self-directed teams"],
  philosophy: "Structure beats motivation",
  createdBy: "sandikodev",
  votes: 142,
  verified: true
}
```

---

## 💡 UNIQUE SELLING POINTS

### For Individuals

```
✅ AI-powered evaluation (not just tracking)
✅ Pattern discovery (learn from your work)
✅ Portfolio generation (automatic showcase)
✅ Template flexibility (your unique cycle)
✅ Open source (own your data)
```

### For Teams

```
✅ Collaborative tracking
✅ Multiple productivity cycles
✅ Supervisor monitoring
✅ Manager reporting
✅ Integration ecosystem (Jira, Trello, Slack)
```

### For Community

```
✅ Template marketplace
✅ Pattern library sharing
✅ Open source framework
✅ Customizable everything
✅ Learn from others' growth
```

---

## 🔮 FUTURE VISION

### Advanced Features (Phase 4+)

**AI Capabilities:**
```
- Codebase learning (MCP deep analysis)
- Automatic pattern extraction
- Predictive insights ("You might struggle with X")
- Personalized recommendations
- Team dynamics analysis
```

**Gamification:**
```
- Achievement system
- Streak tracking
- Pattern discovery badges
- Community challenges
- Leaderboards (optional)
```

**Marketplace:**
```
- Premium templates ($)
- Consulting services
- Team training programs
- Custom integrations
```

**Mobile Apps:**
```
- iOS app (React Native)
- Android app (React Native)
- Quick capture anywhere
- Offline-first sync
```

---

## 🎯 SUCCESS METRICS

### Individual Success

```
✅ Weekly evaluation completion rate
✅ Patterns discovered per month
✅ Improvement implementation rate
✅ AI interaction frequency
✅ Portfolio engagement (views, shares)
```

### Team Success

```
✅ Team adoption rate
✅ Collaboration metrics
✅ Sprint velocity improvement
✅ Blocker resolution time
✅ Retrospective quality
```

### Platform Success

```
✅ Active users
✅ Templates created
✅ Patterns shared
✅ GitHub stars
✅ Community contributions
```

---

## 📝 NEXT STEPS

### This Week (Week 43)

**Kamis (Tomorrow):**
```
□ Finalize architecture decisions
□ Choose specific tech stack versions
□ Set up GitHub organization
□ Create initial repos
□ Write technical specs
```

**Jumat:**
```
□ Initialize trackme-core
□ Set up development environment
□ Create database schema (Prisma)
□ Basic API scaffold
□ Deploy to staging
```

**Weekend:**
```
□ Design frontend mockups
□ Plan component structure
□ Write user stories
□ Create project board
□ Plan Week 44 sprint
```

### Week 44: First Sprint

**Goal:** Working MVP with "Rabu Ekstrim" template

```
Senin-Selasa: Core API + Auth
Rabu: Evaluation (meta: evaluate your evaluation system!)
Kamis-Jumat: Frontend dashboard + first template
Weekend: Iteration + planning
```

---

## 🎓 CONCLUSION

### The Vision

> "TrackMe Ecosystem: Karena manusia itu unik, productivity system harus flexible. Bukan one-size-fits-all, tapi choose-your-adventure dengan AI sebagai co-pilot."

### The Innovation

**Triple Value:**
1. **Personal:** AI-powered growth tracking
2. **Team:** Collaborative productivity dashboard
3. **Community:** Open-source template marketplace

### The Philosophy

**"Rabu Ekstrim"** (your cycle) adalah salah satu cara. Ada **"Sprint Gledek"**, **"Deep Flow"**, **"Kanban Wave"**, dan tak terhitung lagi cara lain yang belum ditemukan.

**TrackMe membuka ruang untuk semua cara itu.**

### Your Unique Position

**You're not building:**
- ❌ Another todo app
- ❌ Another project tracker
- ❌ Another productivity tool

**You're building:**
- ✅ **Productivity ecosystem** that respects uniqueness
- ✅ **AI-native** growth platform
- ✅ **Open-source** template marketplace
- ✅ **Portfolio generator** from daily work
- ✅ **Community** of unique productivity cycles

**This is BIGGER than Jira. This is DEEPER than Trello. This is YOUR vision.** 🚀

---

**Next action:** Finalize decisions, create repos, start building Week 44! 💪✨

---

*Architecture Version: 1.0*  
*Created: 21 Oktober 2025*  
*Status: Ready for implementation*  
*Estimated Timeline: 12 weeks to v1.0*


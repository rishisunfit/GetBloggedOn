# Quiz Funnel Architecture

This document explains all the files involved in the self-assessment quiz funnel feature.

---

## Overview

The quiz funnel is a card-style, multi-step quiz experience that allows users to:
- View a cover page with quiz introduction
- Answer 5-10 questions (one per page)
- Optionally provide contact information
- See a conclusion page with response summary and CTAs

---

## File Structure

```
Blogish/
├── types/
│   └── quiz.ts                    # TypeScript interfaces
├── services/
│   └── quizzes.ts                 # Mock data service (localStorage)
├── components/
│   └── quiz/
│       ├── index.ts               # Barrel exports
│       ├── QuizPlayer.tsx         # Main quiz orchestrator
│       ├── QuizBuilder.tsx        # Admin interface for creating/editing
│       ├── QuizCover.tsx          # Cover page component
│       ├── QuizCard.tsx           # Question card component
│       ├── QuizProgress.tsx       # Progress bar component
│       ├── QuizContactForm.tsx    # Contact info collection
│       └── QuizConclusion.tsx     # Results/summary page
└── app/
    └── quiz/
        ├── [id]/
        │   ├── page.tsx           # Public quiz route
        │   └── edit/
        │       └── page.tsx       # Edit existing quiz
        └── new/
            └── page.tsx           # Create new quiz
```

---

## Core Files

### 1. `types/quiz.ts`

**Purpose:** Defines all TypeScript interfaces for the quiz system.

**Key Types:**
- `Quiz` - Main quiz object with all configuration
- `QuizQuestion` - Individual question with type, options, description
- `QuizOption` - Answer option for multiple/single choice
- `QuizCoverPage` - Cover page content (title, subtitle, description)
- `QuizConclusionPage` - Conclusion content and CTA buttons
- `QuizContactSettings` - Contact form configuration
- `QuizStyles` - Visual customization (colors, fonts, border radius)
- `QuizAnswer` - User's answer to a question
- `QuizSubmission` - Complete quiz submission with all answers

**Question Types Supported:**
- `single-choice` - Select one option
- `multiple-choice` - Select multiple options
- `text-input` - Free text response
- `rating` - Numeric rating scale

---

### 2. `services/quizzes.ts`

**Purpose:** Mock data service using localStorage for CRUD operations.

**API Methods:**
```typescript
quizzesApi.getAll()           // Get all quizzes
quizzesApi.getById(id)        // Get quiz by ID
quizzesApi.getBySlug(slug)    // Get quiz by URL slug
quizzesApi.create(data)       // Create new quiz
quizzesApi.update(id, data)   // Update existing quiz
quizzesApi.delete(id)         // Delete quiz
```

**Note:** This uses `localStorage` for persistence. Your team will wire this to Supabase.

**Sample Data:** Includes the "Knee Self-Assessment" quiz with 10 questions.

---

## Component Files

### 3. `components/quiz/QuizPlayer.tsx`

**Purpose:** Main orchestrator component that manages the entire quiz-taking experience.

**Responsibilities:**
- Manages quiz state (current step, answers, contact info)
- Handles navigation between stages
- Coordinates all child components
- Tracks progress

**Stages:**
1. `cover` → QuizCover
2. `questions` → QuizCard (loops through all questions)
3. `contact` → QuizContactForm (if enabled)
4. `conclusion` → QuizConclusion

**Props:**
```typescript
interface QuizPlayerProps {
  quiz: Quiz;
  onComplete?: (submission: QuizSubmission) => void;
  onClose?: () => void;
}
```

---

### 4. `components/quiz/QuizBuilder.tsx`

**Purpose:** Admin interface for creating and editing quizzes.

**Features:**
- **Content Tab:** Edit cover page, questions, conclusion
- **Design Tab:** Customize colors, fonts, border radius
- **Settings Tab:** Configure contact form collection
- **Live Preview:** Real-time preview matching quiz player aesthetic

**Layout:** Split-view with editor on left, live preview on right.

---

### 5. `components/quiz/QuizCover.tsx`

**Purpose:** Displays the quiz cover/intro page.

**Shows:**
- Quiz title
- Subtitle
- Description
- "Start Assessment" button

---

### 6. `components/quiz/QuizCard.tsx`

**Purpose:** Renders individual questions based on their type.

**Handles:**
- Single-choice questions (radio-style options)
- Multiple-choice questions (checkbox-style options)
- Text input questions
- Rating questions

**Props:**
```typescript
interface QuizCardProps {
  question: QuizQuestion;
  currentAnswer: QuizAnswer | undefined;
  onAnswer: (answer: QuizAnswer) => void;
  styles: QuizStyles;
  questionNumber: number;
  totalQuestions: number;
}
```

---

### 7. `components/quiz/QuizProgress.tsx`

**Purpose:** Simple progress bar showing quiz completion percentage.

**Props:**
```typescript
interface QuizProgressProps {
  current: number;
  total: number;
}
```

---

### 8. `components/quiz/QuizContactForm.tsx`

**Purpose:** Collects user contact information before showing results.

**Configurable Fields:**
- Name (optional/required)
- Email (optional/required)
- Phone (optional/required)

---

### 9. `components/quiz/QuizConclusion.tsx`

**Purpose:** Final results page with response summary and CTAs.

**Features:**
- Response summary showing all answers
- "Get Results from Rish AI" button (instant AI analysis)
- "Build My Custom Knee Plan" button (send to expert)
- Secondary CTA buttons
- Disclaimer text

**Props:**
```typescript
interface QuizConclusionProps {
  conclusion: QuizConclusionPage;
  styles: QuizStyles;
  answers: Record<string, QuizAnswer>;
  questions: QuizQuestion[];
  contactInfo?: { name?: string; email?: string; phone?: string };
}
```

---

### 10. `components/quiz/index.ts`

**Purpose:** Barrel file for clean imports.

```typescript
export { QuizPlayer } from './QuizPlayer';
export { QuizBuilder } from './QuizBuilder';
export { QuizCover } from './QuizCover';
export { QuizCard } from './QuizCard';
export { QuizProgress } from './QuizProgress';
export { QuizContactForm } from './QuizContactForm';
export { QuizConclusion } from './QuizConclusion';
```

---

## Route Files

### 11. `app/quiz/[id]/page.tsx`

**Purpose:** Public-facing route for taking a quiz.

**URL:** `/quiz/{quiz-id-or-slug}`

**Example:** `http://localhost:3001/quiz/sample-quiz-1`

---

### 12. `app/quiz/new/page.tsx`

**Purpose:** Route for creating a new quiz.

**URL:** `/quiz/new`

---

### 13. `app/quiz/[id]/edit/page.tsx`

**Purpose:** Route for editing an existing quiz.

**URL:** `/quiz/{quiz-id}/edit`

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Quiz Builder                            │
│  (Create/Edit quiz content, styling, settings)               │
└─────────────────────┬───────────────────────────────────────┘
                      │ saves to
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    quizzesApi                                │
│  (localStorage now, Supabase later)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ loads from
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Quiz Player                               │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌───────────┐ │
│  │  Cover   │→ │ Questions │→ │ContactForm  │→ │Conclusion │ │
│  │  Page    │  │  (Cards)  │  │ (optional)  │  │  Page     │ │
│  └──────────┘  └──────────┘  └─────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Styling System

Quizzes use a flexible styling system defined in `QuizStyles`:

| Property | Description | Example |
|----------|-------------|---------|
| `primaryColor` | Main buttons, headings | `#18181b` (dark) |
| `secondaryColor` | Secondary elements, AI button | `#3b82f6` (blue) |
| `backgroundColor` | Page background | `#f8fafc` (light) |
| `cardBackgroundColor` | Card/panel background | `#ffffff` (white) |
| `textColor` | Main text color | `#18181b` (dark) |
| `accentColor` | Highlights, progress bar | `#2563eb` (blue) |
| `borderRadius` | Corner rounding | `none`, `small`, `medium`, `large`, `full` |
| `fontFamily` | Typography | `system-ui`, `Inter`, `DM Sans`, etc. |

---

## Backend Integration (TODO for Team)

Currently using localStorage. To integrate with Supabase:

1. **Database Tables Needed:**
   ```sql
   -- quizzes table
   CREATE TABLE quizzes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     cover_page JSONB,
     questions JSONB,
     conclusion_page JSONB,
     contact_settings JSONB,
     styles JSONB,
     user_id UUID REFERENCES auth.users,
     status TEXT DEFAULT 'draft',
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   -- quiz_submissions table
   CREATE TABLE quiz_submissions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     quiz_id UUID REFERENCES quizzes,
     answers JSONB,
     contact_info JSONB,
     completed_at TIMESTAMPTZ DEFAULT now()
   );
   ```

2. **Update `services/quizzes.ts`:**
   - Replace localStorage calls with Supabase client
   - Add authentication checks
   - Implement real-time subscriptions if needed

3. **Wire up CTAs:**
   - "Get Results from Rish AI" → Call AI endpoint
   - "Build My Custom Knee Plan" → Save submission, send notification

---

## Quick Start

**View existing quiz:**
```
http://localhost:3001/quiz/sample-quiz-1
```

**Create new quiz:**
```
http://localhost:3001/quiz/new
```

**Edit quiz:**
```
http://localhost:3001/quiz/{quiz-id}/edit
```

---

## Dependencies

No external dependencies added. Uses:
- React 19
- Next.js 16
- Tailwind CSS
- Lucide React (icons)
- localStorage (mock persistence)





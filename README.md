# Blogish

A modern blog platform with interactive editors, quizzes, and analytics.

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Editor**: TipTap (rich text editor)
- **Language**: TypeScript

## Project Structure

```
/
├── app/                 # Next.js App Router pages
│   ├── dashboard/       # User dashboard (protected)
│   ├── editor/          # Post editor
│   ├── preview/         # Post preview
│   ├── analytics/       # Post analytics & heatmaps
│   ├── quiz/            # Quiz builder & player
│   ├── login/           # Authentication
│   └── signup/
├── components/          # React components
│   ├── editor/          # Editor components
│   ├── viewer/          # Post viewer components
│   └── quiz/            # Quiz components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & Supabase client
├── services/            # API services
├── types/               # TypeScript types
├── migrations/          # Database migrations
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

### Environment Variables

Create a `.env` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Features

- **Rich Text Editor**: TipTap-based editor with formatting, images, videos, and tables
- **Quiz Builder**: Create interactive quizzes with multiple question types
- **Analytics**: Track scroll depth, clicks, attention, and engagement
- **Landing Page**: Public landing page with waitlist signup
- **Dashboard**: Manage posts, quizzes, and folders
- **Authentication**: Supabase auth with login/signup

## Routes

| Route             | Description                |
| ----------------- | -------------------------- |
| `/`               | Landing page (public)      |
| `/login`          | Login page                 |
| `/signup`         | Signup page                |
| `/dashboard`      | User dashboard (protected) |
| `/editor/new`     | Create new post            |
| `/editor/[id]`    | Edit existing post         |
| `/preview/[id]`   | Preview post               |
| `/analytics/[id]` | View post analytics        |
| `/quiz/new`       | Create new quiz            |
| `/quiz/[id]`      | View quiz                  |
| `/quiz/[id]/edit` | Edit quiz                  |

## Deployment

Deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy

## Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |

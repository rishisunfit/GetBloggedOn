# Supabase Setup Guide

## Step 1: Run the Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl/Cmd + Enter`

This will create:
- ✅ `posts` table (for blog posts)
- ✅ `form_submissions` table (for CTA form responses)
- ✅ `reactions` table (for emoji reactions)
- ✅ Row Level Security policies (open for now)
- ✅ Indexes for performance
- ✅ Auto-update timestamps

## Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Where to find these:**
1. Go to **Settings** → **API** in Supabase
2. Copy **Project URL** → paste as `VITE_SUPABASE_URL`
3. Copy **anon/public** key → paste as `VITE_SUPABASE_ANON_KEY`

## Step 3: Restart Dev Server

After creating the `.env` file:

```bash
# Stop the current dev server (Ctrl+C in terminal)
npm run dev
```

## What's Now Connected:

### ✅ Posts
- Create new posts → saved to database
- Edit posts → updates database
- Delete posts → removes from database
- All posts load from database on page load

### ✅ Form Submissions
- CTA form "Have a question? Text me"
- Submissions saved to `form_submissions` table
- You can view them in Supabase dashboard

### ✅ Real-time Persistence
- All changes survive page refresh
- Data stored in cloud
- Can access from any device

## Next Steps (Optional):

### View Form Submissions
Go to Supabase → Table Editor → `form_submissions` to see who messaged you!

### Tighten Security (Later)
The current policies allow anyone to read/write. For production, you'll want to:
- Add authentication
- Restrict writes to authenticated users only
- Keep reads public for blog posts

### Add Images to Storage (Phase 2.5)
We can add Supabase Storage for image uploads next!

---

**Everything should now be working with real data!** 🎉


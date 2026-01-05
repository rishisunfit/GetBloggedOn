# Setting Up rishfits.bloggish.io (Subdomain Blog)

> **For Developer**: This guide walks you through setting up wildcard subdomain routing so that `rishfits.bloggish.io` (and other user subdomains) work in production.

---

## Table of Contents

1. [Permissions You Need](#permissions-you-need)
2. [Prerequisites](#prerequisites)
3. [Step 1: Run the Database Migration](#step-1-run-the-database-migration)
4. [Step 2: Push Code to GitHub](#step-2-push-code-to-github)
5. [Step 3: Set Up Vercel Projects](#step-3-set-up-vercel-projects)
6. [Step 4: Configure Domains](#step-4-configure-domains)
7. [Step 5: Add Environment Variables](#step-5-add-environment-variables)
8. [Step 6: Deploy](#step-6-deploy)
9. [Step 7: Test](#step-7-test)
10. [How It Works](#how-it-works)
11. [Troubleshooting](#troubleshooting)

---

## Permissions You Need

Before starting, make sure you have the following access. **Ask the project owner to grant these if you don't have them.**

### Squarespace (Domain Registrar)

| Permission Needed | Why |
|-------------------|-----|
| **Domain Manager** | To add DNS records (CNAME, A, TXT) |

You will need to add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |
| CNAME | * | `cname.vercel-dns.com` |
| TXT | (provided by Vercel) | (verification code from Vercel) |

> ⚠️ **Note**: Vercel may ask you to add a TXT record for domain verification when setting up the wildcard domain. You'll need access to add this.

### Vercel

| Permission Needed | Why |
|-------------------|-----|
| **Member** or **Owner** on the Vercel team | To create projects, add domains, and set environment variables |

Specifically, you need to be able to:
- Create new Vercel projects
- Add domains to projects (including wildcard `*.bloggish.io`)
- Add environment variables
- Trigger deployments

### Supabase

| Permission Needed | Why |
|-------------------|-----|
| **Access to SQL Editor** | To run the database migration |

You'll need the Supabase dashboard URL: https://supabase.com/dashboard/project/hnsjzvuxotzbiosyzqok

### GitHub

| Permission Needed | Why |
|-------------------|-----|
| **Write access** to the repo | To push code changes |

---

## Permissions Checklist

Before proceeding, confirm you have:

- [ ] **Squarespace**: Domain Manager access to `bloggish.io`
- [ ] **Vercel**: Member/Owner access to the Vercel team
- [ ] **Supabase**: Access to the SQL Editor
- [ ] **GitHub**: Write access to the `GetBloggedOn` repo

---

## Prerequisites

- [ ] Domain `bloggish.io` registered (on Squarespace)
- [ ] Vercel account connected to the GitHub repo
- [ ] Supabase project with data

---

## Step 1: Run the Database Migration

You need to add a `subdomain` column to the `users` table so we can map usernames like `rishfits` to user accounts.

### 1.1 Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/hnsjzvuxotzbiosyzqok/sql/new

### 1.2 Run This SQL

```sql
-- Add subdomain column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subdomain text UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS users_subdomain_idx ON public.users (subdomain) 
WHERE subdomain IS NOT NULL;

-- Add constraint to ensure subdomain is lowercase and URL-safe
ALTER TABLE public.users 
ADD CONSTRAINT users_subdomain_format CHECK (
  subdomain IS NULL OR subdomain ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
);

-- Set the subdomain for testing
-- Replace the UUID with the actual user ID if different
UPDATE public.users 
SET subdomain = 'rishfits' 
WHERE id = 'dbe9bcb3-1aa7-47d6-97c2-8edce98491b2';
```

### 1.3 Verify It Worked

Run this query to confirm:

```sql
SELECT id, name, subdomain FROM public.users WHERE subdomain IS NOT NULL;
```

You should see the user with `subdomain = 'rishfits'`.

---

## Step 2: Push Code to GitHub

```bash
cd /path/to/Blogish
git add .
git commit -m "Add monorepo structure with blogs-platform for subdomains"
git push origin next-refactor
```

---

## Step 3: Set Up Vercel Projects

You need **TWO separate Vercel projects** from the same repo:

### 3.1 Project 1: Main Site (bloggish.io)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. If a project already exists for this repo, go to **Settings → General**
3. Set:
   - **Root Directory**: `apps/main-site`
   - **Framework Preset**: Next.js
   - **Build Command**: (leave blank or `npm run build`)
   - **Install Command**: (leave blank or `npm install`)

### 3.2 Project 2: Blogs Platform (*.bloggish.io)

1. Click **"Add New..." → Project**
2. Import the **same GitHub repo** (`GetBloggedOn`)
3. In the configuration screen:
   - **Root Directory**: `apps/blogs-platform`
   - **Framework Preset**: Next.js
4. Name it something like `bloggish-blogs` or `bloggish-platform`
5. Click **Deploy**

---

## Step 4: Configure Domains

### 4.1 Main Site Domains

In **Vercel → bloggish-main-site project → Settings → Domains**:

Add these domains:
- `bloggish.io`
- `www.bloggish.io`

### 4.2 Blogs Platform Wildcard Domain

In **Vercel → bloggish-blogs project → Settings → Domains**:

Add this wildcard domain:
- `*.bloggish.io`

> ⚠️ **Important**: When you add the wildcard domain, Vercel will ask you to verify ownership. You'll need to add a **TXT record** in Squarespace DNS.

### 4.3 DNS Configuration (Squarespace)

Log into Squarespace Domain Manager and add these DNS records:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | @ | `76.76.21.21` | Points apex domain to Vercel |
| CNAME | www | `cname.vercel-dns.com` | Points www to Vercel |
| CNAME | * | `cname.vercel-dns.com` | **Wildcard** - routes all subdomains to Vercel |
| TXT | _vercel | (from Vercel) | Domain verification (Vercel will provide this) |

### 4.4 Wait for DNS Propagation

DNS changes can take **up to 48 hours** to propagate, but usually complete within **15-30 minutes**.

You can check propagation at: https://dnschecker.org

---

## Step 5: Add Environment Variables

The project owner should provide you with the `.env` file contents or the individual values.

### 5.1 Main Site (`apps/main-site`)

In **Vercel → bloggish-main-site → Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hnsjzvuxotzbiosyzqok.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (ask project owner) |
| `GOOGLE_AI_API_KEY` | (ask project owner, if using AI features) |
| Any other env vars from `.env` | ... |

### 5.2 Blogs Platform (`apps/blogs-platform`)

In **Vercel → bloggish-blogs → Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hnsjzvuxotzbiosyzqok.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (ask project owner) |

---

## Step 6: Deploy

### 6.1 Trigger Fresh Deployments

For each project, go to **Deployments** and redeploy with cache cleared:

1. Click the most recent deployment
2. Click the **⋮** menu → **Redeploy**
3. ✅ Check **"Clear cache and redeploy"**
4. Click **Redeploy**

### 6.2 Wait for Both Deploys

Both projects should show "Ready" status.

---

## Step 7: Test

### 7.1 Test Main Site

Visit: **https://bloggish.io**

Expected: 
- If logged out → Landing page with waitlist
- If logged in → Dashboard with posts

### 7.2 Test Subdomain Blog

Visit: **https://rishfits.bloggish.io**

Expected:
- Blog listing page showing published posts
- Header with user's name
- List of published articles

### 7.3 Test Individual Post

Click on any post to view it at:
**https://rishfits.bloggish.io/post-slug** or **https://rishfits.bloggish.io/post-id**

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Request                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                         │
│  Checks domain and routes to appropriate project                │
└─────────────────────────────────────────────────────────────────┘
                                │
           ┌────────────────────┴────────────────────┐
           │                                         │
           ▼                                         ▼
┌─────────────────────┐                 ┌─────────────────────────┐
│    bloggish.io      │                 │   *.bloggish.io         │
│    www.bloggish.io  │                 │   (wildcard)            │
└─────────────────────┘                 └─────────────────────────┘
           │                                         │
           ▼                                         ▼
┌─────────────────────┐                 ┌─────────────────────────┐
│   apps/main-site    │                 │   apps/blogs-platform   │
│                     │                 │                         │
│ • Landing page      │                 │ • middleware.ts         │
│ • Login/Signup      │                 │   extracts subdomain    │
│ • Dashboard         │                 │   (rishfits)            │
│ • Editor            │                 │                         │
│ • Analytics         │                 │ • Rewrites to           │
└─────────────────────┘                 │   /blog/rishfits        │
                                        │                         │
                                        │ • Fetches user by       │
                                        │   subdomain from DB     │
                                        │                         │
                                        │ • Renders published     │
                                        │   posts for that user   │
                                        └─────────────────────────┘
```

### Middleware Logic (simplified)

```typescript
// apps/blogs-platform/middleware.ts

// Request: https://rishfits.bloggish.io/some-path
// Host header: "rishfits.bloggish.io"

const host = req.headers.get("host"); // "rishfits.bloggish.io"
const subdomain = host.replace(".bloggish.io", ""); // "rishfits"

// Rewrite internally to: /blog/rishfits/some-path
// The page at /blog/[username]/page.tsx handles the rest
```

---

## Troubleshooting

### "Blog not found" error

**Cause**: The subdomain isn't mapped to a user in the database.

**Fix**: 
```sql
-- Check if subdomain exists
SELECT * FROM public.users WHERE subdomain = 'rishfits';

-- If empty, set it:
UPDATE public.users SET subdomain = 'rishfits' WHERE id = 'your-user-id';
```

### "Missing Supabase environment variables"

**Cause**: Environment variables not set in Vercel.

**Fix**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the project's environment variables in Vercel.

### Wildcard domain not working

**Cause**: DNS not configured for wildcard, or verification TXT record missing.

**Fix**: 
1. Add a `*` CNAME record pointing to `cname.vercel-dns.com` in Squarespace
2. Add the verification TXT record that Vercel provides
3. Wait for DNS propagation (check at https://dnschecker.org)

### Vercel says "Domain verification failed"

**Cause**: TXT record not added or not propagated yet.

**Fix**:
1. In Vercel, click the domain to see the required TXT record
2. Add that TXT record in Squarespace DNS
3. Wait 15-30 minutes and click "Verify" again in Vercel

### Old cached deployment

**Cause**: Vercel is using a cached build.

**Fix**: Redeploy with "Clear cache" option enabled.

### Posts not showing

**Cause**: Posts may not be published.

**Fix**: 
```sql
-- Check post status
SELECT id, title, status, is_draft 
FROM posts 
WHERE user_id = 'your-user-id';

-- Posts must have: status = 'published' AND is_draft = false
```

---

## Adding More User Subdomains

When a new user signs up and wants their own subdomain:

```sql
UPDATE public.users 
SET subdomain = 'their-chosen-subdomain' 
WHERE id = 'their-user-id';
```

Then they can access their blog at: `their-chosen-subdomain.bloggish.io`

---

## Local Testing (Optional)

To test subdomains locally:

### 1. Edit /etc/hosts

```bash
sudo nano /etc/hosts
```

Add:
```
127.0.0.1 rishfits.bloggish.io
```

### 2. Run blogs-platform

```bash
cd apps/blogs-platform
npm run dev -- --port 3001
```

### 3. Visit

Open: http://rishfits.bloggish.io:3001

---

## Final Checklist

Before marking complete, verify:

- [ ] Database migration ran successfully (subdomain column exists)
- [ ] User's subdomain set to `rishfits`
- [ ] Code pushed to GitHub
- [ ] Two Vercel projects created with correct root directories:
  - `apps/main-site` for bloggish.io
  - `apps/blogs-platform` for *.bloggish.io
- [ ] Domains configured:
  - `bloggish.io` and `www.bloggish.io` on main-site project
  - `*.bloggish.io` on blogs-platform project
- [ ] DNS records added in Squarespace:
  - A record: @ → 76.76.21.21
  - CNAME: www → cname.vercel-dns.com
  - CNAME: * → cname.vercel-dns.com
  - TXT: verification record from Vercel
- [ ] Environment variables added to both Vercel projects
- [ ] Both projects deployed with cache cleared
- [ ] https://bloggish.io loads the landing/dashboard
- [ ] https://rishfits.bloggish.io loads the blog

🎉 **Done!** The blog is now live at `rishfits.bloggish.io`

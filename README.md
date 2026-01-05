# Blogish Monorepo

A multi-tenant blog platform supporting:
- **bloggish.io** + **www.bloggish.io** → Main marketing site
- **\*.bloggish.io** (e.g., rishfits.bloggish.io, john.bloggish.io) → User blog sites

## Repository Structure

```
/
├── apps/
│   ├── main-site/        # Marketing website (bloggish.io, www.bloggish.io)
│   └── blogs-platform/   # Tenant blogs (*.bloggish.io subdomains)
├── package.json          # Root package.json with workspace scripts
└── README.md
```

## Apps Overview

### `apps/main-site`
The main marketing and dashboard application. This is where users sign up, manage their blogs, and access the editor.

- **Domain**: `bloggish.io`, `www.bloggish.io`
- **Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase

### `apps/blogs-platform`
Handles all tenant blog subdomains. When a user visits `username.bloggish.io`, the middleware rewrites the request to `/blog/username`.

- **Domain**: `*.bloggish.io` (wildcard subdomain)
- **Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS

## Development

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm

### Install Dependencies

From the repo root:
```bash
# Install all apps
npm run install:all

# Or install individually
cd apps/main-site && npm install
cd apps/blogs-platform && npm install
```

### Run Development Servers

From the repo root:
```bash
# Run main site (default: http://localhost:3000)
npm run dev:main

# Run blogs platform (default: http://localhost:3000)
npm run dev:blogs
```

Or run directly in each app folder:
```bash
cd apps/main-site && npm run dev
cd apps/blogs-platform && npm run dev
```

### Local Subdomain Testing (blogs-platform)

To test subdomain routing locally:

1. **Add hosts entry** (requires admin/root):
   ```bash
   # On macOS/Linux, edit /etc/hosts:
   sudo nano /etc/hosts
   
   # Add this line:
   127.0.0.1 rishfits.bloggish.io
   ```

2. **Run the blogs-platform dev server** (use port 3001 if main-site is running):
   ```bash
   cd apps/blogs-platform
   npm run dev -- --port 3001
   ```

3. **Visit the subdomain**:
   ```
   http://rishfits.bloggish.io:3001
   ```

4. **Expected result**: You should see "Blog tenant: rishfits"

## Deployment (Vercel)

This monorepo is designed for two separate Vercel projects:

### Main Site
- **Project**: `blogish-main-site`
- **Root Directory**: `apps/main-site`
- **Domains**: `bloggish.io`, `www.bloggish.io`

### Blogs Platform
- **Project**: `blogish-blogs-platform`
- **Root Directory**: `apps/blogs-platform`
- **Domains**: `*.bloggish.io` (wildcard subdomain)

### Vercel Configuration

1. Create two Vercel projects
2. For each project, set the **Root Directory** to the respective app folder
3. Configure domains:
   - Main site: Add `bloggish.io` and `www.bloggish.io`
   - Blogs platform: Add `*.bloggish.io` as a wildcard domain

## Architecture Notes

### Subdomain Routing

The `apps/blogs-platform/middleware.ts` handles subdomain detection:
- Requests to `username.bloggish.io` are rewritten to `/blog/username`
- Reserved subdomains (`www`, `bloggish`) are not rewritten
- The `/blog/[username]` route renders the tenant's blog

### Shared Code (Future)

If you need to share code between apps, consider:
1. Creating a `/packages` folder for shared utilities
2. Using npm workspaces to link packages
3. Publishing shared packages to a private registry

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev:main` | Start main-site dev server |
| `npm run dev:blogs` | Start blogs-platform dev server |
| `npm run build:main` | Build main-site for production |
| `npm run build:blogs` | Build blogs-platform for production |
| `npm run install:all` | Install dependencies for all apps |

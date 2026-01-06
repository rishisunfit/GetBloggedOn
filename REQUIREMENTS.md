# Blogish - Blog Builder Requirements & Roadmap

## Project Vision
Create an intuitive blog builder with clean aesthetics inspired by https://www.shaanpuri.com/essays/finding-your-thing

## Phase 1: MVP (Current Focus)

### Writer Interface ✅ DECIDED

#### Editor Style
- [ ] **3-Style Toggle System**:
  1. WYSIWYG (Rich text, visual editing)
  2. Markdown (Write in markdown syntax)
  3. Hybrid (Split view? Needs clarification)
- [ ] Smooth transition between editor modes
- [ ] Preserve content when switching modes

#### Formatting Options
- [ ] **Toggle between Basic & Advanced modes**
  - **Basic**: Headers (H1, H2, H3), bold, italic, lists
  - **Advanced**: blockquotes, code blocks, horizontal rules, and more
- [ ] Format toolbar/menu
- [ ] Keyboard shortcuts for common formats

#### Post Management ✅ DECIDED
- [ ] **Multi-post system**:
  - Dashboard view with list of all posts
  - Create new post
  - Edit existing posts
  - Delete posts (with confirmation)
  - Search/filter posts
- [ ] Post metadata tracking

### Content Features

#### Images
- [ ] Drag and drop image upload
- [ ] Click to upload option
- [ ] **Decisions Needed**:
  - Inline with text vs separate gallery?
  - Size restrictions and cropping UI?
  - Multiple images per post?
  - Image captions/alt text?

#### Links
- [ ] Inline text links (highlight text, add URL)
- [ ] **Decisions Needed**:
  - Link cards/embeds?
  - Preview cards for external links?

#### Content Structure & Metadata
- [ ] **Decisions Needed**:
  - Title (required?)
  - Date (auto-generated or manual?)
  - Author name
  - Categories/tags system?
  - URL slug generation
  - Draft vs Published status

### Preview & Viewer Side

#### Preview Toggle ✅ DECIDED
- [ ] Preview button in writer interface
- [ ] **Decisions Needed**:
  - Full screen toggle (switch entire view)?
  - Side-by-side split view?
  - Pop-up/modal preview?

#### Styling & Layout
- [ ] Clean, minimalist aesthetic
- [ ] **Decisions Needed**:
  - Typography: Serif vs sans-serif for body?
  - Color scheme: B&W or brand colors?
  - Layout width and spacing preferences
  - Mobile responsive considerations

#### Rating System
- [ ] Emoji reaction bar at bottom of post
- [ ] **Decisions Needed**:
  - How many emoji types? (example has 4)
  - Which emojis to use?
  - Click functionality (increment for now or just UI?)
  - Show reaction counts
  - Prevent multiple votes per user?

### CTA Section: "Have a question? Text me"

#### Form Fields
- [ ] Phone number input
- [ ] Subject line
- [ ] Quick message textarea
- [ ] **Decisions Needed**:
  - Also collect name/email?
  - Required vs optional fields
  - Field validation rules

#### UX/Placement
- [ ] **Decisions Needed**:
  - Placement: End of article, fixed sidebar, or floating button?
  - Visual design/styling
  - For MVP: Just UI mockup or functional validation?
  - Success/confirmation message

## Technical Stack

### Current Setup
- React + TypeScript + Vite ✅
- **Backend**: Supabase (Phase 2)

### Frontend Decisions Needed
- [ ] **Styling Approach**:
  - Tailwind CSS (rapid development)
  - Plain CSS/CSS Modules
  - Styled Components
  - Other?
- [ ] **Component Library**:
  - shadcn/ui (popular, customizable)
  - Material UI
  - Build from scratch
  - Headless UI + custom styling
- [ ] **Rich Text Editor Library**:
  - TipTap (modern, extensible)
  - Slate.js
  - Draft.js
  - Lexical (Facebook)
  - Build from scratch
- [ ] **Markdown Library**:
  - react-markdown
  - remark/rehype
  - marked
- [ ] **State Management**:
  - React Context
  - Zustand
  - Redux Toolkit
  - Jotai

## Phase 2: Backend Integration (Future)

### Supabase Setup
- [ ] Database schema design
- [ ] Authentication system
- [ ] Image storage (Supabase Storage)
- [ ] Real-time subscriptions (if needed)
- [ ] Row Level Security policies

### Features
- [ ] User accounts & authentication
- [ ] Save/publish posts to database
- [ ] Image upload to cloud storage
- [ ] Handle form submissions (CTA)
- [ ] Analytics/tracking (view counts, popular posts)
- [ ] SEO metadata

## Phase 3: Enhanced Features (Future Consideration)

### Writer Experience
- [ ] Auto-save drafts
- [ ] Version history
- [ ] Collaboration features
- [ ] AI writing assistance
- [ ] Templates/themes
- [ ] Scheduled publishing

### Reader Experience
- [ ] Comments section
- [ ] Social sharing
- [ ] Related posts
- [ ] Email newsletter signup
- [ ] RSS feed
- [ ] Dark mode

### Analytics
- [ ] Post performance metrics
- [ ] Reader engagement tracking
- [ ] A/B testing capabilities

## Priority Questions to Answer Next

1. **Editor Toggle**: What exactly are the 3 styles? (WYSIWYG, Markdown, and...?)
2. **Styling Framework**: Tailwind CSS vs other options?
3. **Rich Text Library**: Which editor library to use?
4. **Preview Mode**: Full screen toggle or split view?
5. **Emoji Reactions**: Which 4 emojis for the rating system?

## Top 3 MVP Priorities (User Defined)
1. Multi-post system (create/edit/list)
2. 3-style editor toggle
3. Basic + Advanced formatting toggle

---

*Last Updated: Dec 16, 2025*









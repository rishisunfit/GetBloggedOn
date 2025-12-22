# UI Editor Roadmap

A list of planned changes and enhancements for the `/ui` editor prototype.

---

## ✅ Implemented Features

### 1. Floating Formatting Toolbar (Google Docs Style)
- [x] Added a mini-header/toolbar that appears when text is selected (BubbleMenu)
- [x] Includes formatting options:
  - Bold, Italic, Underline
  - Text alignment (Left, Center, Right)
  - Heading levels (H1, H2, H3)
  - Link insertion
- [x] Toolbar floats near the selection
- [x] Keyboard shortcuts work (Cmd+B, Cmd+I, etc. via TipTap)

### 2. Editable Content Areas
- [x] Replaced static placeholder text with full TipTap editor
- [x] Maintains editorial styling when user types their own content
- [x] All content is now editable with rich formatting

### 3. TipTap Editor Integration
- [x] Full TipTap editor with all extensions
- [x] Reuses existing StyleExtension and FontSizeExtension
- [x] Complete formatting toolbar at the top

### 4. Functional Sidebar Controls
- [x] **Colors Section:**
  - Native color picker for each color input
  - Live preview when colors change
  - Colors apply to document via CSS variables
- [x] **Typography Section:**
  - Font family dropdown with 8 font options (PT Serif, Georgia, Inter, etc.)
  - Font weight selector (Light to Bold)
  - Separate heading and body typography in Advanced mode

### 5. Block Menu Functionality
- [x] Floating "Add Block" button on the left side
- [x] Working block types:
  - Title → Insert H1
  - Text → Insert paragraph
  - Image → URL prompt + insert
  - Byline → Insert author attribution block
  - Date → Insert current date
  - Code → Insert code block
  - Quote → Insert blockquote
  - Divider → Insert horizontal rule

### 6. Preview & Export
- [x] **Desktop/Mobile toggle:** Shows responsive preview (800px vs 375px)
- [x] **Preview button:** Toggle between edit and read-only preview mode
- [x] **Save dropdown:**
  - Save as template (to Supabase)
  - Export as HTML (full document download)

### 7. Undo/Redo
- [x] Undo/Redo buttons in toolbar
- [x] Keyboard shortcuts via TipTap (Cmd+Z, Cmd+Shift+Z)

### 8. Template System
- [x] Template service for Supabase integration
- [x] Save current design as a reusable template
- [x] Schema added to `supabase-schema.sql`

### 9. Style Presets
- [x] Quick preset buttons in Advanced mode:
  - Editorial (serif fonts)
  - Modern (dark theme)
  - Minimal (clean, Inter font)
  - Warm (amber tones, decorative fonts)

---

## 🎨 CSS Enhancements Added

- Editorial-specific typography styles
- CSS variable support for theming
- Google Fonts import for all font families
- Mobile responsive styles
- Blockquote styling with large italic text

---

## 🔧 Files Modified/Created

| File | Change |
|------|--------|
| `app/ui/page.tsx` | Complete UI editor with TipTap |
| `services/templates.ts` | NEW - Template CRUD operations |
| `app/globals.css` | Editorial styles + Google Fonts |
| `supabase-schema.sql` | Templates table schema |

---

## 🚀 To Use

1. Run the templates migration in Supabase SQL Editor
2. Start dev server: `npm run dev`
3. Navigate to `http://localhost:3000/ui`

---

## 📝 Notes

- The editor reuses your existing TipTap extensions from `components/editor/`
- Color pickers use native HTML5 `<input type="color">` for simplicity
- Templates are user-scoped via Row Level Security
- Export creates a standalone HTML file with inline styles

---

*Last updated: December 21, 2024*

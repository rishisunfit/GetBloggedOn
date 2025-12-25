# Heatmaps for Posts

This document explains the heatmap tracking system implemented for posts.

## Overview

The heatmap system tracks 5 types of user interactions:

1. **Scroll Depth Heatmap** - Tracks how far users scroll down the page
2. **Click Heatmap** - Tracks where users click (including dead clicks)
3. **Attention by Section Heatmap** - Tracks which content sections get viewed
4. **CTA Interaction Heatmap** - Tracks CTA impressions vs clicks
5. **Rage Click Indicators** - Detects multiple rapid clicks in the same spot

## How It Works

### Automatic Tracking

The `HeatmapTracker` component is automatically included in all post viewer pages (`app/posts/[id]/page.tsx`). It tracks:

- **Scroll events** - Throttled to every 250ms, sends max scroll depth per session
- **Click events** - Captures x/y coordinates, element info, and detects dead clicks
- **Section visibility** - Uses IntersectionObserver to track when sections are visible (>500ms)
- **CTA interactions** - Tracks when CTAs enter viewport and when they're clicked
- **Rage clicks** - Detects 3+ clicks in same area within 500ms

### Data Attributes

To enable better tracking, you can add these attributes to your HTML:

#### For Sections (Attention Tracking)

```html
<div data-heatmap-section="introduction">
  <!-- Your content -->
</div>

<h2 data-heatmap-section="main-content">Main Content</h2>
```

If no `data-heatmap-section` is provided, the tracker will automatically use headings (h1-h6) as sections.

#### For CTAs (CTA Tracking)

```html
<div data-cta-id="newsletter-signup">
  <button>Subscribe to Newsletter</button>
</div>

<a href="/pricing" data-cta-id="pricing-cta">View Pricing</a>
```

The CTAForm component already includes `data-cta-id="cta-form-{postId}"`.

#### For Custom Click Tracking

```html
<div data-heatmap-id="special-widget">
  <!-- Your clickable element -->
</div>
```

This helps identify elements even if CSS classes change.

## Database Schema

All heatmap data is stored in Supabase with the following tables:

- `post_heatmap_scroll` - Scroll depth data
- `post_heatmap_clicks` - Click data
- `post_heatmap_attention` - Section attention data
- `post_heatmap_cta` - CTA interaction data
- `post_heatmap_rage_clicks` - Rage click data

All tables have RLS (Row Level Security) enabled:
- **Public can INSERT** - Anonymous users can submit tracking data
- **Post authors can SELECT** - Only post owners can view their heatmap data

## Viewing Heatmaps

### Using the Visualization Component

```tsx
import { HeatmapVisualization } from "@/components/viewer/HeatmapVisualization";

<HeatmapVisualization postId={postId} type="scroll" />
<HeatmapVisualization postId={postId} type="clicks" />
<HeatmapVisualization postId={postId} type="attention" />
<HeatmapVisualization postId={postId} type="cta" />
<HeatmapVisualization postId={postId} type="rage-clicks" />
```

### Using the Service API

```tsx
import { heatmapsApi } from "@/services/heatmaps";

// Get scroll data
const scrollData = await heatmapsApi.getScrollData(postId);

// Get click data
const clickData = await heatmapsApi.getClickData(postId);

// Get attention data
const attentionData = await heatmapsApi.getAttentionData(postId);

// Get CTA data
const ctaData = await heatmapsApi.getCTAData(postId);

// Get rage click data
const rageClickData = await heatmapsApi.getRageClickData(postId);
```

## API Endpoints

All endpoints are public (no authentication required) and use session IDs:

- `POST /api/heatmap/scroll` - Submit scroll depth data
- `POST /api/heatmap/clicks` - Submit click data (batch)
- `POST /api/heatmap/attention` - Submit section attention data
- `POST /api/heatmap/cta` - Submit CTA interaction data
- `POST /api/heatmap/rage-click` - Submit rage click data

## Performance Considerations

- **Throttling**: Scroll events are throttled to 250ms
- **Debouncing**: Click data is batched and sent every 1 second
- **Limits**: Click data queries are limited to 1000 records for performance
- **Efficient tracking**: Uses IntersectionObserver for efficient visibility tracking

## Privacy

- All tracking is anonymous (uses session IDs, not user IDs)
- No personal information is collected
- Data is aggregated for analysis
- RLS policies ensure only post authors can view their own data

## Example Usage in Dashboard

To add heatmap analytics to your dashboard:

```tsx
import { HeatmapVisualization } from "@/components/viewer/HeatmapVisualization";

function PostAnalytics({ postId }: { postId: string }) {
  const [activeType, setActiveType] = useState<"scroll" | "clicks" | "attention" | "cta" | "rage-clicks">("scroll");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveType("scroll")}>Scroll</button>
        <button onClick={() => setActiveType("clicks")}>Clicks</button>
        <button onClick={() => setActiveType("attention")}>Attention</button>
        <button onClick={() => setActiveType("cta")}>CTAs</button>
        <button onClick={() => setActiveType("rage-clicks")}>Rage Clicks</button>
      </div>
      <HeatmapVisualization postId={postId} type={activeType} />
    </div>
  );
}
```

## Best Practices

1. **Add section IDs** - Use `data-heatmap-section` for important content sections
2. **Mark CTAs** - Always add `data-cta-id` to call-to-action elements
3. **Use stable IDs** - Don't use auto-generated or random IDs for tracking attributes
4. **Monitor dead clicks** - Check the click heatmap for dead clicks to identify UX issues
5. **Review scroll depth** - Use scroll depth data to optimize content length and CTA placement

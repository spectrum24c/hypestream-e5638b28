

## HypeStream — Improvement Ideas

Here's a curated list of upgrades grouped by impact area. These are based on what already exists in your codebase (TMDB integration, Supabase auth, watchlist, watch history, HYPE chatbot, newsletter, APK download, multi-profile support).

---

### 1. Engagement & Retention (high impact)

- **Personalized "For You" row** — Build a recommendations row on the home page that uses the user's `watch_history` + `favorites` to call TMDB's `/recommendations` endpoint per watched title and merge results. Most-watched genre weighting.
- **"Because you watched X" sections** — Netflix-style dynamic rows tied to recent watch history items.
- **Trailer-on-hover previews** — On desktop MovieCard hover (after 1s delay), autoplay a muted YouTube trailer in the card. Big perceived-quality boost.
- **Daily "Trending Now" push notification** — Use existing `notifications` system + a scheduled edge function to drop one fresh recommendation per day.

### 2. Social & Community

- **Public profiles + sharable watchlists** — Let users share `/u/:username` with their watchlist & favorites publicly.
- **Reviews & ratings feed** — You already have `RatingReviews.tsx` — surface a global "Recent Reviews" page so reviews are discoverable, not just per-movie.
- **Friends / follow system** — Follow other users, see what they're watching (opt-in).
- **Watch parties** — Synced playback rooms via Supabase Realtime (channel per room, broadcast play/pause/seek events).

### 3. Discovery improvements

- **"Random pick" / "Surprise me" button** — One-click random movie from filtered preferences. Solves the "what to watch" paralysis.
- **Mood-based browsing** — Curated rows like "Feel-good", "Mind-bending", "Date night", "Under 90 minutes" using TMDB filters + runtime.
- **Streaming availability badges** — Use TMDB's `/watch/providers` endpoint to show where each title is officially streaming (Netflix, Prime, etc.) per region.
- **Coming soon / Calendar page** — Upcoming releases with reminder buttons that hook into your notifications system.

### 4. Player & viewing experience

- **Skip intro / outro markers** — Manual or community-sourced timestamps stored in Supabase per episode.
- **Subtitles upload + sync** — Allow users to attach `.srt` files; render via the player.
- **Playback speed + quality memory** — Persist per-user preferences across sessions.
- **"Next episode" autoplay** — For TV shows, auto-queue the next episode with a 10s countdown overlay.

### 5. Monetization (optional)

- **Premium tier via Stripe** — Ad-free, early access to new releases row, unlimited profiles, 4K toggle. You already have `payments--enable_stripe_payments` available.
- **Referral program** — Invite friends, both get a free month.

### 6. Quality, performance & SEO

- **Replace document.title hack with `react-helmet-async`** — Your `PageSEO` component manually patches the head; helmet is more robust for crawlers and handles SSR-friendly rendering if you ever migrate.
- **Image optimization** — Serve TMDB images with `loading="lazy"` (verify it's set everywhere) and `srcSet` for responsive sizing. Consider a Cloudflare/Imgix proxy for further wins.
- **Skeleton loaders everywhere** — Some sections currently show empty space during fetch; consistent skeletons feel faster.
- **Service worker caching strategy review** — Cache TMDB responses with stale-while-revalidate for instant repeat loads.
- **Lighthouse pass** — Run an audit and fix CLS/LCP issues, especially around the Hero section image swap.

### 7. Accessibility & polish

- **Keyboard navigation for sliders** — Arrow-key support on `ContentSlider`.
- **ARIA labels audit** — Many icon-only buttons (e.g., notifications, search toggle) need proper labels for screen readers.
- **Reduced-motion support** — Respect `prefers-reduced-motion` for the Framer Motion welcome screen and slider transitions.
- **Light theme polish** — Verify the Themes page actually has a usable light theme; many movie sites only ship dark.

### 8. Admin & operations

- **Admin analytics dashboard** — On `AdminSettings`, add metrics: total users, signups/week, most-watched titles, newsletter conversion. Pull from Supabase.
- **Content moderation queue** — Approve/hide user reviews from the admin panel.
- **Newsletter composer UI** — Right now newsletters seem code-driven; an admin form to compose & send ad-hoc campaigns would be valuable.

### 9. Mobile / PWA

- **Install prompt banner** — Custom "Add to Home Screen" prompt for PWA users on mobile web.
- **Offline favorites view** — Cache favorites list and posters via service worker so users can browse offline.
- **Native share sheet** — On mobile, the `SocialShare` component should call `navigator.share` for a native UX.

---

### My top 5 recommendations (best ROI for a streaming site)

1. **Trailer-on-hover previews** — single biggest "wow" factor.
2. **Personalized "For You" row** — drives session length.
3. **Watch parties (Supabase Realtime)** — unique, sharable, viral.
4. **Streaming availability badges** — instantly more useful than competitors.
5. **Stripe premium tier** — unlocks revenue without much new infra.

---

**Next step:** pick any item(s) above and I'll plan the implementation in detail before building.


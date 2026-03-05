

## Plan: Update Primary Stream Embed to vidnest.fun

**What changes:**

Update the primary play button's iframe source in `src/components/MoviePlayer.tsx` (line 401) from `vsrc.su` to `vidnest.fun` with the correct URL format:

- **Movies**: `https://vidnest.fun/movie/{TMDB_ID}`
- **TV Shows**: `https://vidnest.fun/tv/{TMDB_ID}/{SEASON}/{EPISODE}`

The alternative source (`vidsrc.vip`) remains unchanged.

**File: `src/components/MoviePlayer.tsx`**

- Line 401: Change the primary iframe `src` from:
  - `https://vsrc.su/embed/tv/${movie.id}/1/1?autonext=1` → `https://vidnest.fun/tv/${movie.id}/{season}/{episode}`
  - `https://vsrc.su/embed/movie/${movie.id}` → `https://vidnest.fun/movie/${movie.id}`
- The TV show URL will use `activeEpisode` or default to season 1, episode 1 (same logic as the alt source).

**Also update `src/utils/movieDownloader.ts`** (`getAlternativeStreamUrl` function, lines 4-30) to use `vidnest.fun` format since that function currently uses `vsrc.su`.

No other files affected. The alt source on `vidsrc.vip` stays as-is.


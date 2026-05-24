# Notification System Plan

## Goals
1. Real device notifications (browser + native Android/iOS via Capacitor)
2. Stop spam — replace timer-based blasts with watch-pattern-aware logic
3. Per-user control over what & how often

---

## 1. Database changes (Supabase migration)

**New tables**
- `push_subscriptions` — stores Web Push endpoints and FCM/APNs tokens
  - `user_id`, `platform` ('web'|'android'|'ios'), `endpoint`, `p256dh`, `auth`, `device_token`, `user_agent`, `created_at`, `last_used_at`
  - RLS: user can CRUD their own rows
- `notification_preferences` — user-chosen cadence
  - `user_id` (unique), `new_releases_enabled`, `new_releases_per_day` (0-5), `recommendations_enabled`, `recommendations_per_week` (0-7), `quiet_hours_start`, `quiet_hours_end`, `preferred_genres` (int[]), `min_match_score` (1-5)
  - RLS: user CRUD own
- `notifications_log` — every notification sent (dedupe + history)
  - `user_id`, `kind` ('new_release'|'recommendation'|'system'), `movie_id`, `title`, `body`, `poster_path`, `sent_at`, `clicked_at`, `delivered_via` ('web'|'native'|'in_app')
  - Unique index on `(user_id, kind, movie_id)` → prevents duplicate sends
  - RLS: user reads own; service role inserts

## 2. Secrets needed
- `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` — Web Push (I'll generate these and ask you to paste)
- `VAPID_SUBJECT` — `mailto:awokojorichmond@gmail.com`
- `FCM_SERVER_KEY` — Firebase Cloud Messaging (for Android via Capacitor) — added when user is ready
- (iOS APNs handled later via Firebase too)

## 3. Edge functions
- **`subscribe-push`** — client posts subscription/token, stores in `push_subscriptions`
- **`send-push`** — internal helper: takes user_id + payload, fans out to all that user's web + native subscriptions
- **`smart-notify`** — the brain. Cron-triggered hourly. For each user:
  1. Load `notification_preferences` + `watch_history` + `favorites`
  2. Check quiet hours, daily/weekly caps via `notifications_log`
  3. **New release branch** — query TMDB "now playing"/"airing today", filter by release_date == today + genre match with watch history, skip already-logged movie_ids
  4. **Recommendation branch** — only on user's chosen day; extract top 3 genres from last 20 watch_history, query TMDB recommendations off their top-watched title, filter out anything in watch_history/favorites, rank by genre overlap, pick top 1
  5. Insert into `notifications_log` → call `send-push`
- **`vapid-public-key`** — returns public key to frontend (no secret leak)

## 4. Service worker (`public/service-worker.js`)
Extend existing worker with `push` + `notificationclick` handlers. Guard registration so it only runs on production host (not Lovable preview iframe — per project PWA rules).

## 5. Capacitor native push
- Add `@capacitor/push-notifications`
- On native launch: request permission → register → send FCM token to `subscribe-push` with `platform: 'android'`
- Handle `pushNotificationReceived` → in-app toast; tap → deep link to movie

## 6. UI
- **`NotificationPreferences.tsx`** — new section in `UserSettings`:
  - Toggle: Enable browser notifications (triggers permission + subscribe)
  - Toggle: New releases on/off + slider (0-5/day)
  - Toggle: Recommendations on/off + slider (0-7/week) + preferred day
  - Quiet hours pickers
  - Min match-score slider
  - List of registered devices with revoke buttons
- Welcome screen: keep existing first-time prompt, but route the "yes" through new subscribe flow
- **`NotificationsList`** (existing): pull from `notifications_log` instead of local state

## 7. Cron
Hourly cron via `pg_cron` + `pg_net` → invokes `smart-notify` (uses anon key, function validates internally).

## 8. Dedupe + anti-spam rules baked into `smart-notify`
- Skip if `(user_id, kind, movie_id)` already in log
- Skip if today's `new_release` count ≥ user's daily cap
- Skip if this week's `recommendation` count ≥ user's weekly cap
- Skip if `now()` inside user's quiet hours (timezone-aware via stored offset)
- Skip if user has no `push_subscriptions` AND `in_app_only` is false

---

## Rollout order (so you can test as we go)
1. Migration: 3 new tables + RLS
2. Generate VAPID keys → I'll request them as secrets
3. Edge functions + service worker push handlers
4. NotificationPreferences UI in UserSettings
5. Capacitor native registration (only fires on the built APK)
6. Cron job
7. Test by manually invoking `smart-notify` for your user

## Technical notes
- `pg_cron` + `pg_net` already used in this project pattern — will enable if not on
- Service worker registration must check `!window.self !== window.top && !hostname.includes('lovableproject.com')` to avoid the preview-iframe stale-cache trap
- Web Push payload max 4KB → only send `{title, body, icon, movie_id}`, fetch full data on click
- FCM/native lib is added but actual push won't reach the APK until you rebuild & ship a new version (Capacitor sync required on your machine)
- Lovable preview will NOT show real push notifications — only the published site can. In-app toast fallback will still work everywhere.

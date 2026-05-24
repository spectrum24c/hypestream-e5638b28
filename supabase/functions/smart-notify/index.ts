// Cron-triggered (hourly). Sends at-most-N personalised notifications per user
// based on watch_history + notification_preferences. Strict dedupe via
// notifications_log unique index.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const TMDB_KEY = "62c59007d93c96aa3cca9f3422d51af5";
const TMDB = "https://api.themoviedb.org/3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Prefs {
  user_id: string;
  new_releases_enabled: boolean;
  new_releases_per_day: number;
  recommendations_enabled: boolean;
  recommendations_per_week: number;
  preferred_day_of_week: number;
  quiet_hours_start: number;
  quiet_hours_end: number;
  preferred_genres: number[];
  min_match_score: number;
  timezone: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Optional: target a single user via body for manual testing
    let targetUserId: string | null = null;
    if (req.method === "POST") {
      try { targetUserId = (await req.json())?.user_id ?? null; } catch { /* no body */ }
    }

    let prefsQuery = supabase
      .from("notification_preferences")
      .select("*")
      .or("new_releases_enabled.eq.true,recommendations_enabled.eq.true");
    if (targetUserId) prefsQuery = prefsQuery.eq("user_id", targetUserId);

    const { data: allPrefs, error: prefsErr } = await prefsQuery;
    if (prefsErr) throw prefsErr;

    // Fetch new-release pool ONCE per run
    const today = new Date().toISOString().slice(0, 10);
    const releasesPool = await fetchTodayReleases(today);

    const stats = { users: 0, notifications: 0, skipped: 0 };

    for (const prefs of (allPrefs as Prefs[]) ?? []) {
      stats.users++;
      try {
        const sent = await processUser(supabase, prefs, releasesPool);
        stats.notifications += sent;
      } catch (e) {
        console.error("user fail", prefs.user_id, e);
        stats.skipped++;
      }
    }

    return json({ ok: true, ...stats });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

async function processUser(
  supabase: any,
  prefs: Prefs,
  releasesPool: any[],
): Promise<number> {
  // Quiet hours check (server clock; client picks timezone later)
  const hour = new Date().getUTCHours();
  const inQuiet = isInQuietHours(hour, prefs.quiet_hours_start, prefs.quiet_hours_end);
  if (inQuiet) return 0;

  // Today's counts
  const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0);
  const startOfWeek = new Date(); startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 7);

  const { data: todaysReleases } = await supabase
    .from("notifications_log")
    .select("movie_id")
    .eq("user_id", prefs.user_id)
    .eq("kind", "new_release")
    .gte("sent_at", startOfDay.toISOString());

  const { data: weekRecs } = await supabase
    .from("notifications_log")
    .select("movie_id")
    .eq("user_id", prefs.user_id)
    .eq("kind", "recommendation")
    .gte("sent_at", startOfWeek.toISOString());

  let sent = 0;

  // Build user genre profile from watch_history
  const { data: history } = await supabase
    .from("watch_history")
    .select("movie_id, media_type, title")
    .eq("user_id", prefs.user_id)
    .order("last_watched_at", { ascending: false })
    .limit(20);

  const userTopMovieIds = (history ?? []).slice(0, 5).map((h: any) => h.movie_id);
  const userGenres = new Set<number>(prefs.preferred_genres ?? []);
  // Enrich genres from watched titles
  for (const id of userTopMovieIds.slice(0, 3)) {
    try {
      const r = await fetch(`${TMDB}/movie/${id}?api_key=${TMDB_KEY}`);
      if (r.ok) {
        const d = await r.json();
        (d.genres ?? []).forEach((g: any) => userGenres.add(g.id));
      }
    } catch { /* ignore */ }
  }

  // === NEW RELEASES ===
  if (prefs.new_releases_enabled && (todaysReleases?.length ?? 0) < prefs.new_releases_per_day) {
    const slots = prefs.new_releases_per_day - (todaysReleases?.length ?? 0);
    const candidates = scoreAndFilter(releasesPool, userGenres)
      .filter((m) => (m.score ?? 0) >= prefs.min_match_score);

    for (const m of candidates.slice(0, slots)) {
      const ok = await logAndSend(supabase, prefs.user_id, {
        kind: "new_release",
        movie_id: String(m.id),
        title: `🎬 New today: ${m.title || m.name}`,
        body: m.overview?.slice(0, 140) || "Just released — tap to watch on HypeStream",
        poster_path: m.poster_path,
        payload: { movie_id: m.id, media_type: m.media_type || "movie" },
      });
      if (ok) sent++;
    }
  }

  // === RECOMMENDATIONS (only on user's chosen day) ===
  const todayDow = new Date().getUTCDay();
  if (
    prefs.recommendations_enabled &&
    todayDow === prefs.preferred_day_of_week &&
    (weekRecs?.length ?? 0) < prefs.recommendations_per_week &&
    userTopMovieIds.length > 0
  ) {
    const slots = prefs.recommendations_per_week - (weekRecs?.length ?? 0);
    const seedId = userTopMovieIds[0];
    const seedMediaType = (history?.[0] as any)?.media_type || "movie";

    let recs: any[] = [];
    try {
      const r = await fetch(
        `${TMDB}/${seedMediaType}/${seedId}/recommendations?api_key=${TMDB_KEY}`
      );
      if (r.ok) recs = (await r.json()).results || [];
    } catch { /* ignore */ }

    // Exclude already watched / favorited
    const { data: favs } = await supabase
      .from("favorites").select("movie_id").eq("user_id", prefs.user_id);
    const seen = new Set([
      ...((history ?? []).map((h: any) => String(h.movie_id))),
      ...((favs ?? []).map((f: any) => String(f.movie_id))),
    ]);

    const scored = scoreAndFilter(recs, userGenres)
      .filter((m) => !seen.has(String(m.id)))
      .filter((m) => (m.score ?? 0) >= prefs.min_match_score);

    for (const m of scored.slice(0, slots)) {
      const ok = await logAndSend(supabase, prefs.user_id, {
        kind: "recommendation",
        movie_id: String(m.id),
        title: `✨ Picked for you: ${m.title || m.name}`,
        body: m.overview?.slice(0, 140) || "Because you watched something similar",
        poster_path: m.poster_path,
        payload: { movie_id: m.id, media_type: seedMediaType },
      });
      if (ok) sent++;
    }
  }

  return sent;
}

async function fetchTodayReleases(today: string): Promise<any[]> {
  const out: any[] = [];
  try {
    const r1 = await fetch(
      `${TMDB}/discover/movie?api_key=${TMDB_KEY}&primary_release_date.gte=${today}&primary_release_date.lte=${today}&sort_by=popularity.desc`
    );
    if (r1.ok) out.push(...((await r1.json()).results || []).map((x: any) => ({ ...x, media_type: "movie" })));
  } catch { /* ignore */ }
  try {
    const r2 = await fetch(
      `${TMDB}/discover/tv?api_key=${TMDB_KEY}&first_air_date.gte=${today}&first_air_date.lte=${today}&sort_by=popularity.desc`
    );
    if (r2.ok) out.push(...((await r2.json()).results || []).map((x: any) => ({ ...x, media_type: "tv" })));
  } catch { /* ignore */ }
  return out;
}

function scoreAndFilter(items: any[], userGenres: Set<number>): any[] {
  return items
    .map((m) => {
      const overlap = (m.genre_ids || []).filter((g: number) => userGenres.has(g)).length;
      // Score 1-5: 0 overlap=1, 1=2, 2=3, 3=4, 4+=5
      const score = Math.min(5, 1 + overlap);
      return { ...m, score };
    })
    .sort((a, b) => (b.score - a.score) || (b.popularity - a.popularity));
}

function isInQuietHours(hour: number, start: number, end: number): boolean {
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end; // wraps midnight
}

async function logAndSend(
  supabase: any,
  user_id: string,
  notif: { kind: string; movie_id: string; title: string; body: string; poster_path?: string | null; payload: any }
): Promise<boolean> {
  // Insert; unique index will reject dupes
  const { error: insertErr, data } = await supabase
    .from("notifications_log")
    .insert({
      user_id,
      kind: notif.kind,
      movie_id: notif.movie_id,
      title: notif.title,
      body: notif.body,
      poster_path: notif.poster_path,
      payload: notif.payload,
    })
    .select("id")
    .single();

  if (insertErr) {
    // Duplicate or other — skip silently
    return false;
  }

  // Fire push (best-effort)
  try {
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        user_id,
        payload: {
          title: notif.title,
          body: notif.body,
          poster_path: notif.poster_path,
          log_id: data.id,
          ...notif.payload,
        },
      }),
    });
  } catch (e) {
    console.error("send-push fail", e);
  }
  return true;
}

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

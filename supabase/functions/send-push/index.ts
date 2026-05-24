// Internal helper: sends a notification to all of a user's registered devices.
// Authenticated by the SUPABASE_SERVICE_ROLE_KEY — only callable from other edge
// functions (smart-notify) or by passing the service-role key as the bearer.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VAPID_PUBLIC_KEY = "BK_YHfgNO1zFVyQ-IfaMSBmPeP-Y4AMA1IOES10VGGWVEtm9v0hrygRUi7RrVIbo5gPuoQSLCxqdr5XyPp4d3VI";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") || "";
    if (!auth.includes(serviceKey)) return json({ error: "Forbidden" }, 403);

    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:awokojorichmond@gmail.com";
    if (!vapidPrivate) return json({ error: "VAPID_PRIVATE_KEY not set" }, 500);
    webpush.setVapidDetails(vapidSubject, VAPID_PUBLIC_KEY, vapidPrivate);

    const { user_id, payload } = await req.json();
    if (!user_id || !payload) return json({ error: "Missing user_id or payload" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);
    if (error) return json({ error: error.message }, 500);

    const results: Array<{ id: string; ok: boolean; err?: string }> = [];
    const fcmKey = Deno.env.get("FCM_SERVER_KEY");

    for (const sub of subs ?? []) {
      try {
        if (sub.platform === "web" && sub.endpoint) {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload)
          );
          results.push({ id: sub.id, ok: true });
        } else if ((sub.platform === "android" || sub.platform === "ios") && sub.device_token) {
          if (!fcmKey) {
            results.push({ id: sub.id, ok: false, err: "FCM_SERVER_KEY not set" });
            continue;
          }
          const r = await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${fcmKey}`,
            },
            body: JSON.stringify({
              to: sub.device_token,
              notification: {
                title: payload.title,
                body: payload.body,
                image: payload.poster_path
                  ? `https://image.tmdb.org/t/p/w500${payload.poster_path}`
                  : undefined,
              },
              data: payload,
            }),
          });
          results.push({ id: sub.id, ok: r.ok });
        }
      } catch (err: any) {
        // 404/410 = subscription is gone, remove it
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
        results.push({ id: sub.id, ok: false, err: err?.message || String(err) });
      }
    }

    return json({ sent: results.length, results });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

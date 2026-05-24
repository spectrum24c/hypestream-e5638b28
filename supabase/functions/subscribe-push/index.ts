import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, DELETE",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { platform, endpoint, p256dh, auth, device_token, user_agent } = body || {};

    if (!platform || !["web", "android", "ios"].includes(platform)) {
      return json({ error: "Invalid platform" }, 400);
    }
    if (platform === "web" && (!endpoint || !p256dh || !auth)) {
      return json({ error: "Missing web push fields" }, 400);
    }
    if (platform !== "web" && !device_token) {
      return json({ error: "Missing device_token" }, 400);
    }

    if (req.method === "DELETE") {
      const q = supabase.from("push_subscriptions").delete().eq("user_id", user.id);
      if (endpoint) await q.eq("endpoint", endpoint);
      else if (device_token) await q.eq("device_token", device_token);
      return json({ ok: true });
    }

    const row = {
      user_id: user.id,
      platform,
      endpoint: endpoint ?? null,
      p256dh: p256dh ?? null,
      auth: auth ?? null,
      device_token: device_token ?? null,
      user_agent: user_agent ?? null,
      last_used_at: new Date().toISOString(),
    };

    const conflictCol = platform === "web" ? "user_id,endpoint" : "user_id,device_token";
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(row, { onConflict: conflictCol });

    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
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

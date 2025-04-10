
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscriberData {
  email: string;
  adminEmail: string;
  userId?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Create the table if it doesn't exist
    const { error: tableError } = await supabaseClient.rpc(
      "create_newsletter_subscribers_if_not_exists"
    );

    if (tableError) {
      console.error("Error ensuring table exists:", tableError);
    }

    // Get the request body
    const { email, adminEmail, userId }: SubscriberData = await req.json();

    // Save to the database
    const { error: insertError } = await supabaseClient
      .from("newsletter_subscribers")
      .insert({
        email: email,
        admin_email: adminEmail,
        user_id: userId || null,
        subscribed_at: new Date().toISOString(),
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Subscription successful" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

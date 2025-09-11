
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
    // Use the service role key to bypass RLS for writing to the database.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the request body
    const { email, adminEmail, userId }: SubscriberData = await req.json();

    console.log("Received subscription request for:", email, "to admin:", adminEmail);

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("email")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error("Error checking existing subscriber:", JSON.stringify(checkError, null, 2));
      throw checkError;
    }

    if (existingSubscriber) {
      console.log("Email already subscribed:", email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "ALREADY_SUBSCRIBED",
          message: "This email has already subscribed to the newsletter" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Insert directly into the newsletter_subscribers table
    const { error: insertError } = await supabaseClient
      .from("newsletter_subscribers")
      .insert({
        email: email,
        admin_email: "awokojorichmond@gmail.com",
        user_id: userId || null,
        subscribed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error inserting subscriber:", JSON.stringify(insertError, null, 2));
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
    console.error("Error in save-newsletter-subscriber:", JSON.stringify(error, null, 2));
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

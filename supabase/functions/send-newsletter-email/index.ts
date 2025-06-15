
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  email: string;
  adminEmail: string;
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

    const { email, adminEmail }: NewsletterRequest = await req.json();

    console.log("Processing newsletter subscription for:", email);

    // Store the subscription in the database
    const { error: insertError } = await supabaseClient
      .from("newsletter_subscribers")
      .insert({
        email: email,
        admin_email: adminEmail,
        subscribed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error storing subscription:", insertError);
      throw insertError;
    }

    console.log("Subscription stored successfully");

    // Send email using EmailJS API (free alternative to Resend)
    const emailJSData = {
      service_id: 'default_service',
      template_id: 'newsletter_subscription',
      user_id: Deno.env.get('EMAILJS_USER_ID'),
      template_params: {
        to_email: adminEmail,
        subscriber_email: email,
        message: `New newsletter subscription from: ${email}`,
        reply_to: 'noreply@hypestream.com'
      }
    };

    // Send notification to admin
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailJSData)
    });

    if (!emailResponse.ok) {
      console.error("Failed to send email notification");
      // Don't throw error here, subscription was already saved
    } else {
      console.log("Email notification sent successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Newsletter subscription successful!" 
      }),
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


// Supabase Edge Function to send newsletter subscription email via Resend

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  subscriberEmail: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { subscriberEmail }: SubscribeRequest = await req.json();

    // Send notification email to admin
    await resend.emails.send({
      from: "HypeStream <onboarding@resend.dev>",
      to: ["awokojorichmond@gmail.com"],
      subject: "New Newsletter Subscription",
      html: `
        <h3>New Subscription</h3>
        <p><strong>Email:</strong> ${subscriberEmail}</p>
      `,
    });

    // Send confirmation email to subscriber
    await resend.emails.send({
      from: "HypeStream <onboarding@resend.dev>",
      to: [subscriberEmail],
      subject: "Welcome to HypeStream Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C3AED;">Welcome to HypeStream!</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive updates about:</p>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
              <span style="position: absolute; left: 0; color: #7C3AED;">✓</span>
              New movie and TV show releases
            </li>
            <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
              <span style="position: absolute; left: 0; color: #7C3AED;">✓</span>
              Exclusive content and behind-the-scenes
            </li>
            <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
              <span style="position: absolute; left: 0; color: #7C3AED;">✓</span>
              Special promotions and events
            </li>
          </ul>
          <p>Stay tuned for our latest updates!</p>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Subscription successful and confirmation sent." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

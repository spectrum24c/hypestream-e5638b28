
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

    const emailResponse = await resend.emails.send({
      from: "HypeStream <onboarding@resend.dev>",
      to: ["awokojorichmond@gmail.com"],
      subject: "New Newsletter Subscription",
      html: `
        <h3>New Subscription</h3>
        <p><strong>Email:</strong> ${subscriberEmail}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

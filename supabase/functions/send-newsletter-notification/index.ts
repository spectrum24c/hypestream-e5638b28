import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterNotificationRequest {
  subscriberEmail: string;
  adminEmail: string;
  userId?: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscriberEmail, adminEmail, userId }: NewsletterNotificationRequest = await req.json();

    let preferenceSummary = "movies and TV shows";

    if (userId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: watchHistory } = await supabaseClient
          .from("watch_history")
          .select("media_type")
          .eq("user_id", userId)
          .limit(100);

        const { data: favorites } = await supabaseClient
          .from("favorites")
          .select("is_tv_show")
          .eq("user_id", userId)
          .limit(100);

        let movieCount = 0;
        let tvCount = 0;

        if (watchHistory && Array.isArray(watchHistory)) {
          for (const item of watchHistory as { media_type?: string }[]) {
            if (item.media_type === "tv") {
              tvCount += 1;
            } else if (item.media_type === "movie") {
              movieCount += 1;
            }
          }
        }

        if (favorites && Array.isArray(favorites)) {
          for (const item of favorites as { is_tv_show?: boolean }[]) {
            if (item.is_tv_show) {
              tvCount += 1;
            } else {
              movieCount += 1;
            }
          }
        }

        if (movieCount > 0 || tvCount > 0) {
          if (movieCount > tvCount) {
            preferenceSummary = "movies you love";
          } else if (tvCount > movieCount) {
            preferenceSummary = "TV shows you love";
          } else {
            preferenceSummary = "movies and TV shows you enjoy";
          }
        }
      } catch (prefError) {
        console.error("Error computing newsletter preferences:", prefError);
      }
    }

    console.log(`Sending newsletter notification for subscriber: ${subscriberEmail} to admin: ${adminEmail}`);

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "HypeStream <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "New Newsletter Subscriber",
      html: `
        <h1>New Newsletter Subscriber!</h1>
        <p>A new user has subscribed to your newsletter:</p>
        <p><strong>Email:</strong> ${subscriberEmail}</p>
        <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
        <br>
        <p>Best regards,<br>HypeStream Team</p>
      `,
    });

    // Send confirmation to subscriber
    const subscriberEmailResponse = await resend.emails.send({
      from: "HypeStream <onboarding@resend.dev>",
      to: [subscriberEmail],
      subject: "Welcome to HypeStream Newsletter!",
      html: `
        <h1>Welcome to HypeStream!</h1>
        <p>Thank you for subscribing to our newsletter, we're excited to have you!</p>
        <p>You'll receive updates tailored to the ${preferenceSummary}.</p>
        <p>If you ever want to unsubscribe, you can do so by replying to any of our newsletter emails.</p>
        <br>
        <p>Best regards,<br>The HypeStream Team</p>
      `,
    });

    console.log("Admin email sent successfully:", adminEmailResponse);
    console.log("Subscriber email sent successfully:", subscriberEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      adminEmailId: adminEmailResponse.data?.id,
      subscriberEmailId: subscriberEmailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in send-newsletter-notification function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

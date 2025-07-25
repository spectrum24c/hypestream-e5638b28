
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  adminEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, adminEmail }: EmailRequest = await req.json();
    
    // Send notification email to your SMTP server email
    const adminEmailResponse = await resend.emails.send({
      from: "HypeStream Newsletter <onboarding@resend.dev>",
      to: ["hypestream127@gmail.com"],
      subject: "New Newsletter Subscription",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C3AED;">New Newsletter Subscription</h2>
          <p>A new user has subscribed to the HypeStream newsletter:</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>You can now send updates to this user through your SMTP server.</p>
        </div>
      `,
    });

    // Send confirmation email to subscriber
    const userEmailResponse = await resend.emails.send({
      from: "HypeStream <onboarding@resend.dev>",
      to: [email],
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

    console.log("Admin email sent:", adminEmailResponse);
    console.log("User confirmation email sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Newsletter subscription confirmation sent successfully" 
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

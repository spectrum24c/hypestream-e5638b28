import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Professional email template component
const AuthEmailTemplate = ({ 
  confirmLink, 
  token, 
  type 
}: { 
  confirmLink: string; 
  token: string; 
  type: string; 
}) => {
  const isSignUp = type === 'signup';
  const title = isSignUp ? 'Confirm Your Email' : 'Reset Your Password';
  const heading = isSignUp ? 'Welcome to HypeStream!' : 'Password Reset Request';
  const description = isSignUp 
    ? 'Thank you for joining HypeStream. Please confirm your email address to complete your registration.'
    : 'We received a request to reset your password. Click the link below to set a new password.';

  return React.createElement('div', { style: { fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' } },
    React.createElement('div', { style: { backgroundColor: '#6366f1', padding: '20px', textAlign: 'center' } },
      React.createElement('h1', { style: { color: '#ffffff', margin: '0', fontSize: '24px' } }, 'HypeStream')
    ),
    React.createElement('div', { style: { padding: '40px 20px', backgroundColor: '#ffffff' } },
      React.createElement('h2', { style: { color: '#1f2937', marginBottom: '20px', fontSize: '20px' } }, heading),
      React.createElement('p', { style: { color: '#4b5563', lineHeight: '1.6', marginBottom: '30px' } }, description),
      React.createElement('div', { style: { textAlign: 'center', marginBottom: '30px' } },
        React.createElement('a', { 
          href: confirmLink,
          style: { 
            backgroundColor: '#6366f1', 
            color: '#ffffff', 
            padding: '12px 24px', 
            textDecoration: 'none', 
            borderRadius: '6px',
            display: 'inline-block',
            fontWeight: 'bold'
          }
        }, title)
      ),
      React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '20px' } }, 
        'Or copy and paste this link in your browser:'
      ),
      React.createElement('p', { style: { 
        backgroundColor: '#f3f4f6', 
        padding: '10px', 
        borderRadius: '4px', 
        wordBreak: 'break-all',
        fontSize: '12px',
        color: '#374151'
      }}, confirmLink),
      React.createElement('p', { style: { color: '#9ca3af', fontSize: '12px', marginTop: '30px' } }, 
        'If you didn\'t request this, you can safely ignore this email.'
      )
    ),
    React.createElement('div', { style: { backgroundColor: '#f9fafb', padding: '20px', textAlign: 'center' } },
      React.createElement('p', { style: { color: '#6b7280', fontSize: '12px', margin: '0' } }, 
        '© 2024 HypeStream. All rights reserved.'
      )
    )
  );
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      user, 
      email_data: { token, token_hash, redirect_to, email_action_type, site_url } 
    } = await req.json();

    // Create confirmation link
    const confirmLink = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    // Render the HTML email
    const html = await renderAsync(
      React.createElement(AuthEmailTemplate, {
        confirmLink,
        token,
        type: email_action_type
      })
    );

    // Send email with proper headers to avoid spam
    const { error } = await resend.emails.send({
      from: 'HypeStream <noreply@yourdomain.com>', // Replace with your verified domain
      to: [user.email],
      subject: email_action_type === 'signup' ? 'Confirm your HypeStream account' : 'Reset your HypeStream password',
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'List-Unsubscribe': '<mailto:unsubscribe@yourdomain.com>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      tags: [
        { name: 'category', value: 'authentication' },
        { name: 'type', value: email_action_type }
      ]
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log(`Authentication email sent successfully to ${user.email}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
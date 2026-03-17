// lib/email.js – send invite (and other) emails via Resend when configured

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@meetech.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send developer invite email. No-op if RESEND_API_KEY is not set.
 * @param {{ to: string, name: string, inviteToken: string, invitedBy: string }}
 */
export async function sendInviteEmail({ to, name, inviteToken, invitedBy }) {
     if (!RESEND_API_KEY) {
          console.warn('RESEND_API_KEY not set; skipping invite email to', to);
          return;
     }

     const registerLink = `${APP_URL}/register?invite=${inviteToken}`;

     const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
               from: FROM_EMAIL,
               to: [to],
               subject: `You're invited to Meetech`,
               html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #0f172a;">You're invited to Meetech</h2>
  <p>Hi ${name || 'there'},</p>
  <p><strong>${invitedBy}</strong> has invited you to join Meetech as a developer.</p>
  <p><a href="${registerLink}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Accept invitation &amp; create account</a></p>
  <p style="color: #64748b; font-size: 14px;">This link expires in 7 days. If you didn't expect this email, you can ignore it.</p>
  <p style="color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} Meetech</p>
</body>
</html>
               `
          })
     });

     if (!res.ok) {
          const err = await res.text();
          throw new Error(`Resend API error: ${res.status} ${err}`);
     }
}

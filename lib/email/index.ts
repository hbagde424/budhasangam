// lib/email/index.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.EMAIL_FROM_NAME ?? "BuddhaSangam"} <${process.env.EMAIL_FROM ?? "noreply@buddhasangam.com"}>`;

// ─── Welcome Email ────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Namo Buddhaya! Welcome to BuddhaSangam 🙏",
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FAF6EF;padding:40px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#3D1C0E;font-size:32px;margin-bottom:8px;">☸ BuddhaSangam</h1>
          <p style="color:#9A7B6F;font-size:14px;letter-spacing:2px;">BUDDHIST MATRIMONY</p>
        </div>
        <div style="background:white;border-radius:20px;padding:32px;border:1px solid #F0E8D8;">
          <h2 style="color:#3D1C0E;font-size:24px;">Namo Buddhaya, ${name}! 🙏</h2>
          <p style="color:#5C3D2E;line-height:1.8;margin:16px 0;">Welcome to BuddhaSangam — a sacred space dedicated to Buddhist hearts finding their Dhamma companion.</p>
          <p style="color:#5C3D2E;line-height:1.8;">To get started:</p>
          <ol style="color:#5C3D2E;line-height:2;">
            <li>Complete your biodata profile</li>
            <li>Upload a clear profile photo</li>
            <li>Set your partner preferences</li>
            <li>Start browsing daily matches</li>
          </ol>
          <div style="text-align:center;margin:28px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background:#E8821A;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;">
              Complete My Profile →
            </a>
          </div>
          <p style="color:#9A7B6F;font-size:13px;text-align:center;border-top:1px solid #F0E8D8;padding-top:20px;margin-top:20px;">
            With Metta,<br/>The BuddhaSangam Team<br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#E8821A;">buddhasangam.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

// ─── OTP Email ────────────────────────────────────────────────
export async function sendOtpEmail(to: string, otp: string, type: "verify" | "reset") {
  const subject =
    type === "verify"
      ? "Verify your BuddhaSangam email"
      : "Reset your BuddhaSangam password";

  return resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;background:#FAF6EF;padding:40px;">
        <h2 style="color:#3D1C0E;text-align:center;">☸ BuddhaSangam</h2>
        <div style="background:white;border-radius:16px;padding:32px;text-align:center;border:1px solid #F0E8D8;">
          <p style="color:#5C3D2E;margin-bottom:24px;">Your one-time code:</p>
          <div style="background:#FAF6EF;border:2px dashed #E8821A;border-radius:12px;padding:20px;margin:16px 0;">
            <span style="font-size:36px;font-weight:bold;color:#E8821A;letter-spacing:8px;">${otp}</span>
          </div>
          <p style="color:#9A7B6F;font-size:13px;margin-top:16px;">This code expires in 10 minutes.</p>
          <p style="color:#9A7B6F;font-size:12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
}

// ─── Interest Received Email ──────────────────────────────────
export async function sendInterestEmail(
  to: string,
  receiverName: string,
  senderName: string,
  senderCity: string,
  message?: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${senderName} has sent you an interest on BuddhaSangam 💛`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FAF6EF;padding:40px;">
        <h2 style="color:#3D1C0E;text-align:center;">☸ BuddhaSangam</h2>
        <div style="background:white;border-radius:20px;padding:32px;border:1px solid #F0E8D8;">
          <h3 style="color:#3D1C0E;">Dear ${receiverName},</h3>
          <p style="color:#5C3D2E;line-height:1.8;"><strong>${senderName}</strong> from ${senderCity} has sent you an interest!</p>
          ${message ? `<blockquote style="border-left:3px solid #E8821A;padding:12px 16px;background:#FAF6EF;border-radius:0 10px 10px 0;color:#5C3D2E;font-style:italic;">"${message}"</blockquote>` : ""}
          <div style="text-align:center;margin:28px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/interests" style="background:#E8821A;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;">
              View Interest →
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

// ─── Connection Accepted Email ────────────────────────────────
export async function sendConnectionAcceptedEmail(
  to: string,
  senderName: string,
  acceptorName: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `🎉 ${acceptorName} accepted your interest on BuddhaSangam!`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FAF6EF;padding:40px;">
        <h2 style="color:#3D1C0E;text-align:center;">☸ BuddhaSangam</h2>
        <div style="background:white;border-radius:20px;padding:32px;border:1px solid #F0E8D8;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🎉</div>
          <h3 style="color:#3D1C0E;">Great news, ${senderName}!</h3>
          <p style="color:#5C3D2E;line-height:1.8;"><strong>${acceptorName}</strong> has accepted your interest. You can now chat and share contact details.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat" style="background:#2D6A4F;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:20px;">
            Start Chatting →
          </a>
        </div>
      </div>
    `,
  });
}

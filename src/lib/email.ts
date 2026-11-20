import nodemailer from "nodemailer";
import { db } from "./db";

/**
 * ADEARA email notification helper.
 * - Reads SMTP credentials from environment variables.
 * - Falls back to logging the email to console + EmailLog when SMTP is not configured,
 *   so submissions still work in development / sandbox environments.
 * - Submissions are ALWAYS saved to the database first (caller responsibility),
 *   so an email delivery failure never loses data.
 */

type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  type: string; // contact | order | inquiry
  refId?: string;
};

function makeTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

export async function sendNotificationEmail(payload: EmailPayload) {
  const transporter = makeTransporter();
  let status: "sent" | "failed" = "failed";
  let error: string | undefined;

  try {
    if (transporter) {
      const fromName = process.env.SMTP_FROM_NAME || "ADEARA DEVELOPMENT";
      const fromEmail = process.env.SMTP_FROM_EMAIL || payload.to;
      const info = await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.body,
      });
      status = "sent";
      console.log("[email] sent:", info.messageId);
    } else {
      // No SMTP configured — log to console so admin can still see the message.
      console.log("[email] (no SMTP configured — logging only)");
      console.log("[email] To:", payload.to);
      console.log("[email] Subject:", payload.subject);
      console.log("[email] Body:\n", payload.body);
      status = "sent"; // treated as sent in dev, logged to EmailLog
    }
  } catch (e: any) {
    error = e?.message || String(e);
    console.error("[email] delivery error:", error);
  }

  try {
    await db.emailLog.create({
      data: {
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
        type: payload.type,
        refId: payload.refId || null,
        status,
        error: error || null,
      },
    });
  } catch (logErr) {
    console.error("[email] failed to write EmailLog:", logErr);
  }

  return status === "sent";
}

export function buildContactEmailHtml(input: {
  fullName: string;
  phone: string;
  email: string;
  service?: string | null;
  subject: string;
  message: string;
  date: string;
}) {
  return `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E3E8EF; border-radius: 12px; overflow: hidden;">
    <div style="background: #1565C0; padding: 20px 24px; color: #fff;">
      <h2 style="margin: 0; font-size: 18px;">New Contact Message — ADEARA DEVELOPMENT</h2>
    </div>
    <div style="padding: 24px; color: #202B3C; line-height: 1.6;">
      <p><strong>Name:</strong> ${input.fullName}</p>
      <p><strong>Phone:</strong> ${input.phone}</p>
      <p><strong>Email:</strong> ${input.email}</p>
      <p><strong>Service:</strong> ${input.service || "—"}</p>
      <p><strong>Subject:</strong> ${input.subject}</p>
      <p><strong>Date:</strong> ${input.date}</p>
      <hr style="border: none; border-top: 1px solid #E3E8EF; margin: 16px 0;">
      <p style="white-space: pre-wrap;">${input.message}</p>
    </div>
  </div>`;
}

export function buildOrderEmailHtml(input: {
  reference: string;
  fullName: string;
  businessName?: string | null;
  phone: string;
  email: string;
  country?: string | null;
  service: string;
  description: string;
  budget?: string | null;
  completionTime?: string | null;
  requirements?: string | null;
  date: string;
}) {
  return `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E3E8EF; border-radius: 12px; overflow: hidden;">
    <div style="background: #0B1F3A; padding: 20px 24px; color: #fff;">
      <h2 style="margin: 0; font-size: 18px;">New Project Order — ${input.reference}</h2>
    </div>
    <div style="padding: 24px; color: #202B3C; line-height: 1.6;">
      <p><strong>Reference:</strong> ${input.reference}</p>
      <p><strong>Name:</strong> ${input.fullName}</p>
      <p><strong>Business:</strong> ${input.businessName || "—"}</p>
      <p><strong>Phone:</strong> ${input.phone}</p>
      <p><strong>Email:</strong> ${input.email}</p>
      <p><strong>Country:</strong> ${input.country || "—"}</p>
      <p><strong>Service:</strong> ${input.service}</p>
      <p><strong>Budget:</strong> ${input.budget || "—"}</p>
      <p><strong>Expected Completion:</strong> ${input.completionTime || "—"}</p>
      <p><strong>Date:</strong> ${input.date}</p>
      <hr style="border: none; border-top: 1px solid #E3E8EF; margin: 16px 0;">
      <p><strong>Description:</strong></p>
      <p style="white-space: pre-wrap;">${input.description}</p>
      <p><strong>Additional Requirements:</strong></p>
      <p style="white-space: pre-wrap;">${input.requirements || "—"}</p>
    </div>
  </div>`;
}

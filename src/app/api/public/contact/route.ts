import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/site-config";
import { sendNotificationEmail, buildContactEmailHtml } from "@/lib/email";
import { rateLimit, rateLimitResponse, validateEmail, sanitize, checkHoneypot } from "@/lib/security";

export async function POST(req: NextRequest) {
  // Rate limit
  const rl = rateLimit(req, "contact");
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot
  if (!checkHoneypot(body)) {
    return NextResponse.json({ ok: true, message: "Message received" });
  }

  const fullName = sanitize(String(body.fullName || "").trim(), 100);
  const phone = sanitize(String(body.phone || "").trim(), 50);
  const email = sanitize(String(body.email || "").trim().toLowerCase(), 120);
  const service = sanitize(String(body.service || "").trim(), 100);
  const subject = sanitize(String(body.subject || "").trim(), 200);
  const message = sanitize(String(body.message || "").trim(), 5000);

  if (!fullName || !phone || !email || !subject || !message) {
    return NextResponse.json({ ok: false, error: "Please fill all required fields." }, { status: 400 });
  }
  if (!validateEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ ok: false, error: "Please provide a longer message." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  let saved;
  try {
    saved = await db.contactMessage.create({
      data: { fullName, phone, email, service: service || null, subject, message, ip },
    });
  } catch (e: any) {
    console.error("[contact] db save failed:", e);
    return NextResponse.json({ ok: false, error: "Failed to save message. Please try again." }, { status: 500 });
  }

  // Email notification (best-effort)
  const notifyEmail = await getSetting("notification_email", "ananiya743@gmail.com");
  try {
    await sendNotificationEmail({
      to: notifyEmail,
      subject: `New Contact Message — ${subject}`,
      body: buildContactEmailHtml({
        fullName, phone, email, service, subject, message,
        date: new Date().toLocaleString(),
      }),
      type: "contact",
      refId: saved.id,
    });
  } catch (e: any) {
    console.error("[contact] email failed:", e);
  }

  return NextResponse.json({
    ok: true,
    message: "Thank you for reaching out! We received your message and will get back to you shortly.",
  });
}

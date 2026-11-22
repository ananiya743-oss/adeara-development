import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/site-config";
import { sendNotificationEmail, buildOrderEmailHtml } from "@/lib/email";
import { rateLimit, rateLimitResponse, validateEmail, sanitize, checkHoneypot } from "@/lib/security";

function generateReference(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ADR-${y}${m}${day}-${rand}`;
}

export async function POST(req: NextRequest) {
  // Rate limit
  const rl = rateLimit(req, "order");
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot
  if (!checkHoneypot(body)) {
    return NextResponse.json({ ok: true, message: "Order received" });
  }

  const fullName = sanitize(String(body.fullName || "").trim(), 100);
  const businessName = sanitize(String(body.businessName || "").trim(), 150) || null;
  const phone = sanitize(String(body.phone || "").trim(), 50);
  const email = sanitize(String(body.email || "").trim().toLowerCase(), 120);
  const country = sanitize(String(body.country || "").trim(), 80) || null;
  const service = sanitize(String(body.service || "").trim(), 100);
  const description = sanitize(String(body.description || "").trim(), 5000);
  const budget = sanitize(String(body.budget || "").trim(), 80) || null;
  const completionTime = sanitize(String(body.completionTime || "").trim(), 120) || null;
  const requirements = sanitize(String(body.requirements || "").trim(), 5000) || null;

  if (!fullName || !phone || !email || !service || !description) {
    return NextResponse.json({ ok: false, error: "Please fill all required fields." }, { status: 400 });
  }
  if (!validateEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (description.length < 10) {
    return NextResponse.json({ ok: false, error: "Please provide a longer project description." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const reference = generateReference();

  let saved;
  try {
    saved = await db.projectOrder.create({
      data: {
        reference,
        fullName,
        businessName,
        phone,
        email,
        country,
        service,
        description,
        budget,
        completionTime,
        requirements,
        ip,
      },
    });
  } catch (e: any) {
    console.error("[order] db save failed:", e);
    return NextResponse.json({ ok: false, error: "Failed to submit order. Please try again." }, { status: 500 });
  }

  // Email notification (best-effort)
  const notifyEmail = await getSetting("notification_email", "ananiya743@gmail.com");
  try {
    await sendNotificationEmail({
      to: notifyEmail,
      subject: `New Project Order — ${reference}`,
      body: buildOrderEmailHtml({
        reference, fullName, businessName, phone, email, country, service,
        description, budget, completionTime, requirements,
        date: new Date().toLocaleString(),
      }),
      type: "order",
      refId: saved.id,
    });
  } catch (e: any) {
    console.error("[order] email failed:", e);
  }

  return NextResponse.json({
    ok: true,
    message: "Your project request has been received. Our team will review it and get back to you soon.",
    reference,
  });
}

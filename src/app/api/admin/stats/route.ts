import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const [
    totalMessages,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalProjects,
    totalTestimonials,
    totalClients,
    recentMessages,
    recentOrders,
    messagesByDay,
    ordersByDay,
    ordersByService,
    messagesByStatus,
  ] = await Promise.all([
    db.contactMessage.count(),
    db.projectOrder.count(),
    db.projectOrder.count({ where: { status: "pending" } }),
    db.projectOrder.count({ where: { status: "completed" } }),
    db.project.count(),
    db.testimonial.count(),
    db.client.count(),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.projectOrder.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.contactMessage.groupBy({ by: ["createdAt"], _count: { _all: true } }).catch(() => []),
    db.projectOrder.groupBy({ by: ["createdAt"], _count: { _all: true } }).catch(() => []),
    db.projectOrder.groupBy({ by: ["service"], _count: { _all: true } }),
    db.contactMessage.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  // Build simple last-7-day buckets for charts
  const days = buildLast7Days();
  const messagesSeries = days.map((d) => ({ date: d.label, count: 0 }));
  const ordersSeries = days.map((d) => ({ date: d.label, count: 0 }));
  for (const m of recentMessages) {
    const idx = days.findIndex((d) => sameDay(d.date, m.createdAt));
    if (idx >= 0) messagesSeries[idx].count++;
  }
  for (const o of recentOrders) {
    const idx = days.findIndex((d) => sameDay(d.date, o.createdAt));
    if (idx >= 0) ordersSeries[idx].count++;
  }

  return NextResponse.json({
    ok: true,
    stats: {
      totalMessages,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProjects,
      totalTestimonials,
      totalClients,
      recentMessages,
      recentOrders,
      messagesSeries,
      ordersSeries,
      ordersByService: ordersByService.map((s) => ({ name: s.service, value: s._count._all })),
      messagesByStatus: messagesByStatus.map((s) => ({ name: s.status, value: s._count._all })),
    },
  });
}

function buildLast7Days() {
  const out: { date: Date; label: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    out.push({ date: d, label: d.toLocaleDateString("en-US", { weekday: "short" }) });
  }
  return out;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

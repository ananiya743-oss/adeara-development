"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ShoppingBag, FolderKanban, Star, Clock, CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const PIE_COLORS = ["#1565C0", "#42A5F5", "#90CAF9", "#0B1F3A", "#5C9CE6", "#1A3556"];

export default function AdminDashboard() {
  return (
    <AdminShell title="Dashboard" description="Overview of website activity and content">
      <DashboardContent />
    </AdminShell>
  );
}

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-foreground/60 text-sm">Loading statistics...</div>;
  if (!data) return <div className="text-foreground/60 text-sm">Failed to load statistics.</div>;

  const cards = [
    { label: "Total Inquiries", value: data.totalMessages, icon: Mail, color: "text-brand", bg: "bg-brand-light" },
    { label: "Total Orders", value: data.totalOrders, icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pending Orders", value: data.pendingOrders, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completed Orders", value: data.completedOrders, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Portfolio Projects", value: data.totalProjects, icon: FolderKanban, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Testimonials", value: data.totalTestimonials, icon: Star, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-dark">{c.value}</div>
                  <div className="text-xs text-foreground/60">{c.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" /> Messages & Orders (last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mergeSeries(data.messagesSeries, data.ordersSeries)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                <XAxis dataKey="date" stroke="#5A6A85" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#5A6A85" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Messages" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Orders" stroke="#42A5F5" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-base">Orders by Service</CardTitle>
          </CardHeader>
          <CardContent>
            {data.ordersByService.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.ordersByService}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="name" stroke="#5A6A85" fontSize={10} />
                  <YAxis allowDecimals={false} stroke="#5A6A85" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1565C0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-sm text-foreground/50">No orders yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-base">Messages by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.messagesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.messagesByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {data.messagesByStatus.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-sm text-foreground/50">No messages yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Recent Orders</div>
            {data.recentOrders.length > 0 ? (
              <div className="space-y-2">
                {data.recentOrders.slice(0, 4).map((o: any) => (
                  <Link key={o.id} href="/admin/orders" className="flex items-center justify-between gap-3 rounded-md border border-border p-2 hover:bg-brand-light text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{o.fullName}</div>
                      <div className="text-xs text-foreground/60 truncate">{o.service} · {o.reference}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-brand shrink-0" />
                  </Link>
                ))}
              </div>
            ) : <div className="text-sm text-foreground/50">No orders yet.</div>}

            <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2 mt-4">Recent Messages</div>
            {data.recentMessages.length > 0 ? (
              <div className="space-y-2">
                {data.recentMessages.slice(0, 4).map((m: any) => (
                  <Link key={m.id} href="/admin/messages" className="flex items-center justify-between gap-3 rounded-md border border-border p-2 hover:bg-brand-light text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{m.fullName}</div>
                      <div className="text-xs text-foreground/60 truncate">{m.subject}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-brand shrink-0" />
                  </Link>
                ))}
              </div>
            ) : <div className="text-sm text-foreground/50">No messages yet.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function mergeSeries(a: any[], b: any[]) {
  return a.map((m, i) => ({ date: m.date, Messages: m.count, Orders: b[i]?.count || 0 }));
}

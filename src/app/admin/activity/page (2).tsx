"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  login: "bg-foreground/10 text-foreground",
  logout: "bg-foreground/10 text-foreground",
  setup: "bg-purple-100 text-purple-700",
};

export default function ActivityAdmin() {
  return (
    <AdminShell title="Activity Log" description="Audit trail of admin actions">
      <ActivityContent />
    </AdminShell>
  );
}

function ActivityContent() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity?limit=100", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-foreground/60">Loading...</div>;

  return (
    <Card className="card-shadow">
      <CardContent className="p-4">
        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0 text-sm">
              <Badge className={`shrink-0 ${ACTION_COLORS[l.action] || "bg-foreground/10"}`}>{l.action}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-foreground">
                  <span className="font-semibold">{l.entity}</span>
                  {l.detail ? <span className="text-foreground/70"> — {l.detail}</span> : null}
                </div>
                <div className="text-xs text-foreground/50">
                  {l.AdminUser?.name || l.AdminUser?.email || "System"} · {new Date(l.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 ? <div className="text-center text-sm text-foreground/50 py-8">No activity logged yet.</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

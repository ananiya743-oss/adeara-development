"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Trash2, Mail, Phone, Eye, Download } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["pending", "reviewing", "approved", "in_progress", "completed", "rejected"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewing: "Reviewing",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewing: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-600 text-white",
  rejected: "bg-red-100 text-red-700",
};

const SERVICES = ["Website Development", "Mobile Application Development", "Digital Marketing", "Other Custom Service"];

export default function OrdersAdmin() {
  return (
    <AdminShell title="Project Orders" description="Manage incoming project inquiries">
      <OrdersContent />
    </AdminShell>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", service: "all", q: "" });
  const [viewing, setViewing] = useState<any | null>(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.status !== "all") params.set("status", filter.status);
    if (filter.service !== "all") params.set("service", filter.service);
    if (filter.q) params.set("q", filter.q);
    fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" }).then((r) => r.json()).then((d) => { setOrders(d.orders || []); setLoading(false); });
  }
  useEffect(() => { load(); }, [filter.status, filter.service, filter.q]);

  async function del(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/orders?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  async function changeStatus(o: any, status: string) {
    const res = await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: o.id, status }) });
    const d = await res.json();
    if (d.ok) { toast.success("Status updated"); load(); } else toast.error(d.error);
  }

  function exportCSV() {
    const headers = ["Reference", "Full Name", "Business", "Phone", "Email", "Country", "Service", "Budget", "Timeline", "Status", "Date"];
    const rows = orders.map((o) => [o.reference, o.fullName, o.businessName, o.phone, o.email, o.country, o.service, o.budget, o.completionTime, o.status, new Date(o.createdAt).toISOString()].map((c) => `"${String(c || "").replace(/"/g, '""')}"`));
    const csv = [headers.map((h) => `"${h}"`).join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card className="card-shadow">
        <CardContent className="p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <Input placeholder="Search by reference, name, email..." value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} className="pl-9" />
            </div>
            <Select value={filter.status} onValueChange={(v) => setFilter({ ...filter, status: v })}>
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filter.service} onValueChange={(v) => setFilter({ ...filter, service: v })}>
              <SelectTrigger><SelectValue placeholder="All services" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/60">{orders.length} order(s)</p>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" /> Export CSV</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
      <div className="space-y-2">
        {orders.map((o) => (
          <Card key={o.id} className="card-shadow">
            <CardContent className="p-4">
              <div className="grid gap-3 md:grid-cols-12 md:items-center">
                <div className="md:col-span-4">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs font-mono font-bold text-brand">{o.reference}</code>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[o.status] || "bg-foreground/10"}`}>{STATUS_LABELS[o.status] || o.status}</span>
                  </div>
                  <div className="font-bold text-brand-dark">{o.fullName}</div>
                  {o.businessName ? <div className="text-xs text-foreground/60">{o.businessName}</div> : null}
                  <div className="text-xs text-foreground/60">{o.service}</div>
                </div>
                <div className="md:col-span-3 text-xs space-y-1">
                  <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-brand" /> {o.phone}</div>
                  <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-brand" /> {o.email}</div>
                  {o.country ? <div className="text-foreground/60">{o.country}</div> : null}
                </div>
                <div className="md:col-span-2 text-xs text-foreground/70">
                  <div><strong>Budget:</strong> {o.budget || "—"}</div>
                  <div><strong>Timeline:</strong> {o.completionTime || "—"}</div>
                  <div className="text-foreground/50">{new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="md:col-span-3 flex items-center gap-2 justify-end">
                  <Select value={o.status} onValueChange={(v) => changeStatus(o, v)}>
                    <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" onClick={() => setViewing(o)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => del(o.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && orders.length === 0 ? (
          <div className="text-center text-sm text-foreground/50 py-8">No orders match your filters.</div>
        ) : null}
      </div>

      {viewing ? <OrderDetails order={viewing} onClose={() => { setViewing(null); load(); }} /> : null}
    </div>
  );
}

function OrderDetails({ order, onClose }: { order: any; onClose: () => void }) {
  const [notes, setNotes] = useState(order.adminNotes || "");
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);
    const res = await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: order.id, adminNotes: notes }) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Notes saved"); onClose(); } else toast.error(d.error);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle>Order Details — {order.reference}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <Info label="Full Name" value={order.fullName} />
            <Info label="Business Name" value={order.businessName} />
            <Info label="Phone" value={order.phone} />
            <Info label="Email" value={order.email} />
            <Info label="Country" value={order.country} />
            <Info label="Service" value={order.service} />
            <Info label="Budget" value={order.budget} />
            <Info label="Timeline" value={order.completionTime} />
            <Info label="Date" value={new Date(order.createdAt).toLocaleString()} />
            <Info label="Status" value={STATUS_LABELS[order.status] || order.status} />
          </div>
          <div className="space-y-2">
            <Label>Project Description</Label>
            <Textarea rows={4} readOnly value={order.description} />
          </div>
          <div className="space-y-2">
            <Label>Additional Requirements</Label>
            <Textarea rows={3} readOnly value={order.requirements || ""} />
          </div>
          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes (not visible to customer)" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={saveNotes} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? "Saving..." : "Save Notes"}</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <a href={`mailto:${order.email}?subject=Re: ${order.reference}`} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-brand-light"><Mail className="h-3.5 w-3.5" /> Email Customer</a>
            <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-brand-light"><Phone className="h-3.5 w-3.5" /> Call Customer</a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">{label}</div>
      <div className="text-sm text-foreground">{value || "—"}</div>
    </div>
  );
}

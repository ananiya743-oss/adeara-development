"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Trash2, Mail, Phone, Eye, MailOpen, Mailbox, Archive, Reply } from "lucide-react";
import { toast } from "sonner";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-foreground/10 text-foreground",
  replied: "bg-emerald-100 text-emerald-700",
  archived: "bg-foreground/10 text-foreground/60",
};

export default function MessagesAdmin() {
  return (
    <AdminShell title="Messages" description="Manage contact form submissions">
      <MessagesContent />
    </AdminShell>
  );
}

function MessagesContent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", q: "" });
  const [viewing, setViewing] = useState<any | null>(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.status !== "all") params.set("status", filter.status);
    if (filter.q) params.set("q", filter.q);
    fetch(`/api/admin/messages?${params.toString()}`, { cache: "no-store" }).then((r) => r.json()).then((d) => { setMessages(d.messages || []); setLoading(false); });
  }
  useEffect(() => { load(); }, [filter.status, filter.q]);

  async function del(id: string) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  async function openMessage(m: any) {
    setViewing(m);
    if (m.status === "new") {
      const res = await fetch("/api/admin/messages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id, status: "read" }) });
      const d = await res.json();
      if (d.ok) load();
    }
  }

  return (
    <div className="space-y-4">
      <Card className="card-shadow">
        <CardContent className="p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <Input placeholder="Search by name, email, subject, message..." value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} className="pl-9" />
            </div>
            <Select value={filter.status} onValueChange={(v) => setFilter({ ...filter, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-foreground/60">{messages.length} message(s)</p>
        </CardContent>
      </Card>

      {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
      <div className="space-y-2">
        {messages.map((m) => (
          <Card key={m.id} className={`card-shadow ${m.status === "new" ? "border-l-4 border-l-brand" : ""}`}>
            <CardContent className="p-4">
              <div className="grid gap-3 md:grid-cols-12 md:items-center">
                <div className="md:col-span-5">
                  <div className="flex items-center gap-2 mb-1">
                    {m.status === "new" ? <Mailbox className="h-4 w-4 text-brand" /> : <MailOpen className="h-4 w-4 text-foreground/40" />}
                    <div className="font-bold text-brand-dark">{m.fullName}</div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[m.status] || ""}`}>{m.status}</span>
                  </div>
                  <div className="text-xs text-foreground/60">{m.email} · {m.phone}</div>
                  <div className="text-sm font-medium text-foreground/80 truncate">{m.subject}</div>
                </div>
                <div className="md:col-span-3 text-xs text-foreground/70">
                  {m.service ? <div><strong>Service:</strong> {m.service}</div> : null}
                  <div className="text-foreground/50">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
                <div className="md:col-span-4 flex items-center gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => openMessage(m)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => del(m.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && messages.length === 0 ? (
          <div className="text-center text-sm text-foreground/50 py-8">No messages match your filters.</div>
        ) : null}
      </div>

      {viewing ? <MessageDetails message={viewing} onClose={() => { setViewing(null); load(); }} /> : null}
    </div>
  );
}

function MessageDetails({ message, onClose }: { message: any; onClose: () => void }) {
  const [notes, setNotes] = useState(message.adminNotes || "");
  const [saving, setSaving] = useState(false);

  async function saveNotes(status?: string) {
    setSaving(true);
    const res = await fetch("/api/admin/messages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: message.id, adminNotes: notes, status: status || "replied" }) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Saved"); onClose(); } else toast.error(d.error);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle>Message — {message.subject}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div><Label className="text-xs">Name</Label><div className="text-foreground">{message.fullName}</div></div>
            <div><Label className="text-xs">Phone</Label><div className="text-foreground">{message.phone}</div></div>
            <div><Label className="text-xs">Email</Label><div className="text-foreground">{message.email}</div></div>
            <div><Label className="text-xs">Service</Label><div className="text-foreground">{message.service || "—"}</div></div>
            <div><Label className="text-xs">Subject</Label><div className="text-foreground">{message.subject}</div></div>
            <div><Label className="text-xs">Date</Label><div className="text-foreground">{new Date(message.createdAt).toLocaleString()}</div></div>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea rows={6} readOnly value={message.message} />
          </div>
          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes..." />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-brand-light"><Mail className="h-3.5 w-3.5" /> Reply by Email</a>
              <a href={`tel:${message.phone}`} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-brand-light"><Phone className="h-3.5 w-3.5" /> Call</a>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button variant="outline" onClick={() => saveNotes("archived")}><Archive className="h-3.5 w-3.5 mr-1" /> Archive</Button>
              <Button onClick={() => saveNotes("replied")} disabled={saving} className="bg-brand hover:bg-brand/90">
                <Reply className="h-3.5 w-3.5 mr-1" /> Mark Replied
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

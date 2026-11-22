"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save, Star } from "lucide-react";
import { toast } from "sonner";
import { MediaPickerButton } from "@/components/admin/media-picker";

export default function TestimonialsAdmin() {
  return (
    <AdminShell title="Testimonials" description="Manage customer testimonials">
      <TestimonialsContent />
    </AdminShell>
  );
}

function TestimonialsContent() {
  const [items, setItems] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/testimonials", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/clients", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([t, c]) => { setItems(t.testimonials || []); setClients(c.clients || []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  async function toggleVisible(t: any) {
    const res = await fetch("/api/admin/testimonials", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, visible: !t.visible }) });
    const d = await res.json();
    if (d.ok) { toast.success("Updated"); load(); } else toast.error(d.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{items.length} testimonials</p>
        <Button onClick={() => setEditing({})} size="sm" className="bg-brand hover:bg-brand/90"><Plus className="h-3.5 w-3.5 mr-1" /> Add Testimonial</Button>
      </div>
      {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <Card key={t.id} className="card-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-3">
                {t.photo ? <img src={t.photo} alt={t.name} className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold">{(t.name || "?").slice(0, 1)}</div>}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-brand-dark truncate text-sm">{t.name}</div>
                  {t.role || t.company ? <div className="text-xs text-foreground/60 truncate">{[t.role, t.company].filter(Boolean).join(" · ")}</div> : null}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => del(t.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-foreground/20"}`} />
                ))}
              </div>
              <p className="text-xs text-foreground/70 line-clamp-3 italic">"{t.content}"</p>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Switch checked={t.visible} onCheckedChange={() => toggleVisible(t)} id={`vis-${t.id}`} />
                <Label htmlFor={`vis-${t.id}`} className="text-xs">{t.visible ? "Published" : "Hidden"}</Label>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && items.length === 0 ? (
          <div className="col-span-full text-center text-sm text-foreground/50 py-8">No testimonials yet. Add one to start building social proof.</div>
        ) : null}
      </div>
      {editing ? <TestimonialEditor item={editing} clients={clients} onClose={() => { setEditing(null); load(); }} /> : null}
    </div>
  );
}

function TestimonialEditor({ item, clients, onClose }: { item: any; clients: any[]; onClose: () => void }) {
  const [data, setData] = useState<any>(item.id ? item : { name: "", role: "", company: "", photo: "", rating: 5, content: "", clientId: "", visible: true });
  const [saving, setSaving] = useState(false);
  const isNew = !item.id;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/testimonials", { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Saved"); onClose(); } else toast.error(d.error || "Save failed");
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle>{isNew ? "Add Testimonial" : "Edit Testimonial"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Customer Name</Label><Input value={data.name || ""} onChange={(e) => setData({ ...data, name: e.target.value })} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Role / Title</Label><Input value={data.role || ""} onChange={(e) => setData({ ...data, role: e.target.value })} placeholder="CEO" /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={data.company || ""} onChange={(e) => setData({ ...data, company: e.target.value })} /></div>
          </div>
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <div className="flex gap-2">
              <Input value={data.photo || ""} onChange={(e) => setData({ ...data, photo: e.target.value })} placeholder="/uploads/..." />
              <MediaPickerButton value={data.photo || ""} onPick={(url) => setData({ ...data, photo: url })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setData({ ...data, rating: i + 1 })}>
                  <Star className={`h-6 w-6 ${i < (data.rating || 0) ? "fill-amber-400 text-amber-400" : "text-foreground/30"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Linked Client (optional)</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.clientId || ""} onChange={(e) => setData({ ...data, clientId: e.target.value || null })}>
              <option value="">None</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Testimonial Content</Label><Textarea rows={5} value={data.content || ""} onChange={(e) => setData({ ...data, content: e.target.value })} /></div>
          <div className="flex items-center gap-3"><Switch checked={data.visible !== false} onCheckedChange={(v) => setData({ ...data, visible: v })} id="vis" /><Label htmlFor="vis" className="cursor-pointer">Published</Label></div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

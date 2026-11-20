"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

const ICON_OPTIONS = ["Rocket", "Lightbulb", "Users", "Smartphone", "ShieldCheck", "Wallet", "Clock", "Heart", "Star", "Zap", "Target", "Award", "CheckCircle", "Sparkles", "TrendingUp", "Lock", "Globe", "Headset"];

export default function WhyChooseAdmin() {
  return (
    <AdminShell title="Why Choose Us" description="Manage the 'Why Choose ADEARA' section">
      <WhyChooseContent />
    </AdminShell>
  );
}

function WhyChooseContent() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/why", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d.items || []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/admin/why?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  async function toggleVisible(it: any) {
    const res = await fetch("/api/admin/why", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: it.id, visible: !it.visible }) });
    const d = await res.json();
    if (d.ok) { toast.success("Updated"); load(); } else toast.error(d.error);
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{items.length} items</p>
        <Button onClick={() => setEditing({})} size="sm" className="bg-brand hover:bg-brand/90"><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button>
      </div>
      {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <Card key={it.id} className="card-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-light text-brand text-xs font-bold">{it.order + 1}</div>
                  <div className="font-bold text-brand-dark">{it.title}</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(it)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => del(it.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="text-xs text-foreground/50">Icon: {it.icon}</div>
              <p className="text-sm text-foreground/70">{it.description}</p>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <Switch checked={it.visible} onCheckedChange={() => toggleVisible(it)} id={`vis-${it.id}`} />
                <Label htmlFor={`vis-${it.id}`} className="text-xs">{it.visible ? "Visible" : "Hidden"}</Label>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && items.length === 0 ? (
          <div className="col-span-full text-center text-sm text-foreground/50 py-8">No items yet.</div>
        ) : null}
      </div>
      {editing ? <Editor item={editing} onClose={() => { setEditing(null); load(); }} /> : null}
    </div>
  );
}

function Editor({ item, onClose }: { item: any; onClose: () => void }) {
  const [data, setData] = useState<any>(item.id ? item : { icon: "Rocket", title: "", description: "", order: 0, visible: true });
  const [saving, setSaving] = useState(false);
  const isNew = !item.id;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/why", { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Saved"); onClose(); } else toast.error(d.error);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{isNew ? "Add Item" : "Edit Item"}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Title</Label><Input value={data.title || ""} onChange={(e) => setData({ ...data, title: e.target.value })} /></div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.icon} onChange={(e) => setData({ ...data, icon: e.target.value })}>
              {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Order</Label><Input type="number" value={data.order || 0} onChange={(e) => setData({ ...data, order: Number(e.target.value) })} /></div>
          <div className="flex items-center gap-3"><Switch checked={data.visible !== false} onCheckedChange={(v) => setData({ ...data, visible: v })} id="vis" /><Label htmlFor="vis" className="cursor-pointer">Visible</Label></div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

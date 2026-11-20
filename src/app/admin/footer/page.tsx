"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = ["company", "services", "resources"];

export default function FooterAdmin() {
  return (
    <AdminShell title="Footer Links" description="Edit footer link groups">
      <FooterContent />
    </AdminShell>
  );
}

function FooterContent() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/footer", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d.items || []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this link?")) return;
    const res = await fetch(`/api/admin/footer?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  async function toggleVisible(it: any) {
    const res = await fetch("/api/admin/footer", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: it.id, visible: !it.visible }) });
    const d = await res.json();
    if (d.ok) { toast.success("Updated"); load(); } else toast.error(d.error);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{items.length} links</p>
        <Button onClick={() => setEditing({})} size="sm" className="bg-brand hover:bg-brand/90"><Plus className="h-3.5 w-3.5 mr-1" /> Add Link</Button>
      </div>
      {SECTIONS.map((sec) => {
        const links = items.filter((i) => i.section === sec);
        if (!links.length) return null;
        return (
          <Card key={sec} className="card-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">{sec}</div>
              {links.map((it) => (
                <div key={it.id} className="flex items-center gap-3 py-2 border-t border-border first:border-t-0">
                  <div className="font-medium text-brand-dark flex-1">{it.label}</div>
                  <div className="text-xs text-brand truncate max-w-[200px]">{it.href}</div>
                  <Switch checked={it.visible} onCheckedChange={() => toggleVisible(it)} id={`vis-${it.id}`} />
                  <Button variant="ghost" size="sm" onClick={() => setEditing(it)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => del(it.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
      {editing ? <Editor item={editing} onClose={() => { setEditing(null); load(); }} /> : null}
    </div>
  );
}

function Editor({ item, onClose }: { item: any; onClose: () => void }) {
  const [data, setData] = useState<any>(item.id ? item : { section: "company", label: "", href: "/", order: 0, visible: true });
  const [saving, setSaving] = useState(false);
  const isNew = !item.id;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/footer", { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Saved"); onClose(); } else toast.error(d.error);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{isNew ? "Add Footer Link" : "Edit Footer Link"}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Section</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.section} onChange={(e) => setData({ ...data, section: e.target.value })}>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Label</Label><Input value={data.label || ""} onChange={(e) => setData({ ...data, label: e.target.value })} /></div>
          <div className="space-y-2"><Label>Link</Label><Input value={data.href || ""} onChange={(e) => setData({ ...data, href: e.target.value })} placeholder="/about" /></div>
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

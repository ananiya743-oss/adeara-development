"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, GripVertical, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function NavAdmin() {
  return (
    <AdminShell title="Navigation" description="Edit the header navigation menu">
      <NavContent />
    </AdminShell>
  );
}

function NavContent() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/admin/nav", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d.items || []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const res = await fetch("/api/admin/nav", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: "New Link", href: "/", order: items.length + 1 }) });
    const d = await res.json();
    if (d.ok) { toast.success("Added"); load(); } else toast.error(d.error);
  }

  async function update(id: string, patch: any) {
    setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
    const res = await fetch("/api/admin/nav", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    const d = await res.json();
    if (!d.ok) toast.error(d.error || "Update failed");
  }

  async function del(id: string) {
    if (!confirm("Delete this navigation item?")) return;
    const res = await fetch(`/api/admin/nav?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;
    const next = [...items];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);
    Promise.all(next.map((it, i) => fetch("/api/admin/nav", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: it.id, order: i + 1 }) })));
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{items.length} navigation items</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh</Button>
          <Button onClick={add} size="sm" className="bg-brand hover:bg-brand/90"><Plus className="h-3.5 w-3.5 mr-1" /> Add Link</Button>
        </div>
      </div>
      <div className="space-y-3">
        {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
        {items.map((item, i) => (
          <Card key={item.id} className="card-shadow">
            <CardContent className="p-4">
              <div className="grid gap-3 md:grid-cols-12 md:items-end">
                <div className="md:col-span-3 space-y-2">
                  <Label className="text-xs">Label</Label>
                  <Input value={item.label} onChange={(e) => update(item.id, { label: e.target.value })} />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label className="text-xs">Link</Label>
                  <Input value={item.href} onChange={(e) => update(item.id, { href: e.target.value })} placeholder="/" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">Order</Label>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" type="button" onClick={() => move(item.id, -1)} disabled={i === 0}><GripVertical className="h-3 w-3 rotate-180" /></Button>
                    <Input type="number" value={item.order} onChange={(e) => update(item.id, { order: Number(e.target.value) })} />
                    <Button variant="outline" size="sm" type="button" onClick={() => move(item.id, 1)} disabled={i === items.length - 1}><GripVertical className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Switch checked={item.isButton} onCheckedChange={(v) => update(item.id, { isButton: v })} id={`btn-${item.id}`} />
                  <Label htmlFor={`btn-${item.id}`} className="text-xs cursor-pointer">Button</Label>
                </div>
                <div className="md:col-span-1 flex items-center gap-2 justify-end">
                  <Switch checked={item.visible} onCheckedChange={(v) => update(item.id, { visible: v })} id={`vis-${item.id}`} />
                  <Button variant="ghost" size="sm" onClick={() => del(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && items.length === 0 ? (
          <div className="text-center text-sm text-foreground/50 py-8">No navigation items yet.</div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { MediaPickerButton } from "@/components/admin/media-picker";

export default function ServicesAdmin() {
  return (
    <AdminShell title="Services" description="Add, edit, and manage your services">
      <ServicesContent />
    </AdminShell>
  );
}

const ICON_OPTIONS = ["Globe", "Smartphone", "Megaphone", "Code2", "PenTool", "Rocket", "ShoppingCart", "Search", "TrendingUp", "Sparkles", "Layers", "Zap", "Camera", "Mail", "Star"];

function ServicesContent() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/services", { cache: "no-store" }).then((r) => r.json()).then((d) => { setServices(d.services || []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{services.length} services</p>
        <Button onClick={() => setEditing({})} size="sm" className="bg-brand hover:bg-brand/90"><Plus className="h-3.5 w-3.5 mr-1" /> Add Service</Button>
      </div>
      {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id} className="card-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="font-bold text-brand-dark">{s.title}</div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => del(s.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="text-xs text-foreground/70 line-clamp-2">{s.shortDesc}</p>
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={s.visible} onCheckedChange={async (v) => { await fetch("/api/admin/services", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id, visible: v }) }); load(); }} id={`vis-${s.id}`} />
                <Label htmlFor={`vis-${s.id}`} className="text-xs">{s.visible ? "Visible" : "Hidden"}</Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing ? <ServiceEditor service={editing} onClose={() => { setEditing(null); load(); }} /> : null}
    </div>
  );
}

function ServiceEditor({ service, onClose }: { service: any; onClose: () => void }) {
  const [data, setData] = useState<any>(service.id ? service : { title: "", shortDesc: "", description: "", icon: "Globe", image: "", features: [], benefits: [], price: "", visible: true, order: 0 });
  const [saving, setSaving] = useState(false);
  const isNew = !service.id;

  function updateFeature(idx: number, v: string) {
    const arr = [...(data.features || [])];
    arr[idx] = v;
    setData({ ...data, features: arr });
  }
  function updateBenefit(idx: number, v: string) {
    const arr = [...(data.benefits || [])];
    arr[idx] = v;
    setData({ ...data, benefits: arr });
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/services", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Saved"); onClose(); } else toast.error(d.error || "Save failed");
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle>{isNew ? "Add Service" : "Edit Service"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Service Title</Label>
              <Input value={data.title || ""} onChange={(e) => setData({ ...data, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={data.slug || ""} onChange={(e) => setData({ ...data, slug: e.target.value })} placeholder="auto from title" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Short Description</Label>
            <Input value={data.shortDesc || ""} onChange={(e) => setData({ ...data, shortDesc: e.target.value })} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Full Description</Label>
            <Textarea rows={5} value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Icon</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.icon} onChange={(e) => setData({ ...data, icon: e.target.value })}>
                {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Price (optional)</Label>
              <Input value={data.price || ""} onChange={(e) => setData({ ...data, price: e.target.value })} placeholder="From a custom quote" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex gap-2">
              <Input value={data.image || ""} onChange={(e) => setData({ ...data, image: e.target.value })} placeholder="/uploads/..." />
              <MediaPickerButton value={data.image || ""} onPick={(url) => setData({ ...data, image: url })} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              <Button variant="ghost" size="sm" type="button" onClick={() => setData({ ...data, features: [...(data.features || []), ""] })}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
            </div>
            {(data.features || []).map((f: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input value={f} onChange={(e) => updateFeature(i, e.target.value)} />
                <Button variant="ghost" size="sm" type="button" onClick={() => setData({ ...data, features: (data.features || []).filter((_: any, j: number) => j !== i) })}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Benefits</Label>
              <Button variant="ghost" size="sm" type="button" onClick={() => setData({ ...data, benefits: [...(data.benefits || []), ""] })}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
            </div>
            {(data.benefits || []).map((b: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input value={b} onChange={(e) => updateBenefit(i, e.target.value)} />
                <Button variant="ghost" size="sm" type="button" onClick={() => setData({ ...data, benefits: (data.benefits || []).filter((_: any, j: number) => j !== i) })}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={data.visible !== false} onCheckedChange={(v) => setData({ ...data, visible: v })} id="vis" />
            <Label htmlFor="vis" className="cursor-pointer">Visible on public site</Label>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-brand hover:bg-brand/90">
              {saving ? <><Save className="mr-1 h-3.5 w-3.5" /> Saving...</> : <><Save className="mr-1 h-3.5 w-3.5" /> Save</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

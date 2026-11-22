"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = ["home", "about", "services", "contact"];

export default function CtaAdmin() {
  return (
    <AdminShell title="Call to Action" description="Edit the CTA banners across the site">
      <CtaContent />
    </AdminShell>
  );
}

function CtaContent() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cta", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d.items || []); setLoading(false); });
  }, []);

  async function save(item: any) {
    const res = await fetch("/api/admin/cta", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
    const d = await res.json();
    if (d.ok) toast.success(`${item.section} CTA saved`); else toast.error(d.error || "Save failed");
  }

  if (loading) return <div className="text-sm text-foreground/60">Loading...</div>;

  // Ensure all sections exist
  const all = SECTIONS.map((s) => items.find((i) => i.section === s) || { section: s, heading: "", description: "", primaryBtn: "", primaryHref: "", secondaryBtn: "", secondaryHref: "", visible: true });

  return (
    <div className="space-y-6 max-w-3xl">
      {all.map((item) => (
        <Card key={item.section} className="card-shadow">
          <CardHeader><CardTitle className="text-base capitalize">{item.section} CTA</CardTitle></CardHeader>
          <CardContent>
            <CtaEditor item={item} onSave={save} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CtaEditor({ item, onSave }: { item: any; onSave: (i: any) => void }) {
  const [data, setData] = useState(item);
  const [saving, setSaving] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    onSave(data);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2"><Label>Heading</Label><Input value={data.heading || ""} onChange={(e) => setData({ ...data, heading: e.target.value })} /></div>
      <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Primary Button Label</Label><Input value={data.primaryBtn || ""} onChange={(e) => setData({ ...data, primaryBtn: e.target.value })} /></div>
        <div className="space-y-2"><Label>Primary Button Link</Label><Input value={data.primaryHref || ""} onChange={(e) => setData({ ...data, primaryHref: e.target.value })} /></div>
        <div className="space-y-2"><Label>Secondary Button Label (optional)</Label><Input value={data.secondaryBtn || ""} onChange={(e) => setData({ ...data, secondaryBtn: e.target.value })} /></div>
        <div className="space-y-2"><Label>Secondary Button Link</Label><Input value={data.secondaryHref || ""} onChange={(e) => setData({ ...data, secondaryHref: e.target.value })} /></div>
      </div>
      <div className="flex items-center gap-3"><Switch checked={data.visible !== false} onCheckedChange={(v) => setData({ ...data, visible: v })} id={`vis-${data.section}`} /><Label htmlFor={`vis-${data.section}`} className="cursor-pointer">Show this CTA</Label></div>
      <Button type="submit" disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Saving...</> : <><Save className="mr-1 h-3.5 w-3.5" /> Save</>}</Button>
    </form>
  );
}

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
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { MediaPickerButton } from "@/components/admin/media-picker";

export default function ClientsAdmin() {
  return (
    <AdminShell title="Clients" description="Manage your client relationships">
      <ClientsContent />
    </AdminShell>
  );
}

function ClientsContent() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/clients", { cache: "no-store" }).then((r) => r.json()).then((d) => { setClients(d.clients || []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this client?")) return;
    const res = await fetch(`/api/admin/clients?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  async function toggleVisible(c: any) {
    const res = await fetch("/api/admin/clients", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, visible: !c.visible }) });
    const d = await res.json();
    if (d.ok) { toast.success("Updated"); load(); } else toast.error(d.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{clients.length} clients</p>
        <Button onClick={() => setEditing({})} size="sm" className="bg-brand hover:bg-brand/90"><Plus className="h-3.5 w-3.5 mr-1" /> Add Client</Button>
      </div>
      {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <Card key={c.id} className="card-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {c.logo ? <img src={c.logo} alt={c.name} className="h-12 w-12 rounded-md object-contain border border-border p-1 bg-white" /> : <div className="h-12 w-12 rounded-md bg-brand-light flex items-center justify-center text-brand font-bold">{c.name.slice(0, 1)}</div>}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-brand-dark truncate">{c.name}</div>
                  {c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline truncate block">{c.website}</a> : null}
                  <div className="text-xs text-foreground/60">{c.projects?.length || 0} projects</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => del(c.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {c.description ? <p className="text-xs text-foreground/70 line-clamp-2">{c.description}</p> : null}
              <div className="flex items-center gap-2">
                <Switch checked={c.visible} onCheckedChange={() => toggleVisible(c)} id={`vis-${c.id}`} />
                <Label htmlFor={`vis-${c.id}`} className="text-xs">{c.visible ? "Published" : "Hidden"}</Label>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && clients.length === 0 ? (
          <div className="col-span-full text-center text-sm text-foreground/50 py-8">No clients yet. Add your first client to get started.</div>
        ) : null}
      </div>
      {editing ? <ClientEditor client={editing} onClose={() => { setEditing(null); load(); }} /> : null}
    </div>
  );
}

function ClientEditor({ client, onClose }: { client: any; onClose: () => void }) {
  const [data, setData] = useState<any>(client.id ? client : { name: "", logo: "", description: "", website: "", visible: true });
  const [saving, setSaving] = useState(false);
  const isNew = !client.id;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/clients", { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Saved"); onClose(); } else toast.error(d.error || "Save failed");
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle>{isNew ? "Add Client" : "Edit Client"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Client Name</Label><Input value={data.name || ""} onChange={(e) => setData({ ...data, name: e.target.value })} /></div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex gap-2">
              <Input value={data.logo || ""} onChange={(e) => setData({ ...data, logo: e.target.value })} placeholder="/uploads/..." />
              <MediaPickerButton value={data.logo || ""} onPick={(url) => setData({ ...data, logo: url })} />
            </div>
          </div>
          <div className="space-y-2"><Label>Website (optional)</Label><Input value={data.website || ""} onChange={(e) => setData({ ...data, website: e.target.value })} placeholder="https://..." /></div>
          <div className="space-y-2"><Label>Description (optional)</Label><Textarea rows={4} value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })} /></div>
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

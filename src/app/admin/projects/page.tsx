"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, X, Save, Star, Globe } from "lucide-react";
import { toast } from "sonner";
import { MediaPickerButton } from "@/components/admin/media-picker";

const STATUSES = ["draft", "published", "hidden"];
const CATEGORIES = ["Website", "Mobile", "Marketing", "Other"];

export default function ProjectsAdmin() {
  return (
    <AdminShell title="Portfolio" description="Manage your portfolio projects">
      <ProjectsContent />
    </AdminShell>
  );
}

function ProjectsContent() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/projects", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/clients", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([p, c]) => { setProjects(p.projects || []); setClients(c.clients || []); setLoading(false); });
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { toast.success("Deleted"); load(); } else toast.error(d.error);
  }

  async function toggleFeatured(p: any) {
    const res = await fetch("/api/admin/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, featured: !p.featured }) });
    const d = await res.json();
    if (d.ok) { toast.success("Updated"); load(); } else toast.error(d.error);
  }

  async function changeStatus(p: any, status: string) {
    const res = await fetch("/api/admin/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, status }) });
    const d = await res.json();
    if (d.ok) { toast.success("Updated"); load(); } else toast.error(d.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{projects.length} projects</p>
        <Button onClick={() => setEditing({})} size="sm" className="bg-brand hover:bg-brand/90"><Plus className="h-3.5 w-3.5 mr-1" /> Add Project</Button>
      </div>
      {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id} className="card-shadow overflow-hidden">
            <div className="aspect-video bg-brand-light relative">
              {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : (
                <div className="w-full h-full flex items-center justify-center text-foreground/30"><Globe className="h-10 w-10" /></div>
              )}
              {p.featured ? <div className="absolute top-2 left-2 inline-flex items-center rounded-full bg-brand text-white px-2 py-0.5 text-xs font-semibold"><Star className="h-3 w-3 mr-1 fill-white" /> Featured</div> : null}
              <div className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "published" ? "bg-emerald-500 text-white" : p.status === "hidden" ? "bg-amber-500 text-white" : "bg-foreground/20 text-white"}`}>{p.status}</div>
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-bold text-brand-dark truncate">{p.title}</div>
                  {p.clientName ? <div className="text-xs text-foreground/60 truncate">{p.clientName}</div> : null}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => del(p.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="text-xs text-foreground/70 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" type="button" onClick={() => toggleFeatured(p)} className={p.featured ? "text-amber-500" : ""}>
                  <Star className={`h-3.5 w-3.5 mr-1 ${p.featured ? "fill-amber-400" : ""}`} /> {p.featured ? "Featured" : "Feature"}
                </Button>
                <Select value={p.status} onValueChange={(v) => changeStatus(p, v)}>
                  <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && projects.length === 0 ? (
          <div className="col-span-full text-center text-sm text-foreground/50 py-8">
            No projects yet. Click "Add Project" to create your first one.
          </div>
        ) : null}
      </div>
      {editing ? <ProjectEditor project={editing} clients={clients} onClose={() => { setEditing(null); load(); }} /> : null}
    </div>
  );
}

function ProjectEditor({ project, clients, onClose }: { project: any; clients: any[]; onClose: () => void }) {
  const [data, setData] = useState<any>(project.id ? project : { title: "", description: "", longDesc: "", image: "", clientName: "", clientId: "", category: "Website", technologies: "", completionDate: "", projectUrl: "", status: "draft", featured: false, order: 0 });
  const [saving, setSaving] = useState(false);
  const isNew = !project.id;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/projects", { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Saved"); onClose(); } else toast.error(d.error || "Save failed");
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle>{isNew ? "Add Project" : "Edit Project"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input value={data.title || ""} onChange={(e) => setData({ ...data, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={data.slug || ""} onChange={(e) => setData({ ...data, slug: e.target.value })} placeholder="auto" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Short Description</Label>
            <Textarea rows={2} value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Long Description (optional)</Label>
            <Textarea rows={4} value={data.longDesc || ""} onChange={(e) => setData({ ...data, longDesc: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Project Image</Label>
            <div className="flex gap-2">
              <Input value={data.image || ""} onChange={(e) => setData({ ...data, image: e.target.value })} placeholder="/uploads/..." />
              <MediaPickerButton value={data.image || ""} onPick={(url) => setData({ ...data, image: url })} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input value={data.clientName || ""} onChange={(e) => setData({ ...data, clientName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Linked Client (optional)</Label>
              <Select value={data.clientId || "none"} onValueChange={(v) => setData({ ...data, clientId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={data.category || "Website"} onValueChange={(v) => setData({ ...data, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Completion Date</Label>
              <Input type="date" value={data.completionDate ? data.completionDate.slice(0, 10) : ""} onChange={(e) => setData({ ...data, completionDate: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Technologies (comma separated)</Label>
              <Input value={data.technologies || ""} onChange={(e) => setData({ ...data, technologies: e.target.value })} placeholder="React, Next.js, Tailwind" />
            </div>
            <div className="space-y-2">
              <Label>Project URL (optional)</Label>
              <Input value={data.projectUrl || ""} onChange={(e) => setData({ ...data, projectUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={data.status || "draft"} onValueChange={(v) => setData({ ...data, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input type="number" value={data.order || 0} onChange={(e) => setData({ ...data, order: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={!!data.featured} onCheckedChange={(v) => setData({ ...data, featured: v })} id="featured" />
            <Label htmlFor="featured" className="cursor-pointer">Feature this project</Label>
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

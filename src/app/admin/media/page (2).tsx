"use client";

import { useEffect, useState, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiDelete } from "@/components/admin/api-helpers";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MediaPage() {
  return (
    <AdminShell title="Media Library" description="Upload and manage images used across the site">
      <MediaContent />
    </AdminShell>
  );
}

function MediaContent() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/media", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMedia(d.media || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function upload(files: FileList) {
    setUploading(true);
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      try {
        const res = await fetch("/api/admin/media", { method: "POST", body: fd });
        const data = await res.json();
        if (!data.ok) toast.error(data.error || "Upload failed");
      } catch {
        toast.error(`Upload failed: ${f.name}`);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Upload complete");
    load();
  }

  async function del(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this media file?")) return;
    if (await apiDelete(`/api/admin/media?id=${id}`)) load();
  }

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="text-sm text-foreground/70">Upload images for use in hero, services, portfolio, testimonials and more.</div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-brand hover:bg-brand/90">
              {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4" /> Upload Images</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-sm text-foreground/60">Loading...</div>
      ) : media.length === 0 ? (
        <Card className="card-shadow">
          <CardContent className="py-12 text-center text-sm text-foreground/50">
            No media uploaded yet. Use the Upload button above to add images.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((m) => (
            <Card key={m.id} className="card-shadow overflow-hidden group">
              <div className="aspect-square bg-brand-light relative">
                <img src={m.url} alt={m.alt || m.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => del(m.id, e)}
                  className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-destructive hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-2">
                <div className="text-xs font-medium text-brand-dark truncate">{m.name}</div>
                <div className="text-[10px] text-foreground/50 truncate">{m.url}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

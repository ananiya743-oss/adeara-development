"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

export function MediaPickerButton({ value, onPick }: { value?: string; onPick: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/media", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMedia(d.media || []))
      .finally(() => setLoading(false));
  }

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        load();
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) load(); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <ImagePlus className="h-4 w-4 mr-1" /> Pick
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-brand/90">
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            {uploading ? " (uploading...)" : ""}
          </label>
          {loading ? <div className="text-sm text-foreground/60">Loading...</div> : null}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto scrollbar-thin">
            {media.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => { onPick(m.url); setOpen(false); }}
                className={`rounded-md border-2 ${value === m.url ? "border-brand" : "border-border"} overflow-hidden aspect-square hover:border-brand`}
              >
                <img src={m.url} alt={m.alt || m.name} className="w-full h-full object-cover" />
              </button>
            ))}
            {media.length === 0 && !loading ? (
              <div className="col-span-full text-sm text-foreground/50 py-12 text-center">No media uploaded yet.</div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

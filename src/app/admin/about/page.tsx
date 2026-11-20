"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSave, SaveButton, apiGet } from "@/components/admin/api-helpers";
import { MediaPickerButton } from "@/components/admin/media-picker";

export default function AboutAdmin() {
  return (
    <AdminShell title="About Page" description="Edit the About Us preview section">
      <AboutForm />
    </AdminShell>
  );
}

function AboutForm() {
  const [data, setData] = useState<any>(null);
  const { save, loading } = useSave("/api/admin/about", "PUT");

  useEffect(() => { apiGet("/api/admin/about").then((d) => d && setData(d.about)); }, []);
  if (!data) return <div className="text-sm text-foreground/60">Loading...</div>;

  function update(patch: any) { setData({ ...data, ...patch }); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await save(data, "About preview saved");
    if (res) setData(res.about);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <Card className="card-shadow">
        <CardHeader><CardTitle className="text-base">Homepage About Preview</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input value={data.heading || ""} onChange={(e) => update({ heading: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={6} value={data.description || ""} onChange={(e) => update({ description: e.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Button Label</Label>
              <Input value={data.buttonLabel || ""} onChange={(e) => update({ buttonLabel: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Button Link</Label>
              <Input value={data.buttonHref || ""} onChange={(e) => update({ buttonHref: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image (optional)</Label>
            <div className="flex gap-2">
              <Input value={data.image || ""} onChange={(e) => update({ image: e.target.value })} placeholder="/uploads/..." />
              <MediaPickerButton value={data.image || ""} onPick={(url) => update({ image: url })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={data.visible !== false} onCheckedChange={(v) => update({ visible: v })} id="visible" />
            <Label htmlFor="visible" className="cursor-pointer">Show this section on homepage</Label>
          </div>
        </CardContent>
      </Card>
      <SaveButton loading={loading} />
    </form>
  );
}

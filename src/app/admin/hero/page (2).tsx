"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSave, SaveButton, apiGet } from "@/components/admin/api-helpers";
import { MediaPickerButton } from "@/components/admin/media-picker";

export default function HeroAdminPage() {
  return (
    <AdminShell title="Hero / Banner" description="Edit the homepage hero section">
      <HeroForm />
    </AdminShell>
  );
}

function HeroForm() {
  const [data, setData] = useState<any>(null);
  const { save, loading } = useSave("/api/admin/hero", "PUT");

  useEffect(() => {
    apiGet("/api/admin/hero").then((d) => d && setData(d.hero));
  }, []);

  if (!data) return <div className="text-sm text-foreground/60">Loading...</div>;

  function update(patch: any) {
    setData({ ...data, ...patch });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await save(data, "Hero section saved");
    if (res) setData(res.hero);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
      <Card className="card-shadow">
        <CardHeader><CardTitle className="text-base">Hero Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input value={data.heading || ""} onChange={(e) => update({ heading: e.target.value })} maxLength={300} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={4} value={data.description || ""} onChange={(e) => update({ description: e.target.value })} maxLength={1000} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Button Label</Label>
              <Input value={data.primaryBtn || ""} onChange={(e) => update({ primaryBtn: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Primary Button Link</Label>
              <Input value={data.primaryHref || ""} onChange={(e) => update({ primaryHref: e.target.value })} placeholder="/services" />
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Label</Label>
              <Input value={data.secondaryBtn || ""} onChange={(e) => update({ secondaryBtn: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Link</Label>
              <Input value={data.secondaryHref || ""} onChange={(e) => update({ secondaryHref: e.target.value })} placeholder="/order" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow">
        <CardHeader><CardTitle className="text-base">Background & Layout</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Background Image (optional)</Label>
              <div className="flex gap-2">
                <Input value={data.bgImage || ""} onChange={(e) => update({ bgImage: e.target.value })} placeholder="/uploads/..." />
                <MediaPickerButton value={data.bgImage || ""} onPick={(url) => update({ bgImage: url })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <Select value={data.textAlign || "left"} onValueChange={(v) => update({ textAlign: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Switch checked={data.visible !== false} onCheckedChange={(v) => update({ visible: v })} id="visible" />
            <Label htmlFor="visible" className="cursor-pointer">Show hero section on homepage</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <SaveButton loading={loading} />
      </div>
    </form>
  );
}

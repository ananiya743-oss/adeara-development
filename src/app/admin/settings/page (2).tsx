"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { MediaPickerButton } from "@/components/admin/media-picker";

export default function SettingsAdmin() {
  return (
    <AdminShell title="Settings" description="Branding, contact, SEO, email and maintenance configuration">
      <SettingsContent />
    </AdminShell>
  );
}

function SettingsContent() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      const map: Record<string, string> = {};
      (d.settings || []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    });
  }, []);

  function update(key: string, value: string) {
    setSettings({ ...settings, [key]: value });
  }

  async function save(category: string, keys: { key: string; category: string }[]) {
    setSaving(true);
    const items = keys.map((k) => ({ key: k.key, value: settings[k.key] ?? "", category: k.category }));
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) toast.success(`${category} settings saved`); else toast.error(d.error || "Save failed");
  }

  if (loading) return <div className="text-sm text-foreground/60">Loading...</div>;

  return (
    <Tabs defaultValue="general">
      <TabsList className="mb-4 flex-wrap">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="about">About Content</TabsTrigger>
        <TabsTrigger value="footer">Footer</TabsTrigger>
        <TabsTrigger value="email">Email & Maintenance</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      {/* GENERAL */}
      <TabsContent value="general">
        <Card className="card-shadow max-w-3xl">
          <CardHeader><CardTitle className="text-base">Company Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Company Name"><Input value={settings.company_name || ""} onChange={(e) => update("company_name", e.target.value)} /></Field>
            <Field label="Company Tagline"><Input value={settings.company_tagline || ""} onChange={(e) => update("company_tagline", e.target.value)} /></Field>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save("General", [{ key: "company_name", category: "general" }, { key: "company_tagline", category: "general" }])} disabled={saving} className="bg-brand hover:bg-brand/90">
                {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Save</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* BRANDING */}
      <TabsContent value="branding">
        <Card className="card-shadow max-w-3xl">
          <CardHeader><CardTitle className="text-base">Brand Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Company Logo (URL)">
              <div className="flex gap-2">
                <Input value={settings.company_logo || ""} onChange={(e) => update("company_logo", e.target.value)} placeholder="/adeara-logo.jpg" />
                <MediaPickerButton value={settings.company_logo || ""} onPick={(url) => update("company_logo", url)} />
              </div>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary Color"><div className="flex items-center gap-2"><input type="color" value={settings.primary_color || "#1565C0"} onChange={(e) => update("primary_color", e.target.value)} className="h-9 w-12 rounded border border-border" /><Input value={settings.primary_color || ""} onChange={(e) => update("primary_color", e.target.value)} /></div></Field>
              <Field label="Secondary Color"><div className="flex items-center gap-2"><input type="color" value={settings.secondary_color || "#FFFFFF"} onChange={(e) => update("secondary_color", e.target.value)} className="h-9 w-12 rounded border border-border" /><Input value={settings.secondary_color || ""} onChange={(e) => update("secondary_color", e.target.value)} /></div></Field>
              <Field label="Dark Color"><div className="flex items-center gap-2"><input type="color" value={settings.dark_color || "#0B1F3A"} onChange={(e) => update("dark_color", e.target.value)} className="h-9 w-12 rounded border border-border" /><Input value={settings.dark_color || ""} onChange={(e) => update("dark_color", e.target.value)} /></div></Field>
              <Field label="Light Color"><div className="flex items-center gap-2"><input type="color" value={settings.light_color || "#EAF3FF"} onChange={(e) => update("light_color", e.target.value)} className="h-9 w-12 rounded border border-border" /><Input value={settings.light_color || ""} onChange={(e) => update("light_color", e.target.value)} /></div></Field>
              <Field label="Text Color"><div className="flex items-center gap-2"><input type="color" value={settings.text_color || "#202B3C"} onChange={(e) => update("text_color", e.target.value)} className="h-9 w-12 rounded border border-border" /><Input value={settings.text_color || ""} onChange={(e) => update("text_color", e.target.value)} /></div></Field>
            </div>
            <Callout>
              Note: Changing colors here updates the database only. To apply new theme colors to the live site, edit the CSS variables in <code>src/app/globals.css</code> or wire them up via a theme injection script.
            </Callout>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save("Branding", [
                { key: "company_logo", category: "branding" },
                { key: "primary_color", category: "branding" },
                { key: "secondary_color", category: "branding" },
                { key: "dark_color", category: "branding" },
                { key: "light_color", category: "branding" },
                { key: "text_color", category: "branding" },
              ])} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* CONTACT */}
      <TabsContent value="contact">
        <Card className="card-shadow max-w-3xl">
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Phone Number"><Input value={settings.company_phone || ""} onChange={(e) => update("company_phone", e.target.value)} /></Field>
            <Field label="Country / Location"><Input value={settings.company_country || ""} onChange={(e) => update("company_country", e.target.value)} /></Field>
            <Field label="Full Address (optional)"><Input value={settings.company_address || ""} onChange={(e) => update("company_address", e.target.value)} /></Field>
            <Field label="Google Maps Embed URL (optional)"><Textarea rows={2} value={settings.google_maps_embed || ""} onChange={(e) => update("google_maps_embed", e.target.value)} placeholder="Paste the src URL from Google Maps > Share > Embed a map" /></Field>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save("Contact", [
                { key: "company_phone", category: "contact" },
                { key: "company_country", category: "contact" },
                { key: "company_address", category: "contact" },
                { key: "google_maps_embed", category: "contact" },
              ])} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SEO */}
      <TabsContent value="seo">
        <Card className="card-shadow max-w-3xl">
          <CardHeader><CardTitle className="text-base">SEO Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="SEO Title (page title)"><Input value={settings.seo_title || ""} onChange={(e) => update("seo_title", e.target.value)} /></Field>
            <Field label="SEO Description (meta description)"><Textarea rows={3} value={settings.seo_description || ""} onChange={(e) => update("seo_description", e.target.value)} /></Field>
            <Field label="SEO Keywords (comma separated)"><Input value={settings.seo_keywords || ""} onChange={(e) => update("seo_keywords", e.target.value)} /></Field>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save("SEO", [
                { key: "seo_title", category: "seo" },
                { key: "seo_description", category: "seo" },
                { key: "seo_keywords", category: "seo" },
              ])} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ABOUT CONTENT */}
      <TabsContent value="about">
        <Card className="card-shadow max-w-3xl">
          <CardHeader><CardTitle className="text-base">About Page Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="About Intro"><Textarea rows={4} value={settings.about_intro || ""} onChange={(e) => update("about_intro", e.target.value)} /></Field>
            <Field label="Our Story"><Textarea rows={5} value={settings.about_story || ""} onChange={(e) => update("about_story", e.target.value)} /></Field>
            <Field label="Our Mission"><Textarea rows={2} value={settings.about_mission || ""} onChange={(e) => update("about_mission", e.target.value)} /></Field>
            <Field label="Our Vision"><Textarea rows={2} value={settings.about_vision || ""} onChange={(e) => update("about_vision", e.target.value)} /></Field>
            <Field label="What Makes Us Different"><Textarea rows={4} value={settings.about_different || ""} onChange={(e) => update("about_different", e.target.value)} /></Field>
            <Field label="Our Values (JSON array of {title, description})">
              <Textarea rows={8} value={settings.about_values || ""} onChange={(e) => update("about_values", e.target.value)} className="font-mono text-xs" />
              <p className="text-xs text-foreground/50">Example: [{"{ \"title\": \"Innovation\", \"description\": \"...\" }"}]</p>
            </Field>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save("About", [
                { key: "about_intro", category: "about" },
                { key: "about_story", category: "about" },
                { key: "about_mission", category: "about" },
                { key: "about_vision", category: "about" },
                { key: "about_different", category: "about" },
                { key: "about_values", category: "about" },
              ])} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* FOOTER */}
      <TabsContent value="footer">
        <Card className="card-shadow max-w-3xl">
          <CardHeader><CardTitle className="text-base">Footer Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Footer Description"><Textarea rows={4} value={settings.footer_description || ""} onChange={(e) => update("footer_description", e.target.value)} /></Field>
            <Field label="Copyright Text (use {year} for current year)"><Input value={settings.footer_copyright || ""} onChange={(e) => update("footer_copyright", e.target.value)} /></Field>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save("Footer", [
                { key: "footer_description", category: "footer" },
                { key: "footer_copyright", category: "footer" },
              ])} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* EMAIL & MAINTENANCE */}
      <TabsContent value="email">
        <Card className="card-shadow max-w-3xl">
          <CardHeader><CardTitle className="text-base">Email Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Notification Email (submissions sent here)">
              <Input value={settings.notification_email || ""} onChange={(e) => update("notification_email", e.target.value)} placeholder="ananiya743@gmail.com" />
              <p className="text-xs text-foreground/50">All contact messages and project orders are sent to this email. This email is never shown publicly.</p>
            </Field>
            <Callout>
              <strong>SMTP setup:</strong> Email notifications require SMTP credentials in your <code>.env</code> file. Without SMTP, emails are logged to the console and EmailLog table. See <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USER</code>, <code>SMTP_PASS</code>, <code>SMTP_FROM_EMAIL</code>, <code>SMTP_FROM_NAME</code> in <code>.env.example</code>.
            </Callout>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save("Email", [{ key: "notification_email", category: "email" }])} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow max-w-3xl mt-4">
          <CardHeader><CardTitle className="text-base">Maintenance Mode</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={settings.maintenance_mode === "true"} onCheckedChange={(v) => update("maintenance_mode", v ? "true" : "false")} id="maintenance" />
              <Label htmlFor="maintenance" className="cursor-pointer">Enable maintenance mode (notifies visitors the site is under construction)</Label>
            </div>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save("Maintenance", [{ key: "maintenance_mode", category: "maintenance" }])} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Save</>}</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SECURITY */}
      <TabsContent value="security">
        <PasswordChangeCard />
      </TabsContent>
    </Tabs>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
      <AlertTriangle className="h-3.5 w-3.5 inline-block mr-1 mb-0.5" />
      {children}
    </div>
  );
}

function PasswordChangeCard() {
  const [data, setData] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (data.newPassword !== data.confirm) { toast.error("Passwords do not match"); return; }
    if (data.newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Password updated"); setData({ currentPassword: "", newPassword: "", confirm: "" }); } else toast.error(d.error || "Failed");
  }

  return (
    <Card className="card-shadow max-w-md">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Field label="Current Password"><Input type="password" value={data.currentPassword} onChange={(e) => setData({ ...data, currentPassword: e.target.value })} /></Field>
        <Field label="New Password (min 8 chars)"><Input type="password" value={data.newPassword} onChange={(e) => setData({ ...data, newPassword: e.target.value })} /></Field>
        <Field label="Confirm New Password"><Input type="password" value={data.confirm} onChange={(e) => setData({ ...data, confirm: e.target.value })} /></Field>
        <Button onClick={save} disabled={saving} className="bg-brand hover:bg-brand/90">{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1 h-4 w-4" /> Update Password</>}</Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  useEffect(() => {
    fetch("/api/admin/auth/seed-check")
      .then((r) => r.json())
      .then((d) => {
        setHasAdmin(!!d.hasAdmin);
        if (d.hasAdmin) router.replace("/admin/login");
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Setup failed.");
        return;
      }
      toast.success("Admin account created. Signing you in...");
      // Auto-sign in
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/admin");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">Loading...</div>;
  if (hasAdmin) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Initial Admin Setup</h1>
          <p className="mt-1 text-sm text-white/70">Create the first administrator account for ADEARA DEVELOPMENT.</p>
        </div>
        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-xl space-y-4">
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <strong>Security notice:</strong> This page is only available before any admin exists. After setup, it is permanently disabled. Please choose a strong, unique password.
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Administrator Name</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ADEARA Administrator" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@adeara.dev" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (min 8 characters)</Label>
            <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Strong password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Re-enter password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-brand hover:bg-brand/90">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : <><ShieldCheck className="mr-2 h-4 w-4" /> Create Admin Account</>}
          </Button>
          <div className="text-center text-xs text-foreground/60 pt-2">
            <Link href="/" className="text-brand hover:underline">Back to website</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2, Copy } from "lucide-react";

const SERVICES = [
  "Website Development",
  "Mobile Application Development",
  "Digital Marketing",
  "Other Custom Service",
];

const BUDGETS = ["< $1,000", "$1,000 – $3,000", "$3,000 – $7,000", "$7,000 – $15,000", "$15,000+", "Let's discuss"];

const TIMELINES = ["ASAP", "Within 1 month", "1 – 3 months", "3 – 6 months", "6+ months", "Flexible"];

export function OrderForm() {
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    country: "",
    service: "",
    description: "",
    budget: "",
    completionTime: "",
    requirements: "",
    company_url: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/public/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
      setReference(data.reference);
      toast.success(data.message || "Order submitted!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (reference) {
    return (
      <div className="rounded-xl border border-border bg-brand-light p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold text-brand-dark">Request received!</h3>
        <p className="mt-3 text-sm text-foreground/70 max-w-md mx-auto">
          Thank you for submitting your project request. Our team will review your details and get in touch with you soon.
        </p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-lg bg-white border border-border px-4 py-3">
          <span className="text-xs text-foreground/60">Your reference</span>
          <code className="text-sm font-mono font-bold text-brand">{reference}</code>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(reference); toast.success("Reference copied"); }}
            className="text-foreground/60 hover:text-brand"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6">
          <Button variant="outline" onClick={() => { setReference(null); setForm({ fullName: "", businessName: "", phone: "", email: "", country: "", service: "", description: "", budget: "", completionTime: "", requirements: "", company_url: "" }); }}>
            Submit another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input
        type="text"
        name="company_url"
        value={form.company_url}
        onChange={(e) => setForm({ ...form, company_url: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name *" required>
          <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} maxLength={100} />
        </Field>
        <Field label="Business / Company Name">
          <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} maxLength={150} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Phone Number *" required>
          <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={50} />
        </Field>
        <Field label="Email Address *" required>
          <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={120} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Country">
          <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} maxLength={80} placeholder="Ethiopia" />
        </Field>
        <Field label="Service Required *" required>
          <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
            <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
            <SelectContent>
              {SERVICES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Project Description *" required>
        <Textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={5000} placeholder="Describe your project, your goals, and any details that will help us understand what you need." />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Budget Range (optional)">
          <Select value={form.budget} onValueChange={(v) => setForm({ ...form, budget: v })}>
            <SelectTrigger><SelectValue placeholder="Select a range" /></SelectTrigger>
            <SelectContent>
              {BUDGETS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Expected Completion Time">
          <Select value={form.completionTime} onValueChange={(v) => setForm({ ...form, completionTime: v })}>
            <SelectTrigger><SelectValue placeholder="Select a timeline" /></SelectTrigger>
            <SelectContent>
              {TIMELINES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Additional Requirements">
        <Textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} maxLength={5000} placeholder="Any other details: integrations, languages, platforms, branding requirements, etc." />
      </Field>
      <Button type="submit" disabled={loading} className="w-full bg-brand hover:bg-brand/90 text-base">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Project Request</>}
      </Button>
    </form>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      {children}
    </div>
  );
}

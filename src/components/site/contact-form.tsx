"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function ContactForm({ services }: { services: { title: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    service: "",
    subject: "",
    message: "",
    company_url: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
      toast.success(data.message || "Message sent!");
      setSubmitted(true);
      setForm({ fullName: "", phone: "", email: "", service: "", subject: "", message: "", company_url: "" });
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-brand-light p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h3 className="text-xl font-bold text-brand-dark">Thank you!</h3>
        <p className="mt-2 text-sm text-foreground/70">
          Your message has been received. Our team will get back to you as soon as possible.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* honeypot */}
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
        <Field label="Full Name *">
          <Input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Your name"
            maxLength={100}
          />
        </Field>
        <Field label="Phone Number *">
          <Input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+251..."
            maxLength={50}
          />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email Address *">
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            maxLength={120}
          />
        </Field>
        <Field label="Service Interested In">
          <Select
            value={form.service}
            onValueChange={(v) => setForm({ ...form, service: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.title} value={s.title}>{s.title}</SelectItem>
              ))}
              <SelectItem value="Other">Other / Not sure</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Subject *">
        <Input
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="How can we help?"
          maxLength={200}
        />
      </Field>
      <Field label="Message *">
        <Textarea
          required
          rows={6}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your project or question..."
          maxLength={5000}
        />
      </Field>
      <Button type="submit" disabled={loading} className="w-full bg-brand hover:bg-brand/90">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      {children}
    </div>
  );
}

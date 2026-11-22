"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, Database, ShieldCheck, ArrowRight } from "lucide-react";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "checking" | "running" | "done" | "error">("idle");
  const [statusInfo, setStatusInfo] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    setStatus("checking");
    try {
      const res = await fetch("/api/setup", { cache: "no-store" });
      const data = await res.json();
      setStatusInfo(data);
      if (data.ok && data.database?.adminCount > 0) {
        setStatus("done");
        setResult({ alreadySeeded: true, message: "Database is already set up." });
      } else {
        setStatus("idle");
      }
    } catch (e: any) {
      setStatus("idle");
      setStatusInfo({ error: e.message });
    }
  }

  async function runSetup() {
    setStatus("running");
    setLogs(["Starting setup..."]);
    setError(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setResult(data);
      setLogs(data.log || []);
      if (data.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setError(data.error || "Setup failed");
      }
    } catch (e: any) {
      setStatus("error");
      setError(e.message);
      setLogs(prev => [...prev, `Network error: ${e.message}`]);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white mb-4">
            <Database className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">ADEARA DEVELOPMENT — Database Setup</h1>
          <p className="mt-2 text-sm text-white/70">
            One-time setup that creates all database tables and seeds the default site content.
          </p>
        </div>

        {/* Status card */}
        <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xl text-foreground">
          {status === "checking" && (
            <div className="flex items-center justify-center py-8 text-foreground/60">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Checking database status...
            </div>
          )}

          {status === "idle" && (
            <div className="space-y-4">
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <strong>Database is not yet set up.</strong> Click the button below to create all tables and seed the default content. This takes about 10 seconds.
              </div>
              {statusInfo?.error ? (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertCircle className="h-3.5 w-3.5 inline-block mr-1 mb-0.5" />
                  Connection check failed: {statusInfo.error}
                  <br />
                  <span className="text-red-600">Make sure your DATABASE_URL and DATABASE_PROVIDER env vars are set correctly in Vercel.</span>
                </div>
              ) : null}
              <button
                onClick={runSetup}
                disabled={status === "running"}
                className="w-full inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-all shadow-soft disabled:opacity-50"
              >
                <Database className="h-4 w-4 mr-2" />
                Set Up Database Now
              </button>
              <p className="text-xs text-foreground/60 text-center">
                This is safe to run — it won't overwrite any existing data.
              </p>
            </div>
          )}

          {status === "running" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
                <span>Setting up database... please wait</span>
              </div>
              <div className="rounded-md bg-foreground/5 p-3 max-h-48 overflow-y-auto scrollbar-thin font-mono text-xs space-y-0.5">
                {logs.map((l, i) => (
                  <div key={i} className={l.startsWith("✓") ? "text-emerald-700" : l.startsWith("❌") ? "text-red-600" : "text-foreground/70"}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "done" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
                <div>
                  <div className="font-semibold">Setup complete!</div>
                  <div className="text-xs text-foreground/60">{result?.message || "Your database is ready."}</div>
                </div>
              </div>

              {result?.adminEmail && (
                <div className="rounded-md bg-brand-light border border-brand/20 p-4 text-sm">
                  <div className="flex items-center gap-2 mb-2 text-brand">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-semibold">Admin Credentials</span>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                    <span className="text-foreground/60">Email:</span>
                    <code className="font-mono">{result.adminEmail}</code>
                    <span className="text-foreground/60">Password:</span>
                    <code className="font-mono">{"•".repeat(8)} (the one you set in SEED_ADMIN_PASSWORD)</code>
                  </div>
                  <div className="mt-3 text-xs text-amber-700">
                    ⚠️ Change this password immediately after your first login.
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-all"
                >
                  Go to Admin Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-brand-light transition-all"
                >
                  View Website
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <div className="font-semibold">Setup failed</div>
                  <div className="text-xs text-foreground/60">{error}</div>
                </div>
              </div>
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700 space-y-2">
                <div className="font-semibold">Common causes:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><code>DATABASE_URL</code> env var is missing or wrong in Vercel → Settings → Environment Variables</li>
                  <li><code>DATABASE_PROVIDER</code> env var is not set to <code>postgresql</code></li>
                  <li>Your Vercel Postgres database is not connected to your project (Vercel → Storage → connect)</li>
                </ul>
              </div>
              {logs.length > 0 && (
                <div className="rounded-md bg-foreground/5 p-3 max-h-48 overflow-y-auto scrollbar-thin font-mono text-xs space-y-0.5">
                  {logs.map((l, i) => (
                    <div key={i} className={l.startsWith("✓") ? "text-emerald-700" : l.startsWith("❌") ? "text-red-600" : "text-foreground/70"}>
                      {l}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={runSetup}
                className="w-full inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white/50">
          ADEARA DEVELOPMENT · Setup utility
        </div>
      </div>
    </div>
  );
}

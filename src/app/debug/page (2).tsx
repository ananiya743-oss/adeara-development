"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Database } from "lucide-react";

type DebugData = {
  timestamp: string;
  env: {
    DATABASE_URL_set: boolean;
    DATABASE_URL_starts_with_postgres: boolean;
    DATABASE_URL_starts_with_file: boolean;
    DATABASE_PROVIDER_set: boolean;
    DATABASE_PROVIDER_value: string;
    NEXTAUTH_SECRET_set: boolean;
    NEXTAUTH_URL_set: boolean;
    NEXTAUTH_URL_value: string;
    BLOB_READ_WRITE_TOKEN_set: boolean;
    SEED_ADMIN_EMAIL_set: boolean;
    SEED_ADMIN_PASSWORD_set: boolean;
  };
  tests: {
    databaseConnection?: { ok: boolean; navItemCount?: number; error?: string; code?: string };
    siteSettingTable?: string;
    adminUserTable?: string;
  };
  diagnosis: string[];
};

export default function DebugPage() {
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/debug", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white p-4">
      <div className="container max-w-3xl mx-auto py-12">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white mb-4">
            <Database className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">ADEARA DEVELOPMENT — Debug</h1>
          <p className="mt-2 text-sm text-white/70">
            Diagnostic info about your database connection and environment variables.
          </p>
        </div>

        <div className="rounded-2xl bg-white text-foreground p-6 md:p-8 shadow-xl space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8 text-foreground/60">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Checking database...
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 inline-block mr-1 mb-0.5" /> Could not reach /api/debug: {error}
            </div>
          )}

          {data && (
            <>
              {data.diagnosis.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/60 mb-3">Diagnosis</h3>
                  <div className="space-y-2">
                    {data.diagnosis.map((d, i) => {
                      const isOk = d.startsWith("✅");
                      const isWarn = d.startsWith("⚠️");
                      return (
                        <div
                          key={i}
                          className={`rounded-md p-3 text-sm flex items-start gap-2 ${
                            isOk
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                              : isWarn
                              ? "bg-amber-50 border border-amber-200 text-amber-700"
                              : "bg-red-50 border border-red-200 text-red-700"
                          }`}
                        >
                          {isOk ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                          <span>{d}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/60 mb-3">Database Connection</h3>
                {data.tests.databaseConnection?.ok ? (
                  <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Connected. NavItem count: <strong>{data.tests.databaseConnection.navItemCount}</strong></span>
                  </div>
                ) : (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 inline-block mr-1 mb-0.5" />
                    <strong>Connection failed:</strong>
                    <pre className="mt-2 text-xs whitespace-pre-wrap font-mono">{data.tests.databaseConnection?.error}</pre>
                    {data.tests.databaseConnection?.code && (
                      <p className="text-xs mt-1">Code: <code>{data.tests.databaseConnection.code}</code></p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/60 mb-3">Environment Variables</h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-brand-light">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Variable</th>
                        <th className="text-left px-3 py-2 font-medium">Value</th>
                        <th className="text-center px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <EnvRow label="DATABASE_URL" value={data.env.DATABASE_URL_set ? "(set)" : "(missing)"} ok={data.env.DATABASE_URL_set && data.env.DATABASE_URL_starts_with_postgres} />
                      <EnvRow label="DATABASE_PROVIDER" value={data.env.DATABASE_PROVIDER_value} ok={data.env.DATABASE_PROVIDER_value === "postgresql"} />
                      <EnvRow label="NEXTAUTH_SECRET" value={data.env.NEXTAUTH_SECRET_set ? "(set)" : "(missing)"} ok={data.env.NEXTAUTH_SECRET_set} />
                      <EnvRow label="NEXTAUTH_URL" value={data.env.NEXTAUTH_URL_value} ok={data.env.NEXTAUTH_URL_set} />
                      <EnvRow label="BLOB_READ_WRITE_TOKEN" value={data.env.BLOB_READ_WRITE_TOKEN_set ? "(set)" : "(missing)"} ok={data.env.BLOB_READ_WRITE_TOKEN_set} />
                      <EnvRow label="SEED_ADMIN_EMAIL" value={data.env.SEED_ADMIN_EMAIL_set ? "(set)" : "(missing)"} ok={data.env.SEED_ADMIN_EMAIL_set} />
                      <EnvRow label="SEED_ADMIN_PASSWORD" value={data.env.SEED_ADMIN_PASSWORD_set ? "(set)" : "(missing)"} ok={data.env.SEED_ADMIN_PASSWORD_set} />
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-foreground/50">
                  Note: Only the variable names and whether they're set are shown — actual secret values are never exposed.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                <button
                  onClick={load}
                  className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-brand-light transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Re-run diagnostic
                </button>
                <Link
                  href="/setup"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
                >
                  Go to Setup Page
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-brand-light transition-colors"
                >
                  View Site
                </Link>
              </div>

              <details className="pt-2 border-t border-border">
                <summary className="cursor-pointer text-xs text-foreground/60 hover:text-foreground">Show raw JSON</summary>
                <pre className="mt-2 rounded-md bg-foreground/5 p-3 text-xs font-mono overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
              </details>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-white/50">
          <p>Share this URL with support: <code className="bg-white/10 px-2 py-0.5 rounded">/debug</code></p>
        </div>
      </div>
    </div>
  );
}

function EnvRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <tr className={ok ? "" : "bg-red-50"}>
      <td className="px-3 py-2 font-mono text-xs">{label}</td>
      <td className="px-3 py-2 font-mono text-xs text-foreground/70">{value}</td>
      <td className="px-3 py-2 text-center">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 inline-block" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600 inline-block" />
        )}
      </td>
    </tr>
  );
}

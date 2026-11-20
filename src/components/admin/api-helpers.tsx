"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function useSave<T>(endpoint: string, method: "PUT" | "POST" = "PUT") {
  const [loading, setLoading] = useState(false);
  async function save(body: T, successMsg = "Saved") {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Save failed");
        return null;
      }
      toast.success(successMsg);
      return data;
    } catch {
      toast.error("Network error");
      return null;
    } finally {
      setLoading(false);
    }
  }
  return { save, loading };
}

export function SaveButton({ loading, label = "Save Changes" }: { loading: boolean; label?: string }) {
  return (
    <Button type="submit" disabled={loading} className="bg-brand hover:bg-brand/90">
      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> {label}</>}
    </Button>
  );
}

export async function apiGet<T = any>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.ok) return null;
    return data;
  } catch {
    return null;
  }
}

export async function apiDelete(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      toast.error(data.error || "Delete failed");
      return false;
    }
    toast.success("Deleted");
    return true;
  } catch {
    toast.error("Network error");
    return false;
  }
}

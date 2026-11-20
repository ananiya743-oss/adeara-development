"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Image, FolderKanban, Users, Mail, ShoppingBag,
  MessageSquare, Star, Settings, LogOut, Menu, X, Globe, FileImage,
  Phone, Sparkles, ListOrdered, ArrowRight, ShieldCheck
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/hero", label: "Hero / Banner", icon: Sparkles },
  { href: "/admin/navigation", label: "Navigation", icon: ListOrdered },
  { href: "/admin/about", label: "About Page", icon: FileImage },
  { href: "/admin/services", label: "Services", icon: Globe },
  { href: "/admin/projects", label: "Portfolio", icon: FolderKanban },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/why-choose", label: "Why Choose Us", icon: ShieldCheck },
  { href: "/admin/process", label: "Process", icon: ListOrdered },
  { href: "/admin/cta", label: "Call to Action", icon: ArrowRight },
  { href: "/admin/social", label: "Social Links", icon: Phone },
  { href: "/admin/footer", label: "Footer", icon: ListOrdered },
  { href: "/admin/media", label: "Media Library", icon: Image },
  { href: "/admin/activity", label: "Activity Log", icon: ListOrdered },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children, title, description, action }: {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-brand-light text-foreground">Loading...</div>;
  }
  if (!session) {
    if (typeof window !== "undefined") router.replace("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-light flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-white border-r border-border shrink-0 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white font-bold">A</div>
            <div className="text-sm font-bold text-brand-dark leading-tight">
              ADEARA
              <div className="text-[10px] font-medium text-foreground/50">Admin Dashboard</div>
            </div>
          </Link>
          <button className="lg:hidden p-1 text-foreground/60" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-2 py-4 space-y-0.5 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-brand text-white" : "text-foreground/80 hover:bg-brand-light hover:text-brand"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-2 bg-white">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open ? <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} /> : null}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-white/90 backdrop-blur flex items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden p-1 text-foreground/60" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold text-brand-dark truncate">{title}</h1>
              {description ? <p className="text-xs text-foreground/60 truncate hidden md:block">{description}</p> : null}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {action}
            <Link href="/" target="_blank" className="hidden md:inline-flex items-center gap-1 text-xs text-foreground/60 hover:text-brand">
              View Site <ArrowRight className="h-3 w-3" />
            </Link>
            <div className="text-xs text-foreground/60 hidden md:block">{(session.user as any)?.email}</div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

type NavItem = { id: string; label: string; href: string; isButton: boolean };

export default function PublicHeaderClient({
  logo,
  companyName,
  first,
  rest,
  linkItems,
  buttonItems,
}: {
  logo: string;
  companyName: string;
  first: string;
  rest: string;
  linkItems: NavItem[];
  buttonItems: NavItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled ? "bg-white/85 backdrop-blur-xl border-b border-border/80 shadow-soft" : "bg-transparent border-b border-transparent"}`}>
      <div className="container-page flex h-16 md:h-20 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative">
            <Image src={logo} alt={companyName} width={44} height={44} className="h-10 w-10 md:h-11 md:w-11 rounded-xl object-contain transition-transform group-hover:scale-105" priority />
            <div className="absolute inset-0 rounded-xl bg-brand/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
          <span className="font-semibold text-base md:text-lg tracking-tight" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>
            {first}
            {rest ? <span className="text-brand"> {rest}</span> : null}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {linkItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors group"
            >
              {item.label}
              <span className="absolute left-4 right-4 bottom-1 h-px bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          {buttonItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className="group inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition-all shadow-soft hover:shadow-premium hover:-translate-y-0.5"
            >
              {item.label}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/60 hover:bg-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-[88%] max-w-sm bg-white z-50 md:hidden shadow-premium flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <Image src={logo} alt={companyName} width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
                  <span className="font-semibold text-base tracking-tight" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>{companyName}</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-brand-light transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-5 space-y-1">
                {linkItems.map(item => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-foreground rounded-xl hover:bg-brand-light hover:text-brand transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-5 border-t border-border space-y-2">
                {buttonItems.map(item => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-soft"
                  >
                    {item.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

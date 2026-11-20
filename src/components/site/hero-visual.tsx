"use client";

import { motion } from "framer-motion";
import { Code2, Smartphone, Megaphone } from "lucide-react";

/**
 * A floating "code window" mockup for the hero section.
 * Apple/Stripe-style minimal preview that hints at the work we do.
 */
export function HeroVisual() {
  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[5/6] max-w-md mx-auto">
      {/* Glow behind */}
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/40 to-brand-light/20 blur-3xl scale-90" />

      {/* Main code window */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full rounded-2xl glass-dark border border-white/15 shadow-premium overflow-hidden"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex items-center gap-1.5 text-xs text-white/40">
            <Code2 className="h-3 w-3" />
            <span className="font-mono">adeara.dev</span>
          </div>
        </div>
        {/* Code lines */}
        <div className="p-5 font-mono text-[11px] leading-relaxed space-y-1.5">
          <CodeLine delay={0.6}>
            <span className="text-violet-300">const</span> <span className="text-sky-300">adeara</span> <span className="text-white/60">=</span> <span className="text-white/40">{"{"}</span>
          </CodeLine>
          <CodeLine delay={0.7} indent={1}>
            <span className="text-emerald-300">mission</span><span className="text-white/60">:</span> <span className="text-amber-200">'Build Your Online Presence'</span><span className="text-white/60">,</span>
          </CodeLine>
          <CodeLine delay={0.8} indent={1}>
            <span className="text-emerald-300">services</span><span className="text-white/60">:</span> <span className="text-white/40">[</span>
          </CodeLine>
          <CodeLine delay={0.9} indent={2}>
            <span className="text-amber-200">'Web'</span><span className="text-white/60">,</span> <span className="text-amber-200">'Mobile'</span><span className="text-white/60">,</span> <span className="text-amber-200">'Marketing'</span>
          </CodeLine>
          <CodeLine delay={1.0} indent={1}>
            <span className="text-white/40">]</span><span className="text-white/60">,</span>
          </CodeLine>
          <CodeLine delay={1.1} indent={1}>
            <span className="text-emerald-300">location</span><span className="text-white/60">:</span> <span className="text-amber-200">'Ethiopia'</span><span className="text-white/60">,</span>
          </CodeLine>
          <CodeLine delay={1.2} indent={1}>
            <span className="text-emerald-300">build</span><span className="text-white/60">:</span> <span className="text-violet-300">async</span> <span className="text-white/40">()</span> <span className="text-white/60">{"=>"}</span> <span className="text-sky-300">launch</span><span className="text-white/40">(</span><span className="text-amber-200">'excellence'</span><span className="text-white/40">)</span>
          </CodeLine>
          <CodeLine delay={1.3}>
            <span className="text-white/40">{'}'}</span>
          </CodeLine>
        </div>
      </motion.div>

      {/* Floating card 1 - Web */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -left-4 sm:-left-8 top-1/3 glass rounded-2xl shadow-premium p-3 pr-4 animate-float-slow"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-brand-dark">Web Development</div>
            <div className="text-[10px] text-foreground/60">Fast · Responsive · SEO</div>
          </div>
        </div>
      </motion.div>

      {/* Floating card 2 - Mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -right-3 sm:-right-6 top-12 glass rounded-2xl shadow-premium p-3 pr-4 animate-float-slower"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-white">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-brand-dark">Mobile Apps</div>
            <div className="text-[10px] text-foreground/60">iOS · Android</div>
          </div>
        </div>
      </motion.div>

      {/* Floating card 3 - Marketing */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-2 sm:right-8 bottom-12 glass rounded-2xl shadow-premium p-3 pr-4 animate-float-slow"
        style={{ animationDelay: "1s" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-brand-dark">Marketing</div>
            <div className="text-[10px] text-foreground/60">SEO · Social · Ads</div>
          </div>
        </div>
      </motion.div>

      {/* Stats badge bottom-left */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass rounded-full shadow-premium px-4 py-2"
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-brand-dark">Available for new projects</span>
        </div>
      </motion.div>
    </div>
  );
}

function CodeLine({ children, delay = 0, indent = 0 }: { children: React.ReactNode; delay?: number; indent?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      style={{ paddingLeft: `${indent * 1.2}rem` }}
    >
      {children}
    </motion.div>
  );
}

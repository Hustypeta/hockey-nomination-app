"use client";

import { ArrowRight, Plus, Sparkles } from "lucide-react";

export function CommunityHero({
  onCreateClick,
  onBrowseClick,
}: {
  onCreateClick: () => void;
  onBrowseClick: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.85]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 15% 0%, rgba(0,180,255,0.24), transparent 55%), radial-gradient(ellipse 90% 75% at 86% 12%, rgba(255,45,85,0.16), transparent 55%), linear-gradient(180deg, rgba(10,15,28,0.95) 0%, rgba(5,7,15,0.55) 42%, rgba(5,7,15,0) 100%)",
        }}
      />
      {/* Grain / ice pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 10px)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Novinka · Komunita
            </p>
            <h1 className="mt-3 font-sans text-3xl font-black tracking-tight text-white sm:text-4xl">
              HokejLineup Komunita
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/70 sm:text-lg">
              Diskutuj, sdílej sestavy, memy a analýzy s ostatními fanoušky. Jedno místo, kde to
              hokejem žije každý den.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={onCreateClick}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff2d55] to-[#c8102e] px-5 py-3 text-sm font-extrabold text-white shadow-[0_18px_60px_rgba(255,45,85,0.18)] transition hover:brightness-110 active:translate-y-px"
            >
              <Plus className="h-4 w-4 transition group-hover:rotate-12" />
              Vytvořit příspěvek
            </button>
            <button
              type="button"
              onClick={onBrowseClick}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white/90 transition hover:border-cyan-400/25 hover:bg-cyan-500/10"
            >
              Procházet diskuze
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


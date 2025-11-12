"use client";

import { useMemo } from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@/lib/auth";
import { NAV_SECTIONS } from "./navigation";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { TopBar } from "@/components/layout/TopBar";
import { SideNav } from "@/components/layout/SideNav";
import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sectionIds = useMemo(() => NAV_SECTIONS.map((section) => section.id), []);
  const { activeId, scrollToSection } = useSectionObserver(sectionIds);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SignedOut>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 text-white">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-semibold">Welcome to ChordLine</h1>
            <p className="mt-3 text-sm text-slate-200">
              Sign in to manage your bands, plan events, share song ideas, and keep earnings on track.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <SignInButton mode="modal">
              <button className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:shadow-lg">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full border border-white/40 px-6 py-2 text-sm font-semibold text-white transition hover:border-white">
                Create an account
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex h-screen flex-col">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <SideNav sections={NAV_SECTIONS} activeId={activeId} onNavigate={scrollToSection} />
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-10">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-24 md:gap-8">
                {children}
              </div>
            </main>
          </div>
          <BottomNav sections={NAV_SECTIONS} activeId={activeId} onNavigate={scrollToSection} />
        </div>
      </SignedIn>
    </div>
  );
}

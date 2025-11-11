"use client";

import type { NavigationSection } from "./navigation";

export function BottomNav({ sections, activeId, onNavigate }: {
  sections: NavigationSection[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-3 gap-1 px-2 py-2">
        {sections.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onNavigate(id)}
                className={`${
                  isActive ? "text-indigo-600" : "text-slate-500"
                } flex w-full flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition hover:bg-slate-100`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import type { NavigationSection } from "./navigation";

export function SideNav({ sections, activeId, onNavigate }: {
  sections: NavigationSection[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-3 py-6 md:flex">
      <ul className="flex flex-col gap-1">
        {sections.map(({ id, label, description, icon: Icon }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onNavigate(id)}
                className={`${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                } group flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition`}
              >
                <Icon className={`h-5 w-5 flex-none ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs text-slate-500">{description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

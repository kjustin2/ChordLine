import type { ReactNode } from "react";

export function Card({ title, action, children, id }: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900 md:text-lg">{title}</h2>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
      <div className="mt-4 space-y-4 text-sm text-slate-600 md:text-base">
        {children}
      </div>
    </section>
  );
}

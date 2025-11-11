import type { ReactNode } from "react";

export function DataState({
  loading,
  error,
  isEmpty,
  empty,
  children,
}: {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  empty: ReactNode;
  children: ReactNode;
}) {
  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (isEmpty) {
    return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">{empty}</div>;
  }

  return <>{children}</>;
}

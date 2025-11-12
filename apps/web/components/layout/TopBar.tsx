"use client";

import { UserButton } from "@/lib/auth";
import { useBandContext, type BandContextValue } from "@/providers/BandProvider";

export function TopBar() {
  const { bands, activeBandId, setActiveBandId, loading, error } = useBandContext();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-slate-900">ChordLine</span>
          <span className="text-xs text-slate-500">Band operations at a glance</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <BandSwitcher
            bands={bands}
            activeBandId={activeBandId}
            setActiveBandId={setActiveBandId}
            loading={loading}
            error={error}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="sm:hidden">
          <BandSwitcher
            bands={bands}
            activeBandId={activeBandId}
            setActiveBandId={setActiveBandId}
            loading={loading}
            error={error}
          />
        </div>
        <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
      </div>
    </header>
  );
}

type BandSwitcherProps = {
  bands: BandContextValue["bands"];
  activeBandId: string | null;
  setActiveBandId: (id: string) => void;
  loading: boolean;
  error: string | null;
};

function BandSwitcher({ bands, activeBandId, setActiveBandId, loading, error }: BandSwitcherProps) {
  if (loading) {
    return <span className="text-xs text-slate-500">Loading bands…</span>;
  }

  if (error) {
    return <span className="text-xs text-red-500">{error}</span>;
  }

  if (!bands.length) {
    return <span className="text-xs text-slate-500">Create your first band below</span>;
  }

  return (
    <label className="flex items-center gap-2 text-xs text-slate-600">
      Band
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={activeBandId ?? ""}
        onChange={(event) => setActiveBandId(event.target.value)}
      >
        {bands.map((band) => (
          <option key={band.id} value={band.id}>
            {band.name}
          </option>
        ))}
      </select>
    </label>
  );
}

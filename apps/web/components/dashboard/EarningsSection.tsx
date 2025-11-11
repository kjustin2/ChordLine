"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { Earning } from "@chordline/types";
import { useBandContext } from "@/providers/BandProvider";
import { useApi } from "@/lib/useApi";
import { earningsApi, type CreateEarningInput } from "@/lib/apiClient";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "../common/Card";
import { DataState } from "../common/DataState";
import { Button } from "../common/Button";

export function EarningsSection() {
  const { activeBandId } = useBandContext();
  const { apiAuthed } = useApi();

  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBandId) {
      setEarnings([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
  const response = await earningsApi.listForBand(apiAuthed, activeBandId);
        if (!cancelled) {
          setEarnings(response ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load earnings");
          setEarnings([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiAuthed, activeBandId]);

  const totals = useMemo(() => {
    if (!earnings.length) {
      return { currency: "USD", amount: "0" };
    }
    const currency = earnings[0].currency ?? "USD";
    const sum = earnings.reduce((acc, earning) => acc + Number.parseFloat(earning.totalAmount), 0);
    return { currency, amount: sum.toFixed(2) };
  }, [earnings]);

  const handleCreate = async (payload: CreateEarningInput) => {
    if (!activeBandId) return false;

    try {
      const response = await earningsApi.createForBand(apiAuthed, activeBandId, payload);
      if (!response) return false;
      setEarnings((prev) => [response, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create earning");
      return false;
    }
  };

  return (
    <section id="earnings" className="space-y-6 md:space-y-8">
      <Card title="Earnings" action={<NewEarningForm disabled={!activeBandId} onCreate={handleCreate} />}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Lifetime total</p>
            <p className="text-3xl font-semibold text-indigo-600">{formatCurrency(totals.amount, totals.currency)}</p>
          </div>
          <p className="text-sm text-slate-500">Track guarantees, merch, and other payouts.</p>
        </div>
        <DataState
          loading={loading}
          error={error}
          isEmpty={!earnings.length}
          empty={activeBandId ? "Add an earning to visualize cashflow." : "Select a band to view earnings."}
        >
          <ul className="flex flex-col gap-3">
            {earnings.map((earning) => (
              <li key={earning.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">{formatCurrency(earning.totalAmount, earning.currency ?? "USD")}</span>
                  <span className="text-xs text-slate-500">{formatDate(earning.createdAt)}</span>
                </div>
                {earning.description ? <p className="mt-2 text-xs text-slate-600">{earning.description}</p> : null}
              </li>
            ))}
          </ul>
        </DataState>
      </Card>
    </section>
  );
}

type NewEarningFormProps = {
  onCreate: (payload: CreateEarningInput) => Promise<boolean>;
  disabled: boolean;
};

function NewEarningForm({ onCreate, disabled }: NewEarningFormProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!amount.trim()) {
      setError("Amount is required");
      return;
    }

    setSubmitting(true);
    const ok = await onCreate({ totalAmount: amount.trim(), currency: currency.trim() || undefined, description: description.trim() || undefined });
    setSubmitting(false);

    if (!ok) {
      setError("Unable to save earning");
      return;
    }

    setAmount("");
    setDescription("");
    setError(null);
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} disabled={disabled}>
        Log earning
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Log earning</span>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      <label className="text-xs text-slate-500">
        Amount
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="1200.00"
        />
      </label>
      <label className="text-xs text-slate-500">
        Currency
        <input
          value={currency}
          onChange={(event) => setCurrency(event.target.value.toUpperCase())}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </label>
      <label className="text-xs text-slate-500">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Guarantee from Spring Showcase"
        />
      </label>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <div className="flex justify-end">
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

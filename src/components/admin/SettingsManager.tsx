"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import Skeleton from "./ui/Skeleton";
import { useToast } from "./ui/ToastProvider";

const DAYS: { key: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat"; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export default function SettingsManager() {
  const { showToast } = useToast();
  const status = useQuery(api.settings.getOrderingStatus);
  const update = useMutation(api.settings.updateOrderingSettings);
  const [saving, setSaving] = useState(false);

  if (status === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { settings } = status;

  async function toggleManualClosed() {
    setSaving(true);
    try {
      await update({ manuallyClosed: !settings.manuallyClosed, weeklySchedule: settings.weeklySchedule });
      showToast(!settings.manuallyClosed ? "Ordering paused." : "Ordering resumed.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleDay(day: (typeof DAYS)[number]["key"]) {
    setSaving(true);
    try {
      await update({
        manuallyClosed: settings.manuallyClosed,
        weeklySchedule: { ...settings.weeklySchedule, [day]: !settings.weeklySchedule[day] },
      });
      showToast("Schedule updated.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Control when customers can place orders on the site.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Ordering right now</h2>
            <p className="mt-1 text-sm text-slate-600">
              {status.isOpenNow ? "Customers can place orders." : "Ordering is currently closed to customers."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleManualClosed}
            disabled={saving}
            className={`rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
              settings.manuallyClosed
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            {settings.manuallyClosed ? "Closed — click to reopen" : "Open — click to pause orders"}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Weekly schedule</h2>
        <p className="mt-1 text-sm text-slate-500">Turn off any day you&apos;re not taking orders — it repeats every week.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {DAYS.map((day) => (
            <label
              key={day.key}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {day.label}
              <input
                type="checkbox"
                checked={settings.weeklySchedule[day.key]}
                onChange={() => toggleDay(day.key)}
                disabled={saving}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

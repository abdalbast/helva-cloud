"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAppQuery, useAppMutation } from "@/lib/app-data";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, Clock, CheckCircle, AlarmClock } from "lucide-react";
import Link from "next/link";

type FollowUp = Record<string, unknown> & {
  _id: string;
  description: string;
  dueAt: string;
  status: string;
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-sunshine-700" />,
  done: <CheckCircle className="h-4 w-4 text-green-600" />,
  snoozed: <AlarmClock className="h-4 w-4 text-foreground/40" />,
};

const fields: FieldDef[] = [
  { name: "description", label: "Description", required: true },
  { name: "dueAt", label: "Due Date", type: "date", required: true },
  { name: "status", label: "Status", type: "select", options: [
    { value: "pending", label: "Pending" },
    { value: "done", label: "Done" },
    { value: "snoozed", label: "Snoozed" },
  ]},
];

export default function FollowUpsPage() {
  const followUps = useAppQuery(api.followUps.list, "followUps") ?? [];
  const createFollowUp = useAppMutation(api.followUps.create, "followUps", "create");
  const updateFollowUp = useAppMutation(api.followUps.update, "followUps", "update");

  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({ status: "pending" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({ status: "pending" });
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await createFollowUp({ description: formValues.description, dueAt: formValues.dueAt, status: formValues.status as "pending" | "done" | "snoozed" });
      setShowForm(false);
      setFormValues({ status: "pending" });
    } catch {
      setError("Follow-up could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setError(null);
    try {
      await updateFollowUp({ id: id as Id<"followUps">, status: status as "pending" | "done" | "snoozed" });
    } catch {
      setError("Follow-up status could not be updated. Please try again.");
    }
  };

  const filtered = filter === "all" ? followUps : followUps.filter((f) => f.status === filter);

  return (
    <div>
      <div>
        <Link href="/app/crm" className="text-caption text-foreground/50 hover:text-mistral-orange transition">
          ← CRM
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <h1 className="text-card-title">Follow-ups</h1>
          <button
            onClick={() => { setFormValues({ status: "pending" }); setShowForm(true); }}
            className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition"
          >
            <Plus className="h-4 w-4" /> Add Follow-up
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {["all", "pending", "done", "snoozed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-[2px] px-3 py-1.5 text-caption capitalize transition ${filter === s ? "border border-sunshine-700/30 bg-surface-cream text-foreground" : "border border-foreground/10 text-foreground/50 hover:bg-surface-cream/50"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {error ? (
          <div className="rounded-[2px] border border-mistral-orange/20 bg-mistral-orange/10 px-3 py-2 text-sm text-mistral-orange">
            {error}
          </div>
        ) : null}
        {filtered.length === 0 && (
          <p className="text-body text-foreground/40">No follow-ups.</p>
        )}
        {filtered.map((f) => (
          <div key={f._id} className="flex items-center gap-3 rounded-[2px] border border-foreground/10 bg-surface-pure p-3 shadow-golden">
            {statusIcons[f.status] ?? <Clock className="h-4 w-4" />}
            <div className="flex-1">
              <span className="text-sm">{f.description}</span>
              <span className="ml-2 text-caption text-foreground/40">Due: {new Date(f.dueAt).toLocaleDateString()}</span>
            </div>
            {f.status === "pending" && (
              <div className="flex gap-1">
                <button onClick={() => updateStatus(f._id, "done")} className="text-caption text-green-600 hover:underline">Done</button>
                <button onClick={() => updateStatus(f._id, "snoozed")} className="text-caption text-foreground/50 hover:underline">Snooze</button>
              </div>
            )}
            {f.status === "snoozed" && (
              <button onClick={() => updateStatus(f._id, "pending")} className="text-caption text-sunshine-700 hover:underline">Reopen</button>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog
          title="New Follow-up"
          fields={fields}
          values={formValues}
          onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

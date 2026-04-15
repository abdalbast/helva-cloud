"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAppQuery, useAppMutation } from "@/lib/app-data";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import Link from "next/link";
import { Plus } from "lucide-react";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"] as const;
type Stage = typeof STAGES[number];

type Deal = {
  _id: string;
  title: string;
  value: number;
  stage: Stage;
  probability: number;
  closeDate: string | null;
  companyName: string | null;
  contactName: string | null;
  notes: string | null;
};

type DealFormValues = {
  title: string;
  value?: string;
  stage?: Stage;
  probability?: string;
  closeDate?: string;
  notes?: string;
};


const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "value", label: "Value (£)", type: "number" },
  { name: "stage", label: "Stage", type: "select", options: STAGES.map((s) => ({ value: s, label: s.replace("_", " ") })) },
  { name: "probability", label: "Probability %", type: "number" },
  { name: "closeDate", label: "Close Date", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function DealsPage() {
  const deals = useAppQuery(api.deals.list, "deals") ?? [];
  const createDeal = useAppMutation(api.deals.create, "deals", "create");
  const updateDeal = useAppMutation(api.deals.update, "deals", "update");
  const removeDeal = useAppMutation(api.deals.remove, "deals", "remove");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<DealFormValues>({ title: "", stage: "lead" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({ title: "", stage: "lead" });
      setEditId(null);
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formValues, value: formValues.value ? Number(formValues.value) : undefined, probability: formValues.probability ? Number(formValues.probability) : undefined };
      if (editId) {
        await updateDeal({ id: editId as Id<"deals">, ...payload });
      } else {
        await createDeal({ ...payload });
      }
      setShowForm(false);
      setEditId(null);
    } catch {
      setError("Deal could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (d: Deal) => {
    setFormValues({
      title: d.title,
      value: String(d.value),
      stage: d.stage,
      probability: String(d.probability),
      closeDate: d.closeDate ?? "",
      notes: d.notes ?? "",
    });
    setEditId(d._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deal?")) return;
    setError(null);
    try {
      await removeDeal({ id: id as Id<"deals"> });
    } catch {
      setError("Deal could not be deleted. Please try again.");
    }
  };

  const byStage = STAGES.map((stage) => ({
    stage,
    deals: deals.filter((d) => d.stage === stage),
    total: deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + Number(d.value), 0),
  }));

  return (
    <div>
      <div>
        <Link href="/app/crm" className="text-caption text-foreground/50 hover:text-mistral-orange transition">
          ← CRM
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <h1 className="text-card-title">Deals Pipeline</h1>
          <button
          onClick={() => { setFormValues({ title: "", stage: "lead" }); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition"
        >
          <Plus className="h-4 w-4" /> Add Deal
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-[2px] border border-mistral-orange/20 bg-mistral-orange/10 px-3 py-2 text-sm text-mistral-orange">
          {error}
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {byStage.map(({ stage, deals: stageDeals, total }) => (
          <div key={stage} className="rounded-[2px] border border-foreground/10 bg-surface-cream/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-caption uppercase tracking-wide text-foreground/60 capitalize">{stage.replace("_", " ")}</span>
              <span className="text-caption text-foreground/40">{stageDeals.length}</span>
            </div>
            <div className="text-caption mt-1 text-sunshine-700">£{total.toLocaleString()}</div>
            <div className="mt-2 space-y-2">
              {stageDeals.map((d) => (
                <div key={d._id} className="rounded-[2px] border border-foreground/10 bg-surface-pure p-2 shadow-golden">
                  <button onClick={() => openEdit(d as Deal)} className="w-full text-left">
                    <div className="text-sm">{d.title}</div>
                    <div className="text-caption text-foreground/50">£{Number(d.value).toLocaleString()}</div>
                    {d.companyName && <div className="text-caption text-sunshine-700">{d.companyName}</div>}
                  </button>
                  <button onClick={() => handleDelete(d._id)} className="mt-1 text-caption text-foreground/40 hover:text-mistral-orange">Delete</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog
          title={editId ? "Edit Deal" : "New Deal"}
          fields={fields}
          values={formValues}
          onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditId(null); }}
          loading={loading}
        />
      )}
    </div>
  );
}

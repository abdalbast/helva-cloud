"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, PenLine } from "lucide-react";

const fields: FieldDef[] = [
  { name: "name", label: "Campaign Name", required: true },
  { name: "channel", label: "Channel", placeholder: "e.g. blog, email, social" },
  { name: "brief", label: "Brief", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "in_progress", label: "In Progress" },
    { value: "published", label: "Published" },
    { value: "completed", label: "Completed" },
  ] },
  { name: "startDate", label: "Start Date", type: "date" },
  { name: "endDate", label: "End Date", type: "date" },
];

export default function ContentPage() {
  const campaigns = useQuery(api.contentCampaigns.list) ?? [];
  const createCampaign = useMutation(api.contentCampaigns.create);
  const updateCampaign = useMutation(api.contentCampaigns.update);
  const removeCampaign = useMutation(api.contentCampaigns.remove);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({ status: "draft" });
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({ status: "draft" });
      setEditId(null);
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const status = formValues.status as "draft" | "in_progress" | "published" | "completed" | undefined;
      if (editId) {
        await updateCampaign({ id: editId as Id<"contentCampaigns">, name: formValues.name, channel: formValues.channel || undefined, brief: formValues.brief || undefined, status, startDate: formValues.startDate || undefined, endDate: formValues.endDate || undefined });
      } else {
        await createCampaign({ name: formValues.name, channel: formValues.channel || undefined, brief: formValues.brief || undefined, status, startDate: formValues.startDate || undefined, endDate: formValues.endDate || undefined });
      }
      setShowForm(false);
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    await removeCampaign({ id: id as Id<"contentCampaigns"> });
  };

  const openEdit = (c: Record<string, unknown>) => {
    setFormValues({ name: c.name as string, channel: (c.channel as string) ?? "", brief: (c.brief as string) ?? "", status: (c.status as string) ?? "", startDate: (c.startDate as string)?.slice(0, 10) ?? "", endDate: (c.endDate as string)?.slice(0, 10) ?? "" });
    setEditId(c._id as string);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">Content Planner</h1>
        <button onClick={() => { setFormValues({ status: "draft" }); setEditId(null); setShowForm(true); }} className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {campaigns.length === 0 && <p className="text-body text-foreground/40">No campaigns yet.</p>}
        {campaigns.map((c) => (
          <div key={c._id} className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenLine className="h-4 w-4 text-sunshine-700" />
                <span className="text-sm font-normal">{c.name}</span>
                {c.channel && <span className="rounded-[2px] bg-surface-cream px-2 py-0.5 text-caption">{c.channel}</span>}
                <span className="rounded-[2px] bg-surface-cream px-2 py-0.5 text-caption capitalize">{c.status}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-caption text-foreground/50 hover:text-mistral-orange">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="text-caption text-foreground/50 hover:text-mistral-orange">Delete</button>
              </div>
            </div>
            {c.brief && <p className="mt-2 text-caption text-foreground/60 line-clamp-2">{c.brief}</p>}
            {(c.startDate || c.endDate) && (
              <p className="mt-1 text-caption text-foreground/40">
                {c.startDate ? new Date(c.startDate).toLocaleDateString() : "?"} → {c.endDate ? new Date(c.endDate).toLocaleDateString() : "?"}
              </p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog title={editId ? "Edit Campaign" : "New Campaign"} fields={fields} values={formValues} onChange={(n, v) => setFormValues((p) => ({ ...p, [n]: v }))} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditId(null); }} loading={loading} />
      )}
    </div>
  );
}

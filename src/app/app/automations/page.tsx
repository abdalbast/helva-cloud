"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, Zap, Pause, AlertTriangle, Trash2 } from "lucide-react";

const statusIcons: Record<string, React.ReactNode> = {
  active: <Zap className="h-4 w-4 text-green-600" />,
  paused: <Pause className="h-4 w-4 text-sunshine-700" />,
  error: <AlertTriangle className="h-4 w-4 text-mistral-orange" />,
};

const fields: FieldDef[] = [
  { name: "name", label: "Name", required: true },
  { name: "trigger", label: "Trigger", required: true, placeholder: "e.g. new_contact, deal_stage_change" },
  { name: "action", label: "Action", required: true, placeholder: "e.g. send_email, create_task" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "error", label: "Error" },
  ]},
];

export default function AutomationsPage() {
  const automations = useQuery(api.automations.list) ?? [];
  const createAutomation = useMutation(api.automations.create);
  const updateAutomation = useMutation(api.automations.update);
  const removeAutomation = useMutation(api.automations.remove);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({ status: "active" });
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({ status: "active" });
      setEditId(null);
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const status = formValues.status as "active" | "paused" | "error";
      if (editId) {
        await updateAutomation({ id: editId as Id<"automations">, name: formValues.name, trigger: formValues.trigger, action: formValues.action, status });
      } else {
        await createAutomation({ name: formValues.name, trigger: formValues.trigger, action: formValues.action, status });
      }
      setShowForm(false);
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this automation?")) return;
    await removeAutomation({ id: id as Id<"automations"> });
  };

  const openEdit = (a: Record<string, unknown>) => {
    setFormValues({ name: a.name as string, trigger: a.trigger as string, action: a.action as string, status: a.status as string });
    setEditId(a._id as string);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">Automations</h1>
        <button onClick={() => { setFormValues({ status: "active" }); setEditId(null); setShowForm(true); }} className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
          <Plus className="h-4 w-4" /> New Automation
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {automations.length === 0 && <p className="text-body text-foreground/40">No automations yet.</p>}
        {automations.map((a) => (
          <div key={a._id} className="flex items-center gap-4 rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
            {statusIcons[a.status] ?? <Zap className="h-4 w-4" />}
            <div className="flex-1">
              <div className="text-sm font-normal">{a.name}</div>
              <div className="text-caption text-foreground/50">
                <span className="text-foreground/70">When:</span> {a.trigger} → <span className="text-foreground/70">Do:</span> {a.action}
              </div>
            </div>
            <div className="text-right">
              <div className="text-caption text-foreground/40">{a.runCount} runs</div>
              {a.lastRunAt && <div className="text-caption text-foreground/30">Last: {new Date(a.lastRunAt).toLocaleDateString()}</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(a)} className="text-caption text-foreground/50 hover:text-mistral-orange">Edit</button>
              <button onClick={() => handleDelete(a._id)} className="text-foreground/30 hover:text-mistral-orange"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog title={editId ? "Edit Automation" : "New Automation"} fields={fields} values={formValues} onChange={(n, v) => setFormValues((p) => ({ ...p, [n]: v }))} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditId(null); }} loading={loading} />
      )}
    </div>
  );
}

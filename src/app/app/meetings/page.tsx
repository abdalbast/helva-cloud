"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAppQuery, useAppMutation } from "@/lib/app-data";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, Calendar } from "lucide-react";

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "notes", label: "Notes", type: "textarea" },
  { name: "decisions", label: "Decisions", type: "textarea" },
  { name: "followUps", label: "Follow-ups", type: "textarea" },
];

export default function MeetingsPage() {
  const meetings = useAppQuery(api.meetings.list, "meetings") ?? [];
  const createMeeting = useAppMutation(api.meetings.create, "meetings", "create");
  const updateMeeting = useAppMutation(api.meetings.update, "meetings", "update");
  const removeMeeting = useAppMutation(api.meetings.remove, "meetings", "remove");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({});
      setEditId(null);
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editId) {
        await updateMeeting({ id: editId as Id<"meetings">, title: formValues.title, date: formValues.date, notes: formValues.notes || undefined, decisions: formValues.decisions || undefined, followUps: formValues.followUps || undefined });
      } else {
        await createMeeting({ title: formValues.title, date: formValues.date, notes: formValues.notes || undefined, decisions: formValues.decisions || undefined, followUps: formValues.followUps || undefined });
      }
      setShowForm(false);
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this meeting?")) return;
    await removeMeeting({ id: id as Id<"meetings"> });
  };

  const openEdit = (m: Record<string, unknown>) => {
    setFormValues({ title: m.title as string, date: (m.date as string)?.slice(0, 10) ?? "", notes: (m.notes as string) ?? "", decisions: (m.decisions as string) ?? "", followUps: (m.followUps as string) ?? "" });
    setEditId(m._id as string);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">Meeting Minutes</h1>
        <button onClick={() => { setFormValues({}); setEditId(null); setShowForm(true); }} className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
          <Plus className="h-4 w-4" /> New Meeting
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {meetings.length === 0 && <p className="text-body text-foreground/40">No meetings yet.</p>}
        {meetings.map((m) => (
          <div key={m._id} className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sunshine-700" />
                <span className="text-sm font-normal">{m.title}</span>
                <span className="text-caption text-foreground/40">{new Date(m.date).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(m)} className="text-caption text-foreground/50 hover:text-mistral-orange">Edit</button>
                <button onClick={() => handleDelete(m._id)} className="text-caption text-foreground/50 hover:text-mistral-orange">Delete</button>
              </div>
            </div>
            {m.notes && <p className="mt-2 text-caption text-foreground/60">{m.notes}</p>}
            {m.decisions && <p className="mt-1 text-caption"><span className="text-foreground/50">Decisions:</span> {m.decisions}</p>}
            {m.followUps && <p className="mt-1 text-caption"><span className="text-sunshine-700">Follow-ups:</span> {m.followUps}</p>}
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog title={editId ? "Edit Meeting" : "New Meeting"} fields={fields} values={formValues} onChange={(n, v) => setFormValues((p) => ({ ...p, [n]: v }))} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditId(null); }} loading={loading} />
      )}
    </div>
  );
}

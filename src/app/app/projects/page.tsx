"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAppQuery, useAppMutation } from "@/lib/app-data";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, FolderKanban } from "lucide-react";
import Link from "next/link";

const fields: FieldDef[] = [
  { name: "name", label: "Name", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "planning", label: "Planning" },
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]},
  { name: "startDate", label: "Start Date", type: "date" },
  { name: "endDate", label: "End Date", type: "date" },
];

const statusColors: Record<string, string> = {
  planning: "bg-surface-cream text-foreground/70",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  on_hold: "bg-sunshine-300/30 text-sunshine-700",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-foreground/5 text-foreground/40",
};

export default function ProjectsPage() {
  const projects = useAppQuery(api.projects.list, "projects") ?? [];
  const createProject = useAppMutation(api.projects.create, "projects", "create");
  const updateProject = useAppMutation(api.projects.update, "projects", "update");
  const removeProject = useAppMutation(api.projects.remove, "projects", "remove");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({ status: "planning" });
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({ status: "planning" });
      setEditId(null);
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const status = formValues.status as "planning" | "active" | "on_hold" | "completed" | "cancelled";
      if (editId) {
        await updateProject({ id: editId as Id<"projects">, name: formValues.name, description: formValues.description || undefined, status, startDate: formValues.startDate || undefined, endDate: formValues.endDate || undefined });
      } else {
        await createProject({ name: formValues.name, description: formValues.description || undefined, status, startDate: formValues.startDate || undefined, endDate: formValues.endDate || undefined });
      }
      setShowForm(false);
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await removeProject({ id: id as Id<"projects"> });
  };

  const openEdit = (p: Record<string, unknown>) => {
    setFormValues({ name: p.name as string, description: (p.description as string) ?? "", status: p.status as string, startDate: (p.startDate as string)?.slice(0, 10) ?? "", endDate: (p.endDate as string)?.slice(0, 10) ?? "" });
    setEditId(p._id as string);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">Projects</h1>
        <button onClick={() => { setFormValues({ status: "planning" }); setEditId(null); setShowForm(true); }} className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && <p className="text-body text-foreground/40 sm:col-span-2 lg:col-span-3">No projects yet.</p>}
        {projects.map((p) => (
          <div key={p._id} className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:border-sunshine-700/30">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-sunshine-700" />
              <span className="text-sm font-normal">{p.name}</span>
            </div>
            <div className="mt-2">
              <span className={`rounded-[2px] px-2 py-0.5 text-caption capitalize ${statusColors[p.status] ?? ""}`}>{(p.status as string).replace("_", " ")}</span>
            </div>
            {p.description && <p className="mt-2 text-caption text-foreground/60 line-clamp-2">{p.description}</p>}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="text-caption text-foreground/50 hover:text-mistral-orange">Edit</button>
                <button onClick={() => handleDelete(p._id)} className="text-caption text-foreground/50 hover:text-mistral-orange">Delete</button>
              </div>
              <Link href={`/app/board?project=${p._id}`} className="text-caption text-sunshine-700 hover:underline">Board →</Link>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog title={editId ? "Edit Project" : "New Project"} fields={fields} values={formValues} onChange={(n, v) => setFormValues((p) => ({ ...p, [n]: v }))} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditId(null); }} loading={loading} />
      )}
    </div>
  );
}

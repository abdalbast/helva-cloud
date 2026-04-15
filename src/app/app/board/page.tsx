"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAppQuery, useAppMutation } from "@/lib/app-data";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus } from "lucide-react";

const COLUMNS = ["backlog", "todo", "in_progress", "review", "done"] as const;

const priorityColors: Record<string, string> = {
  low: "text-foreground/40",
  medium: "text-sunshine-700",
  high: "text-mistral-orange",
  urgent: "text-red-600",
};

function useFields(projects: { _id: string; name: string }[]): FieldDef[] {
  return useMemo(() => [
    { name: "title", label: "Title", required: true },
    { name: "projectId", label: "Project", required: true, type: "select" as const, options: projects.map((p) => ({ value: p._id, label: p.name })) },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "assignee", label: "Assignee" },
    { name: "status", label: "Status", type: "select" as const, options: COLUMNS.map((s) => ({ value: s, label: s.replace("_", " ") })) },
    { name: "priority", label: "Priority", type: "select" as const, options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ]},
    { name: "dueDate", label: "Due Date", type: "date" as const },
  ], [projects]);
}

export default function BoardPage() {
  const tasks = useAppQuery(api.tasks.list, "tasks") ?? [];
  const projects = useAppQuery(api.projects.list, "projects") ?? [];
  const createTask = useAppMutation(api.tasks.create, "tasks", "create");
  const updateTask = useAppMutation(api.tasks.update, "tasks", "update");
  const removeTask = useAppMutation(api.tasks.remove, "tasks", "remove");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({ status: "todo", priority: "medium" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const fields = useFields(projects);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      const projectId = searchParams.get("project") ?? "";
      setFormValues({ status: "todo", priority: "medium", projectId });
      setEditId(null);
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = formValues.status as "backlog" | "todo" | "in_progress" | "review" | "done";
      const priority = formValues.priority as "low" | "medium" | "high" | "urgent";
      if (editId) {
        await updateTask({ id: editId as Id<"tasks">, title: formValues.title, description: formValues.description || undefined, assignee: formValues.assignee || undefined, status, priority, dueDate: formValues.dueDate || undefined });
      } else {
        await createTask({ projectId: formValues.projectId as Id<"projects">, title: formValues.title, description: formValues.description || undefined, assignee: formValues.assignee || undefined, status, priority, dueDate: formValues.dueDate || undefined });
      }
      setShowForm(false);
      setEditId(null);
    } catch {
      setError("Task could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (t: Record<string, unknown>) => {
    setFormValues({ title: t.title as string, projectId: t.projectId as string, description: (t.description as string) ?? "", assignee: (t.assignee as string) ?? "", status: t.status as string, priority: t.priority as string, dueDate: (t.dueDate as string)?.slice(0, 10) ?? "" });
    setEditId(t._id as string);
    setShowForm(true);
  };

  const byColumn = COLUMNS.map((status) => ({
    status,
    tasks: tasks.filter((t) => t.status === status),
  }));

  const projectName = (id: string) => projects.find((p) => p._id === id)?.name ?? `#${id.slice(-6)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">Project Board</h1>
        <button onClick={() => { setFormValues({ status: "todo", priority: "medium", projectId: "" }); setEditId(null); setShowForm(true); }} className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-[2px] border border-mistral-orange/20 bg-mistral-orange/10 px-3 py-2 text-sm text-mistral-orange">
          {error}
        </div>
      ) : null}
      <div className="nav-scroll mt-6 grid auto-cols-[minmax(200px,1fr)] grid-flow-col gap-4 pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-5">
        {byColumn.map(({ status, tasks: colTasks }) => (
          <div key={status} className="rounded-[2px] border border-foreground/10 bg-surface-cream/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-caption uppercase tracking-wide text-foreground/60 capitalize">{status.replace("_", " ")}</span>
              <span className="text-caption text-foreground/40">{colTasks.length}</span>
            </div>
            <div className="mt-2 space-y-2">
              {colTasks.map((t) => (
                <button key={t._id} onClick={() => openEdit(t)} className="w-full rounded-[2px] border border-foreground/10 bg-surface-pure p-2 text-left shadow-golden transition hover:border-sunshine-700/30">
                  <div className="text-sm">{t.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-caption capitalize ${priorityColors[t.priority] ?? ""}`}>{t.priority}</span>
                    <span className="text-caption text-foreground/30">{projectName(t.projectId)}</span>
                  </div>
                  {t.dueDate && <div className="mt-1 text-caption text-foreground/40">Due: {new Date(t.dueDate).toLocaleDateString()}</div>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog title={editId ? "Edit Task" : "New Task"} fields={fields} values={formValues} onChange={(n, v) => setFormValues((p) => ({ ...p, [n]: v }))} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditId(null); }} loading={loading} />
      )}
    </div>
  );
}

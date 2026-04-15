"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, File, Folder, Trash2 } from "lucide-react";

const fields: FieldDef[] = [
  { name: "name", label: "File Name", required: true },
  { name: "type", label: "Type", placeholder: "e.g. pdf, png, docx" },
  { name: "url", label: "URL", type: "url" },
  { name: "sizeBytes", label: "Size (bytes)", type: "number" },
  { name: "folder", label: "Folder" },
];

function formatSize(bytes: number | null | undefined) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const files = useQuery(api.files.list) ?? [];
  const createFile = useMutation(api.files.create);
  const removeFile = useMutation(api.files.remove);

  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createFile({ name: formValues.name, type: formValues.type || undefined, url: formValues.url || undefined, sizeBytes: formValues.sizeBytes ? Number(formValues.sizeBytes) : undefined, folder: formValues.folder || undefined });
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    await removeFile({ id: id as Id<"files"> });
  };

  const folders = [...new Set(files.map((f) => f.folder || "Root"))].sort();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">File Hub</h1>
        <button onClick={() => { setFormValues({}); setShowForm(true); }} className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
          <Plus className="h-4 w-4" /> Add File
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {folders.map((folder) => (
          <div key={folder}>
            <div className="flex items-center gap-2 text-foreground/70">
              <Folder className="h-4 w-4 text-sunshine-700" />
              <span className="text-sm font-normal">{folder}</span>
            </div>
            <div className="mt-2 space-y-1">
              {files.filter((f) => (f.folder || "Root") === folder).map((f) => (
                <div key={f._id} className="flex items-center gap-3 rounded-[2px] border border-foreground/5 bg-surface-pure p-2">
                  <File className="h-4 w-4 text-foreground/40" />
                  <div className="flex-1">
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-mistral-orange hover:underline">{f.name}</a>
                    ) : (
                      <span className="text-sm">{f.name}</span>
                    )}
                  </div>
                  <span className="text-caption text-foreground/40">{f.type ?? "—"}</span>
                  <span className="text-caption text-foreground/40">{formatSize(f.sizeBytes)}</span>
                  <button onClick={() => handleDelete(f._id)} className="text-foreground/30 hover:text-mistral-orange"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {files.length === 0 && <p className="text-body text-foreground/40">No files yet.</p>}
      </div>

      {showForm && (
        <FormDialog title="Add File" fields={fields} values={formValues} onChange={(n, v) => setFormValues((p) => ({ ...p, [n]: v }))} onSubmit={handleSubmit} onClose={() => setShowForm(false)} loading={loading} />
      )}
    </div>
  );
}

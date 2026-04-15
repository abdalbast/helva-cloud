"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, Sparkles, Trash2 } from "lucide-react";

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "prompt", label: "Prompt", type: "textarea", required: true },
  { name: "output", label: "Output", type: "textarea" },
];

export default function AIPage() {
  const prompts = useQuery(api.aiPrompts.list) ?? [];
  const createPrompt = useMutation(api.aiPrompts.create);
  const removePrompt = useMutation(api.aiPrompts.remove);

  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({});
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createPrompt({ title: formValues.title, prompt: formValues.prompt, output: formValues.output || undefined });
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prompt?")) return;
    await removePrompt({ id: id as Id<"aiPrompts"> });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">AI Assistant</h1>
        <button onClick={() => { setFormValues({}); setShowForm(true); }} className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
          <Plus className="h-4 w-4" /> New Prompt
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {prompts.length === 0 && <p className="text-body text-foreground/40">No prompts yet. Start by saving your AI prompts and outputs.</p>}
        {prompts.map((p) => (
          <div key={p._id} className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sunshine-700" />
                <span className="text-sm font-normal">{p.title}</span>
              </div>
              <button onClick={() => handleDelete(p._id)} className="text-foreground/30 hover:text-mistral-orange"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-2 rounded-[2px] bg-surface-cream/50 p-3">
              <div className="text-caption text-foreground/50 mb-1">Prompt</div>
              <p className="text-sm whitespace-pre-wrap">{p.prompt}</p>
            </div>
            {p.output && (
              <div className="mt-2 rounded-[2px] border border-sunshine-700/10 bg-sunshine-700/5 p-3">
                <div className="text-caption text-sunshine-700 mb-1">Output</div>
                <p className="text-sm whitespace-pre-wrap">{p.output}</p>
              </div>
            )}
            <div className="mt-2 text-caption text-foreground/30">{new Date(p._creationTime).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog title="New AI Prompt" fields={fields} values={formValues} onChange={(n, v) => setFormValues((p) => ({ ...p, [n]: v }))} onSubmit={handleSubmit} onClose={() => setShowForm(false)} loading={loading} />
      )}
    </div>
  );
}

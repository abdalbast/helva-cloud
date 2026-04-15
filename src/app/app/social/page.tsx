"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAppQuery, useAppMutation } from "@/lib/app-data";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, Send, Clock, FileEdit } from "lucide-react";

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileEdit className="h-4 w-4 text-foreground/40" />,
  scheduled: <Clock className="h-4 w-4 text-sunshine-700" />,
  published: <Send className="h-4 w-4 text-green-600" />,
};

const fields: FieldDef[] = [
  { name: "platform", label: "Platform", required: true, placeholder: "e.g. Twitter, LinkedIn" },
  { name: "content", label: "Content", type: "textarea", required: true },
  { name: "scheduledAt", label: "Schedule Date", type: "date" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "scheduled", label: "Scheduled" },
    { value: "published", label: "Published" },
  ]},
];

export default function SocialPage() {
  const posts = useAppQuery(api.socialPosts.list, "socialPosts") ?? [];
  const createPost = useAppMutation(api.socialPosts.create, "socialPosts", "create");
  const updatePost = useAppMutation(api.socialPosts.update, "socialPosts", "update");
  const removePost = useAppMutation(api.socialPosts.remove, "socialPosts", "remove");

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
      const status = formValues.status as "draft" | "scheduled" | "published";
      if (editId) {
        await updatePost({ id: editId as Id<"socialPosts">, platform: formValues.platform, content: formValues.content, scheduledAt: formValues.scheduledAt || undefined, status });
      } else {
        await createPost({ platform: formValues.platform, content: formValues.content, scheduledAt: formValues.scheduledAt || undefined, status });
      }
      setShowForm(false);
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await removePost({ id: id as Id<"socialPosts"> });
  };

  const openEdit = (p: Record<string, unknown>) => {
    setFormValues({ platform: p.platform as string, content: p.content as string, scheduledAt: (p.scheduledAt as string)?.slice(0, 10) ?? "", status: p.status as string });
    setEditId(p._id as string);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">Social Scheduler</h1>
        <button onClick={() => { setFormValues({ status: "draft" }); setEditId(null); setShowForm(true); }} className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {posts.length === 0 && <p className="text-body text-foreground/40">No posts yet.</p>}
        {posts.map((p) => (
          <div key={p._id} className="flex items-start gap-3 rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
            <div className="mt-0.5">{statusIcons[p.status] ?? <FileEdit className="h-4 w-4" />}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-[2px] bg-surface-cream px-2 py-0.5 text-caption">{p.platform}</span>
                <span className="rounded-[2px] bg-surface-cream px-2 py-0.5 text-caption capitalize">{p.status}</span>
              </div>
              <p className="mt-2 text-sm">{p.content}</p>
              {p.scheduledAt && <p className="mt-1 text-caption text-foreground/40">Scheduled: {new Date(p.scheduledAt).toLocaleString()}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="text-caption text-foreground/50 hover:text-mistral-orange">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="text-caption text-foreground/50 hover:text-mistral-orange">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog title={editId ? "Edit Post" : "New Post"} fields={fields} values={formValues} onChange={(n, v) => setFormValues((p) => ({ ...p, [n]: v }))} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditId(null); }} loading={loading} />
      )}
    </div>
  );
}

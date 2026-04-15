"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, Phone, Mail, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";

type Activity = Record<string, unknown> & {
  _id: string;
  type: string;
  subject: string;
  body: string | null;
  _creationTime: number;
};

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <MessageSquare className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
};

const fields: FieldDef[] = [
  { name: "type", label: "Type", type: "select", options: [
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "note", label: "Note" },
  ]},
  { name: "subject", label: "Subject", required: true },
  { name: "body", label: "Details", type: "textarea" },
];

export default function ActivitiesPage() {
  const activities = useQuery(api.activities.list) ?? [];
  const createActivity = useMutation(api.activities.create);

  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({ type: "note" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({ type: "note" });
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await createActivity({ type: formValues.type as "call" | "email" | "meeting" | "note", subject: formValues.subject, body: formValues.body || undefined });
      setShowForm(false);
      setFormValues({ type: "note" });
    } catch {
      setError("Activity could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Link href="/app/crm" className="text-caption text-foreground/50 hover:text-mistral-orange transition">
          ← CRM
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <h1 className="text-card-title">Activity Feed</h1>
          <button
            onClick={() => { setFormValues({ type: "note" }); setShowForm(true); }}
            className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition"
          >
            <Plus className="h-4 w-4" /> Log Activity
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {error ? (
          <div className="rounded-[2px] border border-mistral-orange/20 bg-mistral-orange/10 px-3 py-2 text-sm text-mistral-orange">
            {error}
          </div>
        ) : null}
        {activities.length === 0 && (
          <p className="text-body text-foreground/40">No activities yet. Log your first one!</p>
        )}
        {activities.map((a) => (
          <div key={a._id} className="flex items-start gap-3 rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
            <div className="mt-0.5 rounded-[2px] bg-surface-cream p-2 text-foreground/60">
              {typeIcons[a.type] ?? <FileText className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal">{a.subject}</span>
                <span className="rounded-[2px] bg-surface-cream px-1.5 py-0.5 text-caption capitalize text-foreground/50">{a.type}</span>
              </div>
              {a.body && <p className="mt-1 text-caption text-foreground/60">{a.body}</p>}
              <div className="mt-1 text-caption text-foreground/30">{new Date(a._creationTime).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormDialog
          title="Log Activity"
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
